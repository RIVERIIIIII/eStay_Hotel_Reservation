import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hotelAPI } from '../services/api';

const PublicHotelListPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublishedHotels();
  }, []);

  const fetchPublishedHotels = async () => {
    try {
      setLoading(true);
      // 调用API获取所有已发布的酒店
      const response = await hotelAPI.getAll({ published: true });
      setHotels(response.data.hotels);
    } catch (error) {
      setError('获取酒店列表失败');
      console.error('Error fetching published hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '200px' }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="mb-3">
        <h1>酒店列表</h1>
      </div>

      {error && (
        <div className="text-error mb-2">{error}</div>
      )}

      {hotels.length === 0 ? (
        <div className="card text-center">
          <p>暂无已发布的酒店</p>
        </div>
      ) : (
        <div className="row">
          {hotels.map((hotel) => (
            <div key={hotel._id} className="col-md-4 mb-4">
              <div className="card h-100">
                {/* 酒店图片 */}
                {hotel.images && hotel.images.length > 0 && (
                  <div style={{ height: '200px', overflow: 'hidden' }}>
                    <img 
                      src={hotel.images[0]} 
                      alt={hotel.name} 
                      className="card-img-top" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                
                {/* 酒店信息 */}
                <div className="card-body">
                  <h5 className="card-title">{hotel.name}</h5>
                  <p className="card-text" style={{ color: '#6c757d' }}>{hotel.name_en}</p>
                  <p className="card-text">
                    <strong>地址:</strong> {hotel.address}
                  </p>
                  <p className="card-text">
                    <strong>星级:</strong> {'⭐'.repeat(hotel.starRating)}
                  </p>
                  <p className="card-text">
                    <strong>起价:</strong> ¥{hotel.price}
                  </p>
                  
                  {/* 查看详情按钮 */}
                  <Link to={`/public-hotels/${hotel._id}`} className="btn btn-primary">
                    查看详情
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicHotelListPage;