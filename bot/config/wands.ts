export interface Wand {
  name: string;
  rarity: string;
  description: string;
  damageMultiplier: number;
  mpBonus: number;
  spellEfficiency: number; // percentage reduction in MP cost
  passive?: string;
  core: string;
  wood: string;
  length: string;
}

export const WANDS: Wand[] = [
  // Common
  {
    name: 'Holly and Phoenix Feather',
    rarity: 'common',
    description: 'A balanced wand with a warm, golden glow.',
    damageMultiplier: 1.1,
    mpBonus: 5,
    spellEfficiency: 0.05,
    passive: 'Lucky Strike: 5% chance for double damage',
    core: 'Phoenix Feather',
    wood: 'Holly',
    length: '11 inches',
  },
  {
    name: 'Cherry and Unicorn Hair',
    rarity: 'common',
    description: 'A gentle wand that favors defensive magic.',
    damageMultiplier: 1.0,
    mpBonus: 10,
    spellEfficiency: 0.08,
    passive: 'Gentle Shield: +10% max MP',
    core: 'Unicorn Hair',
    wood: 'Cherry',
    length: '10 inches',
  },
  {
    name: 'Pine and Phoenix Feather',
    rarity: 'common',
    description: 'A resilient wand for determined wizards.',
    damageMultiplier: 1.15,
    mpBonus: 3,
    spellEfficiency: 0.03,
    passive: 'Resilience: +15% damage on basic attacks',
    core: 'Phoenix Feather',
    wood: 'Pine',
    length: '12 inches',
  },
  // Uncommon
  {
    name: 'Vine and Dragon Heartstring',
    rarity: 'uncommon',
    description: 'A powerful wand that responds to strong ambition.',
    damageMultiplier: 1.25,
    mpBonus: 8,
    spellEfficiency: 0.06,
    passive: 'Ambitious Strike: +25% damage',
    core: 'Dragon Heartstring',
    wood: 'Vine',
    length: '10.5 inches',
  },
  {
    name: 'Elder and Thestral Hair',
    rarity: 'uncommon',
    description: 'A mysterious wand with an otherworldly presence.',
    damageMultiplier: 1.2,
    mpBonus: 12,
    spellEfficiency: 0.07,
    passive: 'Death Whisper: Spells ignore 10% enemy defense',
    core: 'Thestral Hair',
    wood: 'Elder',
    length: '13 inches',
  },
  {
    name: 'Yew and Phoenix Feather',
    rarity: 'uncommon',
    description: 'A wand of transformation and power.',
    damageMultiplier: 1.3,
    mpBonus: 6,
    spellEfficiency: 0.05,
    passive: 'Transform: 8% chance to heal 10% HP on kill',
    core: 'Phoenix Feather',
    wood: 'Yew',
    length: '13.5 inches',
  },
  // Rare
  {
    name: 'Ebony and Dragon Heartstring',
    rarity: 'rare',
    description: 'A wand suited for battle-mages and duelists.',
    damageMultiplier: 1.45,
    mpBonus: 10,
    spellEfficiency: 0.08,
    passive: 'Battle Mage: +45% damage, spells are 8% cheaper',
    core: 'Dragon Heartstring',
    wood: 'Ebony',
    length: '11.5 inches',
  },
  {
    name: 'Black Walnut and Phoenix Feather',
    rarity: 'rare',
    description: 'A wand of raw, untamed magical energy.',
    damageMultiplier: 1.5,
    mpBonus: 15,
    spellEfficiency: 0.1,
    passive: 'Raw Power: +50% damage, +15 max MP',
    core: 'Phoenix Feather',
    wood: 'Black Walnut',
    length: '12.5 inches',
  },
  // Epic
  {
    name: 'Cypress and Unicorn Hair',
    rarity: 'epic',
    description: 'A noble wand that refuses to serve the unworthy.',
    damageMultiplier: 1.65,
    mpBonus: 20,
    spellEfficiency: 0.12,
    passive: 'Noble Will: +65% damage, +20 max MP, 12% MP savings',
    core: 'Unicorn Hair',
    wood: 'Cypress',
    length: '12 inches',
  },
  {
    name: 'Ironwood and Basilisk Horn',
    rarity: 'epic',
    description: 'A fearsome wand crafted from rare materials.',
    damageMultiplier: 1.75,
    mpBonus: 15,
    spellEfficiency: 0.1,
    passive: 'Venomous Strike: Attacks apply poison (5% HP/turn)',
    core: 'Basilisk Horn',
    wood: 'Ironwood',
    length: '14 inches',
  },
  // Legendary
  {
    name: 'Sambucus and Thestral Tail Hair',
    rarity: 'legendary',
    description: 'The most legendary wand, said to be unbeatable.',
    damageMultiplier: 2.0,
    mpBonus: 30,
    spellEfficiency: 0.15,
    passive: 'Master of Death: +100% damage, +30 MP, 15% MP savings',
    core: 'Thestral Tail Hair',
    wood: 'Sambucus',
    length: '15 inches',
  },
  {
    name: 'Arcane Oak and Dragon Heart',
    rarity: 'legendary',
    description: 'A wand pulsing with ancient draconic power.',
    damageMultiplier: 2.1,
    mpBonus: 25,
    spellEfficiency: 0.13,
    passive: 'Draconic Fury: +110% damage, fire spells deal 25% extra',
    core: 'Dragon Heart',
    wood: 'Arcane Oak',
    length: '14.5 inches',
  },
  // Mythic
  {
    name: 'Voidwood and Phoenix Soul',
    rarity: 'mythic',
    description: 'Forged in the space between worlds.',
    damageMultiplier: 2.5,
    mpBonus: 40,
    spellEfficiency: 0.18,
    passive: 'Void Walker: +150% damage, +40 MP, phase through 18% of damage',
    core: 'Phoenix Soul',
    wood: 'Voidwood',
    length: '15.5 inches',
  },
  // Extremely Rare
  {
    name: 'Celestium and Starfire Core',
    rarity: 'extremely_rare',
    description: 'A wand born from a fallen star, containing cosmic power.',
    damageMultiplier: 3.0,
    mpBonus: 50,
    spellEfficiency: 0.22,
    passive: 'Cosmic Power: +200% damage, +50 MP, 22% MP savings, all spells enhanced',
    core: 'Starfire',
    wood: 'Celestium',
    length: '16 inches',
  },
];

