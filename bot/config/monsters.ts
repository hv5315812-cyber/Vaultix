export interface Monster {
  id: string;
  name: string;
  description: string;
  baseHP: number;
  baseDamage: number;
  baseDefense: number;
  xpReward: number;
  coinReward: number;
  lootTable: { itemId: string; chance: number }[];
  specialAbility?: string;
  difficulty: number;
  minFloor: number;
}

export const MONSTERS: Monster[] = [
  {
    id: 'goblin',
    name: 'Goblin',
    description: 'A sneaky creature with sharp claws.',
    baseHP: 30,
    baseDamage: 8,
    baseDefense: 2,
    xpReward: 15,
    coinReward: 8,
    lootTable: [{ itemId: 'goblin_ear', chance: 0.3 }],
    difficulty: 1,
    minFloor: 1,
  },
  {
    id: 'dark_hound',
    name: 'Dark Hound',
    description: 'A shadowy beast with glowing red eyes.',
    baseHP: 45,
    baseDamage: 12,
    baseDefense: 3,
    xpReward: 20,
    coinReward: 12,
    lootTable: [{ itemId: 'shadow_fang', chance: 0.25 }],
    specialAbility: 'pack_hunt',
    difficulty: 2,
    minFloor: 3,
  },
  {
    id: 'crystal_spider',
    name: 'Crystal Spider',
    description: 'A massive arachnid with crystalline armor.',
    baseHP: 55,
    baseDamage: 10,
    baseDefense: 8,
    xpReward: 25,
    coinReward: 15,
    lootTable: [{ itemId: 'crystal_silk', chance: 0.2 }, { itemId: 'arcane_crystal', chance: 0.05 }],
    specialAbility: 'web_trap',
    difficulty: 3,
    minFloor: 5,
  },
  {
    id: 'shadow_beast',
    name: 'Shadow Beast',
    description: 'A creature born from pure darkness.',
    baseHP: 70,
    baseDamage: 18,
    baseDefense: 5,
    xpReward: 35,
    coinReward: 20,
    lootTable: [{ itemId: 'shadow_essence', chance: 0.2 }],
    specialAbility: 'shadow_strike',
    difficulty: 4,
    minFloor: 10,
  },
  {
    id: 'stone_golem',
    name: 'Stone Golem',
    description: 'An ancient construct of living stone.',
    baseHP: 120,
    baseDamage: 15,
    baseDefense: 15,
    xpReward: 45,
    coinReward: 30,
    lootTable: [{ itemId: 'golem_core', chance: 0.15 }, { itemId: 'arcane_crystal', chance: 0.08 }],
    specialAbility: 'stone_skin',
    difficulty: 5,
    minFloor: 15,
  },
  {
    id: 'arcane_wraith',
    name: 'Arcane Wraith',
    description: 'A spectral being that feeds on magic.',
    baseHP: 80,
    baseDamage: 25,
    baseDefense: 6,
    xpReward: 55,
    coinReward: 35,
    lootTable: [{ itemId: 'wraith_essence', chance: 0.15 }, { itemId: 'mana_shard', chance: 0.2 }],
    specialAbility: 'mana_drain',
    difficulty: 6,
    minFloor: 20,
  },
  {
    id: 'dungeon_guardian',
    name: 'Dungeon Guardian',
    description: 'An armored sentinel protecting the dungeon depths.',
    baseHP: 150,
    baseDamage: 22,
    baseDefense: 18,
    xpReward: 70,
    coinReward: 50,
    lootTable: [{ itemId: 'guardian_shard', chance: 0.1 }, { itemId: 'arcane_crystal', chance: 0.12 }],
    specialAbility: 'shield_bash',
    difficulty: 7,
    minFloor: 25,
  },
  {
    id: 'infernal_demon',
    name: 'Infernal Demon',
    description: 'A demon summoned from the fiery depths.',
    baseHP: 180,
    baseDamage: 30,
    baseDefense: 12,
    xpReward: 90,
    coinReward: 65,
    lootTable: [{ itemId: 'demon_horn', chance: 0.1 }, { itemId: 'hellfire_essence', chance: 0.08 }],
    specialAbility: 'hellfire',
    difficulty: 8,
    minFloor: 30,
  },
  {
    id: 'void_walker',
    name: 'Void Walker',
    description: 'An entity from between dimensions.',
    baseHP: 200,
    baseDamage: 35,
    baseDefense: 15,
    xpReward: 110,
    coinReward: 80,
    lootTable: [{ itemId: 'void_fragment', chance: 0.08 }, { itemId: 'arcane_crystal', chance: 0.15 }],
    specialAbility: 'phase_shift',
    difficulty: 9,
    minFloor: 35,
  },
  {
    id: 'elder_dragon',
    name: 'Elder Dragon',
    description: 'An ancient dragon of immense power.',
    baseHP: 300,
    baseDamage: 45,
    baseDefense: 25,
    xpReward: 150,
    coinReward: 120,
    lootTable: [{ itemId: 'dragon_scale', chance: 0.1 }, { itemId: 'arcane_crystal', chance: 0.2 }],
    specialAbility: 'dragon_breath',
    difficulty: 10,
    minFloor: 40,
  },
  {
    id: 'abyssal_lord',
    name: 'Abyssal Lord',
    description: 'The final guardian of the dungeon. A being of pure destruction.',
    baseHP: 500,
    baseDamage: 60,
    baseDefense: 35,
    xpReward: 300,
    coinReward: 250,
    lootTable: [{ itemId: 'abyssal_core', chance: 0.15 }, { itemId: 'arcane_crystal', chance: 0.3 }],
    specialAbility: 'annihilation_wave',
    difficulty: 11,
    minFloor: 50,
  },
];

export function getMonsterById(id: string): Monster | undefined {
  return MONSTERS.find(m => m.id === id);
}

export function getMonstersForFloor(floor: number): Monster[] {
  return MONSTERS.filter(m => m.minFloor <= floor);
}

export function getRandomMonsterForFloor(floor: number): Monster {
  const available = getMonstersForFloor(floor);
  // Weight towards harder monsters on higher floors
  const weighted = available.map(m => ({
    monster: m,
    weight: m.minFloor <= floor ? Math.max(1, floor - m.minFloor + 1) : 0
  }));
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;
  for (const w of weighted) {
    random -= w.weight;
    if (random <= 0) return w.monster;
  }
  return available[available.length - 1];
}
