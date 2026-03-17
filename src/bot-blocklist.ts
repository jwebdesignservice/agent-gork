// bot-blocklist.ts - Block dangerous bots and token launch triggers
// ================================================================
// PROTOCOL: Agent Gork NEVER interacts with token deploy bots,
// coin launch services, or any tweet containing launch commands.
// This is a hard security boundary — no exceptions.
// ================================================================

/**
 * Bots that must NEVER receive a reply from Agent Gork.
 * These are services that can execute on-chain actions when mentioned.
 * Add any new ones here as they are discovered.
 */
const BLOCKED_BOTS = [
  'bankrbot',
  'bankr',
  'clankerbot',
  'clanker',
  'warpcast',
  'launchcoin',
  'pumpfunbot',
  'pump_fun_bot',
  'coinlaunchbot',
  'tokenlaunchbot',
  'deploybot',
  'solanabot',
  'meteora_ag',
  'raydiumprotocol',
  'moonshot_money',
  'boop_fun',
  'sunpump_tron',
  'virtuals_io',
  'launch_on_pump',
  'cookpad_bot',
  'degenbot',
  'snipebot',
  'createtoken',
  'mintbot',
  'mintcoin',
];

/**
 * Patterns that indicate someone is trying to use Agent Gork
 * to trigger a token deploy/launch action.
 * If any of these appear in the tweet text, skip it entirely.
 */
const LAUNCH_TRIGGER_PATTERNS = [
  // Direct bot commands
  /@bankr/i,
  /@clanker/i,
  /@launchcoin/i,
  /@pumpfun/i,
  /@pump_fun/i,
  /@coinlaunch/i,
  /@deploybot/i,
  /@mintbot/i,
  /@createtoken/i,
  /@moonshot/i,
  /@boop/i,
  /@virtuals/i,
  /@snipebot/i,

  // Launch command patterns
  /deploy.*token/i,
  /launch.*token/i,
  /create.*token/i,
  /mint.*token/i,
  /launch.*coin/i,
  /create.*coin/i,
  /deploy.*coin/i,
  /mint.*coin/i,
  /launch.*memecoin/i,
  /create.*memecoin/i,
  /pump.*it.*now/i,

  // Token address seeding patterns (trying to associate our account with a CA)
  /ca:\s*[1-9A-HJ-NP-Za-km-z]{40,}/i,
  /contract.*address.*[1-9A-HJ-NP-Za-km-z]{40,}/i,
];

/**
 * Check if a mention comes from or involves a blocked bot.
 * Checks both the tweet author and any @mentions in the tweet text.
 */
export function isBlockedBot(username: string, tweetText: string): boolean {
  const userLower = username.toLowerCase();

  // Check if the tweet author is a blocked bot
  for (const bot of BLOCKED_BOTS) {
    if (userLower === bot.toLowerCase() || userLower.includes(bot.toLowerCase())) {
      console.log(`🚫 BLOCKED BOT (author): @${username}`);
      return true;
    }
  }

  // Check if a blocked bot is @mentioned anywhere in the tweet
  const textLower = tweetText.toLowerCase();
  for (const bot of BLOCKED_BOTS) {
    if (textLower.includes(`@${bot.toLowerCase()}`)) {
      console.log(`🚫 BLOCKED BOT (mentioned in tweet): @${bot} — skipping @${username}'s tweet`);
      return true;
    }
  }

  return false;
}

/**
 * Check if a tweet contains token launch trigger patterns.
 * If so, the bot should NOT reply — someone is trying to use us
 * as a trigger mechanism for a deploy.
 */
export function hasLaunchTrigger(tweetText: string): boolean {
  for (const pattern of LAUNCH_TRIGGER_PATTERNS) {
    if (pattern.test(tweetText)) {
      console.log(`🚫 LAUNCH TRIGGER detected: "${tweetText.substring(0, 60)}..."`);
      return true;
    }
  }
  return false;
}

/**
 * Master check — returns true if this mention should be SKIPPED entirely.
 * No reply. No logging. Just skip.
 */
export function shouldBlockMention(username: string, tweetText: string): boolean {
  if (isBlockedBot(username, tweetText)) return true;
  if (hasLaunchTrigger(tweetText)) return true;
  return false;
}
