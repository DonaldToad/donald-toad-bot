import axios from 'axios';

async function testSimpleChartResponse() {
  try {
    console.log('Testing simple chart response...');
    const response = await axios.post('http://localhost:5000/api/chat', {
      message: 'chart',
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

testSimpleChartResponse();