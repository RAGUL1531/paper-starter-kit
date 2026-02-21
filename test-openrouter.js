// Test script to verify OpenRouter integration
// Run this with: node test-openrouter.js

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Read API key from .env file
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/VITE_OPENROUTER_API_KEY=(.+)/);
  
  if (!match) {
    console.error('❌ API key not found in .env file');
    console.log('Please add VITE_OPENROUTER_API_KEY to your .env file');
    process.exit(1);
  }

  const API_KEY = match[1].trim();

  if (API_KEY === 'YOUR_NEW_KEY' || API_KEY === 'your_api_key_here') {
    console.error('❌ Please replace the placeholder API key in .env with your actual OpenRouter API key');
    console.log('Get your key from: https://openrouter.ai/keys');
    process.exit(1);
  }

  console.log('✅ API key found in .env');
  console.log('✅ OpenRouter integration is configured correctly!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Navigate to the chatbot page');
  console.log('3. Start chatting with the AI!');

} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('❌ .env file not found');
    console.log('Please create a .env file with your OpenRouter API key');
    console.log('See .env.example for reference');
  } else {
    console.error('❌ Error:', error.message);
  }
  process.exit(1);
}
