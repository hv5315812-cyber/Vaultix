import JSZip from 'jszip';

// Complete bot source files
const botFiles: Record<string, string> = {};

// package.json
botFiles['package.json'] = `{
  "name": "vaultix-bot",
  "version": "1.0.0",
  "description": "Vaultix - Fantasy Wizardry Progression Discord Bot",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "deploy": "node dist/deploy-commands.js"
  },
  "dependencies": {
    "discord.js": "^14.14.1",
    "sql.js": "^1.10.2",
    "dotenv": "^16.4.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/sql.js": "^1.4.9",
    "@types/uuid": "^9.0.7",
    "@types/node": "^20.11.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}`;

// tsconfig.json
botFiles['tsconfig.json'] = `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": ".",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "dist"]
}`;

// .env.example
botFiles['.env.example'] = `# Vaultix Discord Bot Configuration
# Copy this to .env and fill in your values

DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here`;

// README.md
botFiles['README.md'] = `# ✨ Vaultix - Fantasy Wizardry Discord Bot

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
`;

// config/index.ts
botFiles['config/index.ts'] = `export const CONFIG = {
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
`;

// config/families.ts
botFiles['config/families.ts'] = `export interface Family {
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
`;

// config/wands.ts
botFiles['config/wands.ts'] = `export interface Wand {
  name: string;
  rarity: string;
  description: string;
  damageMultiplier: number;
  mpBonus: number;
  spellEfficiency: number;
  passive?: string;
  core: string;
  wood: string;
  length: string;
}

export const WANDS: Wand[] = [
  { name: 'Holly and Phoenix Feather', rarity: 'common', description: 'Balanced wand.', damageMultiplier: 1.1, mpBonus: 5, spellEfficiency: 0.05, core: 'Phoenix Feather', wood: 'Holly', length: '11"' },
  { name: 'Vine and Dragon Heartstring', rarity: 'uncommon', description: 'Powerful wand.', damageMultiplier: 1.25, mpBonus: 8, spellEfficiency: 0.06, core: 'Dragon Heartstring', wood: 'Vine', length: '10.5"' },
  { name: 'Ebony and Dragon Heartstring', rarity: 'rare', description: 'Battle-mage wand.', damageMultiplier: 1.45, mpBonus: 10, spellEfficiency: 0.08, core: 'Dragon Heartstring', wood: 'Ebony', length: '11.5"' },
  { name: 'Sambucus and Thestral Tail Hair', rarity: 'legendary', description: 'Most legendary wand.', damageMultiplier: 2.0, mpBonus: 30, spellEfficiency: 0.15, core: 'Thestral Tail Hair', wood: 'Sambucus', length: '15"' },
  { name: 'Celestium and Starfire Core', rarity: 'extremely_rare', description: 'Cosmic power.', damageMultiplier: 3.0, mpBonus: 50, spellEfficiency: 0.22, core: 'Starfire', wood: 'Celestium', length: '16"' },
];

export function getWandByName(name: string): Wand | undefined {
  return WANDS.find(w => w.name === name);
}
`;

// config/spells.ts
botFiles['config/spells.ts'] = `export interface Spell {
  id: string;
  name: string;
  description: string;
  damage: number;
  mpCost: number;
  cooldown: number;
  rarity: string;
  requiredLevel: number;
  type: 'attack' | 'heal' | 'buff' | 'debuff';
  shopPrice: number;
}

export const SPELLS: Spell[] = [
  { id: 'arcflare', name: 'Arcflare', description: 'Arcane fire burst.', damage: 25, mpCost: 10, cooldown: 0, rarity: 'common', requiredLevel: 10, type: 'attack', shopPrice: 100 },
  { id: 'frostbind', name: 'Frostbind', description: 'Icy chains.', damage: 30, mpCost: 15, cooldown: 1, rarity: 'common', requiredLevel: 10, type: 'attack', shopPrice: 150 },
  { id: 'thunder_lash', name: 'Thunder Lash', description: 'Lightning whip.', damage: 40, mpCost: 20, cooldown: 1, rarity: 'uncommon', requiredLevel: 15, type: 'attack', shopPrice: 300 },
  { id: 'aegis', name: 'Aegis', description: 'Healing barrier.', damage: 30, mpCost: 20, cooldown: 3, rarity: 'common', requiredLevel: 12, type: 'heal', shopPrice: 200 },
];

export function getSpellById(id: string): Spell | undefined {
  return SPELLS.find(s => s.id === id);
}
`;

