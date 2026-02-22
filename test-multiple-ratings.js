// Test script to verify average rating calculation
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Sample test data - replace with your own valid data
const testHotelId = '659d82d39b053d2c94b6c2d3'; // Valid hotel ID
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWJjY2ZmZmQ3NTYxZGFkMTc0M2U0NDciLCJ1c2VybmFtZSI6InRlc3QxMjMiLCJpYXQiOjE3MTA2MDU1MzQsImV4cCI6MTcxMDY5MTkzNH0.jL5Z9N3X3Y9Y8Z7X6Y5Z4X3Y2Z1X0Y9Z8X7Y6Z5X4Y3Z2X1'; // Valid token

async function testMultipleRatings() {
    try {
        console.log('Testing multiple ratings average calculation...');
        
        // Step 1: Get initial hotel details
        console.log('\n1. Initial hotel details:');
        let hotelData = await axios.get(`${BASE_URL}/public/hotels/${testHotelId}`);
        console.log('Average rating:', hotelData.data.hotel.averageRating);
        console.log('Rating count:', hotelData.data.hotel.ratingCount);
        
        // Step 2: Submit first rating
        console.log('\n2. Submitting first rating: 4.0');
        await axios.post(
            `${BASE_URL}/ratings/${testHotelId}`,
            { rating: 4.0, comment: 'First rating' },
            { headers: { Authorization: `Bearer ${testToken}` } }
        );
        
        // Check updated hotel details
        hotelData = await axios.get(`${BASE_URL}/public/hotels/${testHotelId}`);
        console.log('Updated average rating:', hotelData.data.hotel.averageRating);
        console.log('Updated rating count:', hotelData.data.hotel.ratingCount);
        
        // Step 3: Update rating to 5.0
        console.log('\n3. Updating rating to: 5.0');
        await axios.post(
            `${BASE_URL}/ratings/${testHotelId}`,
            { rating: 5.0, comment: 'Updated rating' },
            { headers: { Authorization: `Bearer ${testToken}` } }
        );
        
        // Check updated hotel details
        hotelData = await axios.get(`${BASE_URL}/public/hotels/${testHotelId}`);
        console.log('Updated average rating:', hotelData.data.hotel.averageRating);
        console.log('Updated rating count:', hotelData.data.hotel.ratingCount);
        
        console.log('\nMultiple ratings test completed!');
        
    } catch (error) {
        console.error('Error during multiple ratings test:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the test
testMultipleRatings();
