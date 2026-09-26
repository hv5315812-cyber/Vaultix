export interface Spell {
  id: string;
  name: string;
  description: string;
  damage: number;
  mpCost: number;
  cooldown: number; // in turns
  rarity: string;
  requiredLevel: number;
  type: 'attack' | 'heal' | 'buff' | 'debuff';
  effect?: string;
  shopPrice: number;
}

export const SPELLS: Spell[] = [
  // Attack Spells
  {
    id: 'arcflare',
    name: 'Arcflare',
    description: 'A burst of arcane fire that scorches the enemy.',
    damage: 25,
    mpCost: 10,
    cooldown: 0,
    rarity: 'common',
    requiredLevel: 10,
    type: 'attack',
    shopPrice: 100,
  },
  {
    id: 'frostbind',
    name: 'Frostbind',
    description: 'Icy chains that freeze and damage the target.',
    damage: 30,
    mpCost: 15,
    cooldown: 1,
    rarity: 'common',
    requiredLevel: 10,
    type: 'attack',
    effect: 'slow',
    shopPrice: 150,
  },
  {
    id: 'thunder_lash',
    name: 'Thunder Lash',
    description: 'A crackling whip of lightning.',
    damage: 40,
    mpCost: 20,
    cooldown: 1,
    rarity: 'uncommon',
    requiredLevel: 15,
    type: 'attack',
    shopPrice: 300,
  },
  {
    id: 'ember_burst',
    name: 'Ember Burst',
    description: 'An explosion of searing embers.',
    damage: 55,
    mpCost: 25,
    cooldown: 2,
    rarity: 'uncommon',
    requiredLevel: 18,
    type: 'attack',
    effect: 'burn',
    shopPrice: 450,
  },
  {
    id: 'shadow_pulse',
    name: 'Shadow Pulse',
    description: 'A wave of dark energy that drains life.',
    damage: 65,
    mpCost: 30,
    cooldown: 2,
    rarity: 'rare',
    requiredLevel: 22,
    type: 'attack',
    effect: 'lifesteal',
    shopPrice: 800,
  },
  {
    id: 'void_rend',
    name: 'Void Rend',
    description: 'Tears reality to unleash devastating damage.',
    damage: 90,
    mpCost: 40,
    cooldown: 3,
    rarity: 'epic',
    requiredLevel: 28,
    type: 'attack',
    effect: 'piercing',
    shopPrice: 1500,
  },
  {
    id: 'celestial_strike',
    name: 'Celestial Strike',
    description: 'Channels starlight into a devastating beam.',
    damage: 130,
    mpCost: 55,
    cooldown: 3,
    rarity: 'legendary',
    requiredLevel: 35,
    type: 'attack',
    shopPrice: 3000,
  },
  {
    id: 'annihilation',
    name: 'Annihilation',
    description: 'The ultimate destructive spell. Nothing survives.',
    damage: 200,
    mpCost: 80,
    cooldown: 5,
    rarity: 'mythic',
    requiredLevel: 45,
    type: 'attack',
    effect: 'execute',
    shopPrice: 6000,
  },
  // Heal Spells
  {
    id: 'aegis',
    name: 'Aegis',
    description: 'A protective barrier that restores health.',
    damage: 30, // heal amount
    mpCost: 20,
    cooldown: 3,
    rarity: 'common',
    requiredLevel: 12,
    type: 'heal',
    shopPrice: 200,
  },
  {
    id: 'rejuvenate',
    name: 'Rejuvenate',
    description: 'Deep healing magic that restores significant health.',
    damage: 60,
    mpCost: 35,
    cooldown: 4,
    rarity: 'rare',
    requiredLevel: 20,
    type: 'heal',
    shopPrice: 600,
  },
  {
    id: 'phoenix_tears',
    name: 'Phoenix Tears',
    description: 'Miraculous healing that nearly fully restores health.',
    damage: 100,
    mpCost: 50,
    cooldown: 6,
    rarity: 'epic',
    requiredLevel: 30,
    type: 'heal',
    shopPrice: 1200,
  },
  // Buff Spells
  {
    id: 'mana_surge',
    name: 'Mana Surge',
    description: 'Temporarily boosts magical power.',
    damage: 0,
    mpCost: 15,
    cooldown: 5,
    rarity: 'uncommon',
    requiredLevel: 14,
    type: 'buff',
    effect: 'damage_up',
    shopPrice: 350,
  },
  {
    id: 'arcane_shield',
    name: 'Arcane Shield',
    description: 'Creates a magical barrier reducing incoming damage.',
    damage: 0,
    mpCost: 20,
    cooldown: 4,
    rarity: 'rare',
    requiredLevel: 16,
    type: 'buff',
    effect: 'defense_up',
    shopPrice: 500,
  },
  // Debuff Spells
  {
    id: 'weaken',
    name: 'Weakening Curse',
    description: 'Reduces enemy damage output.',
    damage: 0,
    mpCost: 15,
    cooldown: 3,
    rarity: 'uncommon',
    requiredLevel: 13,
    type: 'debuff',
    effect: 'enemy_weaken',
    shopPrice: 300,
  },
];

export function getSpellById(id: string): Spell | undefined {
  return SPELLS.find(s => s.id === id);
}

export function getSpellsByRarity(rarity: string): Spell[] {
  return SPELLS.filter(s => s.rarity === rarity);
}
