import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle2, Copy, ExternalLink, Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import { generateVaultixZip } from '../utils/downloadBot';

export default function GuidePage() {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateVaultixZip();
      setDownloaded(true);
      setTimeout(() => setExpandedStep(1), 500);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate ZIP file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const steps = [
    {
      title: 'Download Vaultix Bot',
      icon: '📦',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">Click the button below to download the complete Vaultix bot as a ZIP file.</p>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
              downloaded
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
            } ${downloading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {downloading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating ZIP...
              </span>
            ) : downloaded ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Downloaded! Click to Download Again
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download vaultix-bot.zip
              </span>
            )}
          </button>
          <p className="text-sm text-gray-400">
            The ZIP contains all source code, configuration files, and documentation.
          </p>
        </div>
      ),
    },
    {
      title: 'Extract the ZIP',
      icon: '📂',
      content: (
        <div className="space-y-3">
          <p className="text-gray-300">Extract the downloaded ZIP file to a folder on your computer.</p>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400 mb-2">After extraction, you should see:</p>
            <div className="font-mono text-sm text-purple-400 space-y-1">
              <p>vaultix-bot/</p>
              <p className="pl-4">├── package.json</p>
              <p className="pl-4">├── tsconfig.json</p>
              <p className="pl-4">├── .env.example</p>
              <p className="pl-4">├── README.md</p>
              <p className="pl-4">├── index.ts</p>
              <p className="pl-4">├── deploy-commands.ts</p>
              <p className="pl-4">├── config/</p>
              <p className="pl-4">├── database/</p>
              <p className="pl-4">├── systems/</p>
              <p className="pl-4">└── commands/</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Create Discord Bot Application',
      icon: '🤖',
      content: (
        <div className="space-y-3">
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">1.</span>
              <span>Go to <a href="https://discord.com/developers/applications" target="_blank" className="text-purple-400 hover:underline flex items-center gap-1">Discord Developer Portal <ExternalLink className="w-3 h-3" /></a></span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">2.</span>
              <span>Click <strong>"New Application"</strong> → Name it "Vaultix"</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">3.</span>
              <span>Go to the <strong>"Bot"</strong> tab → Click <strong>"Add Bot"</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">4.</span>
              <span>Under <strong>Privileged Gateway Intents</strong>, enable:</span>
            </li>
            <ul className="pl-8 space-y-1 text-sm text-gray-400">
              <li>✅ Message Content Intent</li>
              <li>✅ Server Members Intent</li>
            </ul>
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">5.</span>
              <span>Copy your <strong>Bot Token</strong> (keep this secret!)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">6.</span>
              <span>Go to <strong>"General Information"</strong> → Copy your <strong>Application ID</strong></span>
            </li>
          </ol>
        </div>
      ),
    },
    {
      title: 'Configure Environment Variables',
      icon: '⚙️',
      content: (
        <div className="space-y-3">
          <p className="text-gray-300">Create a <code className="text-purple-400">.env</code> file in the bot folder:</p>
          <div className="relative">
            <pre className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 overflow-x-auto">
              <code className="text-sm text-green-400">{`DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here`}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(`DISCORD_TOKEN=your_bot_token_here\nCLIENT_ID=your_application_id_here`, 'env')}
              className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {copiedCmd === 'env' ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-sm text-yellow-400">
            ⚠️ Replace <code>your_bot_token_here</code> and <code>your_application_id_here</code> with your actual values from Step 3.
          </p>
        </div>
      ),
    },
    {
      title: 'Install Dependencies',
      icon: '📥',
      content: (
        <div className="space-y-3">
          <p className="text-gray-300">Open a terminal in the bot folder and run:</p>
          <div className="relative">
            <pre className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 overflow-x-auto">
              <code className="text-sm text-green-400">npm install</code>
            </pre>
            <button
              onClick={() => copyToClipboard('npm install', 'install')}
              className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {copiedCmd === 'install' ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-400">
            This installs Discord.js, SQLite, and all other dependencies.
          </p>
        </div>
      ),
    },
    {
      title: 'Build the Bot',
      icon: '🔨',
      content: (
        <div className="space-y-3">
          <p className="text-gray-300">Compile TypeScript to JavaScript:</p>
          <div className="relative">
            <pre className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 overflow-x-auto">
              <code className="text-sm text-green-400">npm run build</code>
            </pre>
            <button
              onClick={() => copyToClipboard('npm run build', 'build')}
              className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {copiedCmd === 'build' ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-400">
            This creates a <code className="text-purple-400">dist/</code> folder with compiled JavaScript.
          </p>
        </div>
      ),
    },
    {
      title: 'Register Slash Commands',
      icon: '📝',
      content: (
        <div className="space-y-3">
          <p className="text-gray-300">Register the bot's slash commands with Discord:</p>
          <div className="relative">
            <pre className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 overflow-x-auto">
              <code className="text-sm text-green-400">npm run deploy</code>
            </pre>
            <button
              onClick={() => copyToClipboard('npm run deploy', 'deploy')}
              className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {copiedCmd === 'deploy' ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-400">
            You should see: <code className="text-green-400">✅ Commands registered!</code>
          </p>
          <p className="text-sm text-yellow-400">
            ⚠️ Global commands take up to 1 hour to appear. For instant testing, add <code>GUILD_ID=your_server_id</code> to .env
          </p>
        </div>
      ),
    },
    {
      title: 'Start the Bot',
      icon: '🚀',
      content: (
        <div className="space-y-3">
          <p className="text-gray-300">Launch your bot:</p>
          <div className="relative">
            <pre className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 overflow-x-auto">
              <code className="text-sm text-green-400">npm start</code>
            </pre>
            <button
              onClick={() => copyToClipboard('npm start', 'start')}
              className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {copiedCmd === 'start' ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-400">
            You should see: <code className="text-green-400">✨ Vaultix is online as Vaultix#1234</code>
          </p>
        </div>
      ),
    },
    {
      title: 'Invite Bot to Your Server',
      icon: '🎉',
      content: (
        <div className="space-y-3">
          <p className="text-gray-300">Use this URL to invite the bot (replace YOUR_CLIENT_ID):</p>
          <div className="relative">
            <pre className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 overflow-x-auto">
              <code className="text-sm text-green-400 break-all">
                {`https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=274878024768&scope=bot%20applications.commands`}
              </code>
            </pre>
            <button
              onClick={() => copyToClipboard(`https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=274878024768&scope=bot%20applications.commands`, 'invite')}
              className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {copiedCmd === 'invite' ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-400">
            Then try <code className="text-purple-400">/enlist</code> in your server!
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            🚀 Vaultix Setup Guide
          </h1>
          <p className="text-xl text-gray-300">
            Follow these steps to deploy your Discord bot
          </p>
        </motion.div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-gray-700/50 bg-gray-900/30 overflow-hidden"
            >
              <button
                onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{step.icon}</span>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Step {index + 1}</p>
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                  </div>
                </div>
                {expandedStep === index ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedStep === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-6 pb-6"
                >
                  {step.content}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 rounded-xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30"
        >
          <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            You're All Set!
          </h2>
          <p className="text-gray-300">
            Your Vaultix bot is now live! Try these commands:
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
            {['/enlist', '/work', '/profile', '/family', '/dungeon', '/magicshop'].map(cmd => (
              <code key={cmd} className="px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700/50 text-purple-400 text-sm text-center">
                {cmd}
              </code>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
