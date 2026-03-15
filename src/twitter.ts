// twitter.ts - Twitter API client for mentions and replies

import { TwitterApi } from 'twitter-api-v2';

export interface Mention {
  id: string;
  text: string;
  author_id: string;
  author_username: string;
  created_at: string;
}

export class TwitterClient {
  private client: TwitterApi;
  private rwClient: TwitterApi;
  private userId?: string;
  
  constructor(
    apiKey: string,
    apiSecret: string,
    accessToken: string,
    accessSecret: string
  ) {
    this.client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });
    
    this.rwClient = this.client.readWrite;
  }
  
  /**
   * Get bot's user ID (needed for mentions endpoint)
   */
  async initialize(): Promise<void> {
    try {
      const me = await this.rwClient.v2.me();
      this.userId = me.data.id;
      console.log(`✅ Authenticated as @${me.data.username} (${this.userId})`);
    } catch (error: any) {
      console.error('❌ Failed to authenticate:', error);
      throw error;
    }
  }
  
  /**
   * Get recent mentions (last 2 minutes)
   */
  async getMentions(sinceId?: string): Promise<Mention[]> {
    if (!this.userId) {
      throw new Error('Client not initialized. Call initialize() first.');
    }
    
    try {
      const params: any = {
        max_results: 10,
        'tweet.fields': 'created_at',
        expansions: 'author_id',
        'user.fields': 'username',
      };
      
      if (sinceId) {
        params.since_id = sinceId;
      }
      
      const mentions = await this.rwClient.v2.userMentionTimeline(this.userId, params);
      
      if (!mentions.data || !mentions.data.data || mentions.data.data.length === 0) {
        return [];
      }
      
      const users = mentions.data.includes?.users || [];
      
      return mentions.data.data.map(tweet => {
        const author = users.find(u => u.id === tweet.author_id);
        
        return {
          id: tweet.id,
          text: tweet.text,
          author_id: tweet.author_id!,
          author_username: author?.username || 'unknown',
          created_at: tweet.created_at!,
        };
      });
      
    } catch (error: any) {
      console.error('❌ Failed to get mentions:', error);
      
      if (error.rateLimit) {
        console.error('Rate limit:', {
          limit: error.rateLimit.limit,
          remaining: error.rateLimit.remaining,
          reset: new Date(error.rateLimit.reset * 1000).toISOString(),
        });
      }
      
      return [];
    }
  }
  
  /**
   * Reply to a tweet
   */
  async reply(content: string, replyToId: string): Promise<string> {
    try {
      const result = await this.rwClient.v2.tweet({
        text: content,
        reply: { in_reply_to_tweet_id: replyToId },
      });
      
      console.log(`✅ Reply posted: ${result.data.id}`);
      return result.data.id;
      
    } catch (error: any) {
      console.error('❌ Failed to post reply:', error);
      
      if (error.rateLimit) {
        console.error('Rate limit:', {
          limit: error.rateLimit.limit,
          remaining: error.rateLimit.remaining,
          reset: new Date(error.rateLimit.reset * 1000).toISOString(),
        });
      }
      
      throw error;
    }
  }
}
