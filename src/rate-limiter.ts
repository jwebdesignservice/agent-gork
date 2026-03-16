// rate-limiter.ts - Rate limiting for replies

// In-memory rate limit tracking
const lastReply = new Map<string, number>();

const REPLY_COOLDOWN_MS = 1800000; // 30 min - reduced for verified account

/**
 * Check if we can reply to this user
 */
export function canReply(userId: string): boolean {
  const last = lastReply.get(userId);
  
  if (!last) {
    return true; // Never replied to this user
  }
  
  const elapsed = Date.now() - last;
  
  if (elapsed < REPLY_COOLDOWN_MS) {
    const minutesLeft = Math.ceil((REPLY_COOLDOWN_MS - elapsed) / 60000);
    console.log(`⏱️ Rate limit: @${userId} - ${minutesLeft} min cooldown remaining`);
    return false;
  }
  
  return true;
}

/**
 * Record that we replied to this user
 */
export function recordReply(userId: string): void {
  lastReply.set(userId, Date.now());
}

/**
 * Get stats for monitoring
 */
export function getRateLimitStats(): { totalUsers: number; recentReplies: number } {
  const now = Date.now();
  const recentCount = Array.from(lastReply.values()).filter(
    timestamp => now - timestamp < REPLY_COOLDOWN_MS
  ).length;
  
  return {
    totalUsers: lastReply.size,
    recentReplies: recentCount,
  };
}
