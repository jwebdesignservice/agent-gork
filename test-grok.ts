// Test Grok API to find working model name
import 'dotenv/config';
import axios from 'axios';

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const API_KEY = process.env.XAI_API_KEY!;

const models = ['grok-beta', 'grok-2-latest', 'grok-2', 'grok-2-1212', 'grok'];

async function testModel(modelName: string) {
  try {
    console.log(`\nTesting model: ${modelName}`);
    
    const response = await axios.post(
      XAI_API_URL,
      {
        model: modelName,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello in 5 words or less.' }
        ],
        temperature: 0.7,
        max_tokens: 20,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    
    const reply = response.data.choices[0]?.message?.content;
    console.log(`✅ SUCCESS with ${modelName}`);
    console.log(`Response: "${reply}"`);
    return true;
    
  } catch (error: any) {
    console.log(`❌ FAILED with ${modelName}`);
    if (error.response?.status) {
      console.log(`HTTP ${error.response.status}: ${error.response.statusText}`);
    }
    if (error.response?.data) {
      console.log(`Error: ${JSON.stringify(error.response.data)}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
    return false;
  }
}

async function main() {
  console.log('🔍 Testing Grok API models...\n');
  console.log(`API Key: ${API_KEY.substring(0, 10)}...`);
  
  for (const model of models) {
    const success = await testModel(model);
    if (success) {
      console.log(`\n🎉 WORKING MODEL FOUND: ${model}`);
      return;
    }
  }
  
  console.log('\n❌ NO WORKING MODEL FOUND');
  console.log('Check x.ai API documentation for correct model names');
}

main();
