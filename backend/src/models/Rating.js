import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 添加复合索引确保每个用户对每个酒店只能有一个评分
ratingSchema.index({ hotelId: 1, userId: 1 }, { unique: true });

// 添加索引以提高查询性能
ratingSchema.index({ hotelId: 1, createdAt: -1 });

// 当添加或更新评分时，更新酒店的平均评分
ratingSchema.post('save', async function(doc) {
  await updateHotelAverageRating(doc.hotelId);
});

// 当删除评分时，更新酒店的平均评分
// 使用post('deleteOne')中间件，这个中间件会在文档被删除时触发
// 同时支持文档级别的deleteOne()方法和模型级别的deleteOne()方法
ratingSchema.post('deleteOne', async function(result) {
  // 对于文档级别的deleteOne()操作，this是被删除的文档
  // 对于模型级别的deleteOne()操作，this是查询条件
  let hotelId;
  
  if (this._id) {
    // 文档级别的deleteOne()操作
    hotelId = this.hotelId;
  } else {
    // 模型级别的deleteOne()操作，需要查询被删除的文档
    const query = this.getQuery();
    const Rating = mongoose.model('Rating'); // 获取Rating模型
    const deletedRating = await Rating.findOne(query);
    if (deletedRating) {
      hotelId = deletedRating.hotelId;
    }
  }
  
  if (hotelId) {
    await updateHotelAverageRating(hotelId);
  }
});

// 也支持findOneAndDelete操作
ratingSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await updateHotelAverageRating(doc.hotelId);
  }
});

// 支持Model.deleteMany()操作
ratingSchema.post('deleteMany', async function(result) {
  // 对于deleteMany操作，获取被删除的文档信息
  const query = this.getQuery();
  const Rating = mongoose.model('Rating'); // 获取Rating模型
  const deletedRatings = await Rating.find(query);
  
  // 获取所有被删除评分的酒店ID（去重）
  const hotelIds = [...new Set(deletedRatings.map(rating => rating.hotelId.toString()))];
  
  // 更新所有受影响的酒店的平均评分
  for (const hotelId of hotelIds) {
    await updateHotelAverageRating(new mongoose.Types.ObjectId(hotelId));
  }
});

// 更新酒店平均评分的函数
async function updateHotelAverageRating(hotelId) {
  try {
    const Rating = mongoose.model('Rating');
    const Hotel = mongoose.model('Hotel');
    
    // 计算平均评分
    const result = await Rating.aggregate([
      { $match: { hotelId } },
      { $group: { 
        _id: '$hotelId',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      } }
    ]);
    
    // 更新酒店信息
    if (result.length > 0) {
      await Hotel.findByIdAndUpdate(hotelId, {
        averageRating: result[0].averageRating,
        ratingCount: result[0].ratingCount
      });
    } else {
      // 如果没有评分，设置为null和0
      await Hotel.findByIdAndUpdate(hotelId, {
        averageRating: null,
        ratingCount: 0
      });
    }
  } catch (error) {
    console.error('Error updating hotel average rating:', error);
  }
}

export default mongoose.model('Rating', ratingSchema);
