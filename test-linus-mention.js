import axios from 'axios';

async function testLinusMention() {
  try {
    console.log('Sending a chat message mentioning LINUS...');
    const response = await axios.post('http://localhost:5000/api/chat', {
      message: 'Tell me about LINUS token',
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

testLinusMention();