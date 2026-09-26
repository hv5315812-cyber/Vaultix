export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'spell' | 'potion' | 'material' | 'reroll' | 'wand' | 'equipment';
  effect?: string;
  spellId?: string;
  stackable: boolean;
  maxStack?: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Spells (purchased to learn)
  {
    id: 'spell_arcflare',
    name: 'Arcflare',
    description: 'Learn the Arcflare spell.',
    price: 100,
    category: 'spell',
    spellId: 'arcflare',
    stackable: false,
  },
  {
    id: 'spell_frostbind',
    name: 'Frostbind',
    description: 'Learn the Frostbind spell.',
    price: 150,
    category: 'spell',
    spellId: 'frostbind',
    stackable: false,
  },
  {
    id: 'spell_thunder_lash',
    name: 'Thunder Lash',
    description: 'Learn the Thunder Lash spell.',
    price: 300,
    category: 'spell',
    spellId: 'thunder_lash',
    stackable: false,
  },
  {
    id: 'spell_ember_burst',
    name: 'Ember Burst',
    description: 'Learn the Ember Burst spell.',
    price: 450,
    category: 'spell',
    spellId: 'ember_burst',
    stackable: false,
  },
  {
    id: 'spell_shadow_pulse',
    name: 'Shadow Pulse',
    description: 'Learn the Shadow Pulse spell.',
    price: 800,
    category: 'spell',
    spellId: 'shadow_pulse',
    stackable: false,
  },
  {
    id: 'spell_void_rend',
    name: 'Void Rend',
    description: 'Learn the Void Rend spell.',
    price: 1500,
    category: 'spell',
    spellId: 'void_rend',
    stackable: false,
  },
  {
    id: 'spell_celestial_strike',
    name: 'Celestial Strike',
    description: 'Learn the Celestial Strike spell.',
    price: 3000,
    category: 'spell',
    spellId: 'celestial_strike',
    stackable: false,
  },
  {
    id: 'spell_annihilation',
    name: 'Annihilation',
    description: 'Learn the ultimate Annihilation spell.',
    price: 6000,
    category: 'spell',
    spellId: 'annihilation',
    stackable: false,
  },
  {
    id: 'spell_aegis',
    name: 'Aegis',
    description: 'Learn the Aegis healing spell.',
    price: 200,
    category: 'spell',
    spellId: 'aegis',
    stackable: false,
  },
  {
    id: 'spell_rejuvenate',
    name: 'Rejuvenate',
    description: 'Learn the Rejuvenate healing spell.',
    price: 600,
    category: 'spell',
    spellId: 'rejuvenate',
    stackable: false,
  },
  {
    id: 'spell_phoenix_tears',
    name: 'Phoenix Tears',
    description: 'Learn the Phoenix Tears healing spell.',
    price: 1200,
    category: 'spell',
    spellId: 'phoenix_tears',
    stackable: false,
  },
  {
    id: 'spell_mana_surge',
    name: 'Mana Surge',
    description: 'Learn the Mana Surge buff spell.',
    price: 350,
    category: 'spell',
    spellId: 'mana_surge',
    stackable: false,
  },
  {
    id: 'spell_arcane_shield',
    name: 'Arcane Shield',
    description: 'Learn the Arcane Shield buff spell.',
    price: 500,
    category: 'spell',
    spellId: 'arcane_shield',
    stackable: false,
  },
  {
    id: 'spell_weaken',
    name: 'Weakening Curse',
    description: 'Learn the Weakening Curse debuff spell.',
    price: 300,
    category: 'spell',
    spellId: 'weaken',
    stackable: false,
  },
  // Potions
  {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Restores 50 HP in combat.',
    price: 50,
    category: 'potion',
    effect: 'heal_50',
    stackable: true,
    maxStack: 20,
  },
  {
    id: 'mana_potion',
    name: 'Mana Potion',
    description: 'Restores 30 MP.',
    price: 60,
    category: 'potion',
    effect: 'mana_30',
    stackable: true,
    maxStack: 20,
  },
  {
    id: 'greater_health_potion',
    name: 'Greater Health Potion',
    description: 'Restores 150 HP in combat.',
    price: 150,
    category: 'potion',
    effect: 'heal_150',
    stackable: true,
    maxStack: 10,
  },
  {
    id: 'greater_mana_potion',
    name: 'Greater Mana Potion',
    description: 'Restores 80 MP.',
    price: 180,
    category: 'potion',
    effect: 'mana_80',
    stackable: true,
    maxStack: 10,
  },
  {
    id: 'elixir_of_power',
    name: 'Elixir of Power',
    description: 'Boosts damage by 50% for one dungeon run.',
    price: 500,
    category: 'potion',
    effect: 'damage_boost',
    stackable: true,
    maxStack: 5,
  },
  // Rerolls
  {
    id: 'family_reroll',
    name: 'Family Reroll',
    description: 'Reroll your family for a chance at a better one.',
    price: 500,
    category: 'reroll',
    stackable: true,
    maxStack: 50,
  },
  // Materials
  {
    id: 'arcane_crystal',
    name: 'Arcane Crystal',
    description: 'A rare crystal needed for wand evolution.',
    price: 200,
    category: 'material',
    stackable: true,
    maxStack: 99,
  },
  {
    id: 'wand_upgrade_stone',
    name: 'Wand Upgrade Stone',
    description: 'Used to upgrade wand stats.',
    price: 300,
    category: 'material',
    stackable: true,
    maxStack: 50,
  },
];

export function getShopItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find(item => item.id === id);
}

export function getShopItemsByCategory(category: string): ShopItem[] {
  return SHOP_ITEMS.filter(item => item.category === category);
}