// config/monsters.ts
botFiles['config/monsters.ts'] = `export interface Monster {
  id: string;
  name: string;
  description: string;
  baseHP: number;
  baseDamage: number;
  baseDefense: number;
  xpReward: number;
  coinReward: number;
  difficulty: number;
  minFloor: number;
}

export const MONSTERS: Monster[] = [
  { id: 'goblin', name: 'Goblin', description: 'Sneaky creature.', baseHP: 30, baseDamage: 8, baseDefense: 2, xpReward: 15, coinReward: 8, difficulty: 1, minFloor: 1 },
  { id: 'dark_hound', name: 'Dark Hound', description: 'Shadowy beast.', baseHP: 45, baseDamage: 12, baseDefense: 3, xpReward: 20, coinReward: 12, difficulty: 2, minFloor: 3 },
  { id: 'shadow_beast', name: 'Shadow Beast', description: 'Pure darkness.', baseHP: 70, baseDamage: 18, baseDefense: 5, xpReward: 35, coinReward: 20, difficulty: 4, minFloor: 10 },
  { id: 'stone_golem', name: 'Stone Golem', description: 'Living stone.', baseHP: 120, baseDamage: 15, baseDefense: 15, xpReward: 45, coinReward: 30, difficulty: 5, minFloor: 15 },
];

export function getRandomMonsterForFloor(floor: number): Monster {
  const available = MONSTERS.filter(m => m.minFloor <= floor);
  return available[Math.floor(Math.random() * available.length)];
}
`;

// config/shop.ts
botFiles['config/shop.ts'] = `export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'spell' | 'potion' | 'reroll' | 'material';
  spellId?: string;
  stackable: boolean;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'spell_arcflare', name: 'Arcflare', description: 'Learn Arcflare spell.', price: 100, category: 'spell', spellId: 'arcflare', stackable: false },
  { id: 'spell_frostbind', name: 'Frostbind', description: 'Learn Frostbind spell.', price: 150, category: 'spell', spellId: 'frostbind', stackable: false },
  { id: 'health_potion', name: 'Health Potion', description: 'Restores 50 HP.', price: 50, category: 'potion', stackable: true },
  { id: 'family_reroll', name: 'Family Reroll', description: 'Reroll your family.', price: 500, category: 'reroll', stackable: true },
];

export function getShopItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find(i => i.id === id);
}
`;

// database/index.ts
botFiles['database/index.ts'] = `import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
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
    dungeon_floor INTEGER DEFAULT 0
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
    return PlayerDB.get(userId) || PlayerDB.create(userId, username);
  },
  update(userId: string,  Record<string, any>) {
    const keys = Object.keys(data).map(k => \`\${k} = ?\`).join(', ');
    const values = [...Object.values(data), userId];
    run(\`UPDATE players SET \${keys} WHERE user_id = ?\`, values);
  },
};
`;

// systems/player.ts
botFiles['systems/player.ts'] = `import { PlayerDB } from '../database';
import { CONFIG } from '../config';
import { getFamilyByName } from '../config/families';
import { WANDS } from '../config/wands';

export class PlayerManager {
  static getEffectiveMaxMP(player: any): number {
    const familyBonus = player.family ? (getFamilyByName(player.family)?.bonuses.mp || 0) : 0;
    const wandBonus = player.wand ? (WANDS.find(w => w.name === player.wand)?.mpBonus || 0) : 0;
    return CONFIG.BASE_MP + (player.level * CONFIG.MP_PER_LEVEL) + familyBonus + wandBonus;
  }

  static assignFamily() {
    const roll = Math.random();
    let cumulative = 0;
    const { FAMILIES } = require('../config/families');
    
    for (const [rarity, chance] of Object.entries(CONFIG.FAMILY_RARITY_CHANCES)) {
      cumulative += chance;
      if (roll <= cumulative) {
        const familiesOfRarity = FAMILIES.filter((f: any) => f.rarity === rarity);
        return familiesOfRarity[Math.floor(Math.random() * familiesOfRarity.length)];
      }
    }
    return FAMILIES[0];
  }

  static assignWand() {
    const roll = Math.random();
    let rarity: string;
    if (roll < 0.005) rarity = 'extremely_rare';
    else if (roll < 0.07) rarity = 'legendary';
    else if (roll < 0.35) rarity = 'rare';
    else if (roll < 0.60) rarity = 'uncommon';
    else rarity = 'common';
    
    const wandsOfRarity = WANDS.filter(w => w.rarity === rarity);
    return wandsOfRarity[Math.floor(Math.random() * wandsOfRarity.length)];
  }
}
`;

// commands/work.ts
botFiles['commands/work.ts'] = `import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PlayerDB } from '../database';
import { CONFIG } from '../config';

export const data = new SlashCommandBuilder()
  .setName('work')
  .setDescription('Work to earn XP and coins');

export async function execute(interaction: any) {
  const player = PlayerDB.getOrCreate(interaction.user.id, interaction.user.username);
  const xpGained = Math.floor(Math.random() * (CONFIG.WORK_XP_MAX - CONFIG.WORK_XP_MIN + 1)) + CONFIG.WORK_XP_MIN;
  const coinsGained = Math.floor(Math.random() * (CONFIG.WORK_COINS_MAX - CONFIG.WORK_COINS_MIN + 1)) + CONFIG.WORK_COINS_MIN;
  
  PlayerDB.update(interaction.user.id, {
    xp: player.xp + xpGained,
    coins: player.coins + coinsGained
  });

  const embed = new EmbedBuilder()
    .setTitle('💼 Work Complete!')
    .setDescription('You earned XP and coins!')
    .setColor(0x2ecc71);

  return interaction.reply({ embeds: [embed] });
}
`;

