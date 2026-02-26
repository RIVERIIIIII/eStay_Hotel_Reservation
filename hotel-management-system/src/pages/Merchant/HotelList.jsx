import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import hotelService from '../../services/hotelService';

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await hotelService.getHotels();
      setHotels(response || []);
    } catch (err) {
      setError('获取酒店列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个酒店吗？')) {
      try {
        await hotelService.deleteHotel(id);
        fetchHotels();
      } catch (err) {
        setError('删除酒店失败');
        console.error(err);
      }
    }
  };

  return (
    <div className="hotel-list-container">
      <div className="hotel-list-header">
        <h2>我的酒店</h2>
        <Link to="/merchant/hotels/add" className="add-hotel-btn">
          添加酒店
        </Link>
      </div>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div>加载中...</div>
      ) : (
        <div className="hotel-list">
          {hotels.length === 0 ? (
            <div className="empty-hotel-list">
              <div className="empty-state-content">
                <div className="empty-state-icon">🏨</div>
                <h3>暂无酒店</h3>
                <p>点击"添加酒店"按钮创建您的第一个酒店</p>
                <Link to="/merchant/hotels/add" className="add-hotel-primary-btn">
                  添加酒店
                </Link>
              </div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>名称</th>
                  <th>地址</th>
                  <th>星级</th>
                  <th>价格</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel) => (
                  <tr key={hotel._id}>
                    <td>{hotel.name}</td>
                    <td>{hotel.address}</td>
                    <td>{hotel.star_rating || hotel.starRating} 星</td>
                    <td>¥{getPriceRange(hotel)}/晚</td>
                    <td>
                      <div>
                        <span className={`status-${hotel.status}`}>
                          {getStatusText(hotel.status)}
                        </span>
                        {hotel.status === 'rejected' && (hotel.reject_reason || hotel.rejectReason) && (
                          <div className="reject-reason">
                            原因：{hotel.reject_reason || hotel.rejectReason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/merchant/hotels/edit/${hotel._id}`} className="edit-btn">
                          编辑
                        </Link>
                        <button
                          onClick={() => handleDelete(hotel._id)}
                          className="delete-btn"
                        >
                          删除
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

export default HotelList;