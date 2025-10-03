// app/_data/lib/db.js
import { MongoClient } from 'mongodb';

export const runtime = 'nodejs';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'bunker';
if (!uri) throw new Error('MONGODB_URI is not set. Add it in your environment variables.');

let clientPromise = global._bunkerMongoClientPromise;
if (!clientPromise) {
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 8000
  });
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
    // players
    players.createIndex({ createdAt: 1 }),
    players.createIndex({ excluded: 1 }),
    players.createIndex({ revealed: 1 }),
    players.createIndex({ id: 1 }, { unique: true }),
    // polls
    polls.createIndex({ id: 1 }, { unique: true }),
    polls.createIndex({ createdAt: 1 }),
    polls.createIndex({ closedAt: 1 }),
    // votes
    votes.createIndex({ pollId: 1, voterId: 1 }, { unique: true }),
    votes.createIndex({ pollId: 1, targetId: 1 })
  ]);

  return db;
}

const cuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const dbApi = {
  // ===== players =====
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
    return db.collection('players')
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: 1 })
      .toArray();
  },

  async listPublic() {
    const db = await getDb();
    const rows = await db.collection('players')
      .find(
        { excluded: 0 },
        { projection: { _id: 0, id: 1, name: 1, public: 1, excluded: 1 } }
      )
      .sort({ createdAt: 1 })
      .toArray();

    // public-объект разворачиваем в корень
    return rows.map(r =>
      r.public
        ? { id: r.id, name: r.name, excluded: r.excluded, ...r.public }
        : { id: r.id, name: r.name, excluded: r.excluded }
    );
  },

  async listRevealed() {
    const db = await getDb();
    return db.collection('players')
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
          gender: data.gender,
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
    await Promise.all([
      db.collection('players').deleteMany({}),
      db.collection('polls').deleteMany({}),
      db.collection('votes').deleteMany({})
    ]);
  },

  // ===== polls & votes =====
  async getActivePoll() {
    const db = await getDb();
    return db.collection('polls').findOne({ closedAt: null }, { projection: { _id: 0 } });
  },

  async startPoll({ candidates, question }) {
    const db = await getDb();

    // закрыть подвисшие
    await db.collection('polls').updateMany(
      { closedAt: null },
      { $set: { closedAt: new Date().toISOString(), closedReason: 'autoclose_on_new' } }
    );

    // по умолчанию — все не исключённые игроки
    if (!Array.isArray(candidates) || candidates.length === 0) {
      const ids = await db.collection('players')
        .find({ excluded: 0 }, { projection: { _id: 0, id: 1 } })
        .toArray();
      candidates = ids.map(x => x.id);
    }

    const uniq = Array.from(new Set(candidates)).filter(Boolean);

    const poll = {
      id: cuid(),
      candidates: uniq,
      question: (question || '').trim() || null,
      createdAt: new Date().toISOString(),
      closedAt: null
    };
    await db.collection('polls').insertOne(poll);
    return poll;
  },

  // проголосовать/поменять голос
  async vote({ pollId, voterId, targetId }) {
    const db = await getDb();

    const poll = await db.collection('polls').findOne({ id: pollId }, { projection: { _id: 0 } });
    if (!poll || poll.closedAt) throw new Error('poll_closed');

    if (!poll.candidates.includes(targetId)) {
      // цель не в кандидатов — ошибка
      throw new Error('bad_target');
    }

    // апдейт/апсертом по уникальному (pollId, voterId)
    await db.collection('votes').updateOne(
      { pollId, voterId },
      { $set: { pollId, voterId, targetId } },
      { upsert: true }
    );
  },

  // состояние для клиента (в т.ч. мой голос)
  async currentPollState({ voterId = null } = {}) {
    const db = await getDb();
    const poll = await db.collection('polls')
      .findOne({ closedAt: null }, { projection: { _id: 0 } });

    let counts = {};
    let my = null;

    if (poll) {
      const votes = await db.collection('votes')
        .find({ pollId: poll.id }, { projection: { _id: 0 } })
        .toArray();

      for (const v of votes) {
        counts[v.targetId] = (counts[v.targetId] || 0) + 1;
        if (voterId && v.voterId === voterId) my = v.targetId;
      }
    }

    const last = await db.collection('polls')
      .find({ closedAt: { $ne: null } }, { projection: { _id: 0 } })
      .sort({ closedAt: -1 })
      .limit(1)
      .toArray();

    return {
      poll: poll
        ? {
          id: poll.id,
          createdAt: poll.createdAt,
          candidates: poll.candidates,
          question: poll.question || null
        }
        : null,
      counts,
      my,
      last: last[0]?.summary ? { summary: last[0].summary } : null
    };
  },

  // закрыть активный и посчитать результат
  async closeActivePoll({ policy = 'most' } = {}) {
    const db = await getDb();
    const collPolls = db.collection('polls');
    const poll = await collPolls.findOne({ closedAt: null }, { projection: { _id: 0 } });
    if (!poll) return null;

    const votes = await db.collection('votes')
      .find({ pollId: poll.id }, { projection: { _id: 0 } })
      .toArray();

    // посчитать
    const counts = {};
    for (const v of votes) {
      counts[v.targetId] = (counts[v.targetId] || 0) + 1;
    }

    // определить победителя(ей)
    let winners = [];
    if (policy === 'most') {
      let max = -1;
      for (const id of poll.candidates) {
        const c = counts[id] || 0;
        if (c > max) {
          max = c;
          winners = [id];
        } else if (c === max) {
          winners.push(id);
        }
      }
      // если все нули — всё равно вернём всех (ничья)
    } else {
      // можно расширить под другие политики
      winners = poll.candidates.slice();
    }

    // оформить summary
    const ordered = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([id, n]) => `${id}: ${n}`);

    const summary = `Завершено • Голосов: ${votes.length}${
      ordered.length ? ' • ' + ordered.join(', ') : ''
    } • Победители: ${winners.join(', ')}`;

    // пометить закрытым
    await collPolls.updateOne(
      { id: poll.id },
      { $set: { closedAt: new Date().toISOString(), summary, closedReason: 'manual' } }
    );

    return { id: poll.id, winners, summary };
  }
};
