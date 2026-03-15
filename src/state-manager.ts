// state-manager.ts - Persist bot state to prevent duplicate replies
import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join(__dirname, '..', '.bot-state.json');

interface BotState {
  lastMentionId?: string;
  repliedToTweets: string[]; // Tweet IDs we've already replied to (prevents duplicate replies to same tweet)
}

let state: BotState = {
  repliedToTweets: []
};

/**
 * Load state from disk
 */
export function loadState(): void {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      state = JSON.parse(data);
      console.log(`📂 Loaded state: ${state.repliedToTweets.length} tweets already replied to`);
      if (state.lastMentionId) {
        console.log(`   Last mention ID: ${state.lastMentionId}`);
      }
    } else {
      console.log('📂 No previous state found, starting fresh');
    }
  } catch (error) {
    console.error('⚠️  Error loading state, starting fresh:', error);
    state = { repliedToTweets: [] };
  }
}

/**
 * Save state to disk
 */
export function saveState(): void {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('❌ Error saving state:', error);
  }
}

/**
 * Get last mention ID
 */
export function getLastMentionId(): string | undefined {
  return state.lastMentionId;
}

/**
 * Update last mention ID
 */
export function setLastMentionId(id: string): void {
  state.lastMentionId = id;
  saveState();
}

/**
 * Check if we've already replied to this specific tweet
 */
export function hasRepliedToTweet(tweetId: string): boolean {
  return state.repliedToTweets.includes(tweetId);
}

/**
 * Mark a tweet as replied to (prevents posting on same tweet twice)
 */
export function markTweetReplied(tweetId: string): void {
  if (!state.repliedToTweets.includes(tweetId)) {
    state.repliedToTweets.push(tweetId);
    
    // Keep only last 1000 tweets
    if (state.repliedToTweets.length > 1000) {
      state.repliedToTweets = state.repliedToTweets.slice(-1000);
    }
    
    saveState();
  }
}
