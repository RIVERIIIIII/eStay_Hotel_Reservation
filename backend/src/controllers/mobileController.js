import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';

export const getMobileHotels = async (req, res) => {
  try {
    // 支持GET和POST方法，从query或body中获取参数
    const params = req.method === 'POST' ? req.body : req.query;
    const {
      page = 1,
      limit = 10,
      pageSize,
      city,
      keyword,
      minPrice,
      maxPrice,
      starRating,
      amenities,
      facilities,
      checkInDate,
      checkOutDate,
      sorter,
      sortBy
    } = params;
    const skip = (page - 1) * (pageSize || limit);

    // 构建查询条件，查询已审核通过或已发布的酒店
    let query = { status: { $in: ['approved', 'published'] } };

    // 按城市筛选
    if (city) {
      query.address = { $regex: city, $options: 'i' };
    }

    // 按关键字搜索（酒店名称、描述、地址）
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { name_en: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { address: { $regex: keyword, $options: 'i' } }
      ];
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

    // 按设施筛选（支持amenities和facilities两种参数名）
    const facilitiesToFilter = amenities || facilities;
    if (facilitiesToFilter) {
      const amenitiesArray = Array.isArray(facilitiesToFilter) ? facilitiesToFilter : facilitiesToFilter.split(',');  
      query.amenities = { $all: amenitiesArray };
    }

    // 构建排序对象
    let sortOptions = { createdAt: -1 }; // 默认按创建时间降序
    
    // 支持sorter和sortBy两种参数名
    const sortParam = sorter || sortBy;
    
    if (sortParam) {
        // 支持格式: "price_asc" 或 "price_desc"
        const [field, direction] = sortParam.split('_');
        if (field === 'price') {
            sortOptions = { price: direction === 'asc' ? 1 : -1 };
        } else if (field === 'rating') {
            // 按用户平均评分降序排序，没有评分的排在后面
            sortOptions = { averageRating: -1, createdAt: -1 };
        }
    }
    
    // 检查是否需要按推荐排序
    if (!sortParam) {
        // 推荐排序：按用户平均评分降序，没有评分的按星级降序，然后按创建时间降序
        sortOptions = { averageRating: -1, starRating: -1, createdAt: -1 };
    }

    // 执行查询
    const hotels = await Hotel.find(query)
      .select('-createdBy -status -rejectReason')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // 检查房间可用性（如果提供了入住和退宿时间）
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
        // 过滤出有可用房间的酒店
        hotels = hotels.filter(hotel => {
          // 检查酒店是否有至少一个可用房型
          return hotel.roomTypes.some(roomType => {
            // 如果房间未被占用或占用时间与查询时间不冲突，则可用
            if (!roomType.occupied) {
              return true;
            }
            
            const occupiedCheckIn = new Date(roomType.occupied.checkInDate);
            const occupiedCheckOut = new Date(roomType.occupied.checkOutDate);
            
            // 检查时间冲突 - 只判断是否与当前占用的时间段重叠
            // 如果请求的入住时间在已占用的时间段内，或者请求的退房时间在已占用的时间段内，
            // 或者请求的时间段完全包含已占用的时间段，或者已占用的时间段完全包含请求的时间段
            // 注意：如果已占用的时间段已经过期，这里的比较会自动处理，因为已过期的时间段不会与未来的查询时间冲突
            const hasConflict = (
              (checkIn >= occupiedCheckIn && checkIn < occupiedCheckOut) ||
              (checkOut > occupiedCheckIn && checkOut <= occupiedCheckOut) ||
              (checkIn <= occupiedCheckIn && checkOut >= occupiedCheckOut)
            );
            
            return !hasConflict;
          });
        });
      }
    }

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

// 获取推荐酒店（用于首页Banner）
export const getFeaturedHotels = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    // 查询所有已发布的酒店
    const hotels = await Hotel.find({ status: 'published' })
      .select('-createdBy -status -rejectReason')
      .sort({ createdAt: -1 });
    
    // 随机排序
    const shuffled = hotels.sort(() => 0.5 - Math.random());
    // 选择前N个
    const featured = shuffled.slice(0, limit);
    
    res.json({ hotels: featured });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMobileHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.id,
      status: 'published'
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
    
    // 验证酒店是否存在且已发布
    const hotel = await Hotel.findOne({ 
      _id: hotelId, 
      status: 'published' 
    });
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    // 检查房间是否可用
    const roomTypeIndex = hotel.roomTypes.findIndex(rt => rt.type === roomType);
    if (roomTypeIndex === -1) {
      return res.status(400).json({ message: 'Room type not found' });
    }
    
    const roomTypeInfo = hotel.roomTypes[roomTypeIndex];
    
    // 检查房间是否已被占用
    if (roomTypeInfo.occupied) {
      const occupiedCheckIn = new Date(roomTypeInfo.occupied.checkInDate);
      const occupiedCheckOut = new Date(roomTypeInfo.occupied.checkOutDate);
      const newCheckIn = new Date(checkInDate);
      const newCheckOut = new Date(checkOutDate);
      
      // 检查时间冲突
      const hasConflict = (
        (newCheckIn >= occupiedCheckIn && newCheckIn < occupiedCheckOut) ||
        (newCheckOut > occupiedCheckIn && newCheckOut <= occupiedCheckOut) ||
        (newCheckIn <= occupiedCheckIn && newCheckOut >= occupiedCheckOut)
      );
      
      if (hasConflict) {
        return res.status(400).json({ message: 'Room is already occupied for the selected dates' });
      }
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
    
    // 更新酒店房间的占用状态
    await Hotel.updateOne(
      { _id: hotelId, 'roomTypes.type': roomType },
      { 
        $set: {
          'roomTypes.$.occupied': {
            checkInDate,
            checkOutDate,
            bookingId: booking._id,
            customerId: req.user._id
          }
        }
      }
    );
    
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

// 取消预定
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // 查找预订
    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.user._id
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // 只能取消未完成的预订
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed booking' });
    }
    
    // 更新预订状态
    booking.status = 'cancelled';
    await booking.save();
    
    // 释放房间占用状态
    await Hotel.updateOne(
      {
        _id: booking.hotelId,
        'roomTypes.type': booking.roomType,
        'roomTypes.occupied.bookingId': booking._id
      },
      { $set: { 'roomTypes.$.occupied': null } }
    );
    
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};