// Test script to check hotel API response
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/public/hotels';

async function testHotelApi() {
    try {
        console.log('Testing hotel API...');
        
        // Test 1: Get hotel list
        console.log('\n1. Getting hotel list:');
        const listResponse = await axios.get(BASE_URL);
        console.log('Status:', listResponse.status);
        console.log('Total hotels:', listResponse.data.total);
        
        if (listResponse.data.hotels.length > 0) {
            const firstHotel = listResponse.data.hotels[0];
            console.log('\nFirst hotel data:');
            console.log('Name:', firstHotel.name);
            console.log('Has averageRating:', 'averageRating' in firstHotel);
            console.log('averageRating:', firstHotel.averageRating);
            console.log('Has ratingCount:', 'ratingCount' in firstHotel);
            console.log('ratingCount:', firstHotel.ratingCount);
            
            // Test 2: Get hotel details
            console.log('\n2. Getting hotel details:');
            const detailResponse = await axios.get(`${BASE_URL}/${firstHotel._id}`);
            console.log('Status:', detailResponse.status);
            console.log('Hotel details:');
            const hotelDetail = detailResponse.data.hotel;
            console.log('Name:', hotelDetail.name);
            console.log('Has averageRating:', 'averageRating' in hotelDetail);
            console.log('averageRating:', hotelDetail.averageRating);
            console.log('Has ratingCount:', 'ratingCount' in hotelDetail);
            console.log('ratingCount:', hotelDetail.ratingCount);
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
testHotelApi();
