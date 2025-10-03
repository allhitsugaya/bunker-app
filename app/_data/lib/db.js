// app/_data/lib/db.js
import { MongoClient } from 'mongodb';

export const runtime = 'nodejs';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'bunker';
if (!uri) throw new Error('MONGODB_URI is not set.');

let clientPromise = global._bunkerMongoClientPromise;
if (!clientPromise) {
  const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 8000 });
  global._bunkerMongoClientPromise = client.connect();
  clientPromise = global._bunkerMongoClientPromise;
}

async function getDb() {
  const client = await clientPromise;
  const db = client.db(dbName);
  const players = db.collection('players');
  const polls = db.collection('polls');
  const votes = db.collection('votes');

  await Promise.allSettled([
    players.createIndex({ createdAt: 1 }),
    players.createIndex({ excluded: 1 }),
    players.createIndex({ id: 1 }, { unique: true }),
    polls.createIndex({ status: 1, createdAt: 1 }),
    polls.createIndex({ id: 1 }, { unique: true }),
    votes.createIndex({ pollId: 1, voterId: 1 }, { unique: true }) // один голос на игрока в рамках голосования
  ]);
  return db;
}

const cuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const dbApi = {
  // ======== PLAYERS (как у тебя) ========
  async createPlayer(data) {
    const db = await getDb();
    const id = cuid();
    const doc = {
      id,
      name: data.name || 'Игрок',
      gender: data.gender ?? null,
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
    return db.collection('players').find({}, { projection: { _id: 0 } }).sort({ createdAt: 1 }).toArray();
  },
  async listPublic() {
    const db = await getDb();
    const rows = await db.collection('players')
      .find({ excluded: 0 }, { projection: { _id: 0, id: 1, name: 1, public: 1 } })
      .sort({ createdAt: 1 }).toArray();
    return rows.map(r => (r.public ? { id: r.id, name: r.name, ...r.public } : { id: r.id, name: r.name }));
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
    await db.collection('players').updateOne({ id: playerId }, {
      $set: {
        name: data.name, gender: data.gender, age: data.age, profession: data.profession,
        health: data.health, psychology: data.psychology, item: data.item, hobby: data.hobby,
        fear: data.fear, secret: data.secret, relationship: data.relationship, trait: data.trait, ability: data.ability
      }
    });
  },
  async setExcluded(playerId, val) {
    const db = await getDb();
    await db.collection('players').updateOne({ id: playerId }, { $set: { excluded: val ? 1 : 0 } });
  },

  // ======== POLLS ========
  async getActivePoll() {
    const db = await getDb();
    return db.collection('polls').findOne({ status: 'open' }, { projection: { _id: 0 } });
  },
  async startPoll({ candidates, meta }) {
    const db = await getDb();
    // закрываем прежнее, если вдруг зависло
    await db.collection('polls').updateMany({ status: 'open' }, {
      $set: {
        status: 'closed',
        closedAt: new Date().toISOString()
      }
    });
    const id = cuid();
    const doc = {
      id,
      status: 'open',
      candidates, // массив playerId
      createdAt: new Date().toISOString(),
      closedAt: null,
      result: null,
      meta: meta || {}
    };
    await db.collection('polls').insertOne(doc);
    return { id };
  },
  async vote({ pollId, voterId, targetId }) {
    const db = await getDb();
    const poll = await db.collection('polls').findOne({ id: pollId }, { projection: { _id: 0 } });
    if (!poll || poll.status !== 'open') throw new Error('poll_closed');
    if (!poll.candidates.includes(targetId)) throw new Error('bad_target');

    // upsert голос (можно менять до закрытия)
    await db.collection('votes').updateOne(
      { pollId, voterId },
      { $set: { pollId, voterId, targetId, at: new Date().toISOString() } },
      { upsert: true }
    );
    return true;
  },
  async tally(pollId) {
    const db = await getDb();
    const poll = await db.collection('polls').findOne({ id: pollId }, { projection: { _id: 0 } });
    if (!poll) return null;
    const votes = await db.collection('votes').aggregate([
      { $match: { pollId } },
      { $group: { _id: '$targetId', count: { $sum: 1 } } }
    ]).toArray();
    const counts = Object.fromEntries(votes.map(v => [v._id, v.count]));
    // гарантируем наличие ключей для всех кандидатов
    poll.candidates.forEach(id => {
      if (!(id in counts)) counts[id] = 0;
    });
    return { poll, counts };
  },
  async myVote(pollId, voterId) {
    const db = await getDb();
    const v = await db.collection('votes').findOne({ pollId, voterId }, { projection: { _id: 0 } });
    return v?.targetId || null;
  },
  async closePoll({ policy = 'most' }) {
    const db = await getDb();
    const poll = await db.collection('polls').findOne({ status: 'open' });
    if (!poll) return null;

    const { counts } = await this.tally(poll.id);
    // определяем победителя(ей)
    const entries = Object.entries(counts); // [ [playerId, count], ... ]
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries.length ? entries[0][1] : 0;
    const winners = entries.filter(([, c]) => c === top).map(([pid]) => pid);

    const result = { winners, counts, policy, totalVotes: entries.reduce((s, [, c]) => s + c, 0) };
    await db.collection('polls').updateOne(
      { id: poll.id },
      { $set: { status: 'closed', closedAt: new Date().toISOString(), result } }
    );
    return await db.collection('polls').findOne({ id: poll.id }, { projection: { _id: 0 } });
  },
  async currentPollState({ voterId }) {
    const active = await this.getActivePoll();
    if (!active) {
      // найдём последний закрытый для истории
      const db = await getDb();
      const last = await db.collection('polls').find({ status: 'closed' })
        .project({ _id: 0 }).sort({ closedAt: -1 }).limit(1).toArray();
      return { poll: null, counts: null, my: null, last: last[0] || null };
    }
    const { counts } = await this.tally(active.id);
    const my = voterId ? await this.myVote(active.id, voterId) : null;
    return { poll: active, counts, my, last: null };
  }
};
