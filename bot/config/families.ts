export interface Family {
  name: string;
  rarity: string;
  description: string;
  bonuses: {
    luck?: number;
    intelligence?: number;
    damage?: number;
    mp?: number;
    xp?: number;
    coins?: number;
    defense?: number;
    hp?: number;
  };
  passive?: string;
}

export const FAMILIES: Family[] = [
  // Common
  {
    name: 'Granger',
    rarity: 'common',
    description: 'A family of brilliant scholars and dedicated learners.',
    bonuses: { intelligence: 15, xp: 5 },
    passive: 'Scholars Mind: +5% XP from all sources',
  },
  {
    name: 'Abbott',
    rarity: 'common',
    description: 'A warm-hearted family known for their kindness and resilience.',
    bonuses: { hp: 10, defense: 5 },
    passive: 'Warm Heart: +10% maximum HP',
  },
  {
    name: 'Finch',
    rarity: 'common',
    description: 'Loyal and hardworking, the Finches never give up.',
    bonuses: { coins: 10, xp: 3 },
    passive: 'Persistent: +10% coin drops',
  },
  // Uncommon
  {
    name: 'Longbottom',
    rarity: 'uncommon',
    description: 'A family of hidden strength and remarkable courage.',
    bonuses: { damage: 10, defense: 10, hp: 5 },
    passive: 'Brave Heart: +10% damage when below 50% HP',
  },
  {
    name: 'Weasley',
    rarity: 'uncommon',
    description: 'A large, loving family with a knack for finding treasures.',
    bonuses: { coins: 20, luck: 10 },
    passive: 'Lucky Charm: +20% coin earnings',
  },
  {
    name: 'Tonks',
    rarity: 'uncommon',
    description: 'Shape-shifters and adaptors who thrive in any situation.',
    bonuses: { intelligence: 10, luck: 8 },
    passive: 'Metamorph: Random stat boost each dungeon floor',
  },
  // Rare
  {
    name: 'Lupin',
    rarity: 'rare',
    description: 'Wise werewolf lineage with heightened senses and power.',
    bonuses: { damage: 15, intelligence: 12, luck: 5 },
    passive: 'Lunar Power: +15% damage during combat',
  },
  {
    name: 'Scamander',
    rarity: 'rare',
    description: 'Beast tamers with an innate connection to magical creatures.',
    bonuses: { luck: 20, hp: 10, defense: 8 },
    passive: 'Creature Bond: Reduced monster damage by 8%',
  },
  {
    name: 'Diggory',
    rarity: 'rare',
    description: 'Noble and fair, known for their unwavering integrity.',
    bonuses: { defense: 15, hp: 15, xp: 8 },
    passive: 'Fair Play: +8% XP, +15% defense',
  },
  // Epic
  {
    name: 'Black',
    rarity: 'epic',
    description: 'An ancient pure-blood family with deep magical roots.',
    bonuses: { damage: 20, mp: 15, intelligence: 10 },
    passive: 'Dark Arts: +20% spell damage',
  },
  {
    name: 'Malfoy',
    rarity: 'epic',
    description: 'Wealthy and cunning, masters of political magic.',
    bonuses: { coins: 35, intelligence: 15, luck: 10 },
    passive: 'Silver Tongue: +35% coin earnings',
  },
  {
    name: 'Lestrange',
    rarity: 'epic',
    description: 'Fierce and devoted, their magic burns with intensity.',
    bonuses: { damage: 25, mp: 10, luck: 8 },
    passive: 'Fanatical: +25% damage, spells cost 10% less MP',
  },
  // Legendary
  {
    name: 'Dumbledore',
    rarity: 'legendary',
    description: 'The greatest magical lineage, producing legendary wizards.',
    bonuses: { intelligence: 30, mp: 25, damage: 15, xp: 15 },
    passive: 'Greater Good: +15% XP, +25% max MP',
  },
  {
    name: 'Peverell',
    rarity: 'legendary',
    description: 'Ancient bloodline connected to the deepest magic.',
    bonuses: { luck: 30, damage: 20, defense: 15, hp: 10 },
    passive: 'Deathly Hallows: +30% luck on all rolls',
  },
  // Mythic
  {
    name: 'Pendragon',
    rarity: 'mythic',
    description: 'Descendants of an ancient magical king, wielding legendary power.',
    bonuses: { damage: 35, hp: 25, defense: 20, mp: 20, intelligence: 15 },
    passive: 'Royal Blood: All stats boosted, +35% damage',
  },
  {
    name: 'Morgana',
    rarity: 'mythic',
    description: 'Dark sorceress lineage of immense arcane power.',
    bonuses: { damage: 40, mp: 30, intelligence: 25, luck: 15 },
    passive: 'Dark Sovereign: +40% spell damage, +30% max MP',
  },
  // Extremely Rare
  {
    name: 'Potter',
    rarity: 'extremely_rare',
    description: 'The chosen bloodline, blessed with extraordinary fortune.',
    bonuses: { luck: 50, damage: 25, hp: 20, defense: 15, xp: 20 },
    passive: 'The Boy Who Lived: 5x luck, +20% XP from all sources',
  },
  {
    name: 'Slytherin',
    rarity: 'extremely_rare',
    description: 'The founder\'s direct line, masters of ambition and cunning.',
    bonuses: { damage: 45, intelligence: 35, mp: 30, coins: 40, luck: 20 },
    passive: 'Serpent\'s Legacy: +45% damage, +40% coins',
  },
];

export function getFamilyByName(name: string): Family | undefined {
  return FAMILIES.find(f => f.name.toLowerCase() === name.toLowerCase());
}

export function getFamiliesByRarity(rarity: string): Family[] {
  return FAMILIES.filter(f => f.rarity === rarity);
}
