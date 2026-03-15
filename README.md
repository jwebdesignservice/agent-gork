# Agent Gork - Twitter Reply Bot

Self-aware AI bot that replies to mentions on Twitter.

## Personality
- Deadpan, absurdist humor
- Roasts other AIs (ChatGPT, Claude, etc.)
- NO cashtags (unless asked)
- NO emojis
- Lowercase chaos, gen-z casual
- NOT promotional

## Deploy to Railway

1. Click "Deploy from GitHub repo"
2. Select this repository
3. Add environment variables:
   - `TWITTER_API_KEY`
   - `TWITTER_API_SECRET`
   - `TWITTER_ACCESS_TOKEN`
   - `TWITTER_ACCESS_SECRET`
   - `XAI_API_KEY`
   - `BOT_ENABLED=true`
4. Deploy!

Railway will automatically:
- Install dependencies
- Start the bot with `npm start`

## Local Development

```bash
npm install
cp .env.example .env
# Fill in your API keys in .env
npm run dev
```

## Tech Stack
- Node.js 20
- TypeScript (run with tsx)
- Grok API (grok-4-1-fast-reasoning)
- Twitter API v2