// Staff definitions (evolved wands)
export interface Staff extends Wand {
  evolutionLevel: number;
  staffPassive: string;
}

export const STAFFS: Staff[] = [
  {
    name: 'Staff of the Archmage',
    rarity: 'legendary',
    description: 'A staff radiating with supreme magical authority.',
    damageMultiplier: 3.5,
    mpBonus: 60,
    spellEfficiency: 0.25,
    passive: 'Archmage: +250% damage, +60 MP',
    staffPassive: 'Arcane Supremacy: All spells deal 50% more damage',
    core: 'Phoenix Soul',
    wood: 'Ancient Yew',
    length: '6 feet',
    evolutionLevel: 1,
  },
  {
    name: 'Staff of Eternal Flame',
    rarity: 'mythic',
    description: 'A staff wreathed in undying fire.',
    damageMultiplier: 4.0,
    mpBonus: 80,
    spellEfficiency: 0.3,
    passive: 'Eternal Flame: +300% damage, +80 MP',
    staffPassive: 'Inferno: Fire spells cost no MP, deal double damage',
    core: 'Dragon Soul',
    wood: 'Flameheart',
    length: '6.5 feet',
    evolutionLevel: 2,
  },
  {
    name: 'Staff of the Void',
    rarity: 'extremely_rare',
    description: 'A staff that bends reality itself.',
    damageMultiplier: 5.0,
    mpBonus: 100,
    spellEfficiency: 0.35,
    passive: 'Void Master: +400% damage, +100 MP',
    staffPassive: 'Reality Warp: 20% chance to instantly defeat enemies',
    core: 'Void Essence',
    wood: 'Celestium',
    length: '7 feet',
    evolutionLevel: 3,
  },
];

export function getWandByName(name: string): Wand | undefined {
  return WANDS.find(w => w.name.toLowerCase() === name.toLowerCase());
}

export function getWandsByRarity(rarity: string): Wand[] {
  return WANDS.filter(w => w.rarity === rarity);
}
