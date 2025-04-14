import axios from 'axios';

async function testTitleChange() {
  try {
    console.log('Testing the title change in comparison response...');
    const response = await axios.post('http://localhost:5000/api/chat', {
      message: 'What do you think about LINUS?',
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

testTitleChange();