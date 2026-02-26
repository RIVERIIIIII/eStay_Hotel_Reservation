import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';

const HotelManagement = () => {
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await adminService.getHotels();
      setHotels(response || []);
    } catch (err) {
      setError('获取酒店列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await adminService.publishHotel(id);
      fetchHotels();
    } catch (err) {
      setError('发布酒店失败');
      console.error(err);
    }
  };

  const handleOffline = async (id) => {
    try {
      await adminService.offlineHotel(id);
      fetchHotels();
    } catch (err) {
      setError('下线酒店失败');
      console.error(err);
    }
  };

  return (
    <div className="hotel-management-container">
      <div className="hotel-management-header">
        <h2>管理酒店</h2>
      </div>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div>加载中...</div>
      ) : (
        <div className="hotel-management-list">
          {hotels.length === 0 ? (
            <div className="empty-hotel-list">
              <div className="empty-state-content">
                <div className="empty-state-icon">🏨</div>
                <h3>暂无酒店</h3>
                <p>商户还未创建任何酒店</p>
              </div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>名称</th>
                  <th>地址</th>
                  <th>位置（经纬度）</th>
                  <th>星级</th>
                  <th>价格</th>
                  <th>状态</th>
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
                    <td>¥{hotel.price}/晚</td>
                    <td>
                      <span className={`status-${hotel.status}`}>
                        {getStatusText(hotel.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {hotel.status === 'approved' && (
                          <button
                            onClick={() => handlePublish(hotel._id)}
                            className="publish-btn"
                          >
                            发布
                          </button>
                        )}
                        {hotel.status === 'published' && (
                          <button
                            onClick={() => handleOffline(hotel._id)}
                            className="offline-btn"
                          >
                            下线
                          </button>
                        )}
                        {hotel.status === 'offline' && (
                          <button
                            onClick={() => handlePublish(hotel._id)}
                            className="publish-btn"
                          >
                            发布
                          </button>
                        )}
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

export default HotelManagement;