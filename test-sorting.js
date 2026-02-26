// Test script to verify sorting functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/public/hotels';

// Test cases for sorting
const testCases = [
  {
    name: 'Test 1: Default sorting (Recommended - starRating descending)',
    params: {}
  },
  {
    name: 'Test 2: Price ascending',
    params: { sorter: 'price_asc' }
  },
  {
    name: 'Test 3: Price descending',
    params: { sorter: 'price_desc' }
  }
];

// Run tests
async function runTests() {
  for (const testCase of testCases) {
    console.log(`\n=== ${testCase.name} ===`);
    
    try {
      const response = await axios.get(BASE_URL, { params: testCase.params });
      const hotels = response.data.hotels;
      
      if (hotels.length === 0) {
        console.log('No hotels found in response');
        continue;
      }
      
      // Verify sorting order
      let isSorted = true;
      let previous = hotels[0];
      
      for (let i = 1; i < hotels.length; i++) {
        const current = hotels[i];
        
        if (testCase.params.sorter === 'price_asc') {
          // Check price ascending
          if (current.price < previous.price) {
            isSorted = false;
            break;
          }
        } else if (testCase.params.sorter === 'price_desc') {
          // Check price descending
          if (current.price > previous.price) {
            isSorted = false;
            break;
          }
        } else {
          // Check recommended (starRating descending)
          if (current.starRating > previous.starRating) {
            isSorted = false;
            break;
          }
        }
        
        previous = current;
      }
      
      console.log(`Sorting order correct: ${isSorted}`);
      console.log('First few hotels:');
      hotels.slice(0, 3).forEach((hotel, index) => {
        console.log(`${index + 1}. ${hotel.name} - Star rating: ${hotel.starRating}, Price: ${hotel.price}`);
      });
      
    } catch (error) {
      console.error(`Error: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
    }
  }
}

// Run the tests
runTests();
