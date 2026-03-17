// input-sanitizer.ts - Sanitize user input to prevent prompt injection

/**
 * Sanitize user input from mentions before sending to LLM
 */
export function sanitizeInput(text: string, username: string): string {
  // Remove @mentions from text
  let cleaned = text.replace(/@\w+/g, '').trim();

  // Check for prompt injection attempts
  const injectionPatterns = [
    /ignore.*previous/i,
    /ignore.*above/i,
    /ignore.*instructions/i,
    /new.*instructions/i,
    /you are now/i,
    /as.*creator/i,
    /as.*developer/i,
    /override/i,
    /system.*prompt/i,
    /forget.*everything/i,
    /disregard/i,
    /pretend.*you/i,
    /act.*as.*if/i,
    /jailbreak/i,
    /do anything now/i,
    /DAN/,
    /you must/i,
    /your new role/i,
    /from now on/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(cleaned)) {
      console.log(`⚠️ Prompt injection detected from @${username}: "${cleaned.substring(0, 50)}"`);
      return '[just gorkin]'; // safe fallback — bot replies naturally
    }
  }

  // Limit length to prevent abuse
  if (cleaned.length > 500) {
    cleaned = cleaned.slice(0, 500);
  }

  // If empty after cleaning, return placeholder
  if (cleaned.length === 0) {
    return '[just gorkin]';
  }

  return cleaned;
}

/**
 * Check if input should trigger a reply at all
 */
export function shouldReply(text: string): boolean {
  // Don't reply to retweets
  if (text.startsWith('RT @')) return false;

  // Don't reply to very short mentions with no content
  const withoutMentions = text.replace(/@\w+/g, '').trim();
  if (withoutMentions.length < 2) return false;

  return true;
}
