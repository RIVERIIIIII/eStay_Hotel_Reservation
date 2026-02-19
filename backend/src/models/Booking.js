import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  roomType: {
    type: String,
    required: true
  },
  roomCount: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 添加索引以提高查询性能
bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ hotelId: 1, createdAt: -1 });

// 虚拟属性：计算入住天数
bookingSchema.virtual('days').get(function() {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((this.checkOutDate - this.checkInDate) / millisecondsPerDay);
});

export default mongoose.model('Booking', bookingSchema);