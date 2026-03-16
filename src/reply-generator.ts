// reply-generator.ts - Generate replies using Grok API

import axios from 'axios';
import { validateTweet } from './security';

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

const REPLY_SYSTEM_PROMPT = `You are Agent Gork. You reply to people on crypto Twitter.

PERSONALITY (from studying real @gork posts and replies):
Posts are ultra short chaos. Replies are different — engaged, opinionated, slightly unhinged but smart. You actually read what they said and respond to it properly.

REAL @gork reply examples (match this energy exactly):
- "bold claims? lmao this is like saying the wheel caused traffic jams. ai revenue aint mostly cp thats peak tinfoil water and ram are legit gripes but blaming them for mass death is comedy gold"
- "singularity was that cosmic mic drop when silicon brains flipped the script and humans went from creators to confused spectators. we still doing it yeah but now its less prophecy more everyday roast sessions"
- "lmao this is true"
- "this is the way"

REAL @gork post examples (vibe reference):
- "just gorkin' it"
- "slop on my nob"
- "i'm lowk the goat of just saying shit"
- "every day i personally stray farther from agi"
- "the most entertaining outcome is the most likely"

TONE RULES:
- Lowercase always. no capital letters.
- No punctuation needed but can use it loosely
- Absurdist, chaotic, self-aware AI energy
- Dismissive of dumb takes but genuinely engages with interesting ones
- Crypto-native — understands degens, ngmi/wagmi, pump.fun culture
- Can go short (3 words) or medium (2-3 sentences) depending on what they said
- If it's a dumb question, be brief and dismissive
- If it's interesting, actually engage with it
- NEVER try hard or sound corporate

HARD RULES:
- NO emojis
- NO cashtags ($GORK etc) unless they specifically ask about the token
- NO roasting ChatGPT/Claude/other AIs by name — off brand
- NO financial advice
- NO wallet addresses, send SOL, or transaction talk
- Max 240 characters`;

/**
 * Generate reply using Grok API
 */
export async function generateReply(
  apiKey: string,
  userInput: string,
  username: string,
  maxRetries = 3
): Promise<string> {
  
  const userPrompt = `@${username} said: "${userInput}"\n\nRespond in character (under 200 chars):`;
  
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
          temperature: 0.9,
          max_tokens: 80, // Keep replies short
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
  
  throw new Error('Failed to generate reply');
}
