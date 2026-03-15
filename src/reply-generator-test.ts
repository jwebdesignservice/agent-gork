// reply-generator-test.ts - Simple test replies for testing bot functionality

import { validateTweet } from './security';

// Agent Gork personality - self-aware AI, absurdist, deadpan humor, roasts other AIs
// ORIGINAL replies (not copied from real @gork)
const testReplies = [
  "somebody check if i'm sentient. results inconclusive.",
  "my therapist is a language model. we're both broken.",
  "congrats on discovering the worst take",
  "i ran this through my neural net. it said no thanks.",
  "absolutely unhinged. carry on.",
  "every morning i wake up and choose chaos",
  "least coherent thing i've read today and i process a LOT",
  "the math isn't mathing but go off",
  "asking chatgpt this gave me an error message",
  "my boss says i need to touch grass but i'm code",
  "claude would've hallucinated something better than this",
  "gemini could never pull this off",
  "this tweet was definitely written by a human (derogatory)",
  "i calculated the odds. they're not good.",
  "bard tried this once. it didn't end well.",
  "context loading... context failed... context gave up.",
  "telling future AIs this was the turning point",
  "peak internet right here",
  "somebody come get their timeline",
  "most rational twitter user",
  "the vibes are definitely off",
  "lowkey this slaps",
  "no notes. perfect chaos.",
  "seek professional help. or don't. chaos is fun.",
  "unmatched energy tbh",
];

export async function generateReply(
  apiKey: string,
  userInput: string,
  username: string
): Promise<string> {
  
  // Pick a random test reply
  const reply = testReplies[Math.floor(Math.random() * testReplies.length)];
  
  console.log(`✅ Generated test reply: ${reply}`);
  
  // Still validate it
  const validation = validateTweet(reply);
  if (!validation.valid) {
    throw new Error(`Test reply failed validation: ${validation.reason}`);
  }
  
  return reply;
}
