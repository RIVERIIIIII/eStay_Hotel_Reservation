import { validationResult } from 'express-validator';
import Hotel from '../models/Hotel.js';

export const createHotel = async (req, res) => {
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
      amenities = []
    } = req.body;

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
      createdBy: req.user._id,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });

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

    const hotels = await Hotel.find(query)
      .select('-createdBy')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

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
      amenities
    } = req.body;

    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      {
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
      },
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
    // 这里简化处理，实际应该使用multer等中间件处理文件上传
    // 并将图片保存到云存储或本地文件系统
    
    // 模拟返回上传成功的图片URL
    const imageUrls = [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg'
    ];
    
    res.json({
      message: 'Images uploaded successfully',
      imageUrls
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};