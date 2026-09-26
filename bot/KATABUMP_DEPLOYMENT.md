# 🚀 Deploying Vaultix to KataBump

Complete step-by-step guide to host your Vaultix Discord bot on KataBump (free hosting).

---

## 📋 Prerequisites

Before starting, you need:
- A Discord account
- A KataBump account (sign up at [katabump.com](https://katabump.com))
- Your Discord Bot Token and Client ID

---

## Step 1: Create Your Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** → Name it "Vaultix"
3. Go to the **"Bot"** tab → Click **"Add Bot"**
4. Under **Privileged Gateway Intents**, enable:
   - ✅ Message Content Intent
   - ✅ Server Members Intent
5. Copy your **Bot Token** (keep this secret!)
6. Go to **"General Information"** → Copy your **Application ID** (this is your CLIENT_ID)

---

## Step 2: Create a KataBump Server

1. Go to [control.katabump.com](https://control.katabump.com)
2. Sign up / Log in
3. Click **"Create Server"**
4. Select **"Discord Bot"** as the server type
5. Choose **Node.js** as the runtime
6. Select the **Free plan** (308 MB RAM, 716 MB storage)
7. Name your server (e.g., "Vaultix Bot")
8. Click **"Create"**

---

## Step 3: Prepare Your Bot Files

### Option A: Upload as ZIP (Recommended)

1. On your computer, create a folder called `vaultix-bot`
2. Copy ALL files from the `bot/` directory into this folder
3. Your folder structure should look like this:

```
vaultix-bot/
├── package.json          ← REQUIRED at root
├── tsconfig.json
├── index.ts
├── deploy-commands.ts
├── .env                  ← You'll create this
├── config/
│   ├── index.ts
│   ├── families.ts
│   ├── wands.ts
│   ├── spells.ts
│   ├── monsters.ts
│   └── shop.ts
├── database/
│   └── index.ts
├── systems/
│   ├── player.ts
│   ├── combat.ts
│   └── work.ts
└── commands/
    ├── admin.ts
    ├── buy.ts
    ├── cast.ts
    ├── dungeon.ts
    ├── enlist.ts
    ├── family.ts
    ├── inventory.ts
    ├── magicshop.ts
    ├── profile.ts
    ├── reroll.ts
    ├── spells.ts
    ├── stats.ts
    ├── wand.ts
    └── work.ts
```

4. Create a `.env` file in the root:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
```

5. **Select all files** in the folder and create a ZIP archive:
   - Windows: Right-click → Send to → Compressed (zipped) folder
   - Mac: Right-click → Compress
   - Linux: `zip -r vaultix-bot.zip *`

### Option B: Upload via SFTP

If you prefer SFTP (for larger projects or frequent updates):

1. In KataBump panel, go to your server
2. Find the **SFTP credentials** (usually in the server settings)
3. Use FileZilla or any SFTP client to connect
4. Upload all bot files to the root directory

---

## Step 4: Upload to KataBump

1. Log in to [control.katabump.com](https://control.katabump.com)
2. Select your Vaultix server
3. Go to the **"Files"** tab
4. Drag and drop your `vaultix-bot.zip` file
5. Wait for upload to complete (max 100 MB)
6. **Right-click** the ZIP file → Click **"Unarchive"** (or "Extract")
7. Wait for extraction to complete
8. You can delete the ZIP file after extraction

---

## Step 5: Configure Environment Variables

1. In the KataBump file manager, find the `.env` file
2. Click on it to edit
3. Replace with your actual values:

```env
DISCORD_TOKEN=MTExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxx
CLIENT_ID=123456789012345678
```

4. Click **"Save"**

⚠️ **IMPORTANT**: Never share your bot token! Keep it secret!

---

## Step 6: Configure Startup Settings

1. Go to the **"Startup"** tab in KataBump
2. Configure these settings:

| Setting | Value |
|---------|-------|
| **JS FILE** (Entry point) | `dist/index.js` |
| **Node.js Version** | `18.x` or latest |
| **Additional Node Packages** | (leave empty - package.json handles it) |

3. Save the startup configuration

---

## Step 7: Install Dependencies & Build

### First Time Setup

Since Vaultix is written in TypeScript, you need to compile it to JavaScript first.

**Method 1: Using KataBump Console (Recommended)**

1. Go to the **"Console"** tab
2. Click **"Start"** to boot the server
3. Wait for it to install dependencies from `package.json`
4. Once installed, open the console terminal
5. Run these commands:

```bash
# Install TypeScript compiler globally
npm install -g typescript

# Compile TypeScript to JavaScript
npm run build

# This creates the dist/ folder with compiled JS files
```

6. After compilation, click **"Stop"** then **"Start"** again

**Method 2: Compile Locally, Then Upload**

If you prefer to compile on your own computer:

```bash
# On your computer, in the bot/ folder:
cd bot
npm install
npm run build
```

Then upload the entire folder (including the `dist/` folder) to KataBump.

---

## Step 8: Register Slash Commands

Before the bot can respond to commands, you need to register them with Discord.

1. In the KataBump console, run:

```bash
npm run deploy
```

This will register all slash commands globally with Discord.

2. Wait for the confirmation message:
   ```
   ✅ Successfully registered 14 commands.
   ```

⚠️ **Note**: Global command registration can take up to 1 hour to propagate to all servers. For faster testing, you can set `GUILD_ID` in your `.env` file to register commands instantly in one server.

---

## Step 9: Start Your Bot

1. Go to the **"Console"** tab
2. Click **"Start"**
3. Watch the logs for:
   ```
   ✅ Database initialized
   🔌 Connecting to Discord...
   ✨ Vaultix is online! Logged in as Vaultix#1234
   Serving X guilds
   ```

4. If you see errors, check the troubleshooting section below

---

## Step 10: Invite Bot to Your Server

1. Use this URL (replace `YOUR_CLIENT_ID` with your actual Application ID):

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=274878024768&scope=bot%20applications.commands
```

2. Select your server
3. Grant the required permissions
4. Click **"Authorize"**

---

## ✅ Testing Your Bot

Once the bot is online and invited to your server:

1. Type `/enlist` to create your profile
2. Type `/work` to earn XP and coins
3. Type `/profile` to see your stats
4. Keep working until you reach Level 10
5. Then you'll get the option to become a Wizard!
6. Type `/dungeon enter` to start fighting monsters

---

## 🔧 Troubleshooting

### Bot doesn't start

**Check the console logs for errors.** Common issues:

| Error | Solution |
|-------|----------|
| `DISCORD_TOKEN not found` | Check your `.env` file has the correct token |
| `Cannot find module` | Run `npm install` in the console |
| `dist/index.js not found` | Run `npm run build` to compile TypeScript |
| `Database initialization failed` | Check file permissions or delete `vaultix.db` to reset |

### Commands don't appear

- Global commands take up to 1 hour to appear
- For instant testing, add `GUILD_ID=your_server_id` to `.env` and re-run `npm run deploy`
- Make sure you invited the bot with `applications.commands` scope

### Bot goes offline

- KataBump free tier may restart servers periodically
- Check the console for crash logs
- Ensure your bot token is valid (not expired/revoked)

### Database errors

- The database file (`vaultix.db`) is created automatically
- If corrupted, delete it and restart the bot (all player data will be lost)
- The database auto-saves every 30 seconds

---

## 📝 Updating Your Bot

To update the bot code:

1. Stop the bot in KataBump console
2. Upload new files (via ZIP or SFTP)
3. If you changed TypeScript files, run `npm run build` again
4. Start the bot

---

## 🎯 KataBump Free Tier Limits

| Resource | Limit |
|----------|-------|
| RAM | 308 MB |
| Storage | 716 MB |
| CPU | Shared |
| Uptime | 24/7 (with occasional restarts) |
| Cost | Free forever |

Vaultix is lightweight and fits well within these limits!

---

## 💡 Tips

- **Backup your database**: Download `vaultix.db` regularly via the file manager
- **Monitor logs**: Check the console occasionally for errors
- **Keep token safe**: Never commit `.env` to public repositories
- **Update dependencies**: Periodically run `npm update` to get security patches

---

## 🆘 Need Help?

- KataBump Discord: [discord.katabump.com](https://discord.katabump.com)
- KataBump Docs: [docs.katabump.com](https://docs.katabump.com)
- Email: support@katabump.com

---

**Your Vaultix bot is now live! 🎉**
