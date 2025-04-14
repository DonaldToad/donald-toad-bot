import axios from 'axios';

async function testBitcoinPrice() {
  try {
    const response = await axios.get('http://localhost:5000/api/crypto/bitcoin?format=text');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error.message);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
  }
}

testBitcoinPrice();