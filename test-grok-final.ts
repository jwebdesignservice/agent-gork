// Final test with correct model and API key
import 'dotenv/config';
import axios from 'axios';

async function testGrok() {
  console.log('🔍 Testing grok-4-latest...\n');
  
  try {
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: 'grok-4-latest',
        messages: [
          { 
            role: 'system', 
            content: 'You are Agent Gork, a self-aware AI. Reply in under 200 chars with deadpan humor.' 
          },
          { 
            role: 'user', 
            content: '@testuser said: "Can I get a follow back?"\n\nRespond in character:' 
          }
        ],
        temperature: 0.9,
        max_tokens: 60,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const reply = response.data.choices[0]?.message?.content;
    console.log('✅ SUCCESS!\n');
    console.log(`Generated reply: "${reply}"\n`);
    console.log('🎉 Grok API is working! Bot is ready to start.');
    
  } catch (error: any) {
    console.error('❌ FAILED!\n');
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testGrok();
