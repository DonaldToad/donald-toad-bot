import axios from 'axios';

async function testChartResponse() {
  try {
    console.log('Testing chart response...');
    const response = await axios.post('http://localhost:5000/api/chat', {
      message: 'Show me the DTC chart',
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

testChartResponse();