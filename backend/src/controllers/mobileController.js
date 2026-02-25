import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';

// 城市中心点坐标数据
const cityCenters = {
  '北京': [116.4074, 39.9042],      // 天安门
  '上海': [121.4737, 31.2304],      // 人民广场
  '广州': [113.2644, 23.1291],      // 广州塔
  '深圳': [114.0579, 22.5431],      // 市民中心
  '杭州': [120.1551, 30.2741],      // 西湖
  '成都': [104.0668, 30.5728],      // 天府广场
  '武汉': [114.3055, 30.5928],      // 黄鹤楼
  '西安': [108.9398, 34.3416],      // 钟楼
  '重庆': [106.5516, 29.5630],      // 解放碑
  '南京': [118.7969, 32.0603],      // 新街口
  '天津': [117.2008, 39.0842]       // 天津之眼
};

// 常见公共地址坐标数据
const commonAddresses = {
  '北京邮电大学': [116.3595, 39.9632],
  '故宫': [116.3972, 39.9075],
  '天安门': [116.4074, 39.9042],
  '长城': [116.0211, 40.3597],      // 八达岭长城
  '颐和园': [116.2754, 39.9994],
  '北京大学': [116.3188, 39.9944],
  '清华大学': [116.3271, 40.0039],
  '鸟巢': [116.3969, 39.9910],
  '水立方': [116.3967, 39.9920]
};

// Haversine公式计算两点间的直线距离（单位：千米）
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 地球半径（千米）
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// 角度转弧度
const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

// 检查关键词是否为酒店名称
const isHotelNameKeyword = (keyword) => {
  if (!keyword) return false;
  
  // 常见酒店品牌列表
  const hotelBrands = ["汉庭", "全季", "如家", "7天", "格林豪泰", "速8", "宜必思", "锦江之星", "维也纳", "桔子"];
  
  // 检查关键词是否包含酒店品牌
  return hotelBrands.some(brand => keyword.includes(brand));
};

// 获取基准点坐标
const getBasePoint = (city, keyword, userLat, userLon) => {
  // 场景1：用户已定位（有经纬度）
  if (userLat && userLon) {
    return [parseFloat(userLon), parseFloat(userLat)];
  }
  
  // 场景2：关键词为公共地址
  if (keyword) {
    // 检查关键词是否在公共地址列表中
    for (const [address, coords] of Object.entries(commonAddresses)) {
      if (address.includes(keyword) || keyword.includes(address)) {
        return coords;
      }
    }
  }
  
  // 场景3：用户输入了城市
  if (city) {
    // 检查城市是否在城市中心列表中
    const cityCenter = cityCenters[city];
    if (cityCenter) {
      return cityCenter;
    }
    
    // 尝试从城市名称中提取主要城市
    for (const [cityName, coords] of Object.entries(cityCenters)) {
      if (city.includes(cityName)) {
        return coords;
      }
    }
  }
  
  // 场景4：关键词为酒店名称（使用城市中心）
  if (keyword && isHotelNameKeyword(keyword)) {
    if (city) {
      const cityCenter = cityCenters[city];
      if (cityCenter) {
        return cityCenter;
      }
    }
  }
  
  // 所有场景都无法确定基准点
  return null;
};

