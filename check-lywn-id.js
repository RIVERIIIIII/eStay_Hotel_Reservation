// 检查用户lywn的ID
const mongoose = require('mongoose');

// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/hotel-booking');

// 定义用户模型
const UserSchema = new mongoose.Schema({
  username: String,
  role: String
});

const User = mongoose.model('User', UserSchema);

// 检查用户lywn的ID
async function checkLywnId() {
  try {
    console.log('连接到MongoDB...');
    
    // 查找用户lywn
    const lywnUser = await User.findOne({ username: 'lywn' });
    
    if (lywnUser) {
      console.log('用户lywn的信息:');
      console.log(`ID: ${lywnUser._id}`);
      console.log(`用户名: ${lywnUser.username}`);
      console.log(`角色: ${lywnUser.role}`);
    } else {
      console.log('未找到用户lywn');
      
      // 列出所有用户名包含'lywn'或'lyw'的用户
      const similarUsers = await User.find({ 
        username: { 
          $regex: 'lyw', 
          $options: 'i' 
        } 
      });
      console.log('类似用户名的用户:');
      similarUsers.forEach(user => {
        console.log(`ID: ${user._id}, 用户名: ${user.username}, 角色: ${user.role}`);
      });
    }
    
    // 断开连接
    await mongoose.connection.close();
    console.log('已断开MongoDB连接');
    
  } catch (error) {
    console.error('获取用户信息失败:', error.message);
    await mongoose.connection.close();
  }
}

// 运行检查
checkLywnId();
