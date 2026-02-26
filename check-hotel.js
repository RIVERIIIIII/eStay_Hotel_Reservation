// 检查酒店1的信息
const mongoose = require('mongoose');

// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/hotel-booking');

// 定义酒店模型
const HotelSchema = new mongoose.Schema({
  name: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: String,
  createdAt: Date
});

const Hotel = mongoose.model('Hotel', HotelSchema);

// 定义用户模型
const UserSchema = new mongoose.Schema({
  username: String,
  role: String
});

const User = mongoose.model('User', UserSchema);

// 检查酒店1的信息
async function checkHotel1() {
  try {
    console.log('连接到MongoDB...');
    
    // 获取酒店1
    const hotel1 = await Hotel.findOne({ name: '酒店1' }).populate('createdBy');
    
    if (hotel1) {
      console.log('酒店1信息:');
      console.log(`ID: ${hotel1._id}`);
      console.log(`名称: ${hotel1.name}`);
      console.log(`创建者ID: ${hotel1.createdBy._id}`);
      console.log(`创建者用户名: ${hotel1.createdBy.username}`);
      console.log(`状态: ${hotel1.status}`);
    } else {
      console.log('未找到酒店1');
      
      // 列出所有酒店
      const hotels = await Hotel.find({}).populate('createdBy');
      console.log('所有酒店:');
      hotels.forEach(hotel => {
        console.log(`ID: ${hotel._id}, 名称: ${hotel.name}, 创建者: ${hotel.createdBy ? hotel.createdBy.username : '无'}`);
      });
    }
    
    // 断开连接
    await mongoose.connection.close();
    console.log('已断开MongoDB连接');
    
  } catch (error) {
    console.error('获取酒店信息失败:', error.message);
    await mongoose.connection.close();
  }
}

// 运行检查
checkHotel1();
