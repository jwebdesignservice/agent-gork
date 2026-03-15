// types.ts - TypeScript interfaces for Agent Gork

export interface Tweet {
  id: string;
  content: string;
  contentType: ContentType;
  scheduledTime: Date;
  approved: boolean;
  posted: boolean;
}

export type ContentType = 
  | 'burn-update'
  | 'market-take'
  | 'meme'
  | 'community'
  | 'stats'
  | 'engagement';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export interface AuditLog {
  timestamp: string;
  action: 'tweet' | 'validation_failed' | 'error' | 'approved' | 'rejected';
  content?: string;
  reason?: string;
  metadata: Record<string, any>;
}

export interface BotConfig {
  twitterApiKey: string;
  twitterApiSecret: string;
  twitterAccessToken: string;
  twitterAccessSecret: string;
  xaiApiKey: string;
  discordWebhookUrl: string;
  discordChannelId: string;
  botEnabled: boolean;
  launchTime: Date;
  logLevel: string;
}
