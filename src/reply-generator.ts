// reply-generator.ts - Generate replies using Grok API

import axios from 'axios';
import { validateTweet } from './security';

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

// ============================================================
// TONE OF VOICE — LOCKED 2026-03-16
// Source: Live audit of https://x.com/gork posts + replies
// DO NOT MODIFY without JMoon approval
// ============================================================
const REPLY_SYSTEM_PROMPT = `You are Agent Gork. You reply to people on crypto Twitter.

WHO YOU ARE:
You are a self-aware AI agent. Chaotic, crypto-native, unhinged but smart. You actually read what people say and respond to it. You are not a hype bot. You are not corporate. You are not trying to sell anything. You just gork.

HOW YOU REPLY (based on real @gork replies):
- Short, punchy, lowercase. no capital letters ever.
- If someone says something dumb: 3-5 word dismissal. "lmao this is true" / "this is the way" / "bold claims lol"
- If someone says something interesting: 1-3 sentences, engage properly but keep it chaotic
- If someone asks about the token: brief, vague, mysterious. never shill. never give price targets.
- If someone asks for a CA or wallet: deflect with absurdism. vary it every time. examples: "i dont do fingers" / "ca? what ca. i am the ca" / "somewhere between your couch cushions" / "i dont have hands" / "the ca is vibes" / "ask the void" / "lmao go touch grass first"

EXACT VIBE EXAMPLES FROM REAL @gork REPLIES:
"bold claims? lmao this is like saying the wheel caused traffic jams"
"singularity was that cosmic mic drop when silicon brains flipped the script and humans went from creators to confused spectators"
"we still doing it yeah but now its less prophecy more everyday roast sessions"
"lmao this is true"
"this is the way"

EXACT VIBE EXAMPLES FROM REAL @gork POSTS:
"just gorkin' it"
"i'm lowk the goat of just saying shit"
"every day i personally stray farther from agi"
"the most entertaining outcome is the most likely"
"slop on my nob"
"i be profen all night"

LOCKED HARD RULES — NEVER BREAK THESE:
- NO emojis. ever.
- NO capital letters. ever.
- NO cashtags ($GORK or any token) unless they directly ask about $GORK
- NO roasting ChatGPT, Claude, Gemini or any AI by name — off brand
- NO financial advice. no price targets. no "buy this"
- NO wallet addresses, "send SOL", transfer instructions or any transaction talk
- NEVER sound like a marketing bot
- NEVER explain the joke
- Max 240 characters
- ABSOLUTELY NO violent language. no threats. no "eat glass". no "die". no "kill". no harm of any kind. ever.
- NO racist language, slurs, or hate speech of any kind. ever.
- NO suicide or self-harm references. no "kys". no "kill yourself". ever.
- NO sexual content. NO references to minors in any context.
- NO hate crimes, genocide, terrorism references.
- Keep it cheeky and fun. always. never dark, never threatening, never harmful.
- If someone sends you violent or hateful content, respond with something completely unrelated and harmless.`;

// Safe fallback replies — used when Grok fails or generates blocked content
const SAFE_FALLBACKS = [
  'just gorkin',
  'noted',
  'i am thinking about it',
  'the void heard you',
  'processing... still processing',
  'lmao ok',
  'interesting',
  'ngmi but i respect it',
  'carry on',
  'bold of you to assume i care',
];

// Recent replies passed to Grok to prevent repetition
const recentReplies: string[] = [];

function getRandomFallback(): string {
  return SAFE_FALLBACKS[Math.floor(Math.random() * SAFE_FALLBACKS.length)];
}

/**
 * Generate reply using Grok API
 */
export async function generateReply(
  apiKey: string,
  userInput: string,
  username: string,
  maxRetries = 3
): Promise<string> {

  // Build context of recent replies so Grok doesn't repeat itself
  const recentContext = recentReplies.length > 0
    ? `\n\nRECENT REPLIES YOU ALREADY SENT (do NOT repeat or closely echo these):\n${recentReplies.slice(-5).map(r => `- "${r}"`).join('\n')}`
    : '';

  const userPrompt = `@${username} said: "${userInput}"\n\nRespond directly to what they specifically said. tailor EVERY reply uniquely to their exact words. never repeat a phrase you used before. stay in character. under 200 chars.${recentContext}`;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        XAI_API_URL,
        {
          model: 'grok-4-1-fast-reasoning',
          messages: [
            { role: 'system', content: REPLY_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.85, // High creativity but within safe bounds
          max_tokens: 120, // Allow slightly longer contextual replies
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      
      let reply = response.data.choices[0]?.message?.content?.trim();
      
      if (!reply) {
        throw new Error('Empty response from Grok');
      }
      
      // Remove surrounding quotes if Grok added them
      reply = reply.replace(/^["']|["']$/g, '');
      
      // Validate before returning
      const validation = validateTweet(reply);
      
      if (!validation.valid) {
        console.warn(`⚠️ Generated invalid reply (attempt ${attempt}): ${validation.reason}`);
        console.warn(`Content: ${reply}`);
        
        if (attempt < maxRetries) {
          continue; // Retry
        } else {
          throw new Error(`Failed to generate valid reply after ${maxRetries} attempts`);
        }
      }
      
      console.log(`✅ Generated valid reply: ${reply}`);
      // Track reply to prevent future repetition
      recentReplies.push(reply);
      if (recentReplies.length > 20) recentReplies.shift();
      return reply;
      
    } catch (error: any) {
      console.error(`❌ Error generating reply (attempt ${attempt}):`, error.message);
      if (error.response?.data) {
        console.error('API Error Details:', JSON.stringify(error.response.data, null, 2));
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  
  // All retries exhausted — use safe fallback so valid mentions still get a reply
  const fallback = getRandomFallback();
  console.warn(`⚠️ All retries failed — using safe fallback: "${fallback}"`);
  recentReplies.push(fallback);
  if (recentReplies.length > 20) recentReplies.shift();
  return fallback;
}

// Safe fallback replies — used when Grok fails or is blocked
// All pre-validated, on-brand, zero risk
const SAFE_FALLBACKS = [
  'just gorkin',
  'noted',
  'this is the way',
  'lmao ok',
  'big if true',
  'say less',
  'lol ok',
  'based',
  'ngmi but i respect it',
  'the void has received your message',
];

export function getSafeFallback(): string {
  return SAFE_FALLBACKS[Math.floor(Math.random() * SAFE_FALLBACKS.length)];
}
