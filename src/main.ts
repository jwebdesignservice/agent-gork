// main.ts - Agent Gork reply-only bot

import 'dotenv/config';
import { TwitterClient } from './twitter';
// Using real Grok API for contextual replies
import { generateReply } from './reply-generator';
import { sanitizeInput, shouldReply } from './input-sanitizer';
import { canReply, recordReply, getRateLimitStats } from './rate-limiter';
import { addToRecentTweets } from './security';
import { canReplyToday, recordDailyReply, getDailyStats } from './daily-limiter';
import { validateTweet } from './security';
import { loadState, getLastMentionId, setLastMentionId, hasRepliedToTweet, markTweetReplied } from './state-manager';
import { addToRecentTweets } from './security';

// Configuration
const config = {
  twitterApiKey: process.env.TWITTER_API_KEY!,
  twitterApiSecret: process.env.TWITTER_API_SECRET!,
  twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN!,
  twitterAccessSecret: process.env.TWITTER_ACCESS_SECRET!,
  xaiApiKey: process.env.XAI_API_KEY!,
  botEnabled: process.env.BOT_ENABLED === 'true',
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '120000'), // 2 min default
};

// Validate config
for (const [key, value] of Object.entries(config)) {
  if (value === undefined || value === '') {
    throw new Error(`Missing required config: ${key}`);
  }
}

/**
 * Process new mentions and reply
 * (Mentions include both @mentions AND replies/comments under our posts)
 */
async function processMentions(twitter: TwitterClient) {
  try {
    // Get new mentions (using persistent lastMentionId)
    const mentions = await twitter.getMentions(getLastMentionId());
    
    if (mentions.length === 0) {
      return; // No new mentions
    }
    
    console.log(`📬 Found ${mentions.length} new mention(s)`);
    
    // Update last mention ID (newest first in Twitter API) - PERSISTENT
    setLastMentionId(mentions[0].id);
    
    // Process each mention (oldest first)
    for (const mention of mentions.reverse()) {
      try {
        console.log(`\n📝 Processing mention from @${mention.author_username}:`);
        console.log(`   "${mention.text}"`);
        
        // Check if already replied to this specific tweet
        if (hasRepliedToTweet(mention.id)) {
          console.log('   ⏭️  Skipping (already replied to this tweet)');
          continue;
        }
        
        // Check if we should reply
        if (!shouldReply(mention.text)) {
          console.log('   ⏭️  Skipping (retweet or no content)');
          continue;
        }
        
        // Check daily limit
        if (!canReplyToday()) {
          console.log('   ⏱️  Skipping (daily limit reached)');
          continue;
        }

        // Check per-user rate limit (30 min cooldown)
        if (!canReply(mention.author_id)) {
          console.log(`   ⏱️  Skipping (user ${mention.author_username} on cooldown)`);
          continue;
        }
        
        // Sanitize input
        const sanitized = sanitizeInput(mention.text, mention.author_username);
        
        if (sanitized.startsWith('[FILTERED:')) {
          console.log(`   🚫 Filtered: ${sanitized}`);
          // Still reply, but with the filtered indicator
        }
        
        // Generate reply
        console.log('   🎨 Generating reply...');
        const reply = await generateReply(
          config.xaiApiKey,
          sanitized,
          mention.author_username
        );
        
        // Double-check validation (already done in generateReply, but belt-and-suspenders)
        const validation = validateTweet(reply);
        if (!validation.valid) {
          console.error(`   ❌ Validation failed: ${validation.reason}`);
          continue;
        }
        
        // Post reply
        console.log(`   📤 Posting: "${reply}"`);
        await twitter.reply(reply, mention.id);
        
        // Mark tweet as replied to (prevents duplicate replies)
        markTweetReplied(mention.id);
        
        // Record reply for rate limiting
        recordReply(mention.author_id);
        recordDailyReply();

        // Register reply in duplicate detector so Grok never repeats itself
        addToRecentTweets(reply);

        // Add to recent tweets (prevents repeating same reply)
        addToRecentTweets(reply);
        
        console.log('   ✅ Reply posted successfully');
        
        // Longer delay between replies to avoid spam flags (30 seconds)
        await new Promise(resolve => setTimeout(resolve, 30000));
        
      } catch (error: any) {
        console.error(`   ❌ Error processing mention:`, error.message);
        // Continue to next mention
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error in processMentions:', error.message);
  }
}

/**
 * Main loop
 */
async function main() {
  console.log('🤖 Agent Gork (Reply-Only Bot) starting...\n');
  
  // Load persistent state (prevents duplicate replies)
  loadState();
  
  // Check bot enabled
  if (!config.botEnabled) {
    console.log('🛑 Bot is disabled (BOT_ENABLED !== true)');
    process.exit(0);
  }
  
  // Initialize Twitter client
  const twitter = new TwitterClient(
    config.twitterApiKey,
    config.twitterApiSecret,
    config.twitterAccessToken,
    config.twitterAccessSecret
  );
  
  await twitter.initialize();

  // CRITICAL: If no saved state, fetch latest mention ID from Twitter NOW
  // This prevents re-processing old mentions after a redeploy/restart
  if (!getLastMentionId()) {
    console.log('🔍 No saved state — fetching latest mention ID to anchor from now...');
    const latestMentions = await twitter.getMentions(undefined);
    if (latestMentions.length > 0) {
      const latestId = latestMentions[0].id;
      setLastMentionId(latestId);
      console.log(`📌 Anchored at mention ID: ${latestId} — will only reply to NEW mentions from here`);
    } else {
      console.log('📌 No existing mentions found — starting fresh');
    }
  }

  console.log(`✅ Bot initialized`);
  console.log(`⏱️  Poll interval: ${config.pollIntervalMs / 1000}s\n`);
  
  // Main loop
  while (true) {
    try {
      // Check kill switch
      if (process.env.BOT_ENABLED !== 'true') {
        console.log('🛑 Bot disabled via kill switch (BOT_ENABLED !== true)');
        break;
      }
      
      // Process mentions (includes both @mentions AND replies/comments)
      await processMentions(twitter);
      
      // Show stats
      const stats = getRateLimitStats();
      const dailyStats = getDailyStats();
      console.log(`\n📊 Stats: ${dailyStats.count}/${dailyStats.limit} replies today, ${stats.recentReplies} active rate limits`);
      
      // Wait before next poll
      console.log(`⏳ Waiting ${config.pollIntervalMs / 1000}s until next check...\n`);
      await new Promise(resolve => setTimeout(resolve, config.pollIntervalMs));
      
    } catch (error: any) {
      console.error('❌ Error in main loop:', error);
      
      // Wait 5 minutes before retrying on error
      console.log('⏳ Waiting 5 minutes before retry...\n');
      await new Promise(resolve => setTimeout(resolve, 300000));
    }
  }
  
  console.log('👋 Bot shutting down...');
  process.exit(0);
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down...');
  process.env.BOT_ENABLED = 'false';
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  process.env.BOT_ENABLED = 'false';
});

// Start bot
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
