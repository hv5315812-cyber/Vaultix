import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'vaultix.db');
let db: Database.Database;

export function initDatabase(): Database.Database {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  createTables();
  return db;
}

export function getDatabase(): Database.Database {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

function createTables() {
  db.exec(`
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
    );

    CREATE TABLE IF NOT EXISTS player_spells (
      user_id TEXT NOT NULL,
      spell_id TEXT NOT NULL,
      upgraded INTEGER DEFAULT 0,
      upgrade_level INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, spell_id),
      FOREIGN KEY (user_id) REFERENCES players(user_id)
    );

    CREATE TABLE IF NOT EXISTS player_inventory (
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      PRIMARY KEY (user_id, item_id),
      FOREIGN KEY (user_id) REFERENCES players(user_id)
    );

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
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES players(user_id)
    );

    CREATE TABLE IF NOT EXISTS shop_purchases (
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      purchased_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES players(user_id)
    );
  `);
}

// Player CRUD operations
export const PlayerDB = {
  get(userId: string) {
    return db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId) as any;
  },

  create(userId: string, username: string) {
    db.prepare(`
      INSERT INTO players (user_id, username) VALUES (?, ?)
    `).run(userId, username);
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
    db.prepare(`UPDATE players SET ${keys}, updated_at = datetime('now') WHERE user_id = ?`).run(...values);
  },

  addXP(userId: string, amount: number) {
    db.prepare('UPDATE players SET xp = xp + ?, updated_at = datetime(\'now\') WHERE user_id = ?').run(amount, userId);
  },

  addCoins(userId: string, amount: number) {
    db.prepare('UPDATE players SET coins = coins + ?, updated_at = datetime(\'now\') WHERE user_id = ?').run(amount, userId);
  },

  setFamily(userId: string, family: string) {
    db.prepare('UPDATE players SET family = ?, updated_at = datetime(\'now\') WHERE user_id = ?').run(family, userId);
  },

  setWand(userId: string, wand: string) {
    db.prepare('UPDATE players SET wand = ?, updated_at = datetime(\'now\') WHERE user_id = ?').run(wand, userId);
  },

  setWizard(userId: string, isWizard: boolean) {
    db.prepare('UPDATE players SET is_wizard = ?, updated_at = datetime(\'now\') WHERE user_id = ?').run(isWizard ? 1 : 0, userId);
  },

  updateMP(userId: string, current: number, max: number) {
    db.prepare('UPDATE players SET mp = ?, max_mp = ?, updated_at = datetime(\'now\') WHERE user_id = ?').run(current, max, userId);
  },

  setDungeonFloor(userId: string, floor: number) {
    db.prepare('UPDATE players SET dungeon_floor = ?, updated_at = datetime(\'now\') WHERE user_id = ?').run(floor, userId);
  },

  levelUp(userId: string, newLevel: number) {
    db.prepare('UPDATE players SET level = ?, updated_at = datetime(\'now\') WHERE user_id = ?').run(newLevel, userId);
  },

  resetRerollCount(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    db.prepare('UPDATE players SET rerolls_used_today = 0, reroll_reset_date = ? WHERE user_id = ?').run(today, userId);
  },

  incrementReroll(userId: string) {
    db.prepare('UPDATE players SET rerolls_used_today = rerolls_used_today + 1, updated_at = datetime(\'now\') WHERE user_id = ?').run(userId);
  },

  setWorkCooldown(userId: string, cooldown: string) {
    db.prepare('UPDATE players SET work_cooldown = ?, updated_at = datetime(\'now\') WHERE user_id = ?').run(cooldown, userId);
  },
};

// Spell operations
export const SpellDB = {
  getLearned(userId: string) {
    return db.prepare('SELECT * FROM player_spells WHERE user_id = ?').all(userId) as any[];
  },

  learnSpell(userId: string, spellId: string) {
    db.prepare('INSERT OR IGNORE INTO player_spells (user_id, spell_id) VALUES (?, ?)').run(userId, spellId);
  },

  hasSpell(userId: string, spellId: string): boolean {
    const row = db.prepare('SELECT 1 FROM player_spells WHERE user_id = ? AND spell_id = ?').get(userId, spellId);
    return !!row;
  },

  upgradeSpell(userId: string, spellId: string) {
    db.prepare('UPDATE player_spells SET upgrade_level = upgrade_level + 1 WHERE user_id = ? AND spell_id = ?').run(userId, spellId);
  },
};

// Inventory operations
export const InventoryDB = {
  getAll(userId: string) {
    return db.prepare('SELECT * FROM player_inventory WHERE user_id = ?').all(userId) as any[];
  },

  addItem(userId: string, itemId: string, quantity: number = 1) {
    const existing = db.prepare('SELECT quantity FROM player_inventory WHERE user_id = ? AND item_id = ?').get(userId, itemId) as any;
    if (existing) {
      db.prepare('UPDATE player_inventory SET quantity = quantity + ? WHERE user_id = ? AND item_id = ?').run(quantity, userId, itemId);
    } else {
      db.prepare('INSERT INTO player_inventory (user_id, item_id, quantity) VALUES (?, ?, ?)').run(userId, itemId, quantity);
    }
  },

  removeItem(userId: string, itemId: string, quantity: number = 1): boolean {
    const existing = db.prepare('SELECT quantity FROM player_inventory WHERE user_id = ? AND item_id = ?').get(userId, itemId) as any;
    if (!existing || existing.quantity < quantity) return false;
    if (existing.quantity === quantity) {
      db.prepare('DELETE FROM player_inventory WHERE user_id = ? AND item_id = ?').run(userId, itemId);
    } else {
      db.prepare('UPDATE player_inventory SET quantity = quantity - ? WHERE user_id = ? AND item_id = ?').run(quantity, userId, itemId);
    }
    return true;
  },

  getQuantity(userId: string, itemId: string): number {
    const row = db.prepare('SELECT quantity FROM player_inventory WHERE user_id = ? AND item_id = ?').get(userId, itemId) as any;
    return row ? row.quantity : 0;
  },
};

// Combat session operations
export const CombatDB = {
  create(sessionId: string, userId: string, channelId: string, floor: number, enemiesData: string, playerHp: number, playerMp: number) {
    db.prepare(`
      INSERT INTO combat_sessions (session_id, user_id, channel_id, floor, enemies_data, player_hp, player_mp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(sessionId, userId, channelId, floor, enemiesData, playerHp, playerMp);
  },

  getActive(userId: string) {
    return db.prepare('SELECT * FROM combat_sessions WHERE user_id = ? AND is_active = 1').get(userId) as any;
  },

  update(sessionId: string, data: Record<string, any>) {
    const keys = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    values.push(sessionId);
    db.prepare(`UPDATE combat_sessions SET ${keys} WHERE session_id = ?`).run(...values);
  },

  end(sessionId: string) {
    db.prepare('UPDATE combat_sessions SET is_active = 0 WHERE session_id = ?').run(sessionId);
  },

  deleteAll(userId: string) {
    db.prepare('DELETE FROM combat_sessions WHERE user_id = ?').run(userId);
  },
};
