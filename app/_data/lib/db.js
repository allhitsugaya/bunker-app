// app/_data/lib/db.js
import { MongoClient } from 'mongodb';

export const runtime = 'nodejs';

// === Конфиг через .env ===
// MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true&w=majority&appName=<AppName>"
// MONGODB_DB="bunker"   // можно не указывать, возьмём "bunker" по умолчанию
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ Missing MONGODB_URI in env');
}
const dbName = process.env.MONGODB_DB || 'bunker';

// Кэшируем клиент межгорячими перезагрузками в деве
let _client = global._bunkerMongoClient || null;
let _db = global._bunkerMongoDb || null;

async function getDb() {
  if (_db) return _db;
  if (!_client) {
    _client = new MongoClient(uri, {
      // таймауты и хорошая практика для serverless
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 8000
    });
    global._bunkerMongoClient = _client;
  }
  if (!_client.topology?.isConnected()) {
    await _client.connect();
  }
  _db = _client.db(dbName);
  global._bunkerMongoDb = _db;

  // индексы (однократно)
  const players = _db.collection('players');
  await players.createIndex({ createdAt: 1 });
  await players.createIndex({ excluded: 1 });
  await players.createIndex({ revealed: 1 });

  return _db;
}

const cuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

/**
 * Структура документа в коллекции "players":
 * {
 *   _id: <mongo ObjectId>,  // не используем наружу
 *   id: string,             // наш внешний ID (playerId)
 *   name: string,
 *   age: number,
 *   profession, health, psychology, item, hobby, fear,
 *   secret, relationship, trait, ability: string | null,
 *   revealed: number (0|1),
 *   public: object|null,    // {"age": 22, "profession": "..."} — что открыть публично
 *   excluded: number (0|1),
 *   createdAt: ISO string
 * }
 */

export const dbApi = {
  async createPlayer(data) {
    const db = await getDb();
    const players = db.collection('players');
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
    await players.insertOne(doc);
    return { id };
  },

  async getPlayer(id) {
    const db = await getDb();
    return db.collection('players').findOne({ id }, { projection: { _id: 0 } });
  },

  // ведущий видит всех
  async listAll() {
    const db = await getDb();
    return db
      .collection('players')
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: 1 })
      .toArray();
  },

  // публичные представления для всех не исключённых
  async listPublic() {
    const db = await getDb();
    const rows = await db
      .collection('players')
      .find({ excluded: 0 }, { projection: { _id: 0, id: 1, name: 1, public: 1 } })
      .sort({ createdAt: 1 })
      .toArray();

    return rows.map(r => {
      if (!r.public) return { id: r.id, name: r.name };
      return { id: r.id, name: r.name, ...r.public };
    });
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
    const players = db.collection('players');
    if (value === undefined) {
      const row = await players.findOne({ id: targetId }, { projection: { revealed: 1 } });
      const next = row?.revealed ? 0 : 1;
      await players.updateOne({ id: targetId }, { $set: { revealed: next } });
      return !!next;
    } else {
      const explicit = value ? 1 : 0;
      await players.updateOne({ id: targetId }, { $set: { revealed: explicit } });
      return !!explicit;
    }
  },

  // самораскрытие
  async setPublic(playerId, obj) {
    const db = await getDb();
    await db.collection('players').updateOne(
      { id: playerId },
      { $set: { public: obj || null } }
    );
  },

  async clearPublic(playerId) {
    const db = await getDb();
    await db.collection('players').updateOne(
      { id: playerId },
      { $set: { public: null } }
    );
  },

  // пересоздать персонажа (новые случайные поля, тот же id)
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
    await db.collection('players').updateOne(
      { id: playerId },
      { $set: { excluded: val ? 1 : 0 } }
    );
  },

  // Полный сброс
  async wipe() {
    const db = await getDb();
    await db.collection('players').deleteMany({});
  },
  // в dbApi
  async deletePlayer(playerId) {
    const db = await getDb();
    await db.collection('players').deleteOne({ id: playerId });
  }

};
