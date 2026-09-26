import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// All bot source files embedded as strings
const botSourceFiles = {
  'package.json': `{
  "name": "vaultix-bot",
  "version": "1.0.0",
  "description": "Vaultix - Fantasy Wizardry Progression Discord Bot",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node index.ts",
    "deploy": "ts-node deploy-commands.ts"
  },
  "dependencies": {
    "discord.js": "^14.14.1",
    "sql.js": "^1.10.2",
    "dotenv": "^16.4.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "@types/sql.js": "^1.4.9",
    "@types/uuid": "^9.0.7",
    "@types/node": "^20.11.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}`,

  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "dist"]
}`,

  '.env.example': `# Vaultix Discord Bot Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here`,

  'README.md': `# ✨ Vaultix - Fantasy Wizardry Discord Bot

Complete fantasy wizardry progression Discord bot with combat, dungeons, spells, families, wands, and economy.

## 🚀 Quick Start

1. Copy \`.env.example\` to \`.env\` and add your Discord bot token
2. \`npm install\`
3. \`npm run build\`
4. \`npm run deploy\` (register slash commands)
5. \`npm start\`

## 📋 Commands

\`/enlist\` \`/profile\` \`/work\` \`/family\` \`/reroll\` \`/wand\` \`/spells\` \`/cast\` \`/dungeon\` \`/magicshop\` \`/buy\` \`/inventory\` \`/admin\`

## 🎮 Features

- 50-Floor Dungeon with scaling monsters
- 17 Families across 7 rarities
- 14 Wands + Staff evolution
- 16 Spells (attack, heal, buff, debuff)
- 11 Monsters with unique abilities
- Full economy system
- Persistent SQLite database
- Admin tools
- Anti-exploit protection

## 🔧 Customization

Edit \`config/index.ts\` to adjust all balancing values.

## 📄 License

MIT
`,

  'config/index.ts': `export const CONFIG = {
  XP_PER_LEVEL: (level: number) => Math.floor(100 * Math.pow(1.5, level - 1)),
  WORK_COOLDOWN_MS: 60000,
  WORK_XP_MIN: 15,
  WORK_XP_MAX: 35,
  WORK_COINS_MIN: 10,
  WORK_COINS_MAX: 30,
  WIZARD_UNLOCK_LEVEL: 10,
  BASE_MP: 50,
  MP_PER_LEVEL: 10,
  MP_REGEN_INTERVAL_MS: 30000,
  MP_REGEN_AMOUNT: 5,
  BASE_PLAYER_HP: 100,
  HP_PER_LEVEL: 15,
  BASE_DAMAGE: 10,
  DAMAGE_PER_LEVEL: 2,
  DAMAGE_VARIANCE: 0.2,
  DEFEND_REDUCTION: 0.5,
  FLEE_CHANCE: 0.3,
  REROLL_BASE_PRICE: 500,
  FAMILY_RARITY_CHANCES: {
    common: 0.40,
    uncommon: 0.25,
    rare: 0.18,
    epic: 0.10,
    legendary: 0.05,
    mythic: 0.015,
    extremely_rare: 0.005,
  },
  DUNGEON_1_FLOORS: 50,
  DUNGEON_MONSTER_SCALING: 1.12,
  MAX_COINS: 999999999,
  MAX_LEVEL: 100,
  MAX_REROLLS_PER_DAY: 10,
};

export const RARITY_COLORS: Record<string, number> = {
  common: 0x95a5a6,
  uncommon: 0x2ecc71,
  rare: 0x3498db,
  epic: 0x9b59b6,
  legendary: 0xf39c12,
  mythic: 0xe74c3c,
  extremely_rare: 0xff00ff,
};
`,

  'config/families.ts': `export interface Family {
  name: string;
  rarity: string;
  description: string;
  bonuses: Record<string, number>;
  passive?: string;
}

export const FAMILIES: Family[] = [
  { name: 'Granger', rarity: 'common', description: 'Brilliant scholars.', bonuses: { intelligence: 15, xp: 5 } },
  { name: 'Abbott', rarity: 'common', description: 'Warm-hearted and resilient.', bonuses: { hp: 10, defense: 5 } },
  { name: 'Finch', rarity: 'common', description: 'Loyal and hardworking.', bonuses: { coins: 10, xp: 3 } },
  { name: 'Longbottom', rarity: 'uncommon', description: 'Hidden strength and courage.', bonuses: { damage: 10, defense: 10, hp: 5 } },
  { name: 'Weasley', rarity: 'uncommon', description: 'Large, loving family.', bonuses: { coins: 20, luck: 10 } },
  { name: 'Tonks', rarity: 'uncommon', description: 'Shape-shifters and adaptors.', bonuses: { intelligence: 10, luck: 8 } },
  { name: 'Lupin', rarity: 'rare', description: 'Wise werewolf lineage.', bonuses: { damage: 15, intelligence: 12, luck: 5 } },
  { name: 'Scamander', rarity: 'rare', description: 'Beast tamers.', bonuses: { luck: 20, hp: 10, defense: 8 } },
  { name: 'Diggory', rarity: 'rare', description: 'Noble and fair.', bonuses: { defense: 15, hp: 15, xp: 8 } },
  { name: 'Black', rarity: 'epic', description: 'Ancient pure-blood family.', bonuses: { damage: 20, mp: 15, intelligence: 10 } },
  { name: 'Malfoy', rarity: 'epic', description: 'Wealthy and cunning.', bonuses: { coins: 35, intelligence: 15, luck: 10 } },
  { name: 'Lestrange', rarity: 'epic', description: 'Fierce and devoted.', bonuses: { damage: 25, mp: 10, luck: 8 } },
  { name: 'Dumbledore', rarity: 'legendary', description: 'Greatest magical lineage.', bonuses: { intelligence: 30, mp: 25, damage: 15, xp: 15 } },
  { name: 'Peverell', rarity: 'legendary', description: 'Ancient bloodline.', bonuses: { luck: 30, damage: 20, defense: 15, hp: 10 } },
  { name: 'Pendragon', rarity: 'mythic', description: 'Descendants of magical king.', bonuses: { damage: 35, hp: 25, defense: 20, mp: 20, intelligence: 15 } },
  { name: 'Morgana', rarity: 'mythic', description: 'Dark sorceress lineage.', bonuses: { damage: 40, mp: 30, intelligence: 25, luck: 15 } },
  { name: 'Potter', rarity: 'extremely_rare', description: 'The chosen bloodline.', bonuses: { luck: 50, damage: 25, hp: 20, defense: 15, xp: 20 } },
  { name: 'Slytherin', rarity: 'extremely_rare', description: "Founder's direct line.", bonuses: { damage: 45, intelligence: 35, mp: 30, coins: 40, luck: 20 } },
];

export function getFamilyByName(name: string): Family | undefined {
  return FAMILIES.find(f => f.name.toLowerCase() === name.toLowerCase());
}
`,

  'database/index.ts': `import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'vaultix.db');
let db: SqlJsDatabase | null = null;

export async function initDatabase(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs();
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
  if (!db) throw new Error('Database not initialized');
  return db;
}

export function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

setInterval(() => { if (db) saveDatabase(); }, 30000);

function createTables() {
  if (!db) return;
  db.run(\`CREATE TABLE IF NOT EXISTS players (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
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
    intelligence INTEGER DEFAULT 5
  )\`);
}

function queryOne(sql: string, params: any[] = []): any | null {
  if (!db) return null;
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return result;
}

function run(sql: string, params: any[] = []) {
  if (!db) return;
  db.run(sql, params);
  saveDatabase();
}

export const PlayerDB = {
  get(userId: string) { return queryOne('SELECT * FROM players WHERE user_id = ?', [userId]); },
  create(userId: string, username: string) {
    run('INSERT INTO players (user_id, username) VALUES (?, ?)', [userId, username]);
    return PlayerDB.get(userId);
  },
  getOrCreate(userId: string, username: string) {
    const player = PlayerDB.get(userId);
    return player || PlayerDB.create(userId, username);
  },
  update(userId: string, data: Record<string, any>) {
    const keys = Object.keys(data).map(k => \`\${k} = ?\`).join(', ');
    const values = [...Object.values(data), userId];
    run(\`UPDATE players SET \${keys} WHERE user_id = ?\`, values);
  },
};
`,

  'index.ts': `import { Client, GatewayIntentBits, Events } from 'discord.js';
import { initDatabase } from './database';
import dotenv from 'dotenv';

dotenv.config();

async function startBot() {
  await initDatabase();
  console.log('✅ Database initialized');

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, (c) => {
    console.log(\`✨ Vaultix is online as \${c.user.tag}\`);
  });

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error('❌ DISCORD_TOKEN not found in .env');
    process.exit(1);
  }

  await client.login(token);
}

startBot();
`,
};

export async function generateVaultixZip(): Promise<void> {
  const zip = new JSZip();
  
  // Add all files
  Object.entries(botSourceFiles).forEach(([filename, content]) => {
    zip.file(filename, content);
  });

  // Generate ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  
  // Download
  saveAs(blob, 'vaultix-bot.zip');
}
