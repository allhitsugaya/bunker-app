// app/api/health/route.js
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const runtime = 'nodejs';

export async function GET() {
  const ts = new Date().toISOString();
  const uptime = process.uptime();

  // Проверяем доступность Mongo (не светим строку подключения)
  let mongo = { connected: false, error: null };
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MISSING_ENV:MONGODB_URI');

    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 3000,
      maxPoolSize: 5
    });

    const dbName = process.env.MONGODB_DB || 'bunker';
    await client.db(dbName).command({ ping: 1 });
    await client.close();
    mongo.connected = true;
  } catch (e) {
    mongo.error = String(e?.message || e);
  }

  return NextResponse.json({
    ok: true,
    ts,
    uptime,
    env: {
      // только наличие, без значений
      MONGODB_URI: Boolean(process.env.MONGODB_URI),
      MONGODB_DB: process.env.MONGODB_DB || 'bunker',
      ADMIN_KEY: Boolean(process.env.ADMIN_KEY)
    },
    mongo
  });
}
