// Test script to check hotel list API
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/public/hotels';

async function testListApi() {
    try {
        console.log('Testing hotel list API...');
        
        // Get hotel list
        const response = await axios.get(BASE_URL);
        
        console.log('Status:', response.status);
        console.log('Total hotels:', response.data.total);
        
        // Check if hotels have averageRating and ratingCount fields
        if (response.data.hotels.length > 0) {
            console.log('\nHotel list data:');
            response.data.hotels.forEach((hotel, index) => {
                console.log(`\nHotel ${index + 1}:`);
                console.log('Name:', hotel.name);
                console.log('Has averageRating:', 'averageRating' in hotel);
                console.log('averageRating:', hotel.averageRating);
                console.log('Has ratingCount:', 'ratingCount' in hotel);
                console.log('ratingCount:', hotel.ratingCount);
            });
        }
        
        console.log('\nAPI test completed!');
        
    } catch (error) {
        console.error('Error during testing:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the test
testListApi();
