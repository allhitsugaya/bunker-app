// app/lib/db.js
import Database from 'better-sqlite3';

export const runtime = 'nodejs';

const DB_PATH =
  process.env.DB_FILE
  || (process.env.NODE_ENV === 'production' ? '/tmp/bunker.db' : 'bunker.db');


/** ——————————————————————  INTERNAL: open + migrate  —————————————————————— */

function ensureColumns(db, table, needed) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  const existing = new Set(cols.map(c => c.name));
  for (const { name, ddl } of needed) {
    if (!existing.has(name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}

function openAndMigrate() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
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

  // Миграции новых колонок без try/catch — только если их реально нет
  ensureColumns(db, 'players', [
    { name: 'public', ddl: 'public TEXT' },
    { name: 'excluded', ddl: 'excluded INTEGER DEFAULT 0' }
  ]);

  return db;
}

// singleton
let conn = globalThis._bunkerConn;
if (!conn) {
  conn = globalThis._bunkerConn = openAndMigrate();
}

/** ——————————————————————  HELPERS  —————————————————————— */

const cuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function safeParseJSON(str) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/** ——————————————————————  PUBLIC API  —————————————————————— */

export const dbApi = {
  /**
   * Создать нового игрока.
   * data — объект со всеми полями (name, age, profession, ...).
   * Возвращает { id }
   */
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

  /** Получить игрока полностью (все поля, в том числе скрытые) */
  getPlayer(id) {
    return conn.prepare(`SELECT * FROM players WHERE id=?`).get(id);
  },

  /** Ведущему — список всех игроков (включая исключённых) */
  listAll() {
    return conn.prepare(`SELECT * FROM players ORDER BY createdAt ASC`).all();
  },

  /**
   * Публичный список для всех (только не исключённые).
   * Возвращает: { id, name, ...publicFields }
   */
  listPublic() {
    const rows = conn.prepare(
      `SELECT id, name, public, excluded FROM players WHERE excluded=0 ORDER BY createdAt ASC`
    ).all();
    return rows.map(r => {
      const pub = safeParseJSON(r.public);
      return pub ? { id: r.id, name: r.name, ...pub } : { id: r.id, name: r.name };
    });
  },

  /** Старый “массовый” флаг, если вдруг используешь */
  listRevealed() {
    return conn.prepare(`
      SELECT * FROM players
      WHERE revealed=1 AND excluded=0
      ORDER BY createdAt ASC
    `).all();
  },

  /** Переключить флаг revealed (или выставить явно) */
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

  /** Самораскрытие (публичные поля) */
  setPublic(playerId, obj) {
    const payload = obj ? JSON.stringify(obj) : null;
    conn.prepare(`UPDATE players SET public=? WHERE id=?`).run(payload, playerId);
  },

  clearPublic(playerId) {
    conn.prepare(`UPDATE players SET public=NULL WHERE id=?`).run(playerId);
  },

  /** Пересоздать статы (обновить все поля у существующего id) */
  updatePlayer(playerId, data) {
    conn.prepare(`
      UPDATE players SET
        name=@name, age=@age, profession=@profession, health=@health, psychology=@psychology,
        item=@item, hobby=@hobby, fear=@fear, secret=@secret, relationship=@relationship,
        trait=@trait, ability=@ability
      WHERE id=@id
    `).run({ id: playerId, ...data });
  },

  /** Исключить/вернуть игрока */
  setExcluded(playerId, val) {
    conn.prepare(`UPDATE players SET excluded=? WHERE id=?`).run(val ? 1 : 0, playerId);
  },
  deletePlayer(playerId) {
    conn.prepare(`DELETE FROM players WHERE id=?`).run(playerId);
  }

};
