import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Sword, Shield, Scroll, Coins, Users, Wand2,
  Castle, BookOpen, Settings, Terminal, ChevronRight,
  Zap, Heart, Star, Crown, Skull, Package, RefreshCw,
  Database, Code, FileText, ArrowRight, ExternalLink, Download, Loader2
} from 'lucide-react';
import { generateVaultixZip, downloadSetupGuide, downloadAllCodeAsText } from './utils/downloadBot';
import GuidePage from './pages/GuidePage';

type Tab = 'guide' | 'overview' | 'commands' | 'systems' | 'families' | 'spells' | 'wands' | 'setup' | 'katabump' | 'files';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('guide');

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'guide', label: '🚀 Setup Guide', icon: Download },
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'commands', label: 'Commands', icon: Terminal },
    { id: 'systems', label: 'Systems', icon: Settings },
    { id: 'families', label: 'Families', icon: Users },
    { id: 'spells', label: 'Spells', icon: Zap },
    { id: 'wands', label: 'Wands', icon: Wand2 },
    { id: 'katabump', label: 'KataBump Deploy', icon: ExternalLink },
    { id: 'files', label: 'Project Files', icon: Code },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-purple-500/20 backdrop-blur-xl bg-gray-950/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                VAULTIX
              </h1>
              <p className="text-xs text-gray-400">Fantasy Wizardry Discord Bot</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium">
              v1.0.0
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-medium">
              Discord.js v14
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <nav className="w-56 shrink-0 hidden lg:block">
          <div className="sticky top-24 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-t border-purple-500/20 p-2 z-50 overflow-x-auto">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-gray-400'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'guide' && <GuidePage />}
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'commands' && <CommandsTab />}
              {activeTab === 'systems' && <SystemsTab />}
              {activeTab === 'families' && <FamiliesTab />}
              {activeTab === 'spells' && <SpellsTab />}
              {activeTab === 'wands' && <WandsTab />}
              {activeTab === 'katabump' && <KataBumpTab />}
              {activeTab === 'files' && <FilesTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function OverviewTab() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      console.log('Starting ZIP generation...');
      await generateVaultixZip();
      console.log('ZIP generation complete');
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Failed to generate ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <h2 className="text-3xl font-bold mb-3">✨ Welcome to Vaultix</h2>
        <p className="text-gray-300 text-lg max-w-2xl">
          A complete fantasy wizardry progression Discord bot featuring combat, dungeons, spells,
          families, wands, and a full economy system. Built with Discord.js v14, SQLite, and TypeScript.
        </p>
        
        {/* Download Button */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating ZIP...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                <span>Download Vaultix Bot (.zip)</span>
              </>
            )}
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={downloadSetupGuide}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Setup Guide (Text)</span>
            </button>
            <button
              onClick={downloadAllCodeAsText}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>All Code (Text)</span>
            </button>
          </div>
          <p className="text-sm text-gray-400">
            Complete bot source code ready for deployment. If ZIP doesn't work, try the text alternatives.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm">
            50-Floor Dungeon
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm">
            17 Families
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm">
            16 Spells
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-pink-500/20 border border-pink-500/30 text-pink-300 text-sm">
            14 Wands
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-sm">
            11 Monsters
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-sm">
            Full Economy
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FeatureCard
          icon={<Sword className="w-5 h-5 text-red-400" />}
          title="Turn-Based Combat"
          description="Full combat system with attack, spells, items, defend, and flee options."
          color="red"
        />
        <FeatureCard
          icon={<Castle className="w-5 h-5 text-purple-400" />}
          title="50-Floor Dungeon"
          description="Progressive difficulty with scaling monsters, group encounters, and boss floors."
          color="purple"
        />
        <FeatureCard
          icon={<Users className="w-5 h-5 text-blue-400" />}
          title="Family System"
          description="17 families across 7 rarities with unique bonuses and passive abilities."
          color="blue"
        />
        <FeatureCard
          icon={<Wand2 className="w-5 h-5 text-yellow-400" />}
          title="Wand Progression"
          description="Wands choose their owner. Evolve into powerful Staffs at high levels."
          color="yellow"
        />
        <FeatureCard
          icon={<Scroll className="w-5 h-5 text-green-400" />}
          title="Spell System"
          description="16 spells including attacks, heals, buffs, and debuffs with cooldowns."
          color="green"
        />
        <FeatureCard
          icon={<Database className="w-5 h-5 text-indigo-400" />}
          title="Persistent Database"
          description="SQLite database ensures all progress is saved across restarts."
          color="indigo"
        />
      </div>

      <div className="rounded-xl bg-gray-900/50 border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-green-400" />
          Tech Stack
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TechItem name="Discord.js v14" desc="Discord API" />
          <TechItem name="TypeScript" desc="Type Safety" />
          <TechItem name="SQLite" desc="Database" />
          <TechItem name="better-sqlite3" desc="DB Driver" />
          <TechItem name="Node.js" desc="Runtime" />
          <TechItem name="Slash Commands" desc="Modern UX" />
          <TechItem name="Buttons/Menus" desc="Interactive" />
          <TechItem name="Embeds" desc="Rich UI" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  const colorMap: Record<string, string> = {
    red: 'border-red-500/30 bg-red-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    yellow: 'border-yellow-500/30 bg-yellow-500/5',
    green: 'border-green-500/30 bg-green-500/5',
    indigo: 'border-indigo-500/30 bg-indigo-500/5',
  };

  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function TechItem({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/30">
      <p className="font-medium text-sm">{name}</p>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  );
}

