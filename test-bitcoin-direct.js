import { fetchCryptocurrencyPrice } from './server/linea-explorer';

async function testBitcoinPrice() {
  try {
    console.log('Fetching Bitcoin price directly...');
    const btcPrice = await fetchCryptocurrencyPrice('bitcoin');
    console.log('Bitcoin price:', btcPrice);
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
  }
}

testBitcoinPrice();