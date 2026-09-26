// Vaultix Configuration - All balancing values are here
export const CONFIG = {
  // Progression
  XP_PER_LEVEL: (level: number) => Math.floor(100 * Math.pow(1.5, level - 1)),
  WORK_COOLDOWN_MS: 60000, // 1 minute
  WORK_XP_MIN: 15,
  WORK_XP_MAX: 35,
  WORK_COINS_MIN: 10,
  WORK_COINS_MAX: 30,
  WIZARD_UNLOCK_LEVEL: 10,

  // Magic Power
  BASE_MP: 50,
  MP_PER_LEVEL: 10,
  MP_REGEN_INTERVAL_MS: 30000, // 30 seconds
  MP_REGEN_AMOUNT: 5,

  // Combat
  BASE_PLAYER_HP: 100,
  HP_PER_LEVEL: 15,
  BASE_DAMAGE: 10,
  DAMAGE_PER_LEVEL: 2,
  DAMAGE_VARIANCE: 0.2, // ±20%
  DEFEND_REDUCTION: 0.5,
  FLEE_CHANCE: 0.3,

  // Family Reroll
  REROLL_BASE_PRICE: 500,
  REROLL_PRICE_MULTIPLIER: 1.5,

  // Family Rarity Chances (must sum to 1.0)
  FAMILY_RARITY_CHANCES: {
    common: 0.40,
    uncommon: 0.25,
    rare: 0.18,
    epic: 0.10,
    legendary: 0.05,
    mythic: 0.015,
    extremely_rare: 0.005,
  },

  // Dungeon
  DUNGEON_1_FLOORS: 50,
  DUNGEON_BASE_MONSTERS: 1,
  DUNGEON_MONSTER_SCALING: 1.12,
  DUNGEON_XP_BASE: 25,
  DUNGEON_COINS_BASE: 15,
  DUNGEON_REST_COOLDOWN_MS: 5000,

  // Staff Evolution Requirements
  STAFF_EVOLUTION_LEVEL: 40,
  STAFF_EVOLUTION_DUNGEON_FLOOR: 30,
  STAFF_EVOLUTION_COINS: 10000,
  STAFF_EVOLUTION_MATERIAL: 'arcane_crystal',
  STAFF_EVOLUTION_MATERIAL_COUNT: 5,

  // Anti-Exploit
  MAX_COINS: 999999999,
  MAX_LEVEL: 100,
  MAX_REROLLS_PER_DAY: 10,
  COMBAT_TIMEOUT_MS: 60000,
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

export const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'extremely_rare'];
