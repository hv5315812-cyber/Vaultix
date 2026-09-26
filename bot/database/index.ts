import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'vaultix.db');
let db: SqlJsDatabase | null = null;

export async function initDatabase(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  createTables();
  saveDatabase();
  return db;
}

export function getDatabase(): SqlJsDatabase {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

export function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Auto-save every 30 seconds
setInterval(() => {
  if (db) saveDatabase();
}, 30000);

function createTables() {
  if (!db) return;
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      user_id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      xp INTEGER DEFAULT 0,
      work_xp INTEGER DEFAULT 0,
      coins INTEGER DEFAULT 0,
      hp INTEGER DEFAULT 100,
      max_hp INTEGER DEFAULT 100,
      mp INTEGER DEFAULT 0,
      max_mp INTEGER DEFAULT 50,
      family TEXT DEFAULT NULL,
      wand TEXT DEFAULT NULL,
      is_wizard INTEGER DEFAULT 0,
      dungeon_floor INTEGER DEFAULT 0,
      damage INTEGER DEFAULT 10,
      defense INTEGER DEFAULT 5,
      luck INTEGER DEFAULT 5,
      intelligence INTEGER DEFAULT 5,
      rerolls_used_today INTEGER DEFAULT 0,
      reroll_reset_date TEXT DEFAULT NULL,
      work_cooldown TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS player_spells (
      user_id TEXT NOT NULL,
      spell_id TEXT NOT NULL,
      upgraded INTEGER DEFAULT 0,
      upgrade_level INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, spell_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS player_inventory (
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      PRIMARY KEY (user_id, item_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS combat_sessions (
      session_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      floor INTEGER NOT NULL,
      enemies_data TEXT NOT NULL,
      player_hp INTEGER NOT NULL,
      player_mp INTEGER NOT NULL,
      turn INTEGER DEFAULT 1,
      buffs TEXT DEFAULT '{}',
      debuffs TEXT DEFAULT '{}',
      cooldowns TEXT DEFAULT '{}',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS shop_purchases (
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      purchased_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

// Helper to run queries and get results
function queryAll(sql: string, params: any[] = []): any[] {
  if (!db) return [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql: string, params: any[] = []): any | null {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

function run(sql: string, params: any[] = []) {
  if (!db) return;
  db.run(sql, params);
  saveDatabase();
}

// Player CRUD operations
export const PlayerDB = {
  get(userId: string) {
    return queryOne('SELECT * FROM players WHERE user_id = ?', [userId]);
  },

  create(userId: string, username: string) {
    run('INSERT INTO players (user_id, username) VALUES (?, ?)', [userId, username]);
    return PlayerDB.get(userId);
  },

  getOrCreate(userId: string, username: string) {
    const player = PlayerDB.get(userId);
    if (player) return player;
    return PlayerDB.create(userId, username);
  },

  update(userId: string, data: Record<string, any>) {
    const keys = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    values.push(userId);
    run(`UPDATE players SET ${keys}, updated_at = datetime('now') WHERE user_id = ?`, values);
  },

  addXP(userId: string, amount: number) {
    run('UPDATE players SET xp = xp + ?, updated_at = datetime(\'now\') WHERE user_id = ?', [amount, userId]);
  },

  addCoins(userId: string, amount: number) {
    run('UPDATE players SET coins = coins + ?, updated_at = datetime(\'now\') WHERE user_id = ?', [amount, userId]);
  },

  setFamily(userId: string, family: string) {
    run('UPDATE players SET family = ?, updated_at = datetime(\'now\') WHERE user_id = ?', [family, userId]);
  },

  setWand(userId: string, wand: string) {
    run('UPDATE players SET wand = ?, updated_at = datetime(\'now\') WHERE user_id = ?', [wand, userId]);
  },

  setWizard(userId: string, isWizard: boolean) {
    run('UPDATE players SET is_wizard = ?, updated_at = datetime(\'now\') WHERE user_id = ?', [isWizard ? 1 : 0, userId]);
  },

  updateMP(userId: string, current: number, max: number) {
    run('UPDATE players SET mp = ?, max_mp = ?, updated_at = datetime(\'now\') WHERE user_id = ?', [current, max, userId]);
  },

  setDungeonFloor(userId: string, floor: number) {
    run('UPDATE players SET dungeon_floor = ?, updated_at = datetime(\'now\') WHERE user_id = ?', [floor, userId]);
  },

  levelUp(userId: string, newLevel: number) {
    run('UPDATE players SET level = ?, updated_at = datetime(\'now\') WHERE user_id = ?', [newLevel, userId]);
  },

  resetRerollCount(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    run('UPDATE players SET rerolls_used_today = 0, reroll_reset_date = ? WHERE user_id = ?', [today, userId]);
  },

  incrementReroll(userId: string) {
    run('UPDATE players SET rerolls_used_today = rerolls_used_today + 1, updated_at = datetime(\'now\') WHERE user_id = ?', [userId]);
  },

  setWorkCooldown(userId: string, cooldown: string) {
    run('UPDATE players SET work_cooldown = ?, updated_at = datetime(\'now\') WHERE user_id = ?', [cooldown, userId]);
  },
};

// Spell operations
export const SpellDB = {
  getLearned(userId: string) {
    return queryAll('SELECT * FROM player_spells WHERE user_id = ?', [userId]);
  },

  learnSpell(userId: string, spellId: string) {
    run('INSERT OR IGNORE INTO player_spells (user_id, spell_id) VALUES (?, ?)', [userId, spellId]);
  },

  hasSpell(userId: string, spellId: string): boolean {
    const row = queryOne('SELECT 1 FROM player_spells WHERE user_id = ? AND spell_id = ?', [userId, spellId]);
    return !!row;
  },

  upgradeSpell(userId: string, spellId: string) {
    run('UPDATE player_spells SET upgrade_level = upgrade_level + 1 WHERE user_id = ? AND spell_id = ?', [userId, spellId]);
  },
};

// Inventory operations
export const InventoryDB = {
  getAll(userId: string) {
    return queryAll('SELECT * FROM player_inventory WHERE user_id = ?', [userId]);
  },

  addItem(userId: string, itemId: string, quantity: number = 1) {
    const existing = queryOne('SELECT quantity FROM player_inventory WHERE user_id = ? AND item_id = ?', [userId, itemId]);
    if (existing) {
      run('UPDATE player_inventory SET quantity = quantity + ? WHERE user_id = ? AND item_id = ?', [quantity, userId, itemId]);
    } else {
      run('INSERT INTO player_inventory (user_id, item_id, quantity) VALUES (?, ?, ?)', [userId, itemId, quantity]);
    }
  },

  removeItem(userId: string, itemId: string, quantity: number = 1): boolean {
    const existing = queryOne('SELECT quantity FROM player_inventory WHERE user_id = ? AND item_id = ?', [userId, itemId]);
    if (!existing || existing.quantity < quantity) return false;
    if (existing.quantity === quantity) {
      run('DELETE FROM player_inventory WHERE user_id = ? AND item_id = ?', [userId, itemId]);
    } else {
      run('UPDATE player_inventory SET quantity = quantity - ? WHERE user_id = ? AND item_id = ?', [quantity, userId, itemId]);
    }
    return true;
  },

  getQuantity(userId: string, itemId: string): number {
    const row = queryOne('SELECT quantity FROM player_inventory WHERE user_id = ? AND item_id = ?', [userId, itemId]);
    return row ? row.quantity : 0;
  },
};

// Combat session operations
export const CombatDB = {
  create(sessionId: string, userId: string, channelId: string, floor: number, enemiesData: string, playerHp: number, playerMp: number) {
    run(`
      INSERT INTO combat_sessions (session_id, user_id, channel_id, floor, enemies_data, player_hp, player_mp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [sessionId, userId, channelId, floor, enemiesData, playerHp, playerMp]);
  },

  getActive(userId: string) {
    return queryOne('SELECT * FROM combat_sessions WHERE user_id = ? AND is_active = 1', [userId]);
  },

  update(sessionId: string, data: Record<string, any>) {
    const keys = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    values.push(sessionId);
    run(`UPDATE combat_sessions SET ${keys} WHERE session_id = ?`, values);
  },

  end(sessionId: string) {
    run('UPDATE combat_sessions SET is_active = 0 WHERE session_id = ?', [sessionId]);
  },

  deleteAll(userId: string) {
    run('DELETE FROM combat_sessions WHERE user_id = ?', [userId]);
  },
};
