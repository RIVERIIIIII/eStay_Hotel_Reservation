import { validationResult } from 'express-validator';
import Hotel from '../models/Hotel.js';

export const createHotel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, name_en, address, starRating, roomTypes, price, openingTime, description, amenities = [], images = [], mainImage = '', longitude, latitude } = req.body;

  // 创建酒店对象，包括地理位置信息
  const hotel = new Hotel({
    name,
    name_en,
    address,
    starRating,
    roomTypes,
    price,
    openingTime,
    description,
    amenities,
    images,
    mainImage,
    createdBy: req.user._id,
    status: req.user.role === 'admin' ? 'approved' : 'pending'
  });

  // 如果提供了经纬度信息，则设置地理位置
  if (longitude !== undefined && latitude !== undefined) {
    hotel.location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };
  }

    await hotel.save();
    
    res.status(201).json({
      message: 'Hotel created successfully',
      hotel: {
        id: hotel._id,
        name: hotel.name,
        status: hotel.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getHotels = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { createdBy: req.user._id };
    if (status) {
      query.status = status;
    }

    // 推荐排序：按用户平均评分降序，没有评分的按星级降序，然后按创建时间降序
    const hotels = await Hotel.aggregate([
      { $match: query },
      { $addFields: {
          hasRating: { $cond: { if: { $ne: ["$averageRating", null] }, then: 1, else: 0 } }
        } },
      { $sort: { hasRating: -1, averageRating: -1, starRating: -1, createdAt: -1 } },
      { $project: {
          createdBy: 0
        } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const total = await Hotel.countDocuments(query);

    res.json({
      hotels,
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

export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).select('-createdBy');

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json({ hotel });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateHotel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
    name,
    name_en,
    address,
    starRating,
    roomTypes,
    price,
    openingTime,
    description,
    amenities,
    images,
    mainImage,
    longitude,
    latitude
  } = req.body;

  // 构建更新对象
  const updateData = {
    name,
    name_en,
    address,
    starRating,
    roomTypes,
    price,
    openingTime,
    description,
    amenities,
    status: 'pending' // 重置为待审核状态
  };
  
  // 如果提供了图片信息，则添加到更新对象
  if (images !== undefined) {
    updateData.images = images;
  }
  
  // 如果提供了主图信息，则添加到更新对象
  if (mainImage !== undefined) {
    updateData.mainImage = mainImage;
  }

  // 如果提供了经纬度信息，则添加到更新对象
  if (longitude !== undefined && latitude !== undefined) {
    updateData.location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };
  }

  const hotel = await Hotel.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    updateData,
    { new: true, runValidators: true }
  ).select('-createdBy');

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json({
      message: 'Hotel updated successfully',
      hotel
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const uploadImages = async (req, res) => {
  try {
    // 检查是否有文件上传
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }
    
    // 获取当前服务器的基本URL
    // 注意：在Android模拟器中，localhost对应10.0.2.2，所以需要特殊处理
    const baseUrl = req.protocol + '://' + '10.0.2.2:5000';
    
    // 生成完整的图片URL数组
    const imageUrls = req.files.map(file => {
      // 使用/uploads前缀和文件名构建完整URL
      // 使用10.0.2.2确保在Android模拟器中能正确访问
      return `http://10.0.2.2:5000/uploads/${file.filename}`;
    });
    
    res.json({
      message: 'Images uploaded successfully',
      imageUrls
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};