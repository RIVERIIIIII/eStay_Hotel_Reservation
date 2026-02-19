import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { hotelAPI } from '../../services/api';

const HotelListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchParams, setSearchParams] = useState({
    location: location.state?.location || '当前位置',
    keyword: location.state?.keyword || '',
    checkInDate: location.state?.checkInDate ? new Date(location.state.checkInDate) : new Date(),
    checkOutDate: location.state?.checkOutDate ? new Date(location.state.checkOutDate) : new Date(Date.now() + 86400000),
    priceRange: [0, 5000],
    starRating: [],
    amenities: []
  });
  const [showFilter, setShowFilter] = useState(false);



  // 模拟星级选项
  const starOptions = [5, 4, 3, 2, 1];

  // 模拟设施选项
  const amenityOptions = [
    { id: 'wifi', name: '免费WiFi' },
    { id: 'parking', name: '停车场' },
    { id: 'gym', name: '健身房' },
    { id: 'pool', name: '游泳池' },
    { id: 'breakfast', name: '早餐' },
    { id: 'conference', name: '会议室' },
    { id: 'spa', name: 'SPA' },
    { id: 'child', name: '儿童设施' }
  ];

  // 加载酒店数据
  useEffect(() => {
    loadHotels();
  }, [page, searchParams]);

  // 加载酒店数据
  const loadHotels = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      // 构建API请求参数
      const params = {
        page,
        limit: 3, // 每页3条数据
        location: searchParams.location,
        keyword: searchParams.keyword,
        checkInDate: searchParams.checkInDate ? searchParams.checkInDate.toISOString().split('T')[0] : undefined,
        checkOutDate: searchParams.checkOutDate ? searchParams.checkOutDate.toISOString().split('T')[0] : undefined,
        minPrice: searchParams.priceRange[0],
        maxPrice: searchParams.priceRange[1],
        starRating: searchParams.starRating.length > 0 ? searchParams.starRating : undefined,
        amenities: searchParams.amenities.length > 0 ? searchParams.amenities : undefined
      };

      // 调用真实的API获取酒店列表
      const response = await hotelAPI.getAll(params);
      // 处理后端返回的数据结构 { hotels: [...], pagination: { pages: ... } }
      const { hotels, pagination } = response.data;

      setHotels(prevHotels => [...prevHotels, ...hotels]);
      setHasMore(page < pagination.pages);
    } catch (error) {
      console.error('加载酒店列表失败:', error);
      // 可以添加错误提示或回退到模拟数据
      alert('加载酒店列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理上滑加载
  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  // 处理酒店点击
  const handleHotelClick = (hotelId) => {
    navigate(`/mobile/hotels/${hotelId}`);
  };

  // 处理筛选重置
  const handleResetFilter = () => {
    setSearchParams({
      ...searchParams,
      priceRange: [0, 5000],
      starRating: [],
      amenities: []
    });
    setHotels([]);
    setPage(1);
    setHasMore(true);
  };

  // 处理筛选应用
  const handleApplyFilter = () => {
    setShowFilter(false);
    setHotels([]);
    setPage(1);
    setHasMore(true);
  };

  // 处理星级选择
  const handleStarSelect = (star) => {
    setSearchParams(prev => ({
      ...prev,
      starRating: prev.starRating.includes(star)
        ? prev.starRating.filter(s => s !== star)
        : [...prev.starRating, star]
    }));
  };

  // 处理设施选择
  const handleAmenitySelect = (amenityId) => {
    setSearchParams(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  return (
    <div className="mobile-list-page" onScroll={handleScroll}>
      {/* 顶部导航栏 */}
      <div className="mobile-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>酒店列表</h1>
        <button className="filter-button" onClick={() => setShowFilter(!showFilter)}>
          筛选
        </button>
      </div>

      {/* 顶部核心条件筛选 */}
      <div className="top-filter-bar">
        <div className="filter-item">
          <span className="filter-label">📍</span>
          <span className="filter-value">{searchParams.location}</span>
        </div>
        <div className="filter-item">
          <span className="filter-label">📅</span>
          <div className="date-pickers">
            <DatePicker
              selected={searchParams.checkInDate}
              onChange={(date) => setSearchParams({...searchParams, checkInDate: date})}
              selectsStart
              startDate={searchParams.checkInDate}
              endDate={searchParams.checkOutDate}
              placeholderText="入住"
              className="date-picker"
            />
            <span className="date-separator">至</span>
            <DatePicker
              selected={searchParams.checkOutDate}
              onChange={(date) => setSearchParams({...searchParams, checkOutDate: date})}
              selectsEnd
              startDate={searchParams.checkInDate}
              endDate={searchParams.checkOutDate}
              minDate={searchParams.checkInDate}
              placeholderText="离店"
              className="date-picker"
            />
          </div>
        </div>
        <div className="filter-item search-button">
          <span>🔍 搜索</span>
        </div>
      </div>

      {/* 详细筛选区域 */}
      {showFilter && (
        <div className="filter-panel">
          <div className="filter-section">
            <h3>价格范围</h3>
            <div className="price-range">
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={searchParams.priceRange[1]}
                onChange={(e) => setSearchParams({
                  ...searchParams,
                  priceRange: [0, parseInt(e.target.value)]
                })}
              />
              <span className="price-value">¥{searchParams.priceRange[1]}以下</span>
            </div>
          </div>

          <div className="filter-section">
            <h3>酒店星级</h3>
            <div className="star-options">
              {starOptions.map(star => (
                <button
                  key={star}
                  className={`star-option ${searchParams.starRating.includes(star) ? 'selected' : ''}`}
                  onClick={() => handleStarSelect(star)}
                >
                  {'⭐'.repeat(star)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>酒店设施</h3>
            <div className="amenity-options">
              {amenityOptions.map(amenity => (
                <button
                  key={amenity.id}
                  className={`amenity-option ${searchParams.amenities.includes(amenity.id) ? 'selected' : ''}`}
                  onClick={() => handleAmenitySelect(amenity.id)}
                >
                  {amenity.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-actions">
            <button className="reset-button" onClick={handleResetFilter}>
              重置
            </button>
            <button className="apply-button" onClick={handleApplyFilter}>
              应用
            </button>
          </div>
        </div>
      )}

      {/* 酒店列表 */}
      <div className="hotel-list">
        {hotels.map(hotel => (
          <div
            key={hotel._id}
            className="hotel-card"
            onClick={() => handleHotelClick(hotel._id)}
          >
            <div className="hotel-image-container">
              <img src={hotel.images && hotel.images[0] ? hotel.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'} alt={hotel.name} className="hotel-image" />
              <div className="hotel-price">
                <span className="price-symbol">¥</span>
                <span className="price-value">{hotel.price}</span>
                <span className="price-unit">起/晚</span>
              </div>
            </div>
            <div className="hotel-info">
              <div className="hotel-header">
                <h3 className="hotel-name">{hotel.name}</h3>
                <div className="hotel-rating">
                  <span className="rating-value">{hotel.rating || '暂无评分'}</span>
                  <span className="rating-count">({hotel.reviewCount || 0}条点评)</span>
                </div>
              </div>
              <div className="hotel-address">
                <span className="address-icon">📍</span>
                <span className="address-text">{hotel.address}</span>
              </div>
              <div className="hotel-amenities">
                {hotel.amenities && hotel.amenities.slice(0, 3).map((amenity, index) => (
                  <span key={index} className="amenity-tag">
                    {amenity}
                  </span>
                ))}
                {hotel.amenities && hotel.amenities.length > 3 && (
                  <span className="amenity-more">+{hotel.amenities.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 加载更多 */}
        {loading && (
          <div className="loading-more">
            <span>加载中...</span>
          </div>
        )}

        {!hasMore && hotels.length > 0 && (
          <div className="no-more">
            <span>没有更多酒店了</span>
          </div>
        )}

        {!loading && hotels.length === 0 && (
          <div className="no-results">
            <span>暂无符合条件的酒店</span>
          </div>
        )}
      </div>

      {/* 移动端样式 */}
      <style jsx>{`
        .mobile-list-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f5f5f5;
          min-height: 100vh;
          overflow-y: auto;
        }

        .mobile-header {
          background-color: #1e88e5;
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .back-button {
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
        }

        .filter-button {
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
        }

        .top-filter-bar {
          background-color: white;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .filter-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background-color: #f0f0f0;
          border-radius: 16px;
          white-space: nowrap;
        }

        .filter-label {
          margin-right: 5px;
          font-size: 14px;
        }

        .filter-value {
          font-size: 14px;
        }

        .date-separator {
          margin: 0 5px;
          color: #999;
        }

        .date-pickers {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .date-picker {
          padding: 6px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
          background-color: white;
        }

        .filter-item.search-button {
          background-color: #1e88e5;
          color: white;
          font-weight: 600;
        }

        .filter-panel {
          background-color: white;
          margin: 10px;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .filter-section {
          margin-bottom: 20px;
        }

        .filter-section h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 600;
        }

        .price-range {
          padding: 10px 0;
        }

        .price-range input {
          width: 100%;
          margin-bottom: 10px;
        }

        .price-value {
          font-size: 14px;
          color: #1e88e5;
        }

        .star-options {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .star-option {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          background-color: white;
          font-size: 12px;
          cursor: pointer;
        }

        .star-option.selected {
          background-color: #e3f2fd;
          border-color: #1e88e5;
        }

        .amenity-options {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .amenity-option {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          background-color: white;
          font-size: 12px;
          cursor: pointer;
        }

        .amenity-option.selected {
          background-color: #e3f2fd;
          border-color: #1e88e5;
        }

        .filter-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .reset-button {
          flex: 1;
          padding: 10px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background-color: white;
          font-size: 14px;
          cursor: pointer;
        }

        .apply-button {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 4px;
          background-color: #1e88e5;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .hotel-list {
          padding: 10px;
        }

        .hotel-card {
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
        }

        .hotel-image-container {
          position: relative;
          height: 180px;
        }

        .hotel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hotel-price {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background-color: rgba(0,0,0,0.7);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
        }

        .price-symbol {
          font-size: 12px;
        }

        .price-value {
          font-size: 18px;
          font-weight: 600;
        }

        .price-unit {
          font-size: 12px;
          margin-left: 2px;
        }

        .hotel-info {
          padding: 12px;
        }

        .hotel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .hotel-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          flex: 1;
        }

        .hotel-rating {
          display: flex;
          align-items: center;
        }

        .rating-value {
          background-color: #ff9800;
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          margin-right: 5px;
        }

        .rating-count {
          font-size: 12px;
          color: #999;
        }

        .hotel-address {
          display: flex;
          align-items: flex-start;
          margin-bottom: 8px;
          font-size: 13px;
          color: #666;
        }

        .address-icon {
          font-size: 12px;
          margin-right: 5px;
          margin-top: 1px;
        }

        .address-text {
          flex: 1;
          line-height: 1.3;
        }

        .hotel-amenities {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .amenity-tag {
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

        .loading-more {
          text-align: center;
          padding: 20px;
          color: #999;
          font-size: 14px;
        }

        .no-more {
          text-align: center;
          padding: 20px;
          color: #999;
          font-size: 14px;
        }

        .no-results {
          text-align: center;
          padding: 40px 20px;
          color: #999;
          font-size: 14px;
        }

        /* 响应式样式 */
        @media (max-width: 480px) {
          .hotel-image-container {
            height: 150px;
          }

          .hotel-name {
            font-size: 15px;
          }

          .top-filter-bar {
            padding: 10px;
          }

          .filter-item {
            padding: 6px 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default HotelListPage;