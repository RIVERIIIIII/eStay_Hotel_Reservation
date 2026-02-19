import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelAPI } from '../services/api';

const PublicHotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHotelDetail();
  }, [id]);

  const fetchHotelDetail = async () => {
    try {
      setLoading(true);
      // 调用API获取酒店详情
      const response = await hotelAPI.getById(id);
      const hotelData = response.data.hotel;
      
      // 检查酒店是否已发布
      if (!hotelData.published) {
        setError('该酒店暂未发布');
        return;
      }
      
      setHotel(hotelData);
    } catch (error) {
      setError('获取酒店详情失败');
      console.error('Error fetching hotel detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div>加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button onClick={handleBack} className="btn btn-primary">
          返回
        </button>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          酒店不存在
        </div>
        <button onClick={handleBack} className="btn btn-primary">
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-4">
      {/* 返回按钮 */}
      <button onClick={handleBack} className="btn btn-secondary mb-3">
        返回酒店列表
      </button>

      {/* 酒店信息 */}
      <div className="card mb-4">
        <div className="card-body">
          <h1 className="card-title">{hotel.name}</h1>
          <p className="card-text" style={{ fontSize: '1.2rem', color: '#6c757d' }}>{hotel.name_en}</p>
          <p className="card-text">
            <strong>地址:</strong> {hotel.address}
          </p>
          <p className="card-text">
            <strong>星级:</strong> {'⭐'.repeat(hotel.starRating)}
          </p>
          <p className="card-text">
            <strong>起价:</strong> ¥{hotel.price}
          </p>
          {hotel.description && (
            <div className="mt-4">
              <h4>酒店描述</h4>
              <p>{hotel.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* 酒店图片 */}
      {hotel.images && hotel.images.length > 0 && (
        <div className="mb-4">
          <h3>酒店图片</h3>
          <div className="row">
            {hotel.images.map((image, index) => (
              <div key={index} className="col-md-4 mb-3">
                <img 
                  src={image} 
                  alt={`酒店图片 ${index + 1}`} 
                  className="img-fluid rounded" 
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 酒店设施 */}
      {hotel.amenities && hotel.amenities.length > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <h3>酒店设施</h3>
            <div className="d-flex flex-wrap gap-2 mt-3">
              {hotel.amenities.map((amenity, index) => (
                <span key={index} className="badge badge-secondary" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 房型信息 */}
      {hotel.roomTypes && hotel.roomTypes.length > 0 && (
        <div className="mb-4">
          <h3>房型信息</h3>
          <div className="row">
            {hotel.roomTypes.map((roomType, index) => (
              <div key={index} className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{roomType.type}</h5>
                    <p className="card-text">
                      <strong>价格:</strong> ¥{roomType.price}/晚
                    </p>
                    {roomType.description && (
                      <p className="card-text">{roomType.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicHotelDetailPage;