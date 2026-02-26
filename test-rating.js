// Test script to simulate user rating
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Sample test data
const testHotelId = '659d82d39b053d2c94b6c2d3'; // Replace with a valid hotel ID from your database
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWJjY2ZmZmQ3NTYxZGFkMTc0M2U0NDciLCJ1c2VybmFtZSI6InRlc3QxMjMiLCJpYXQiOjE3MTA2MDU1MzQsImV4cCI6MTcxMDY5MTkzNH0.jL5Z9N3X3Y9Y8Z7X6Y5Z4X3Y2Z1X0Y9Z8X7Y6Z5X4Y3Z2X1'; // Replace with a valid token

async function testRatingFlow() {
    try {
        console.log('Testing rating flow...');
        
        // Step 1: Get hotel details before rating
        console.log('\n1. Getting hotel details before rating:');
        const hotelBefore = await axios.get(`${BASE_URL}/public/hotels/${testHotelId}`);
        console.log('Hotel name:', hotelBefore.data.hotel.name);
        console.log('Average rating before:', hotelBefore.data.hotel.averageRating);
        console.log('Rating count before:', hotelBefore.data.hotel.ratingCount);
        
        // Step 2: Submit a rating
        console.log('\n2. Submitting rating:');
        const ratingResponse = await axios.post(
            `${BASE_URL}/ratings/${testHotelId}`,
            { rating: 4.5, comment: 'Great hotel!' },
            { headers: { Authorization: `Bearer ${testToken}` } }
        );
        console.log('Rating response:', ratingResponse.data);
        
        // Step 3: Get hotel details after rating
        console.log('\n3. Getting hotel details after rating:');
        const hotelAfter = await axios.get(`${BASE_URL}/public/hotels/${testHotelId}`);
        console.log('Average rating after:', hotelAfter.data.hotel.averageRating);
        console.log('Rating count after:', hotelAfter.data.hotel.ratingCount);
        
        // Step 4: Verify rating is saved
        console.log('\n4. Getting hotel ratings:');
        const ratingsResponse = await axios.get(`${BASE_URL}/ratings/hotel/${testHotelId}`);
        console.log('Total ratings:', ratingsResponse.data.total);
        
        console.log('\nRating test completed!');
        
    } catch (error) {
        console.error('Error during rating test:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the test
testRatingFlow();
