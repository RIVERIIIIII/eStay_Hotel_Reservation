import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  name_en: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  // 酒店地理位置（经纬度）
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  starRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  roomTypes: [{
    type: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: String,
    // 记录当前房间的占用情况
    occupied: {
      type: {
        checkInDate: Date,
        checkOutDate: Date,
        bookingId: mongoose.Schema.Types.ObjectId,
        customerId: mongoose.Schema.Types.ObjectId
      },
      default: null
    }
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  openingTime: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected','published','offline'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    trim: true
  }],
  mainImage: {
    type: String,
    trim: true
  },
  rejectReason: {
    type: String,
    trim: true
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: null
  },
  ratingCount: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// 创建地理空间索引，支持地理位置查询
hotelSchema.index({ location: '2dsphere' });

// 添加索引以提高查询性能
hotelSchema.index({ createdBy: 1, createdAt: -1 });
hotelSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Hotel', hotelSchema);