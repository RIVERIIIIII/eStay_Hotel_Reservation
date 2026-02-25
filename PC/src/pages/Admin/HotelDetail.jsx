import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    try {
      console.log('Fetching hotel details for ID:', id);
      // 由于后端没有管理员获取单个酒店详情的API，我们从所有酒店中查找
      const allHotels = await adminService.getHotels();
      console.log('All hotels:', allHotels);
      const foundHotel = allHotels.find(hotel => hotel._id === id || hotel.id === id);
      console.log('Found hotel:', foundHotel);
      
      if (!foundHotel) {
        throw new Error('酒店不存在');
      }
      
      setHotel(foundHotel);
    } catch (err) {
      console.error('Error fetching hotel details:', err);
      setError('获取酒店详情失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '待审核',
      'approved': '已通过',
      'rejected': '已拒绝',
      'published': '已发布',
      'offline': '已下线',
    };
    return statusMap[status] || status;
  };

  const getPriceRange = (hotel) => {
    if (!hotel.roomTypes || !Array.isArray(hotel.roomTypes) || hotel.roomTypes.length === 0) {
      return hotel.price ? `${hotel.price}` : '未设置';
    }
    
    const prices = hotel.roomTypes
      .map(rt => parseFloat(rt.price))
      .filter(price => !isNaN(price) && price > 0);
    
    if (prices.length === 0) {
      return '未设置';
    }
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    return minPrice === maxPrice ? `${minPrice}` : `${minPrice}-${maxPrice}`;
  };

  // 内联样式
  const styles = {
    facilityTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '5px',
    },
    facilityTag: {
      padding: '6px 12px',
      backgroundColor: '#2196f3',
      color: '#fff',
      borderRadius: '16px',
      fontSize: '13px',
    },
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!hotel) {
    return <div>酒店不存在</div>;
  }

  return (
    <div className="hotel-detail-container">
      <div className="hotel-detail">
        <div className="hotel-detail-header">
        <h2>酒店详情</h2>
      </div>
        <div className="hotel-detail-content">
          <div className="detail-section">
            <h3>基本信息</h3>
            <div className="detail-row">
              <span className="detail-label">酒店名称（中文）：</span>
              <span className="detail-value">{hotel.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">酒店名称（英文）：</span>
              <span className="detail-value">{hotel.name_en}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">地址：</span>
              <span className="detail-value">{hotel.address}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">纬度：</span>
              <span className="detail-value">{hotel.latitude || '未设置'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">经度：</span>
              <span className="detail-value">{hotel.longitude || '未设置'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">星级：</span>
              <span className="detail-value">{hotel.star_rating || hotel.starRating} 星</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">价格：</span>
              <span className="detail-value">¥{getPriceRange(hotel)}/晚</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">开业时间：</span>
              <span className="detail-value">{hotel.opening_time || hotel.openingTime}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">房型：</span>
              <div className="detail-value">
                {hotel.roomTypes && Array.isArray(hotel.roomTypes) && hotel.roomTypes.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {hotel.roomTypes.map((roomType, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>{roomType.type}</span>
                        <span style={{ color: '#2196f3', fontWeight: 'bold' }}>
                          {roomType.price ? `¥${roomType.price}/晚` : '未设置价格'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  '无'
                )}
              </div>
            </div>
            <div className="detail-row">
              <span className="detail-label">设施：</span>
              <div className="detail-value">
                {hotel.facilities ? (
                  <div style={styles.facilityTags}>
                    {typeof hotel.facilities === 'string' 
                      ? hotel.facilities.split('、').map((facility, index) => (
                          <div key={index} style={styles.facilityTag}>
                            {facility}
                          </div>
                        ))
                      : Array.isArray(hotel.facilities) 
                      ? hotel.facilities.map((facility, index) => (
                          <div key={index} style={styles.facilityTag}>
                            {facility}
                          </div>
                        ))
                      : hotel.facilities
                    }
                  </div>
                ) : (
                  '无'
                )}
              </div>
            </div>
          </div>
          <div className="detail-section">
            <h3>描述</h3>
            <div className="detail-description">{hotel.description}</div>
          </div>
          <div className="detail-section">
            <h3>状态</h3>
            <div className="detail-row">
              <span className="detail-label">审核状态：</span>
              <span className={`detail-value status-${hotel.status}`}>
                {getStatusText(hotel.status)}
              </span>
            </div>
          </div>
          {hotel.images && hotel.images.length > 0 && (
            <div className="detail-section">
              <h3>图片</h3>
              <div className="detail-images">
                {hotel.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`酒店图片 ${index + 1}`}
                    className="detail-image"
                  />
                ))}
              </div>
            </div>
          )}
          <div className="hotel-detail-footer">
            <button onClick={() => navigate(-1)} className="back-btn-small">
              返回
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;