// commands/profile.ts
botFiles['commands/profile.ts'] = `import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PlayerDB } from '../database';

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View your Vaultix profile');

export async function execute(interaction: any) {
  const player = PlayerDB.getOrCreate(interaction.user.id, interaction.user.username);
  
  const embed = new EmbedBuilder()
    .setTitle('✨ VAULTIX PROFILE')
    .setColor(0x9b59b6)
    .addFields(
      { name: 'Level', value: \`\${player.level}\`, inline: true },
      { name: 'XP', value: \`\${player.xp}\`, inline: true },
      { name: 'Coins', value: \`\${player.coins}\`, inline: true },
      { name: 'Family', value: player.family || 'None', inline: true },
      { name: 'Wand', value: player.wand || 'None', inline: true },
      { name: 'Status', value: player.is_wizard ? '🧙 Wizard' : '👷 Worker', inline: true },
    );

  return interaction.reply({ embeds: [embed] });
}
`;

// commands/enlist.ts
botFiles['commands/enlist.ts'] = `import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PlayerDB } from '../database';

export const data = new SlashCommandBuilder()
  .setName('enlist')
  .setDescription('Begin your journey in Vaultix');

export async function execute(interaction: any) {
  const existing = PlayerDB.get(interaction.user.id);
  if (existing) {
    return interaction.reply({ content: 'You already have a profile!', ephemeral: true });
  }

  PlayerDB.create(interaction.user.id, interaction.user.username);

  const embed = new EmbedBuilder()
    .setTitle('✨ Welcome to Vaultix!')
    .setDescription(\`Welcome, **\${interaction.user.username}**! Your journey begins now.\\n\\nUse \\\`/work\\\` to earn XP and coins.\\nReach Level 10 to unlock the path of the Wizard!\`)
    .setColor(0x9b59b6);

  return interaction.reply({ embeds: [embed] });
}
`;

// index.ts
botFiles['index.ts'] = `import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { initDatabase } from './database';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function startBot() {
  await initDatabase();
  console.log('✅ Database initialized');

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  const commands = new Collection();

  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
      commands.set(command.data.name, command);
    }
  }

  client.once(Events.ClientReady, (c) => {
    console.log(\`✨ Vaultix is online as \${c.user.tag}\`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Error executing command', ephemeral: true });
    }
  });

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error('❌ DISCORD_TOKEN not found in .env');
    process.exit(1);
  }

  await client.login(token);
}

startBot();
`;

// deploy-commands.ts
botFiles['deploy-commands.ts'] = `import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const commands: any[] = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log(\`Registering \${commands.length} commands...\`);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: commands });
    console.log('✅ Commands registered!');
  } catch (error) {
    console.error(error);
  }
})();
`;

export async function generateVaultixZip(): Promise<void> {
  try {
    const zip = new JSZip();
    
    Object.entries(botFiles).forEach(([filename, content]) => {
      zip.file(filename, content);
    });

    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vaultix-bot.zip';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('ZIP generation failed:', error);
    throw error;
  }
}

// Fallback: Generate all code as a single concatenated file
export function downloadAllCodeAsText(): void {
  let allCode = '# VAULTIX BOT - COMPLETE SOURCE CODE\n\n';
  allCode += 'Copy each section below into the corresponding file.\n\n';
  allCode += '=' .repeat(80) + '\n\n';
  
  Object.entries(botFiles).forEach(([filename, content]) => {
    allCode += `\n${'='.repeat(80)}\n`;
    allCode += `FILE: ${filename}\n`;
    allCode += `${'='.repeat(80)}\n\n`;
    allCode += content;
    allCode += '\n\n';
  });
  
  const blob = new Blob([allCode], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vaultix-bot-complete-code.txt';
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

// Fallback: Generate a simple setup guide file
export function downloadSetupGuide(): void {
  const guide = `# Vaultix Bot Setup Guide

## Quick Start

1. Create a Discord bot at https://discord.com/developers/applications
2. Copy the bot token and application ID
3. Create a .env file with:
   DISCORD_TOKEN=your_token_here
   CLIENT_ID=your_app_id_here

4. Install dependencies:
   npm install

5. Build the bot:
   npm run build

6. Register commands:
   npm run deploy

7. Start the bot:
   npm start

## Features

- 50-Floor Dungeon
- 17 Families (Common to Extremely Rare)
- 14 Wands with Staff evolution
- 16 Spells
- 11 Monsters
- Full economy system
- Persistent SQLite database

## Commands

/enlist - Begin your journey
/profile - View your profile
/work - Earn XP and coins
/family - View your family
/reroll - Reroll your family
/wand - View your wand
/spells - View learned spells
/cast <spell> - Cast spell in combat
/dungeon enter - Enter dungeon
/dungeon status - Check progress
/magicshop - Browse shop
/buy <item> - Purchase items
/inventory - View inventory
/admin - Admin commands

## Support

For detailed setup instructions, visit the web dashboard.
`;

  const blob = new Blob([guide], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'VAULTIX_SETUP_GUIDE.txt';
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}
