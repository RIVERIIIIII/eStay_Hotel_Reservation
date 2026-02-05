import { validationResult } from 'express-validator';
import Hotel from '../models/Hotel.js';

export const getPendingHotels = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const hotels = await Hotel.find({ status: 'pending' })
      .populate('createdBy', 'username role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Hotel.countDocuments({ status: 'pending' });

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

export const approveHotel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        rejectReason: null
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username role');

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json({
      message: 'Hotel approved successfully',
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

export const rejectHotel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason } = req.body;

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        rejectReason: reason
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username role');

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json({
      message: 'Hotel rejected successfully',
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

export const getAllHotels = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const hotels = await Hotel.find(query)
      .populate('createdBy', 'username role')
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