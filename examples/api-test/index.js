/**
 * API Test Example
 * 
 * A simple script to test the @gravity-ai/api package locally.
 * 
 * Usage:
 *   1. Create a .env file in this directory with: API_KEY=your-api-key
 *   2. Run: node --env-file=.env index.js
 * 
 * Or pass the API key directly:
 *   API_KEY=your-api-key node index.js
 */

const { Client } = require('../../packages/api/dist/index.js');

// Initialize the client with your API key
const client = new Client(process.env.API_KEY);

async function main() {
  console.log('🚀 Testing Gravity API Client...\n');

  try {
    const ad = await client.getAd({
      // Conversation context (required)
      messages: [
        { role: 'user', content: 'I need help finding a new laptop for programming.' },
        { role: 'assistant', content: 'What is your budget and preferred operating system?' },
        { role: 'user', content: 'Around $2000, and I prefer macOS for development.' }
      ],
      
      // Device information (optional but recommended)
      device: {
        ip: '1.2.3.4',
        country: 'US',
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      
      // User demographics (optional)
      user: {
        gender: 'male',
        age: '25-34'
      },
      
      // Relevancy threshold (optional, 0-1)
      relevancy: 0.8,
      
      // Custom fields (optional)
      interests: ['coding', 'apple', 'software development'],
      summary: 'User is a developer looking for a high-end MacBook'
    });

    if (ad) {
      console.log('✅ Ad received!\n');
      console.log('📝 Ad Text:', ad.adText);
      console.log('🔗 Click URL:', ad.clickUrl || '(none)');
      console.log('📊 Impression URL:', ad.impUrl || '(none)');
      console.log('💰 Payout:', ad.payout ? `$${ad.payout.toFixed(2)}` : '(none)');
    } else {
      console.log('ℹ️  No ad available for this context.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();

