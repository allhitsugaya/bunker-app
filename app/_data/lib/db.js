// app/_data/lib/db.js
import { MongoClient } from 'mongodb';

export const runtime = 'nodejs';

// ---- ENV ----
// MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true&w=majority"
// MONGODB_DB="bunker"   // опционально
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'bunker';

if (!uri) {
  // Без URI смысла продолжать нет — пусть упадёт предсказуемо
  throw new Error('MONGODB_URI is not set. Add it in your environment variables.');
}

// ---- Глобальный singleton промиса подключения (корректно для Vercel / HMR) ----
let clientPromise = global._bunkerMongoClientPromise;
if (!clientPromise) {
  const client = new MongoClient(uri, {
    // настройки для serverless-окружений
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 8000
  });
  global._bunkerMongoClientPromise = client.connect();
  clientPromise = global._bunkerMongoClientPromise;
}

async function getDb() {
  const client = await clientPromise; // здесь выбросит реальную ошибку, если нет коннекта
  const db = client.db(dbName);

  // Индексы — один раз «лениво» (createIndex идемпотентен)
  const players = db.collection('players');
  await Promise.allSettled([
    players.createIndex({ createdAt: 1 }),
    players.createIndex({ excluded: 1 }),
    players.createIndex({ revealed: 1 }),
    players.createIndex({ id: 1 }, { unique: true })
  ]);

  return db;
}

const cuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const dbApi = {
  async createPlayer(data) {
    const db = await getDb();
    const id = cuid();
    const doc = {
      id,
      name: data.name || 'Игрок',
      age: data.age ?? null,
      profession: data.profession ?? null,
      health: data.health ?? null,
      psychology: data.psychology ?? null,
      item: data.item ?? null,
      hobby: data.hobby ?? null,
      fear: data.fear ?? null,
      secret: data.secret ?? null,
      relationship: data.relationship ?? null,
      trait: data.trait ?? null,
      ability: data.ability ?? null,
      revealed: 0,
      public: null,
      excluded: 0,
      createdAt: new Date().toISOString()
    };
    await db.collection('players').insertOne(doc);
    return { id };
  },

  async getPlayer(id) {
    const db = await getDb();
    return db.collection('players').findOne({ id }, { projection: { _id: 0 } });
  },

  async listAll() {
    const db = await getDb();
    return db
      .collection('players')
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: 1 })
      .toArray();
  },

  async listPublic() {
    const db = await getDb();
    const rows = await db
      .collection('players')
      .find({ excluded: 0 }, { projection: { _id: 0, id: 1, name: 1, public: 1 } })
      .sort({ createdAt: 1 })
      .toArray();
    // вернуть уже развёрнутые публичные поля
    return rows.map((r) => (r.public ? { id: r.id, name: r.name, ...r.public } : { id: r.id, name: r.name }));
  },

  async listRevealed() {
    const db = await getDb();
    return db
      .collection('players')
      .find({ revealed: 1, excluded: 0 }, { projection: { _id: 0 } })
      .sort({ createdAt: 1 })
      .toArray();
  },

  async toggleReveal(targetId, value) {
    const db = await getDb();
    const coll = db.collection('players');
    if (value === undefined) {
      const row = await coll.findOne({ id: targetId }, { projection: { revealed: 1 } });
      const next = row?.revealed ? 0 : 1;
      await coll.updateOne({ id: targetId }, { $set: { revealed: next } });
      return !!next;
    } else {
      const explicit = value ? 1 : 0;
      await coll.updateOne({ id: targetId }, { $set: { revealed: explicit } });
      return !!explicit;
    }
  },

  async setPublic(playerId, obj) {
    const db = await getDb();
    await db.collection('players').updateOne({ id: playerId }, { $set: { public: obj || null } });
  },

  async clearPublic(playerId) {
    const db = await getDb();
    await db.collection('players').updateOne({ id: playerId }, { $set: { public: null } });
  },

  async updatePlayer(playerId, data) {
    const db = await getDb();
    await db.collection('players').updateOne(
      { id: playerId },
      {
        $set: {
          name: data.name,
          age: data.age,
          profession: data.profession,
          health: data.health,
          psychology: data.psychology,
          item: data.item,
          hobby: data.hobby,
          fear: data.fear,
          secret: data.secret,
          relationship: data.relationship,
          trait: data.trait,
          ability: data.ability
        }
      }
    );
  },

  async setExcluded(playerId, val) {
    const db = await getDb();
    await db.collection('players').updateOne({ id: playerId }, { $set: { excluded: val ? 1 : 0 } });
  },

  async deletePlayer(playerId) {
    const db = await getDb();
    await db.collection('players').deleteOne({ id: playerId });
  },

  async wipe() {
    const db = await getDb();
    await db.collection('players').deleteMany({});
  }
};
