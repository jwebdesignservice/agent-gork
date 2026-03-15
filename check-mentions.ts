// Quick script to check current mentions
import 'dotenv/config';
import { TwitterClient } from './src/twitter';

async function checkMentions() {
  const twitter = new TwitterClient(
    process.env.TWITTER_API_KEY!,
    process.env.TWITTER_API_SECRET!,
    process.env.TWITTER_ACCESS_TOKEN!,
    process.env.TWITTER_ACCESS_SECRET!
  );
  
  await twitter.initialize();
  
  console.log('\n📬 Checking for new mentions...\n');
  const mentions = await twitter.getMentions();
  
  console.log(`Found ${mentions.length} mention(s):\n`);
  
  for (const mention of mentions) {
    console.log(`🔹 @${mention.author_username} (${mention.created_at})`);
    console.log(`   ID: ${mention.id}`);
    console.log(`   "${mention.text}"`);
    console.log('');
  }
}

checkMentions().catch(console.error);
