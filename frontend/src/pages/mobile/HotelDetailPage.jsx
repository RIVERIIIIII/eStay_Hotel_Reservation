import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hotelAPI } from '../../services/api';

const HotelDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [selectedRoom, setSelectedRoom] = useState(null);



  // 加载酒店详情
  useEffect(() => {
    loadHotelDetail();
  }, [id]);

  // 加载酒店详情
  const loadHotelDetail = async () => {
    setLoading(true);

    try {
      // 调用真实的API获取酒店详情
      const response = await hotelAPI.getById(id);
      // 假设API返回的数据结构为 { hotel: {...} }
      const hotelData = response.data.hotel;
      
      // 如果需要，转换数据结构以匹配前端组件的期望
      setHotel(hotelData);
    } catch (error) {
      console.error('加载酒店详情失败:', error);
      // 可以添加错误提示或回退到模拟数据
      alert('加载酒店详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理日期选择
  const handleDateChange = (type, value) => {
    if (type === 'checkIn') {
      setCheckInDate(value);
    } else {
      setCheckOutDate(value);
    }
  };

  // 处理人数调整
  const handleGuestsChange = (action) => {
    if (action === 'increase') {
      setGuests(prev => prev + 1);
    } else if (action === 'decrease' && guests > 1) {
      setGuests(prev => prev - 1);
    }
  };

  // 处理预订
  const handleBook = (roomType) => {
    setSelectedRoom(roomType);
    // 这里可以跳转到预订确认页面或直接调用预订API
    alert(`预订 ${roomType.type}，价格：¥${roomType.price}/晚`);
  };

  // 计算入住天数
  const getStayDays = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="mobile-detail-page loading">
        <div className="loading-spinner">加载中...</div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="mobile-detail-page error">
        <div className="error-message">酒店信息加载失败</div>
      </div>
    );
  }

  return (
    <div className="mobile-detail-page">
      {/* 顶部导航栏 */}
      <div className="mobile-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>{hotel.name}</h1>
        <button className="share-button">
          📤
        </button>
      </div>

      {/* 大图Banner */}
      <div className="image-gallery">
        <div className="image-container">
          {(hotel.images && hotel.images.length > 0) ? (
            hotel.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${hotel.name} 图片 ${index + 1}`}
                className="gallery-image"
              />
            ))
          ) : (
            <img
              src="https://via.placeholder.com/800x400?text=No+Image"
              alt={`${hotel.name}`}
              className="gallery-image"
            />
          )}
        </div>
        <div className="image-indicators">
          {(hotel.images && hotel.images.length > 0) ? (
            hotel.images.map((_, index) => (
              <span
                key={index}
                className={`indicator ${index === 0 ? 'active' : ''}`}
              ></span>
            ))
          ) : (
            <span className="indicator active"></span>
          )}
        </div>
      </div>

      {/* 酒店基础信息 */}
      <div className="hotel-info">
        <div className="hotel-name-section">
          <h2>{hotel.name}</h2>
          <div className="rating-section">
            <span className="rating-value">{hotel.rating}</span>
            <span className="review-count">{hotel.reviewCount}条点评</span>
          </div>
        </div>

        <div className="address-section">
          <span className="address-icon">📍</span>
          <span className="address-text">{hotel.address}</span>
        </div>

        <div className="description-section">
          <p>{hotel.description}</p>
        </div>

        <div className="amenities-section">
          <h3>酒店设施</h3>
          <div className="amenities-list">
            {hotel.amenities.map((amenity, index) => (
              <span key={index} className="amenity-tag">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 日历+人间Banner */}
      <div className="date-guest-banner">
        <div className="date-section">
          <div className="date-item">
            <label>入住</label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => handleDateChange('checkIn', e.target.value)}
            />
          </div>
          <div className="date-item">
            <label>离店</label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => handleDateChange('checkOut', e.target.value)}
            />
          </div>
        </div>
        <div className="guest-section">
          <label>人数</label>
          <div className="guest-controls">
            <button
              className="guest-button"
              onClick={() => handleGuestsChange('decrease')}
            >
              -
            </button>
            <span className="guest-count">{guests}</span>
            <button
              className="guest-button"
              onClick={() => handleGuestsChange('increase')}
            >
              +
            </button>
          </div>
        </div>
        {checkInDate && checkOutDate && (
          <div className="stay-info">
            <span>入住{getStayDays()}晚</span>
          </div>
        )}
      </div>

      {/* 酒店当前房型价格列表 */}
      <div className="room-list">
        <h3>房型列表</h3>
        {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
          hotel.roomTypes.map((roomType, index) => (
            <div key={index} className="room-card">
              <div className="room-image-container">
                <img 
                  src='https://via.placeholder.com/200x150?text=Room+Image' 
                  alt={roomType.type} 
                  className="room-image" 
                />
              </div>
              <div className="room-details">
                <h4>{roomType.type}</h4>
                {roomType.description && (
                  <div className="room-description">
                    {roomType.description}
                  </div>
                )}
                <div className="room-price-section">
                  <div className="price-info">
                    <span className="price-symbol">¥</span>
                    <span className="price-value">{roomType.price}</span>
                    <span className="price-unit">/晚</span>
                  </div>
                  <button
                    className="book-button"
                    onClick={() => handleBook(roomType)}
                  >
                    立即预订
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-rooms">暂无房型信息</div>
        )}
      </div>

      {/* 底部预订栏 */}
      {selectedRoom && (
        <div className="bottom-book-bar">
          <div className="bottom-info">
            <div className="bottom-room-type">{selectedRoom.type}</div>
            <div className="bottom-price">
              <span className="price-symbol">¥</span>
              <span className="price-value">{selectedRoom.price}</span>
              <span className="price-unit">/晚</span>
            </div>
          </div>
          <button className="bottom-book-button">
            确认预订
          </button>
        </div>
      )}

      {/* 移动端样式 */}
      <style jsx>{`
        .mobile-detail-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f5f5f5;
          min-height: 100vh;
        }

        .loading, .error {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }

        .loading-spinner, .error-message {
          font-size: 16px;
          color: #666;
        }

        .mobile-header {
          background-color: #1e88e5;
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .back-button, .share-button {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
        }

        .mobile-header h1 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          flex: 1;
          text-align: center;
        }

        .image-gallery {
          position: relative;
          height: 250px;
        }

        .image-container {
          height: 100%;
          overflow: hidden;
        }

        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-indicators {
          position: absolute;
          bottom: 10px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 5px;
        }

        .indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.5);
        }

        .indicator.active {
          background-color: white;
          width: 18px;
          border-radius: 3px;
        }

        .hotel-info {
          background-color: white;
          margin: 10px;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .hotel-name-section {
          margin-bottom: 12px;
        }

        .hotel-name-section h2 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .rating-value {
          background-color: #ff9800;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .review-count {
          font-size: 12px;
          color: #999;
        }

        .address-section {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          font-size: 14px;
          color: #666;
        }

        .address-icon {
          margin-right: 8px;
          margin-top: 2px;
        }

        .address-text {
          flex: 1;
          line-height: 1.3;
        }

        .description-section {
          margin-bottom: 16px;
        }

        .description-section p {
          margin: 0;
          font-size: 14px;
          line-height: 1.4;
          color: #333;
        }

        .amenities-section {
          margin-bottom: 8px;
        }

        .amenities-section h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 600;
        }

        .amenities-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .amenity-tag {
          padding: 5px 10px;
          background-color: #f0f0f0;
          border-radius: 12px;
          font-size: 12px;
          color: #666;
        }

        .date-guest-banner {
          background-color: white;
          margin: 10px;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .date-section {
          display: flex;
          gap: 10px;
          margin-bottom: 12px;
        }

        .date-item {
          flex: 1;
        }

        .date-item label {
          display: block;
          font-size: 12px;
          color: #999;
          margin-bottom: 5px;
        }

        .date-item input {
          width: 100%;
          padding: 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
        }

        .guest-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .guest-section label {
          font-size: 14px;
          color: #333;
        }

        .guest-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .guest-button {
          width: 28px;
          height: 28px;
          border: 1px solid #e0e0e0;
          border-radius: 50%;
          background-color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .guest-count {
          font-size: 14px;
          font-weight: 600;
        }

        .stay-info {
          text-align: right;
          font-size: 14px;
          color: #1e88e5;
          font-weight: 600;
        }

        .room-list {
          background-color: white;
          margin: 10px;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 80px;
        }

        .room-list h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .room-card {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .room-card:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .room-image-container {
          width: 100px;
          height: 100px;
          border-radius: 4px;
          overflow: hidden;
        }

        .room-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .room-details {
          flex: 1;
        }

        .room-details h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
        }

        .room-specs {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
          font-size: 12px;
          color: #999;
        }

        .room-amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }

        .room-amenity-tag {
          padding: 3px 8px;
          background-color: #f0f0f0;
          border-radius: 10px;
          font-size: 11px;
          color: #666;
        }

        .amenity-more {
          padding: 3px 8px;
          background-color: #f0f0f0;
          border-radius: 10px;
          font-size: 11px;
          color: #666;
        }

        .room-description {
          font-size: 14px;
          color: #666;
          margin: 8px 0;
        }

        .room-price-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .price-info {
          display: flex;
          align-items: baseline;
        }

        .price-symbol {
          font-size: 12px;
          color: #ff4757;
          font-weight: 600;
        }

        .price-value {
          font-size: 18px;
          color: #ff4757;
          font-weight: 600;
        }

        .price-unit {
          font-size: 12px;
          color: #999;
          margin-left: 2px;
        }

        .book-button {
          padding: 8px 16px;
          background-color: #1e88e5;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .bottom-book-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: white;
          padding: 12px 16px;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bottom-info {
          flex: 1;
          margin-right: 16px;
        }

        .bottom-room-type {
          font-size: 14px;
          color: #666;
          margin-bottom: 4px;
        }

        .bottom-price {
          font-size: 18px;
          font-weight: 600;
          color: #e74c3c;
        }

        .bottom-book-button {
          padding: 10px 20px;
          background-color: #1e88e5;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        /* 响应式样式 */
        @media (max-width: 480px) {
          .image-gallery {
            height: 200px;
          }

          .room-image-container {
            width: 80px;
            height: 80px;
          }

          .price-value {
            font-size: 16px;
          }

          .book-button {
            padding: 6px 12px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default HotelDetailPage;