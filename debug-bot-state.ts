// Comprehensive bot state debugger
import 'dotenv/config';
import { TwitterClient } from './src/twitter';

async function debug() {
  console.log('🔍 AGENT GORK DEBUG REPORT\n');
  console.log('=' .repeat(60));
  
  // 1. Check environment
  console.log('\n1. ENVIRONMENT CHECK:');
  console.log(`   ✓ Twitter API Key: ${process.env.TWITTER_API_KEY?.substring(0, 10)}...`);
  console.log(`   ✓ XAI API Key: ${process.env.XAI_API_KEY?.substring(0, 10)}...`);
  console.log(`   ✓ Bot Enabled: ${process.env.BOT_ENABLED}`);
  
  // 2. Twitter connection
  console.log('\n2. TWITTER API TEST:');
  try {
    const twitter = new TwitterClient(
      process.env.TWITTER_API_KEY!,
      process.env.TWITTER_API_SECRET!,
      process.env.TWITTER_ACCESS_TOKEN!,
      process.env.TWITTER_ACCESS_SECRET!
    );
    
    await twitter.initialize();
    console.log('   ✓ Twitter authentication: SUCCESS');
    
    // 3. Get recent mentions
    console.log('\n3. CHECKING MENTIONS (last 10):');
    const mentions = await twitter.getMentions();
    
    if (mentions.length === 0) {
      console.log('   ⚠️  NO MENTIONS FOUND');
      console.log('   This could mean:');
      console.log('     - No new mentions since last poll');
      console.log('     - lastMentionId is too recent');
      console.log('     - Twitter API rate limit');
    } else {
      console.log(`   ✓ Found ${mentions.length} mention(s):\n`);
      
      mentions.forEach((m, i) => {
        console.log(`   ${i + 1}. @${m.author_username} (${m.created_at})`);
        console.log(`      ID: ${m.id}`);
        console.log(`      Text: "${m.text}"`);
        console.log('');
      });
      
      // Check for JMoon specifically
      const jmoonMentions = mentions.filter(m => m.author_username === 'Jmoon_174');
      if (jmoonMentions.length > 0) {
        console.log(`   ✓ JMoon mentions found: ${jmoonMentions.length}`);
      } else {
        console.log('   ⚠️  NO JMoon mentions in current batch');
        console.log('      Possible reasons:');
        console.log('        - JMoon tweets are older than newest mention');
        console.log('        - Already processed (lastMentionId is set)');
      }
    }
    
  } catch (error: any) {
    console.log('   ❌ ERROR:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('DEBUG COMPLETE\n');
}

debug();
