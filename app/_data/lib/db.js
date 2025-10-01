// app/lib/db.js
import Database from 'better-sqlite3';

export const runtime = 'nodejs';

let conn = global._bunkerConn;
if (!conn) {
  conn = global._bunkerConn = new Database('bunker.db');
  conn.pragma('journal_mode = WAL');
  conn.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT,
      age INTEGER,
      profession TEXT,
      health TEXT,
      psychology TEXT,
      item TEXT,
      hobby TEXT,
      fear TEXT,
      secret TEXT,
      relationship TEXT,
      trait TEXT,
      ability TEXT,
      revealed INTEGER DEFAULT 0,
      createdAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_players_created ON players(createdAt);
  `);
  // новые поля
  try {
    conn.exec(`ALTER TABLE players ADD COLUMN public TEXT`);
  } catch {
  }
  try {
    conn.exec(`ALTER TABLE players ADD COLUMN excluded INTEGER DEFAULT 0`);
  } catch {
  }
}

const cuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const dbApi = {
  createPlayer(data) {
    const id = cuid();
    const createdAt = new Date().toISOString();
    conn.prepare(`
      INSERT INTO players (
        id, name, age, profession, health, psychology, item, hobby, fear, secret,
        relationship, trait, ability, revealed, public, excluded, createdAt
      ) VALUES (
        @id, @name, @age, @profession, @health, @psychology, @item, @hobby, @fear, @secret,
        @relationship, @trait, @ability, 0, NULL, 0, @createdAt
      )
    `).run({ id, createdAt, ...data });
    return { id };
  },

  getPlayer(id) {
    return conn.prepare(`SELECT * FROM players WHERE id=?`).get(id);
  },

  // ведущему — всех (включая исключённых)
  listAll() {
    return conn.prepare(`SELECT * FROM players ORDER BY createdAt ASC`).all();
  },

  // публичные представления для всех не исключённых
  listPublic() {
    const rows = conn.prepare(
      `SELECT id, name, public FROM players WHERE excluded=0 ORDER BY createdAt ASC`
    ).all();
    return rows.map(r => {
      if (!r.public) return { id: r.id, name: r.name };
      const pub = JSON.parse(r.public);
      return { id: r.id, name: r.name, ...pub };
    });
  },

  // старое “массовое раскрытие” (если пользуешься)
  listRevealed() {
    return conn.prepare(`SELECT * FROM players WHERE revealed=1 AND excluded=0 ORDER BY createdAt ASC`).all();
  },

  toggleReveal(targetId, value) {
    const explicit = value === undefined ? null : value ? 1 : 0;
    if (explicit === null) {
      const row = conn.prepare(`SELECT revealed FROM players WHERE id=?`).get(targetId);
      const next = row?.revealed ? 0 : 1;
      conn.prepare(`UPDATE players SET revealed=? WHERE id=?`).run(next, targetId);
      return !!next;
    } else {
      conn.prepare(`UPDATE players SET revealed=? WHERE id=?`).run(explicit, targetId);
      return !!explicit;
    }
  },

  // самораскрытие
  setPublic(playerId, obj) {
    conn.prepare(`UPDATE players SET public=? WHERE id=?`).run(JSON.stringify(obj || null), playerId);
  },

  clearPublic(playerId) {
    conn.prepare(`UPDATE players SET public=NULL WHERE id=?`).run(playerId);
  },

  // пересоздать (новый рандом при том же id)
  updatePlayer(playerId, data) {
    conn.prepare(`
      UPDATE players SET
        name=@name, age=@age, profession=@profession, health=@health, psychology=@psychology,
        item=@item, hobby=@hobby, fear=@fear, secret=@secret, relationship=@relationship,
        trait=@trait, ability=@ability
      WHERE id=@id
    `).run({ id: playerId, ...data });
  },

  // исключение/возврат
  setExcluded(playerId, val) {
    conn.prepare(`UPDATE players SET excluded=? WHERE id=?`).run(val ? 1 : 0, playerId);
  }
};
