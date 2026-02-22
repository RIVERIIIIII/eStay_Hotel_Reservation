import Rating from '../models/Rating.js';
import Hotel from '../models/Hotel.js';

// 添加或更新酒店评分
export const createOrUpdateRating = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;
    
    // 验证酒店是否存在且已审核通过
    const hotel = await Hotel.findOne({ 
      _id: hotelId, 
      status: 'approved' 
    });
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    // 查找是否已经存在该用户对该酒店的评分
    let ratingDoc = await Rating.findOne({ hotelId, userId });
    
    if (ratingDoc) {
      // 更新评分
      ratingDoc.rating = rating;
      ratingDoc.comment = comment;
      await ratingDoc.save();
      return res.json({ 
        message: 'Rating updated successfully', 
        rating: ratingDoc 
      });
    } else {
      // 创建新评分
      ratingDoc = new Rating({
        hotelId,
        userId,
        rating,
        comment
      });
      await ratingDoc.save();
      return res.status(201).json({ 
        message: 'Rating created successfully', 
        rating: ratingDoc 
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 获取酒店的所有评分
export const getHotelRatings = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // 验证酒店是否存在
    const hotel = await Hotel.findById(hotelId);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    // 查询评分
    const ratings = await Rating.find({ hotelId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Rating.countDocuments({ hotelId });
    
    res.json({
      ratings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 获取用户对某个酒店的评分
export const getUserHotelRating = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const userId = req.user._id;
    
    const rating = await Rating.findOne({ hotelId, userId });
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    res.json({ rating });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 删除评分
export const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user._id;
    
    // 查找评分并验证是否属于该用户
    const rating = await Rating.findOne({ _id: ratingId, userId });
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // 删除评分
    await rating.deleteOne();
    
    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
