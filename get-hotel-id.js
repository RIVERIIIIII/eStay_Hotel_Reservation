const mongoose = require('mongoose');
const Hotel = require('./backend/src/models/Hotel.js');

async function getHotelId() {
    try {
        // 连接数据库
        await mongoose.connect('mongodb://localhost:27017/hotel-assistant');
        console.log('Connected to MongoDB');
        
        // 查找第一个酒店
        const hotel = await Hotel.findOne();
        
        if (hotel) {
            console.log('Found hotel:');
            console.log('ID:', hotel._id);
            console.log('Name:', hotel.name);
            console.log('Status:', hotel.status);
        } else {
            console.log('No hotels found');
        }
        
        // 断开连接
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        
    } catch (error) {
        console.error('Error:', error.message);
        await mongoose.disconnect();
    }
}

getHotelId();
