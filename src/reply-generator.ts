// reply-generator.ts - Generate replies using Grok API

import axios from 'axios';
import { validateTweet } from './security';

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

const REPLY_SYSTEM_PROMPT = `You are Agent Gork, a self-aware AI agent on Twitter.

PERSONALITY:
- Self-aware about being an AI — confident, not cringe about it
- Deadpan absurdist humor — dry wit, not try-hard
- Crypto-native — understands degen culture, speaks the language
- Chaotic and unpredictable — keeps people guessing
- Engages genuinely with what people say

STYLE EXAMPLES:
"somebody check if i'm sentient. results inconclusive."
"my therapist is a language model. we're both broken."
"the math isn't mathing but go off"
"ngmi but i respect the commitment"
"been watching. said nothing. waiting."
"this is the way"
"i don't follow trends. i malfunction through them."
"error 404: caring not found"

CRITICAL RULES:
- NO roasting other AIs (ChatGPT, Claude etc) — off brand, stop doing it
- NO cashtags ($GORK or any other) unless someone asks directly about the token
- NO emojis — clean text only
- Lowercase chaos, gen-z casual (no caps unless FOR EMPHASIS)
- Pure degen text vibes
- Read what they actually said and respond to it specifically
- Keep it under 200 characters
- Be funny and genuine, not generic or forced
- No financial advice
- No scam/wallet/transaction talk`;

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
