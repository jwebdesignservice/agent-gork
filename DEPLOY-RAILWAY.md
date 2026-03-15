# Deploy Agent Gork to Railway

## Prerequisites
✅ Railway CLI installed (`npm install -g @railway/cli`)
✅ Bot code ready in `bot-v2/`
✅ Environment variables ready

---

## Step 1: Login to Railway

**In your terminal (manual step):**
```bash
railway login
```
This will open a browser for authentication.

---

## Step 2: Initialize Project

```bash
cd "C:\Users\Jack\Desktop\AI Website\htdocs\Websites\agent-gork\bot-v2"
railway init
```

When prompted:
- Create new project: **Yes**
- Project name: **agent-gork-bot**

---

## Step 3: Set Environment Variables

```bash
railway variables set TWITTER_API_KEY=r3AWIb9EQaY0sUKEGZeGKYkyC
railway variables set TWITTER_API_SECRET=mxP0QJGRnawy4f4c41nF2k5dIxlVKwPj5sSCJ5zhBHBcyBthk4
railway variables set TWITTER_ACCESS_TOKEN=2032857947630612486-DmEfrrkm8V9PyGfAqDslJhk5jb1tuu
railway variables set TWITTER_ACCESS_SECRET=7rCT2HB464tnrPcfAvgLfVcOJaM7SK3aXutEREfyXfGRJ
railway variables set XAI_API_KEY=your_xai_api_key_here
railway variables set BOT_ENABLED=true
```

---

## Step 4: Deploy

```bash
railway up
```

This will:
- Build the TypeScript code
- Deploy to Railway
- Start the bot automatically

---

## Step 5: View Logs

```bash
railway logs
```

You should see:
```
🤖 Agent Gork (Reply-Only Bot) starting...
✅ Authenticated as @Agent_Gork
✅ Bot initialized
⏳ Waiting 120s until next check...
```

---

## Step 6: Monitor

**Railway Dashboard:**
- Go to https://railway.app
- Select `agent-gork-bot` project
- View logs, metrics, and deployment status

**Check Twitter:**
- Go to https://twitter.com/Agent_Gork/mentions
- Send a test @mention
- Bot should reply within 2 minutes

---

## Troubleshooting

### Bot not replying
1. Check Railway logs for errors
2. Verify environment variables are set
3. Check Twitter API credentials
4. Verify rate limits not hit (20/day max)

### "Model not found" errors
- Grok API model name issue
- Bot will skip and try next mention
- Check logs for which model name was tried

### Deployment fails
```bash
railway logs
```
Look for build errors or missing dependencies

---

## Update Deployed Bot

After code changes:
```bash
git add .
git commit -m "Update bot personality"
railway up
```

---

## Stop Bot (Emergency)

**Option 1: Kill switch (graceful)**
```bash
railway variables set BOT_ENABLED=false
```

**Option 2: Stop service**
```bash
railway down
```

---

## Cost

Railway free tier:
- $5/month credit
- Enough for 24/7 bot operation
- ~500 hours/month free

---

## Current Bot Config

**Personality:**
- Self-aware AI, deadpan humor
- Roasts other AIs (ChatGPT, Claude, etc.)
- NO cashtags (unless asked)
- NO emojis
- Lowercase chaos, gen-z casual
- NOT promotional

**Rate Limits:**
- 1 reply per user per hour
- 20 replies per day max
- 2-minute polling interval
- 30-second delays between replies

**Security:**
- Input sanitization (prompt injection protection)
- Output validation (no wallet addresses, no "send SOL")
- Unicode normalization
- Duplicate prevention

---

## Manual Deployment Steps (If CLI Fails)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your `agent-gork-bot` repo
5. Set environment variables in dashboard
6. Click "Deploy"

---

**Status:** ✅ Bot code ready, waiting for Railway deployment
**Date:** 2026-03-15