function CommandsTab() {
  const commands = [
    { name: '/enlist', desc: 'Begin your journey - creates your profile', category: 'Core' },
    { name: '/profile [user]', desc: 'View your or another user\'s profile', category: 'Core' },
    { name: '/stats', desc: 'View detailed combat statistics', category: 'Core' },
    { name: '/work', desc: 'Work to earn XP and coins (60s cooldown)', category: 'Economy' },
    { name: '/family', desc: 'View your current family and bonuses', category: 'Family' },
    { name: '/reroll', desc: 'Reroll your family (requires item)', category: 'Family' },
    { name: '/wand', desc: 'View your wand information', category: 'Equipment' },
    { name: '/spells', desc: 'View your learned spells', category: 'Magic' },
    { name: '/cast <spell>', desc: 'Cast a spell in combat', category: 'Magic' },
    { name: '/magicshop', desc: 'Browse the Magic Shop', category: 'Shop' },
    { name: '/buy <item> [qty]', desc: 'Buy items from the shop', category: 'Shop' },
    { name: '/inventory', desc: 'View your inventory', category: 'Shop' },
    { name: '/dungeon enter', desc: 'Enter the next dungeon floor', category: 'Dungeon' },
    { name: '/dungeon status', desc: 'Check dungeon progress', category: 'Dungeon' },
    { name: '/admin givecoins', desc: 'Give coins to a user (admin)', category: 'Admin' },
    { name: '/admin givexp', desc: 'Give XP to a user (admin)', category: 'Admin' },
    { name: '/admin setlevel', desc: 'Set a user\'s level (admin)', category: 'Admin' },
    { name: '/admin setfamily', desc: 'Set a user\'s family (admin)', category: 'Admin' },
    { name: '/admin setwand', desc: 'Set a user\'s wand (admin)', category: 'Admin' },
    { name: '/admin giveitem', desc: 'Give an item to a user (admin)', category: 'Admin' },
    { name: '/admin resetplayer', desc: 'Reset a user\'s data (admin)', category: 'Admin' },
    { name: '/admin setdungeon', desc: 'Set dungeon floor (admin)', category: 'Admin' },
    { name: '/admin setwizard', desc: 'Set wizard status (admin)', category: 'Admin' },
  ];

  const categories = [...new Set(commands.map(c => c.category))];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📋 All Commands</h2>
      <p className="text-gray-400">Vaultix uses Discord slash commands for all interactions.</p>

      {categories.map(cat => (
        <div key={cat} className="rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50">
            <h3 className="font-semibold text-sm text-gray-300">{cat}</h3>
          </div>
          <div className="divide-y divide-gray-800/50">
            {commands.filter(c => c.category === cat).map(cmd => (
              <div key={cmd.name} className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/30">
                <div>
                  <code className="text-purple-400 font-mono text-sm">{cmd.name}</code>
                  <p className="text-sm text-gray-400 mt-0.5">{cmd.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SystemsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">⚙️ Game Systems</h2>

      <SystemSection title="Player Progression" icon={<Star className="w-5 h-5 text-yellow-400" />}>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• Players start as Workers and earn XP/coins through /work</li>
          <li>• Level up to unlock new content (Wizard at Level 10)</li>
          <li>• XP formula: 100 × 1.5^(level-1) per level</li>
          <li>• Max level: 100</li>
          <li>• Choice between staying Worker or becoming Wizard</li>
        </ul>
      </SystemSection>

      <SystemSection title="Magic Power (MP)" icon={<Zap className="w-5 h-5 text-blue-400" />}>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• Base MP: 50 + (Level × 10) + Family Bonus + Wand Bonus</li>
          <li>• Spells consume MP - can't cast without enough</li>
          <li>• Regenerates 5 MP every 30 seconds</li>
          <li>• Wand spell efficiency reduces MP cost</li>
        </ul>
      </SystemSection>

      <SystemSection title="Combat System" icon={<Sword className="w-5 h-5 text-red-400" />}>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• Turn-based combat with interactive buttons</li>
          <li>• Actions: Attack, Cast Spell, Use Item, Defend, Flee</li>
          <li>• Damage = (Base + Level + Family + Intelligence) × Wand × Defense Reduction × Variance</li>
          <li>• Defend reduces damage by 50%</li>
          <li>• Flee has 30% success chance</li>
          <li>• Cooldowns on spells and buffs/debuffs</li>
        </ul>
      </SystemSection>

      <SystemSection title="Dungeon System" icon={<Castle className="w-5 h-5 text-purple-400" />}>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• 50 floors with progressive difficulty</li>
          <li>• Floors 1-6: Monster count = floor number</li>
          <li>• Floors 7+: Groups of 2-8 monsters</li>
          <li>• Monster stats scale by 1.12^floor</li>
          <li>• Rewards scale with floor depth</li>
          <li>• Loot drops from monsters</li>
        </ul>
      </SystemSection>

      <SystemSection title="Economy" icon={<Coins className="w-5 h-5 text-yellow-400" />}>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• Workers earn through /work (15-35 XP, 10-30 coins)</li>
          <li>• Wizards earn through dungeon rewards</li>
          <li>• Family bonuses affect coin earnings</li>
          <li>• Shop sells spells, potions, rerolls, materials</li>
          <li>• Both paths are balanced - no direct upgrade</li>
        </ul>
      </SystemSection>

      <SystemSection title="Anti-Exploit" icon={<Shield className="w-5 h-5 text-green-400" />}>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• Work cooldown (60 seconds)</li>
          <li>• Daily reroll limit (10 per day)</li>
          <li>• Server-side validation on all inputs</li>
          <li>• Max coin/level caps</li>
          <li>• Stack limits on inventory items</li>
          <li>• Combat timeout protection</li>
          <li>• No negative values accepted</li>
        </ul>
      </SystemSection>
    </div>
  );
}

function SystemSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-900/30 p-5">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function FamiliesTab() {
  const families = [
    { name: 'Granger', rarity: 'Common', bonus: '+15% Intelligence, +5% XP', passive: "Scholar's Mind" },
    { name: 'Abbott', rarity: 'Common', bonus: '+10% HP, +5% Defense', passive: 'Warm Heart' },
    { name: 'Finch', rarity: 'Common', bonus: '+10% Coins, +3% XP', passive: 'Persistent' },
    { name: 'Longbottom', rarity: 'Uncommon', bonus: '+10% Damage, +10% Defense, +5% HP', passive: 'Brave Heart' },
    { name: 'Weasley', rarity: 'Uncommon', bonus: '+20% Coins, +10% Luck', passive: 'Lucky Charm' },
    { name: 'Tonks', rarity: 'Uncommon', bonus: '+10% Intelligence, +8% Luck', passive: 'Metamorph' },
    { name: 'Lupin', rarity: 'Rare', bonus: '+15% Damage, +12% Intelligence, +5% Luck', passive: 'Lunar Power' },
    { name: 'Scamander', rarity: 'Rare', bonus: '+20% Luck, +10% HP, +8% Defense', passive: 'Creature Bond' },
    { name: 'Diggory', rarity: 'Rare', bonus: '+15% Defense, +15% HP, +8% XP', passive: 'Fair Play' },
    { name: 'Black', rarity: 'Epic', bonus: '+20% Damage, +15% MP, +10% Intelligence', passive: 'Dark Arts' },
    { name: 'Malfoy', rarity: 'Epic', bonus: '+35% Coins, +15% Intelligence, +10% Luck', passive: 'Silver Tongue' },
    { name: 'Lestrange', rarity: 'Epic', bonus: '+25% Damage, +10% MP, +8% Luck', passive: 'Fanatical' },
    { name: 'Dumbledore', rarity: 'Legendary', bonus: '+30% Intelligence, +25% MP, +15% Damage, +15% XP', passive: 'Greater Good' },
    { name: 'Peverell', rarity: 'Legendary', bonus: '+30% Luck, +20% Damage, +15% Defense, +10% HP', passive: 'Deathly Hallows' },
    { name: 'Pendragon', rarity: 'Mythic', bonus: '+35% Damage, +25% HP, +20% Defense, +20% MP, +15% Intelligence', passive: 'Royal Blood' },
    { name: 'Morgana', rarity: 'Mythic', bonus: '+40% Damage, +30% MP, +25% Intelligence, +15% Luck', passive: 'Dark Sovereign' },
    { name: 'Potter', rarity: 'Extremely Rare', bonus: '5x Luck, +25% Damage, +20% HP, +15% Defense, +20% XP', passive: 'The Boy Who Lived' },
    { name: 'Slytherin', rarity: 'Extremely Rare', bonus: '+45% Damage, +35% Intelligence, +30% MP, +40% Coins, +20% Luck', passive: "Serpent's Legacy" },
  ];

  const rarityColors: Record<string, string> = {
    'Common': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
    'Uncommon': 'text-green-400 bg-green-500/10 border-green-500/30',
    'Rare': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    'Epic': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    'Legendary': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    'Mythic': 'text-red-400 bg-red-500/10 border-red-500/30',
    'Extremely Rare': 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">🏠 Families</h2>
        <p className="text-gray-400 mt-1">17 families across 7 rarities. Drop rates are configurable.</p>
      </div>

      <div className="rounded-xl bg-gray-900/50 border border-gray-700/50 p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Drop Rates</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { rarity: 'Common', rate: '40%' },
            { rarity: 'Uncommon', rate: '25%' },
            { rarity: 'Rare', rate: '18%' },
            { rarity: 'Epic', rate: '10%' },
            { rarity: 'Legendary', rate: '5%' },
            { rarity: 'Mythic', rate: '1.5%' },
            { rarity: 'Extremely Rare', rate: '0.5%' },
          ].map(d => (
            <div key={d.rarity} className="text-center p-2 rounded-lg bg-gray-800/50">
              <p className={`text-xs font-medium ${rarityColors[d.rarity]?.split(' ')[0]}`}>{d.rarity}</p>
              <p className="text-lg font-bold">{d.rate}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {families.map(f => (
          <div key={f.name} className="rounded-xl border border-gray-700/50 bg-gray-900/30 p-4 hover:bg-gray-800/30 transition-colors">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-yellow-400" />
                <div>
                  <h4 className="font-semibold">{f.name}</h4>
                  <p className="text-xs text-gray-500">{f.passive}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${rarityColors[f.rarity]}`}>
                {f.rarity}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">{f.bonus}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpellsTab() {
  const spells = [
    { name: 'Arcflare', type: 'Attack', damage: 25, mp: 10, rarity: 'Common', level: 10 },
    { name: 'Frostbind', type: 'Attack', damage: 30, mp: 15, rarity: 'Common', level: 10 },
    { name: 'Thunder Lash', type: 'Attack', damage: 40, mp: 20, rarity: 'Uncommon', level: 15 },
    { name: 'Ember Burst', type: 'Attack', damage: 55, mp: 25, rarity: 'Uncommon', level: 18 },
    { name: 'Shadow Pulse', type: 'Attack', damage: 65, mp: 30, rarity: 'Rare', level: 22 },
    { name: 'Void Rend', type: 'Attack', damage: 90, mp: 40, rarity: 'Epic', level: 28 },
    { name: 'Celestial Strike', type: 'Attack', damage: 130, mp: 55, rarity: 'Legendary', level: 35 },
    { name: 'Annihilation', type: 'Attack', damage: 200, mp: 80, rarity: 'Mythic', level: 45 },
    { name: 'Aegis', type: 'Heal', damage: 30, mp: 20, rarity: 'Common', level: 12 },
    { name: 'Rejuvenate', type: 'Heal', damage: 60, mp: 35, rarity: 'Rare', level: 20 },
    { name: 'Phoenix Tears', type: 'Heal', damage: 100, mp: 50, rarity: 'Epic', level: 30 },
    { name: 'Mana Surge', type: 'Buff', damage: 0, mp: 15, rarity: 'Uncommon', level: 14 },
    { name: 'Arcane Shield', type: 'Buff', damage: 0, mp: 20, rarity: 'Rare', level: 16 },
    { name: 'Weakening Curse', type: 'Debuff', damage: 0, mp: 15, rarity: 'Uncommon', level: 13 },
  ];

  const typeColors: Record<string, string> = {
    'Attack': 'text-red-400 bg-red-500/10',
    'Heal': 'text-green-400 bg-green-500/10',
    'Buff': 'text-blue-400 bg-blue-500/10',
    'Debuff': 'text-purple-400 bg-purple-500/10',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📖 Spells</h2>
      <p className="text-gray-400">16 spells across attack, heal, buff, and debuff types.</p>

      <div className="rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Spell</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Type</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Power</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">MP Cost</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Rarity</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Req. Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {spells.map(spell => (
                <tr key={spell.name} className="hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-medium">{spell.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${typeColors[spell.type]}`}>
                      {spell.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{spell.damage > 0 ? spell.damage : '-'}</td>
                  <td className="px-4 py-3 text-blue-400">{spell.mp}</td>
                  <td className="px-4 py-3 text-gray-400">{spell.rarity}</td>
                  <td className="px-4 py-3 text-gray-400">{spell.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function WandsTab() {
  const wands = [
    { name: 'Holly and Phoenix Feather', rarity: 'Common', dmg: '1.1x', mp: '+5', efficiency: '5%', core: 'Phoenix Feather' },
    { name: 'Cherry and Unicorn Hair', rarity: 'Common', dmg: '1.0x', mp: '+10', efficiency: '8%', core: 'Unicorn Hair' },
    { name: 'Pine and Phoenix Feather', rarity: 'Common', dmg: '1.15x', mp: '+3', efficiency: '3%', core: 'Phoenix Feather' },
    { name: 'Vine and Dragon Heartstring', rarity: 'Uncommon', dmg: '1.25x', mp: '+8', efficiency: '6%', core: 'Dragon Heartstring' },
    { name: 'Elder and Thestral Hair', rarity: 'Uncommon', dmg: '1.2x', mp: '+12', efficiency: '7%', core: 'Thestral Hair' },
    { name: 'Yew and Phoenix Feather', rarity: 'Uncommon', dmg: '1.3x', mp: '+6', efficiency: '5%', core: 'Phoenix Feather' },
    { name: 'Ebony and Dragon Heartstring', rarity: 'Rare', dmg: '1.45x', mp: '+10', efficiency: '8%', core: 'Dragon Heartstring' },
    { name: 'Black Walnut and Phoenix Feather', rarity: 'Rare', dmg: '1.5x', mp: '+15', efficiency: '10%', core: 'Phoenix Feather' },
    { name: 'Cypress and Unicorn Hair', rarity: 'Epic', dmg: '1.65x', mp: '+20', efficiency: '12%', core: 'Unicorn Hair' },
    { name: 'Ironwood and Basilisk Horn', rarity: 'Epic', dmg: '1.75x', mp: '+15', efficiency: '10%', core: 'Basilisk Horn' },
    { name: 'Sambucus and Thestral Tail Hair', rarity: 'Legendary', dmg: '2.0x', mp: '+30', efficiency: '15%', core: 'Thestral Tail Hair' },
    { name: 'Arcane Oak and Dragon Heart', rarity: 'Legendary', dmg: '2.1x', mp: '+25', efficiency: '13%', core: 'Dragon Heart' },
    { name: 'Voidwood and Phoenix Soul', rarity: 'Mythic', dmg: '2.5x', mp: '+40', efficiency: '18%', core: 'Phoenix Soul' },
    { name: 'Celestium and Starfire Core', rarity: 'Extremely Rare', dmg: '3.0x', mp: '+50', efficiency: '22%', core: 'Starfire' },
  ];

  const rarityColors: Record<string, string> = {
    'Common': 'text-gray-400',
    'Uncommon': 'text-green-400',
    'Rare': 'text-blue-400',
    'Epic': 'text-purple-400',
    'Legendary': 'text-yellow-400',
    'Mythic': 'text-red-400',
    'Extremely Rare': 'text-pink-400',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">🪄 Wands</h2>
        <p className="text-gray-400 mt-1">14 wands that choose their owner. Evolve into Staffs at high progression.</p>
      </div>

      <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/30 p-4">
        <h3 className="font-semibold text-yellow-400 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Staff Evolution
        </h3>
        <p className="text-sm text-gray-300 mt-1">
          At Level 40, Floor 30, with 10,000 coins and 5 Arcane Crystals, wands can evolve into powerful Staffs.
        </p>
      </div>

      <div className="space-y-2">
        {wands.map(wand => (
          <div key={wand.name} className="rounded-xl border border-gray-700/50 bg-gray-900/30 p-4 hover:bg-gray-800/30 transition-colors">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-yellow-400" />
                  {wand.name}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">Core: {wand.core}</p>
              </div>
              <span className={`text-xs font-medium ${rarityColors[wand.rarity]}`}>
                {wand.rarity}
              </span>
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="text-red-400">⚔️ {wand.dmg}</span>
              <span className="text-blue-400">💫 {wand.mp}</span>
              <span className="text-green-400">✨ {wand.efficiency} efficiency</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SetupTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🚀 Setup Guide</h2>

      <SetupStep number={1} title="Create Discord Application">
        <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
          <li>Go to <a href="https://discord.com/developers/applications" className="text-purple-400 hover:underline" target="_blank">Discord Developer Portal</a></li>
          <li>Click "New Application" and name it "Vaultix"</li>
          <li>Go to the "Bot" tab and click "Add Bot"</li>
          <li>Copy the Bot Token (you'll need this later)</li>
          <li>Copy the Application ID from the "General Information" tab</li>
          <li>Enable "Message Content Intent" under Privileged Gateway Intents</li>
        </ol>
      </SetupStep>

      <SetupStep number={2} title="Install Dependencies">
        <CodeBlock code={`cd bot
npm install`} />
      </SetupStep>

      <SetupStep number={3} title="Configure Environment">
        <CodeBlock code={`# Copy the example env file
cp .env.example .env

# Edit .env with your values:
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here`} />
      </SetupStep>

      <SetupStep number={4} title="Register Slash Commands">
        <CodeBlock code={`# This registers all slash commands globally
npm run deploy

# Or for faster testing in one server:
# Set GUILD_ID in .env first, then:
node dist/deploy-commands.js`} />
      </SetupStep>

      <SetupStep number={5} title="Start the Bot">
        <CodeBlock code={`# Compile TypeScript
npm run build

# Start the bot
npm start

# Or for development:
npm run dev`} />
      </SetupStep>

      <SetupStep number={6} title="Invite to Server">
        <p className="text-sm text-gray-300 mb-2">
          Use this OAuth2 URL format to invite the bot:
        </p>
        <CodeBlock code={`https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=274878024768&scope=bot%20applications.commands`} />
        <p className="text-xs text-gray-500 mt-2">
          Replace YOUR_CLIENT_ID with your actual Application ID.
        </p>
      </SetupStep>

      <SetupStep number={7} title="Extending the Bot">
        <div className="space-y-3 text-sm text-gray-300">
          <p><strong className="text-white">Add a new family:</strong> Edit <code className="text-purple-400">bot/config/families.ts</code> and add to the FAMILIES array.</p>
          <p><strong className="text-white">Add a new spell:</strong> Edit <code className="text-purple-400">bot/config/spells.ts</code> and <code className="text-purple-400">bot/config/shop.ts</code>.</p>
          <p><strong className="text-white">Add a new wand:</strong> Edit <code className="text-purple-400">bot/config/wands.ts</code>.</p>
          <p><strong className="text-white">Add a new monster:</strong> Edit <code className="text-purple-400">bot/config/monsters.ts</code>.</p>
          <p><strong className="text-white">Rebalance:</strong> Edit <code className="text-purple-400">bot/config/index.ts</code> - all values are configurable.</p>
          <p><strong className="text-white">Add commands:</strong> Create a new file in <code className="text-purple-400">bot/commands/</code> following the existing pattern.</p>
        </div>
      </SetupStep>
    </div>
  );
}

function SetupStep({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-900/30 p-5">
      <h3 className="font-semibold flex items-center gap-3 mb-3">
        <span className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-sm text-purple-400">
          {number}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-gray-950 border border-gray-700/50 rounded-lg p-4 overflow-x-auto">
      <code className="text-sm text-green-400 font-mono">{code}</code>
    </pre>
  );
}

function FilesTab() {
  const files = [
    { path: 'bot/', type: 'dir', desc: 'Bot root directory' },
    { path: 'bot/index.ts', type: 'file', desc: 'Main bot entry point - client, event handlers, button logic' },
    { path: 'bot/deploy-commands.ts', type: 'file', desc: 'Registers slash commands with Discord API' },
    { path: 'bot/package.json', type: 'file', desc: 'Bot dependencies and scripts' },
    { path: 'bot/tsconfig.json', type: 'file', desc: 'TypeScript configuration' },
    { path: 'bot/.env.example', type: 'file', desc: 'Environment variable template' },
    { path: 'bot/config/', type: 'dir', desc: 'All game configuration' },
    { path: 'bot/config/index.ts', type: 'file', desc: 'Core balancing values (XP, MP, combat, etc.)' },
    { path: 'bot/config/families.ts', type: 'file', desc: '17 family definitions with rarities and bonuses' },
    { path: 'bot/config/wands.ts', type: 'file', desc: '14 wands + 3 staffs with stats' },
    { path: 'bot/config/spells.ts', type: 'file', desc: '16 spell definitions' },
    { path: 'bot/config/monsters.ts', type: 'file', desc: '11 monster definitions with loot tables' },
    { path: 'bot/config/shop.ts', type: 'file', desc: 'Shop items (spells, potions, materials, rerolls)' },
    { path: 'bot/database/', type: 'dir', desc: 'Database layer' },
    { path: 'bot/database/index.ts', type: 'file', desc: 'SQLite setup, tables, CRUD operations' },
    { path: 'bot/systems/', type: 'dir', desc: 'Core game systems' },
    { path: 'bot/systems/player.ts', type: 'file', desc: 'Player management, stat calculations, embeds' },
    { path: 'bot/systems/combat.ts', type: 'file', desc: 'Full combat engine' },
    { path: 'bot/systems/work.ts', type: 'file', desc: 'Work/economy system' },
    { path: 'bot/commands/', type: 'dir', desc: 'Slash command handlers' },
    { path: 'bot/commands/work.ts', type: 'file', desc: '/work command' },
    { path: 'bot/commands/profile.ts', type: 'file', desc: '/profile command' },
    { path: 'bot/commands/stats.ts', type: 'file', desc: '/stats command' },
    { path: 'bot/commands/family.ts', type: 'file', desc: '/family command' },
    { path: 'bot/commands/wand.ts', type: 'file', desc: '/wand command' },
    { path: 'bot/commands/spells.ts', type: 'file', desc: '/spells command' },
    { path: 'bot/commands/cast.ts', type: 'file', desc: '/cast command' },
    { path: 'bot/commands/dungeon.ts', type: 'file', desc: '/dungeon command (enter/status)' },
    { path: 'bot/commands/magicshop.ts', type: 'file', desc: '/magicshop command' },
    { path: 'bot/commands/buy.ts', type: 'file', desc: '/buy command' },
    { path: 'bot/commands/inventory.ts', type: 'file', desc: '/inventory command' },
    { path: 'bot/commands/reroll.ts', type: 'file', desc: '/reroll command' },
    { path: 'bot/commands/enlist.ts', type: 'file', desc: '/enlist command (registration)' },
    { path: 'bot/commands/admin.ts', type: 'file', desc: '/admin command (9 subcommands)' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📁 Project Files</h2>
      <p className="text-gray-400">Complete file structure of the Vaultix bot.</p>

      <div className="rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="divide-y divide-gray-800/50">
          {files.map(file => (
            <div key={file.path} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-800/30">
              {file.type === 'dir' ? (
                <Package className="w-4 h-4 text-yellow-400 shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-blue-400 shrink-0" />
              )}
              <code className="text-sm font-mono text-gray-300">{file.path}</code>
              <span className="text-xs text-gray-500 ml-auto hidden sm:block">{file.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KataBumpTab() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
        <h2 className="text-3xl font-bold mb-3">🚀 Deploy to KataBump</h2>
        <p className="text-gray-300 text-lg max-w-2xl">
          Host your Vaultix bot 24/7 for free on KataBump. No credit card required.
          308 MB RAM, 716 MB storage — more than enough for Vaultix!
        </p>
        <div className="mt-4 flex gap-3">
          <a
            href="https://katabump.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-medium hover:bg-green-500/30 transition-colors inline-flex items-center gap-2"
          >
            Visit KataBump <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href="https://docs.katabump.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-gray-500/20 border border-gray-500/30 text-gray-300 text-sm font-medium hover:bg-gray-500/30 transition-colors inline-flex items-center gap-2"
          >
            Read Docs <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="space-y-4">
        <KataBumpStep number={1} title="Create Discord Bot Application">
          <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
            <li>Go to <a href="https://discord.com/developers/applications" className="text-purple-400 hover:underline" target="_blank">Discord Developer Portal</a></li>
            <li>Click "New Application" → Name it "Vaultix"</li>
            <li>Go to "Bot" tab → Click "Add Bot"</li>
            <li>Enable <strong>Message Content Intent</strong> and <strong>Server Members Intent</strong></li>
            <li>Copy your <strong>Bot Token</strong> (keep secret!)</li>
            <li>Copy your <strong>Application ID</strong> from General Information</li>
          </ol>
        </KataBumpStep>

        <KataBumpStep number={2} title="Create KataBump Server">
          <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
            <li>Sign up at <a href="https://control.katabump.com" className="text-green-400 hover:underline" target="_blank">control.katabump.com</a></li>
            <li>Click "Create Server" → Select "Discord Bot"</li>
            <li>Choose <strong>Node.js</strong> runtime</li>
            <li>Select the <strong>Free plan</strong> (308 MB RAM)</li>
            <li>Name it "Vaultix Bot" → Click Create</li>
          </ol>
        </KataBumpStep>

        <KataBumpStep number={3} title="Prepare & Upload Files">
          <div className="space-y-3 text-sm text-gray-300">
            <p>1. Copy all files from the <code className="text-purple-400">bot/</code> folder</p>
            <p>2. Create a <code className="text-purple-400">.env</code> file with your tokens:</p>
            <CodeBlock code={`DISCORD_TOKEN=your_bot_token_here\nCLIENT_ID=your_application_id_here`} />
            <p>3. ZIP everything and upload to KataBump's "Files" tab</p>
            <p>4. Right-click the ZIP → "Unarchive"</p>
          </div>
        </KataBumpStep>

        <KataBumpStep number={4} title="Configure Startup">
          <div className="space-y-3 text-sm text-gray-300">
            <p>In the <strong>"Startup"</strong> tab, set:</p>
            <div className="rounded-lg bg-gray-800/50 border border-gray-700/50 p-4">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-700/30">
                    <td className="py-2 font-medium">JS FILE</td>
                    <td className="py-2 text-green-400 font-mono">dist/index.js</td>
                  </tr>
                  <tr className="border-b border-gray-700/30">
                    <td className="py-2 font-medium">Node.js Version</td>
                    <td className="py-2 text-green-400 font-mono">18.x</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Additional Packages</td>
                    <td className="py-2 text-gray-500">(leave empty)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </KataBumpStep>

        <KataBumpStep number={5} title="Build & Start">
          <div className="space-y-3 text-sm text-gray-300">
            <p>In the KataBump console, run these commands:</p>
            <CodeBlock code={`# Install dependencies (automatic from package.json)\n# Compile TypeScript to JavaScript\nnpm install -g typescript\nnpm run build\n\n# Register slash commands with Discord\nnpm run deploy\n\n# Start the bot\nnpm start`} />
            <p>You should see:</p>
            <CodeBlock code={`✅ Database initialized\n🔌 Connecting to Discord...\n✨ Vaultix is online! Logged in as Vaultix#1234\nServing X guilds`} />
          </div>
        </KataBumpStep>

        <KataBumpStep number={6} title="Invite Bot to Server">
          <div className="space-y-3 text-sm text-gray-300">
            <p>Use this URL (replace YOUR_CLIENT_ID):</p>
            <CodeBlock code={`https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=274878024768&scope=bot%20applications.commands`} />
            <p>Then try <code className="text-purple-400">/enlist</code> in your server!</p>
          </div>
        </KataBumpStep>
      </div>

      <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/30 p-5">
        <h3 className="font-semibold text-yellow-400 flex items-center gap-2 mb-3">
          ⚠️ Important Notes
        </h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• <strong>sql.js</strong> is used instead of better-sqlite3 — no native compilation needed on KataBump</li>
          <li>• Database auto-saves every 30 seconds to <code className="text-purple-400">vaultix.db</code></li>
          <li>• Download <code className="text-purple-400">vaultix.db</code> regularly as backup via file manager</li>
          <li>• Global slash commands take up to 1 hour to appear (add GUILD_ID for instant testing)</li>
          <li>• Free tier may restart occasionally — your data is safe in the database file</li>
        </ul>
      </div>

      <div className="rounded-xl bg-gray-900/50 border border-gray-700/50 p-5">
        <h3 className="font-semibold mb-3">🔄 Updating Your Bot</h3>
        <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
          <li>Stop the bot in KataBump console</li>
          <li>Upload new files (ZIP or SFTP)</li>
          <li>Run <code className="text-purple-400">npm run build</code> if you changed TypeScript files</li>
          <li>Start the bot again</li>
        </ol>
      </div>
    </div>
  );
}

function KataBumpStep({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-900/30 p-5">
      <h3 className="font-semibold flex items-center gap-3 mb-3">
        <span className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-sm text-green-400">
          {number}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default App;
