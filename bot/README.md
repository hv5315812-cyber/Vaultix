# ✨ Vaultix - Fantasy Wizardry Discord Bot

A complete fantasy wizardry progression Discord bot featuring combat, dungeons, spells, families, wands, and a full economy system.

## 🎮 Features

- **Player Progression** - Start as a Worker, become a Wizard at Level 10
- **50-Floor Dungeon** - Progressive difficulty with scaling monsters
- **Turn-Based Combat** - Attack, spells, items, defend, flee
- **17 Families** - 7 rarity tiers with unique bonuses and passives
- **14 Wands** - Wands choose their owner, evolve into Staffs
- **16 Spells** - Attack, heal, buff, and debuff spells
- **11 Monsters** - With unique abilities and loot tables
- **Full Economy** - Work, shop, loot, and trade
- **Persistent Database** - SQLite ensures data survives restarts
- **Admin Tools** - Full admin command suite for management
- **Anti-Exploit** - Cooldowns, limits, and server-side validation

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Discord.js v14 | Discord API wrapper |
| TypeScript | Type safety |
| SQLite (better-sqlite3) | Persistent database |
| Node.js | Runtime |

## 📁 Project Structure

```
bot/
├── index.ts              # Main entry point
├── deploy-commands.ts    # Slash command registration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── .env.example          # Environment template
├── config/
│   ├── index.ts          # Core balancing values
│   ├── families.ts       # Family definitions
│   ├── wands.ts          # Wand & Staff definitions
│   ├── spells.ts         # Spell definitions
│   ├── monsters.ts       # Monster definitions
│   └── shop.ts           # Shop items
├── database/
│   └── index.ts          # SQLite setup & CRUD operations
├── systems/
│   ├── player.ts         # Player management & stat calculations
│   ├── combat.ts         # Combat engine
│   └── work.ts           # Work/economy system
└── commands/
    ├── enlist.ts         # /enlist - Registration
    ├── profile.ts        # /profile - View profile
    ├── stats.ts          # /stats - Detailed stats
    ├── work.ts           # /work - Earn XP/coins
    ├── family.ts         # /family - View family
    ├── reroll.ts         # /reroll - Reroll family
    ├── wand.ts           # /wand - View wand
    ├── spells.ts         # /spells - View spells
    ├── cast.ts           # /cast - Cast spell
    ├── dungeon.ts        # /dungeon - Enter/check dungeon
    ├── magicshop.ts      # /magicshop - Browse shop
    ├── buy.ts            # /buy - Purchase items
    ├── inventory.ts      # /inventory - View inventory
    └── admin.ts          # /admin - Admin commands
```

## 🚀 Setup Instructions

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" → Name it "Vaultix"
3. Go to "Bot" tab → "Add Bot"
4. Copy the **Bot Token**
5. Go to "General Information" → Copy the **Application ID**
6. Enable **Message Content Intent** under Privileged Gateway Intents

### 2. Install Dependencies

```bash
cd bot
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
```

### 4. Register Commands

```bash
# Compile TypeScript
npm run build

# Register slash commands globally
npm run deploy
```

### 5. Start the Bot

```bash
npm start
```

### 6. Invite to Server

Use this URL (replace `YOUR_CLIENT_ID`):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=274878024768&scope=bot%20applications.commands
```

## 📋 Commands

| Command | Description |
|---------|-------------|
| `/enlist` | Begin your journey |
| `/profile [user]` | View profile |
| `/stats` | Detailed statistics |
| `/work` | Earn XP and coins |
| `/family` | View family info |
| `/reroll` | Reroll family |
| `/wand` | View wand info |
| `/spells` | View learned spells |
| `/cast <spell>` | Cast spell in combat |
| `/dungeon enter` | Enter dungeon |
| `/dungeon status` | Check progress |
| `/magicshop` | Browse shop |
| `/buy <item> [qty]` | Buy items |
| `/inventory` | View inventory |
| `/admin *` | Admin commands (9 subcommands) |

## 🏠 Families

| Name | Rarity | Key Bonus |
|------|--------|-----------|
| Granger | Common | +15% Intelligence |
| Abbott | Common | +10% HP |
| Finch | Common | +10% Coins |
| Longbottom | Uncommon | +10% Damage |
| Weasley | Uncommon | +20% Coins |
| Tonks | Uncommon | +10% Intelligence |
| Lupin | Rare | +15% Damage |
| Scamander | Rare | +20% Luck |
| Diggory | Rare | +15% Defense |
| Black | Epic | +20% Damage |
| Malfoy | Epic | +35% Coins |
| Lestrange | Epic | +25% Damage |
| Dumbledore | Legendary | +30% Intelligence |
| Peverell | Legendary | +30% Luck |
| Pendragon | Mythic | +35% Damage |
| Morgana | Mythic | +40% Damage |
| Potter | Extremely Rare | 5x Luck |
| Slytherin | Extremely Rare | +45% Damage |

### Drop Rates (Configurable)

| Rarity | Chance |
|--------|--------|
| Common | 40% |
| Uncommon | 25% |
| Rare | 18% |
| Epic | 10% |
| Legendary | 5% |
| Mythic | 1.5% |
| Extremely Rare | 0.5% |

## 🔧 Customization

All balancing values are in `bot/config/index.ts`:

- XP requirements and work rewards
- MP regeneration and base values
- Combat damage formulas
- Family drop rates
- Shop prices
- Dungeon scaling
- Cooldowns and limits

### Adding New Content

- **New Family**: Add to `FAMILIES` array in `config/families.ts`
- **New Spell**: Add to `SPELLS` array in `config/spells.ts` + shop entry
- **New Wand**: Add to `WANDS` array in `config/wands.ts`
- **New Monster**: Add to `MONSTERS` array in `config/monsters.ts`
- **New Command**: Create file in `commands/` with `data` and `execute` exports

## 🗄️ Database

The bot uses SQLite with WAL mode. The database file (`vaultix.db`) is created automatically on first run.

**Tables:**
- `players` - User profiles and stats
- `player_spells` - Learned spells per user
- `player_inventory` - Inventory items per user
- `combat_sessions` - Active combat states
- `shop_purchases` - Purchase history

## 🛡️ Anti-Exploit

- Work cooldown (60 seconds)
- Daily reroll limit (10/day)
- Server-side validation on all inputs
- Max coin cap (999,999,999)
- Max level cap (100)
- Inventory stack limits
- Combat timeout protection
- No negative values accepted
- Button interaction validation

## 📄 License

MIT

---

Built with ❤️ for the Discord community.
