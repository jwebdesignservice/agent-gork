// List available models from xAI API
import 'dotenv/config';
import axios from 'axios';

async function listModels() {
  try {
    console.log('🔍 Querying xAI for available models...\n');
    
    const response = await axios.get('https://api.x.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
    });
    
    console.log('✅ Available models:\n');
    
    if (response.data.data && Array.isArray(response.data.data)) {
      response.data.data.forEach((model: any) => {
        console.log(`  - ${model.id}`);
      });
    } else {
      console.log(JSON.stringify(response.data, null, 2));
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

listModels();
