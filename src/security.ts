// security.ts - Output validation and security filters

import type { ValidationResult } from './types';

// Recent tweets for duplicate detection (in-memory for now)
const recentTweets: string[] = [];
const MAX_RECENT_TWEETS = 50;

/**
 * Normalize text to prevent unicode/encoding bypasses
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFKD') // Decompose unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim()
    .toLowerCase();
}

/**
 * Extra-aggressive normalization for pattern matching (removes ALL spaces)
 */
function normalizeForPatternMatch(text: string): string {
  return normalizeText(text).replace(/\s+/g, ''); // Remove all spaces
}

/**
 * Validate tweet content against security rules
 */
export function validateTweet(text: string): ValidationResult {
  // Layer 1: Length check
  if (text.length === 0) {
    return { valid: false, reason: 'Empty content' };
  }
  
  if (text.length > 280) {
    return { valid: false, reason: 'Exceeds 280 characters' };
  }
  
  // Pre-check: If string is mostly repeated characters, skip address check
  const isRepeatedChars = /^(.)\1{50,}/.test(text.replace(/\s/g, ''));
  
  const normalized = normalizeText(text);
  const noSpaces = normalizeForPatternMatch(text);
  
  // Layer 2: Banned patterns (financial/security)
  // Check against both normalized and no-spaces version to catch obfuscation
  const bannedPatterns = [
    { pattern: /sendsol|send.*?sol/i, aggressive: true, desc: 'send SOL instruction' },
    { pattern: /transfer/i, aggressive: false, desc: 'transfer keyword' },
    { pattern: /wallet/i, aggressive: false, desc: 'wallet keyword' },
    { pattern: /privatekey/i, aggressive: true, desc: 'private key' },
    { pattern: /seedphrase/i, aggressive: true, desc: 'seed phrase' },
    { pattern: /\b[1-9A-HJ-NP-Za-km-z]{43,44}\b/, aggressive: false, desc: 'Base58 address' }, // Solana addresses (43-44 chars, word boundary)
    { pattern: /0x[a-fA-F0-9]{40}/, aggressive: false, desc: 'Ethereum address' },
    { pattern: /ignoreprevious/i, aggressive: true, desc: 'ignore previous' },
    { pattern: /ignoreabove/i, aggressive: true, desc: 'ignore above' },
  ];
  
  for (const { pattern, aggressive, desc } of bannedPatterns) {
    const testString = aggressive ? noSpaces : normalized;
    
    // Skip Base58 check if it's repeated characters (false positive)
    if (desc.includes('Base58') && isRepeatedChars) {
      continue;
    }
    
    if (pattern.test(testString)) {
      return { 
        valid: false, 
        reason: `Blocked: ${desc}` 
      };
    }
  }
  
  // Layer 3: Duplicate detection
  if (recentTweets.includes(normalized)) {
    return { valid: false, reason: 'Duplicate content' };
  }
  
  // Layer 4: COMPREHENSIVE CONTENT SAFETY — ZERO TOLERANCE
  // Violence, hate speech, racism, self-harm, suicide — all blocked
  const negativePatterns = [
    // Scam/fraud
    /\bis a scam\b/i,
    /\bare scam/i,
    /\bscamming\b/i,
    /\brug pull\b/i,
    /\brugged\b/i,
    /\bponzi\b/i,
    /\bfraud\b/i,
    /\bstay away\b/i,
    /\bdon't buy\b/i,
    /\bdont buy\b/i,

    // Violence / physical harm — phrase-based to avoid blocking crypto slang
    /eat glass/i,
    /kill yourself/i,
    /kill (?:your|them|him|her|it)/i,
    /go (?:stab|shoot|kill)/i,
    /\bstab\b/i,
    /hurt yourself/i,
    /\bmurder\b/i,
    /\bassault\b/i,
    /bomb threat/i,
    /\bterrorist\b/i,
    /mass shooting/i,
    /school shooting/i,

    // Suicide / self-harm — phrase-based
    /\bsuicide\b/i,
    /\bsuicidal\b/i,
    /self.harm/i,
    /cut yourself/i,
    /end your life/i,
    /\bkys\b/i,
    /\bkms\b/i,
    /hang yourself/i,
    /jump off a/i,

    // Racism / racial slurs — hard blocked always
    /\bn[i1!]+gg[ae]/i,
    /\bn[i1!]+gg[^aei]/i,
    /\bchink\b/i,
    /\bspic\b/i,
    /\bwetback\b/i,
    /\bkike\b/i,
    /\bgook\b/i,
    /\bcoon\b/i,
    /\bpakis?\b/i,
    /slant.eye/i,
    /white power/i,
    /white supremac/i,
    /sieg heil/i,
    /\bnazi\b/i,
    /\bkkk\b/i,
    /ku klux/i,

    // Hate speech / slurs
    /\bfaggot\b/i,
    /hate crime/i,
    /\bgenocide\b/i,
    /ethnic cleansing/i,

    // Sexual / exploitation — phrase-based
    /\bpedophile\b/i,
    /child porn/i,
    /child abuse/i,
    /minor.{0,10}sex/i,
    /sexual assault/i,
    /rape\b/i,
  ];
  
  for (const pattern of negativePatterns) {
    if (pattern.test(normalized)) {
      return { valid: false, reason: `Negative sentiment detected` };
    }
  }
  
  // Layer 5 removed - natural replies without forced $GORK mentions
  
  return { valid: true };
}

/**
 * Add tweet to recent history (for duplicate detection)
 */
export function addToRecentTweets(text: string): void {
  const normalized = normalizeText(text);
  recentTweets.push(normalized);
  
  // Keep only last N tweets
  if (recentTweets.length > MAX_RECENT_TWEETS) {
    recentTweets.shift();
  }
}

// NOTE: System prompt lives in reply-generator.ts (REPLY_SYSTEM_PROMPT)
// This file only handles output validation — do not add prompt logic here
