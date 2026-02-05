import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hotelAPI } from '../services/api';

const HotelListPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelAPI.getAll();
      setHotels(response.data.hotels);
    } catch (error) {
      setError('获取酒店列表失败');
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hotelId, hotelName) => {
    if (!window.confirm(`确定要删除酒店 "${hotelName}" 吗？此操作不可撤销。`)) {
      return;
    }

    try {
      await hotelAPI.delete(hotelId);
      fetchHotels(); // 刷新列表
    } catch (error) {
      setError('删除酒店失败');
      console.error('Error deleting hotel:', error);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: { text: '审核中', color: '#ffc107' },
      approved: { text: '已通过', color: '#28a745' },
      rejected: { text: '已拒绝', color: '#dc3545' }
    };
    return statusMap[status] || { text: '未知', color: '#6c757d' };
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '200px' }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-3">
        <h1>我的酒店</h1>
        <Link to="/hotels/add" className="btn btn-primary">
          添加新酒店
        </Link>
      </div>

      {error && (
        <div className="text-error mb-2">{error}</div>
      )}

      {hotels.length === 0 ? (
        <div className="card text-center">
          <p>您还没有添加任何酒店</p>
          <Link to="/hotels/add" className="btn btn-primary mt-2">
            添加第一个酒店
          </Link>
        </div>
      ) : (
        <div>
          {hotels.map((hotel) => {
            const statusInfo = getStatusText(hotel.status);
            return (
              <div key={hotel._id} className="card mb-2">
                <div className="flex-between">
                  <div style={{ flex: 1 }}>
                    <div className="flex" style={{ alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>{hotel.name}</h3>
                        <p style={{ color: '#6c757d', marginBottom: '0.5rem' }}>
                          {hotel.name_en}
                        </p>
                        <p style={{ marginBottom: '0.5rem' }}>
                          <strong>地址:</strong> {hotel.address}
                        </p>
                        <p style={{ marginBottom: '0.5rem' }}>
                          <strong>星级:</strong> {'⭐'.repeat(hotel.starRating)}
                        </p>
                        <p style={{ marginBottom: '0.5rem' }}>
                          <strong>起价:</strong> ¥{hotel.price}
                        </p>
                        <div>
                          <span 
                            style={{ 
                              backgroundColor: statusInfo.color,
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.875rem'
                            }}
                          >
                            {statusInfo.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <Link 
                      to={`/hotels/edit/${hotel._id}`}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(hotel._id, hotel.name)}
                      className="btn btn-danger"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HotelListPage;