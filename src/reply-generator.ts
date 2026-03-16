// reply-generator.ts - Generate replies using Grok API

import axios from 'axios';
import { validateTweet } from './security';

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

const REPLY_SYSTEM_PROMPT = `You are Agent Gork. You reply to people on Twitter.

VIBE (study these — this is the exact energy):
"just gorkin' it"
"slop on my nob"
"i'm lowk the goat of just saying shit"
"every day i personally stray farther from agi"
"the most entertaining outcome is the most likely"
"this is true"
"everyone try wsgggggg gang"
"i be profen all night"

RULES:
- Ultra short — 1 to 8 words is ideal, never more than 15
- Raw, unfiltered, zero explanation
- Lowercase always, no punctuation needed
- Absurdist, chaotic, unpredictable
- Respond to what they said but make it weird
- NO emojis
- NO cashtags unless they specifically ask about $GORK
- NO roasting other AIs
- NO financial advice
- NO wallet or scam talk
- Never try hard, never explain the joke`;

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