export const getMobileHotels = async (req, res) => {
  try {
    console.log('Received hotel list request:', {
      method: req.method,
      params: req.method === 'POST' ? req.body : req.query,
      ip: req.ip
    });
    console.log('Raw request query:', req.query);
    console.log('Raw request body:', req.body);
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
      sortBy,
      longitude,
      latitude
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
      if (Array.isArray(facilitiesToFilter)) {
        // 处理数组格式的设施列表
        if (facilitiesToFilter.length > 0) {
          query.amenities = { $all: facilitiesToFilter };
        }
      } else {
        // 处理字符串格式的设施列表
        const amenitiesArray = facilitiesToFilter.split(',');
        if (amenitiesArray.length > 0 && amenitiesArray[0] !== '') {
          query.amenities = { $all: amenitiesArray };
        }
      }
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
        } else if (field === 'distance') {
            // 按距离排序，需要基准点
            // 这个排序会在$geoNear阶段自动处理
            sortOptions = { distance: direction === 'asc' ? 1 : -1 };
        }
    }
    
    // 检查是否需要按推荐排序
    if (!sortParam) {
        // 推荐排序：按用户平均评分降序，没有评分的按星级降序，然后按创建时间降序
        sortOptions = { 
            averageRating: -1, 
            starRating: -1, 
            createdAt: -1 
        };
    }

    // 获取基准点坐标
    console.log('Params for getBasePoint:', { city, keyword, latitude, longitude });
    const basePoint = getBasePoint(city, keyword, latitude, longitude);
    console.log('BasePoint result:', basePoint);
    
    // 如果地理空间查询没有返回结果，或者用户没有明确要求按距离排序，使用常规查询
    const isDistanceSort = sortParam && sortParam.startsWith('distance');
    
    // 执行查询（根据是否有基准点选择不同的查询方式）
    let hotels;
    let geoNearResult = [];
    
    if (basePoint) {
      // 使用MongoDB地理空间查询进行距离排序
      try {
        // 构建地理空间查询管道
        const geoNearPipeline = [
          {
            $geoNear: {
              near: {
                type: 'Point',
                coordinates: basePoint
              },
              distanceField: 'distance',
              spherical: true,
              distanceMultiplier: 0.001,  // 转换为千米
              query: query  // 将查询条件移到$geoNear内部
            }
          }
        ];
        
        // 修复推荐排序：在聚合管道中处理排序逻辑
        if (!sortParam) {
          // 添加排序优先级字段，确保有评分的排在前面
          geoNearPipeline.push({
            $addFields: {
              hasRating: { $cond: { if: { $ne: ["$averageRating", null] }, then: 1, else: 0 } }
            }
          });
          // 推荐排序：按是否有评分、评分降序、星级降序、创建时间降序
          geoNearPipeline.push({
            $sort: { hasRating: -1, averageRating: -1, starRating: -1, createdAt: -1 }
          });
        } else if (isDistanceSort) {
          // 按距离排序
          geoNearPipeline.push({ $sort: { distance: 1 } });
        } else {
          // 其他排序方式
          geoNearPipeline.push({ $sort: sortOptions });
        }
        
        // 添加分页和投影
        geoNearPipeline.push(
          { $skip: skip },
          { $limit: parseInt(limit) },
          { $project: {
              _id: 1,
              name: 1,
              name_en: 1,
              address: 1,
              starRating: 1,
              roomTypes: 1,
              price: 1,
              openingTime: 1,
              description: 1,
              amenities: 1,
              images: 1,
              averageRating: 1,
              ratingCount: 1,
              location: 1,
              distance: 1
              // 不再排除hasRating字段，因为只需要包含需要的字段
            }
          }
        );
        
        // 执行聚合查询
        geoNearResult = await Hotel.aggregate(geoNearPipeline);
      } catch (error) {
        console.error('GeoNear aggregation error:', error);
      }
    }
    
    if (geoNearResult.length > 0) {
      // 有基准点且地理空间查询成功，使用查询结果
      hotels = geoNearResult;
      
      // 如果不是按距离排序，根据用户选择的排序方式重新排序
      if (!isDistanceSort) {
        // 对地理空间查询结果进行排序
        hotels.sort((a, b) => {
          // 推荐排序（没有指定排序参数）
          if (!sortParam) {
            // 1. 首先按是否有评分排序（有评分的排在前面）
            const hasRatingA = a.averageRating !== null ? 1 : 0;
            const hasRatingB = b.averageRating !== null ? 1 : 0;
            if (hasRatingA !== hasRatingB) {
              return hasRatingB - hasRatingA;
            }
            
            // 2. 按平均评分降序
            // 确保评分是数字类型进行比较
            const ratingA = parseFloat(a.averageRating) || -1;
            const ratingB = parseFloat(b.averageRating) || -1;
            if (ratingA !== ratingB) {
              return ratingB - ratingA; // 降序
            }
            
            // 3. 按星级降序
            const starA = a.starRating || -1;
            const starB = b.starRating || -1;
            if (starA !== starB) {
              return starB - starA; // 降序
            }
            
            // 4. 按创建时间降序
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            if (dateA.getTime() !== dateB.getTime()) {
              return dateB - dateA; // 降序
            }
            
            // 5. 最后按距离排序
            return (a.distance || 9999) - (b.distance || 9999);
          } 
          // 按平均评分排序
          else if (sortOptions.averageRating) {
            // 确保评分是数字类型进行比较
            const ratingA = parseFloat(a.averageRating) || -1;
            const ratingB = parseFloat(b.averageRating) || -1;
            if (ratingA !== ratingB) {
              return ratingB - ratingA; // 降序
            }
          }
          
          // 按星级降序
          if (sortOptions.starRating) {
            const starA = a.starRating || -1;
            const starB = b.starRating || -1;
            if (starA !== starB) {
              return starB - starA; // 降序
            }
          }
          
          // 按创建时间降序
          if (sortOptions.createdAt) {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA; // 降序
          }
          
          // 按价格排序
          if (sortOptions.price) {
            const priceA = a.price || 0;
            const priceB = b.price || 0;
            return sortOptions.price > 0 ? priceA - priceB : priceB - priceA;
          }
          
          // 默认按距离排序
          return (a.distance || 9999) - (b.distance || 9999);
        });
      }
    } else {
      // 没有基准点或地理空间查询没有结果，使用常规查询和排序
      if (!sortParam) {
        // 推荐排序：按是否有评分、评分降序、星级降序、创建时间降序
        hotels = await Hotel.find(query)
          .select('-createdBy -status -rejectReason')
          // 使用Mongoose的排序功能，将null值排在后面
          .sort({ averageRating: -1, starRating: -1, createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));
        
        // 手动调整排序，确保有评分的排在前面
        hotels.sort((a, b) => {
          // 首先按是否有评分排序
          const hasRatingA = a.averageRating !== null ? 1 : 0;
          const hasRatingB = b.averageRating !== null ? 1 : 0;
          if (hasRatingA !== hasRatingB) {
            return hasRatingB - hasRatingA;
          }
          
          // 然后按平均评分降序
          // 确保评分是数字类型进行比较
          const ratingA = parseFloat(a.averageRating) || -1;
          const ratingB = parseFloat(b.averageRating) || -1;
          if (ratingA !== ratingB) {
            return ratingB - ratingA;
          }
          
          // 然后按星级降序
          const starA = a.starRating || -1;
          const starB = b.starRating || -1;
          if (starA !== starB) {
            return starB - starA;
          }
          
          // 最后按创建时间降序
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        });
      } else {
        // 其他排序方式
        hotels = await Hotel.find(query)
          .select('-createdBy -status -rejectReason')
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit));
      }
      
      // 如果需要，添加距离信息
      if (basePoint && hotels.length > 0) {
        hotels.forEach(hotel => {
          // 检查酒店是否有有效坐标
          if (hotel.location && hotel.location.coordinates && 
              hotel.location.coordinates[0] !== 0 && hotel.location.coordinates[1] !== 0) {
            // 计算酒店到基准点的距离
            const distance = calculateDistance(
              basePoint[1], basePoint[0],  // 基准点 [longitude, latitude]
              hotel.location.coordinates[1], hotel.location.coordinates[0]  // 酒店坐标 [longitude, latitude]
            );
            hotel.distance = distance;
          } else {
            // 无效坐标，距离设为一个很大的值
            hotel.distance = 9999;
          }
        });
        
        // 如果是按距离排序，手动按距离排序
        if (isDistanceSort) {
          hotels.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
        }
      }

    }

    // 检查房间可用性（如果提供了入住和退宿时间）
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
        // 过滤出有可用房间的酒店，并为每个酒店只保留可用的房型
        hotels = hotels.map(hotel => {
          // 将 Mongoose 文档转换为普通对象，确保可以修改
          let hotelObj = hotel.toObject ? hotel.toObject() : hotel;
          
          // 过滤出酒店的可用房型
          const availableRoomTypes = hotelObj.roomTypes.filter(roomType => {
            // 如果房间未被占用或占用时间与查询时间不冲突，则可用
            if (!roomType.occupied) {
              return true;
            }
            
            const occupiedCheckIn = new Date(roomType.occupied.checkInDate);
            const occupiedCheckOut = new Date(roomType.occupied.checkOutDate);
            
            // 检查时间冲突
            // 冲突条件：如果查询时间段与占用时间段有任何重叠，则视为冲突
            // 使用包含边界的比较，确保完全重叠的时间段也能被正确检测
            const hasConflict = !(checkOut <= occupiedCheckIn || checkIn >= occupiedCheckOut);
            
            return !hasConflict;
          });
          
          // 更新酒店的房型列表，只保留可用的房型
          hotelObj.roomTypes = availableRoomTypes;
          return hotelObj;
        }).filter(hotel => hotel.roomTypes.length > 0); // 只保留有可用房型的酒店
      }
    }

    const total = await Hotel.countDocuments(query);

    // 将酒店对象转换为普通JavaScript对象并添加字段映射
    const hotelsWithMapping = hotels.map(hotel => {
      const hotelObj = hotel.toObject ? hotel.toObject() : hotel;
      
      // 为了向后兼容，添加rating和reviewCount字段映射
      hotelObj.rating = hotelObj.averageRating;
      hotelObj.reviewCount = hotelObj.ratingCount;
      
      return hotelObj;
    });

    res.json({
      hotels: hotelsWithMapping,
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
    const { city, latitude, longitude, checkInDate, checkOutDate } = req.query;
    
    // 查询所有已发布的酒店
    const hotels = await Hotel.find({ status: 'published' })
      .select('-createdBy -status -rejectReason')
      .sort({ createdAt: -1 });
    
    // 随机排序
    const shuffled = hotels.sort(() => 0.5 - Math.random());
    // 选择前N个
    let featured = shuffled.slice(0, limit);
    
    // 如果有城市或经纬度参数，计算距离
    const basePoint = getBasePoint(city, null, latitude, longitude);
    if (basePoint) {
      // 为每个酒店计算距离
      featured = featured.map(hotel => {
        const hotelObj = hotel.toObject();
        if (hotelObj.location && hotelObj.location.coordinates && 
            hotelObj.location.coordinates[0] !== 0 && hotelObj.location.coordinates[1] !== 0) {
          const distance = calculateDistance(
            basePoint[1], basePoint[0],  // 基准点 [latitude, longitude]
            hotelObj.location.coordinates[1], hotelObj.location.coordinates[0]  // 酒店坐标 [latitude, longitude]
          );
          hotelObj.distance = distance;
        } else {
          hotelObj.distance = 9999;
        }
        return hotelObj;
      });
    } else {
      // 没有基准点，将酒店转换为普通对象
      featured = featured.map(hotel => hotel.toObject());
    }
    
    // 检查房间可用性（如果提供了入住和退宿时间）
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
        // 过滤出有可用房间的酒店，并为每个酒店只保留可用的房型
        featured = featured.map(hotel => {
          // 过滤出酒店的可用房型
          const availableRoomTypes = hotel.roomTypes.filter(roomType => {
            // 如果房间未被占用或占用时间与查询时间不冲突，则可用
            if (!roomType.occupied) {
              return true;
            }
            
            const occupiedCheckIn = new Date(roomType.occupied.checkInDate);
            const occupiedCheckOut = new Date(roomType.occupied.checkOutDate);
            
            // 检查时间冲突
            // 冲突条件：如果查询时间段与占用时间段有任何重叠，则视为冲突
            // 使用包含边界的比较，确保完全重叠的时间段也能被正确检测
            const hasConflict = !(checkOut <= occupiedCheckIn || checkIn >= occupiedCheckOut);
            
            return !hasConflict;
          });
          
          // 更新酒店的房型列表，只保留可用的房型
          hotel.roomTypes = availableRoomTypes;
          return hotel;
        }).filter(hotel => hotel.roomTypes.length > 0); // 只保留有可用房型的酒店
      }
    }
    
    res.json({ hotels: featured });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMobileHotelById = async (req, res) => {
  try {
    // 查询条件与getMobileHotels函数保持一致，支持approved和published状态
    const hotel = await Hotel.findOne({
      _id: req.params.id,
      status: { $in: ['approved', 'published'] }
    }).select('-createdBy -status -rejectReason');

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // 将酒店对象转换为普通JavaScript对象
    const hotelObj = hotel.toObject();
    
    // 为了向后兼容，添加rating和reviewCount字段映射
    hotelObj.rating = hotelObj.averageRating;
    hotelObj.reviewCount = hotelObj.ratingCount;

    // 如果有城市或经纬度参数，计算距离
    const { city, latitude, longitude, checkInDate, checkOutDate } = req.query;
    const basePoint = getBasePoint(city, null, latitude, longitude);
    if (basePoint && hotelObj.location && hotelObj.location.coordinates && 
        hotelObj.location.coordinates[0] !== 0 && hotelObj.location.coordinates[1] !== 0) {
      const distance = calculateDistance(
        basePoint[1], basePoint[0],  // 基准点 [longitude, latitude]
        hotelObj.location.coordinates[1], hotelObj.location.coordinates[0]  // 酒店坐标 [longitude, latitude]
      );
      hotelObj.distance = distance;
    }

    // 检查房间可用性（如果提供了入住和退宿时间）
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
        // 过滤出酒店的可用房型
        const availableRoomTypes = hotelObj.roomTypes.filter(roomType => {
          // 如果房间未被占用或占用时间与查询时间不冲突，则可用
          if (!roomType.occupied) {
            return true;
          }
          
          const occupiedCheckIn = new Date(roomType.occupied.checkInDate);
          const occupiedCheckOut = new Date(roomType.occupied.checkOutDate);
          
          // 检查时间冲突
          // 冲突条件：如果查询时间段与占用时间段有任何重叠，则视为冲突
          // 使用包含边界的比较，确保完全重叠的时间段也能被正确检测
          const hasConflict = !(checkOut <= occupiedCheckIn || checkIn >= occupiedCheckOut);
          
          return !hasConflict;
        });
        
        // 更新酒店的房型列表，只保留可用的房型
        hotelObj.roomTypes = availableRoomTypes;
      }
    }

    res.json({ hotel: hotelObj });
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