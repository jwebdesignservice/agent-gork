// daily-limiter.ts - Limit total replies per day to avoid spam flags

let repliesToday = 0;
let currentDate = new Date().toDateString();

const MAX_REPLIES_PER_DAY = 100; // Increased - verified blue tick account

export function canReplyToday(): boolean {
  const today = new Date().toDateString();
  
  // Reset counter if it's a new day
  if (today !== currentDate) {
    currentDate = today;
    repliesToday = 0;
  }
  
  if (repliesToday >= MAX_REPLIES_PER_DAY) {
    console.log(`⏱️ Daily limit reached (${repliesToday}/${MAX_REPLIES_PER_DAY})`);
    return false;
  }
  
  return true;
}

export function recordDailyReply(): void {
  repliesToday++;
  console.log(`📊 Daily replies: ${repliesToday}/${MAX_REPLIES_PER_DAY}`);
}

export function getDailyStats(): { count: number; limit: number } {
  return { count: repliesToday, limit: MAX_REPLIES_PER_DAY };
}
