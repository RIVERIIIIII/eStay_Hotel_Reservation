import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';

const HotelReview = () => {
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingHotels();
  }, []);

  const fetchPendingHotels = async () => {
    setLoading(true);
    try {
      const response = await adminService.getPendingHotels();
      setHotels(response || []);
    } catch (err) {
      setError('获取待审核酒店失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveHotel(id);
      fetchPendingHotels();
    } catch (err) {
      setError('审核酒店失败');
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('请输入拒绝原因：');
    if (reason) {
      try {
        await adminService.rejectHotel(id, reason);
        fetchPendingHotels();
      } catch (err) {
        setError('拒绝酒店失败');
        console.error(err);
      }
    }
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

  return (
    <div className="hotel-review-container">
      <div className="hotel-review-header">
        <h2>待审核酒店</h2>
      </div>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div>加载中...</div>
      ) : (
        <div className="hotel-review-list">
          {hotels.length === 0 ? (
            <p>暂无待审核酒店。</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>名称</th>
                  <th>地址</th>
                  <th>位置（经纬度）</th>
                  <th>星级</th>
                  <th>价格</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel) => (
                  <tr key={hotel._id}>
                    <td>
                      <Link to={`/admin/hotels/${hotel._id}`} className="hotel-name-link">
                        {hotel.name}
                      </Link>
                    </td>
                    <td>{hotel.address}</td>
                    <td>
                      {hotel.latitude && hotel.longitude 
                        ? `${hotel.latitude}, ${hotel.longitude}`
                        : '未设置'
                      }
                    </td>
                    <td>{hotel.star_rating || hotel.starRating} 星</td>
                    <td>¥{getPriceRange(hotel)}/晚</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleApprove(hotel._id)}
                          className="approve-btn"
                        >
                          通过
                        </button>
                        <button
                          onClick={() => handleReject(hotel._id)}
                          className="reject-btn"
                        >
                          拒绝
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelReview;