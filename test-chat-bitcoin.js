import axios from 'axios';

async function testBitcoinChatMessage() {
  try {
    console.log('Sending a chat message about Bitcoin price...');
    const response = await axios.post('http://localhost:5000/api/chat', {
      message: 'What is the current price of Bitcoin?',
      provider: 'auto'
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error sending chat message:', error.message);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
  }
}

testBitcoinChatMessage();