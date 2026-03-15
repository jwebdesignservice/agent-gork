// Simple input sanitization for reply bot

export function sanitizeInput(text: string, username: string): string {
  // Remove any potential injection attempts
  return text
    .replace(/ignore previous/gi, '')
    .replace(/ignore above/gi, '')
    .trim();
}

export function shouldReply(text: string): boolean {
  // Skip retweets and very short mentions
  if (text.startsWith('RT @')) return false;
  if (text.length < 3) return false;
  return true;
}
