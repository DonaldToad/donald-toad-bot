import axios from 'axios';

async function testEthereumChatMessage() {
  try {
    console.log('Sending a chat message about Ethereum price after fix...');
    const response = await axios.post('http://localhost:5000/api/chat', {
      message: 'What is the current price of Ethereum?',
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

testEthereumChatMessage();