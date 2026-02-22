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
    description: String
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
    enum: ['pending', 'approved', 'rejected'],
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

// 添加索引以提高查询性能
hotelSchema.index({ createdBy: 1, createdAt: -1 });
hotelSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Hotel', hotelSchema);