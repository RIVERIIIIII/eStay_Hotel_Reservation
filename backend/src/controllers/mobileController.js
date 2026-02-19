import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';

export const getMobileHotels = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      city, 
      minPrice, 
      maxPrice, 
      starRating, 
      amenities 
    } = req.query;
    const skip = (page - 1) * limit;
    
    // 构建查询条件，只查询已审核通过的酒店
    let query = { status: 'approved' };
    
    // 按城市筛选
    if (city) {
      query.city = city;
    }
    
    // 按价格范围筛选
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }
    
    // 按星级筛选
    if (starRating) {
      query.starRating = parseInt(starRating);
    }
    
    // 按设施筛选
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $all: amenitiesArray };
    }

    // 执行查询
    const hotels = await Hotel.find(query)
      .select('-createdBy -status -rejectReason')
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

export const getMobileHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.id,
      status: 'approved'
    }).select('-createdBy -status -rejectReason');

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json({ hotel });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { 
      hotelId, 
      checkInDate, 
      checkOutDate, 
      roomType, 
      roomCount, 
      totalPrice 
    } = req.body;
    
    // 验证酒店是否存在且已审核通过
    const hotel = await Hotel.findOne({ 
      _id: hotelId, 
      status: 'approved' 
    });
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    // 创建新的预定
    const booking = new Booking({
      customerId: req.user._id,
      hotelId,
      checkInDate,
      checkOutDate,
      roomType,
      roomCount,
      totalPrice,
      status: 'confirmed' // 直接确认预定
    });
    
    await booking.save();
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // 查询用户的预定列表
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate('hotelId', 'name address starRating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Booking.countDocuments({ customerId: req.user._id });
    
    res.json({
      bookings,
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