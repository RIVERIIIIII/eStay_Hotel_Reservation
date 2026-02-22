import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { hotelAPI } from '../../services/api';

const HotelSearchPage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('当前位置');
  const [keyword, setKeyword] = useState('');
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedLat, setSelectedLat] = useState(39.9042); // 默认北京坐标
  const [selectedLng, setSelectedLng] = useState(116.4074); // 默认北京坐标
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const mapRef = useRef(null);

  // 模拟热门城市数据
  const hotCities = ['北京', '上海', '广州', '深圳', '杭州', '成都'];

  // 模拟快捷标签数据
  const quickTags = [
    { id: 1, name: '亲子酒店', icon: '👨‍👩‍👧‍👦' },
    { id: 2, name: '豪华酒店', icon: '🏨' },
    { id: 3, name: '免费停车', icon: '🚗' },
    { id: 4, name: '近地铁', icon: '🚇' },
    { id: 5, name: '会议室', icon: '📊' },
    { id: 6, name: '健身房', icon: '💪' },
    { id: 7, name: '游泳池', icon: '🏊' },
    { id: 8, name: '早餐', icon: '🍽️' },
  ];

  // 加载推荐酒店（广告Banner）
  useEffect(() => {
    loadBanners();
  }, []);

  // 加载推荐酒店数据
  const loadBanners = async () => {
    setLoadingBanners(true);
    try {
      // 调用API获取推荐酒店
      const response = await hotelAPI.getFeatured();
      const { hotels: featuredHotels } = response.data;
      
      // 转换为Banner格式
      const bannerData = featuredHotels.map((hotel, index) => ({
        id: hotel._id,
        title: hotel.name,
        subtitle: `¥${hotel.price}起/晚`,
        image: hotel.images && hotel.images[0] ? hotel.images[0] : 'https://via.placeholder.com/1024x512?text=Hotel+Image',
        hotelId: hotel._id
      }));
      
      setBanners(bannerData);
    } catch (error) {
      console.error('加载推荐酒店失败:', error);
      // 如果API调用失败，使用默认数据
      setBanners([
        {
          id: 1,
          title: '五星级豪华酒店特惠',
          subtitle: '限时8折，享免费早餐',
          image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=luxury%20hotel%20exterior%20with%20modern%20architecture&size=1024x512',
          hotelId: '1'
        },
        {
          id: 2,
          title: '亲子度假酒店',
          subtitle: '儿童乐园+家庭套房',
          image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=family%20friendly%20hotel%20with%20swimming%20pool&size=1024x512',
          hotelId: '2'
        },
        {
          id: 3,
          title: '商务出差首选',
          subtitle: '近商圈+高速WiFi',
          image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=business%20hotel%20with%20meeting%20rooms&size=1024x512',
          hotelId: '3'
        },
      ]);
    } finally {
      setLoadingBanners(false);
    }
  };

  // 处理搜索提交
  const handleSearch = () => {
    navigate('/mobile/hotels', {
      state: {
        location,
        keyword,
        checkInDate: checkInDate ? checkInDate.toISOString().split('T')[0] : '',
        checkOutDate: checkOutDate ? checkOutDate.toISOString().split('T')[0] : ''
      }
    });
  };

  // 处理Banner点击
  const handleBannerClick = (hotelId) => {
    navigate(`/mobile/hotels/${hotelId}`);
  };

  // 处理城市选择
  const handleCitySelect = (city) => {
    setLocation(city);
  };

  // 获取当前位置
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLat(latitude);
          setSelectedLng(longitude);
          setLocation('当前位置');
          setShowMap(false);
          // 这里可以调用逆地理编码API获取具体地址
        },
        (error) => {
          console.error('获取位置失败:', error);
          alert('获取位置失败，请手动选择');
        }
      );
    } else {
      alert('您的浏览器不支持地理定位');
    }
  };

  // 处理地图点击
  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLat(lat);
    setSelectedLng(lng);
    // 这里可以调用逆地理编码API获取具体地址
    setLocation('已选择位置');
  };

  // 确认位置选择
  const confirmLocation = () => {
    setShowMap(false);
  };

  return (
    <div className="mobile-search-page">
      {/* 顶部导航栏 */}
      <div className="mobile-header">
        <h1>酒店预订</h1>
      </div>

      {/* 顶部Banner */}
      <div className="banner-container">
        {loadingBanners ? (
          <div className="loading-banners">
            <span>加载中...</span>
          </div>
        ) : (
          banners.map((banner) => (
            <div 
              key={banner.id} 
              className="banner-item"
              onClick={() => handleBannerClick(banner.hotelId)}
            >
              <img src={banner.image} alt={banner.title} className="banner-image" />
              <div className="banner-content">
                <h3>{banner.title}</h3>
                <p>{banner.subtitle}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 核心查询区域 */}
      <div className="search-container">
        {/* 位置选择 */}
        <div className="search-item">
          <span className="search-label">📍</span>
          <div className="location-selector">
            <span className="current-location" onClick={() => setShowMap(true)}>
              {location}
              <span className="location-arrow">▼</span>
            </span>
            <div className="hot-cities">
              {hotCities.map((city, index) => (
                <span 
                  key={index} 
                  className="city-tag"
                  onClick={() => handleCitySelect(city)}
                >
                  {city}
                </span>
              ))}
              <span className="city-tag" onClick={getCurrentLocation}>
                📍 定位
              </span>
            </div>
          </div>
        </div>

        {/* 地图选择弹窗 */}
        {showMap && (
          <div className="map-modal">
            <div className="map-header">
              <h3>选择位置</h3>
              <button className="close-btn" onClick={() => setShowMap(false)}>✕</button>
            </div>
            <div className="map-container">
              <LoadScript googleMapsApiKey="YOUR_API_KEY">
                <GoogleMap
                  ref={mapRef}
                  center={{ lat: selectedLat, lng: selectedLng }}
                  zoom={15}
                  onClick={handleMapClick}
                  mapContainerStyle={{ width: '100%', height: '400px' }}
                >
                  <Marker
                    position={{ lat: selectedLat, lng: selectedLng }}
                    draggable
                    onDragEnd={(event) => {
                      setSelectedLat(event.latLng.lat());
                      setSelectedLng(event.latLng.lng());
                    }}
                  />
                </GoogleMap>
              </LoadScript>
            </div>
            <div className="map-footer">
              <button className="confirm-btn" onClick={confirmLocation}>
                确认选择
              </button>
            </div>
          </div>
        )}

        {/* 关键字搜索 */}
        <div className="search-item">
          <span className="search-label">🔍</span>
          <input
            type="text"
            placeholder="搜索酒店名称、地址"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="search-input"
          />
        </div>

        {/* 日期选择 */}
        <div className="search-item date-selector">
          <span className="search-label">📅</span>
          <div className="date-inputs">
            <DatePicker
              className="date-input"
              selected={checkInDate}
              onChange={(date) => setCheckInDate(date)}
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
              placeholderText="选择入住日期"
            />
            <span className="date-separator">至</span>
            <DatePicker
              className="date-input"
              selected={checkOutDate}
              onChange={(date) => setCheckOutDate(date)}
              minDate={checkInDate ? new Date(checkInDate.getTime() + 86400000) : new Date()}
              dateFormat="yyyy-MM-dd"
              placeholderText="选择离店日期"
            />
          </div>
        </div>

        {/* 搜索按钮 */}
        <button className="search-button" onClick={handleSearch}>
          搜索酒店
        </button>
      </div>

      {/* 快捷标签 */}
      <div className="quick-tags-container">
        <h3>热门筛选</h3>
        <div className="quick-tags-grid">
          {quickTags.map((tag) => (
            <div key={tag.id} className="quick-tag">
              <span className="tag-icon">{tag.icon}</span>
              <span className="tag-name">{tag.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 推荐酒店预览 */}
      <div className="recommended-hotels">
        <h3>推荐酒店</h3>
        <div className="hotel-preview">
          <p>点击搜索查看更多酒店</p>
        </div>
      </div>

      {/* 移动端样式 */}
      <style jsx>{`
        .mobile-search-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f5f5f5;
          min-height: 100vh;
        }

        .mobile-header {
          background-color: #1e88e5;
          color: white;
          padding: 16px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .mobile-header h1 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .banner-container {
          margin: 10px 0;
          overflow-x: auto;
          white-space: nowrap;
          padding: 0 10px;
        }

        .banner-item {
          display: inline-block;
          width: 300px;
          height: 150px;
          margin-right: 10px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
        }

        .banner-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .banner-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
          color: white;
          padding: 10px;
        }

        .loading-banners {
          text-align: center;
          padding: 50px;
          color: #999;
          font-size: 16px;
        }

        .banner-content h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .banner-content p {
          margin: 5px 0 0 0;
          font-size: 12px;
        }

        .search-container {
          background-color: white;
          margin: 10px;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .search-item {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f0f0f0;
        }

        .search-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .search-label {
          font-size: 16px;
          margin-right: 10px;
        }

        .location-selector {
          flex: 1;
        }

        .current-location {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }

        .location-arrow {
          font-size: 12px;
          color: #999;
        }

        .hot-cities {
          margin-top: 10px;
        }

        .city-tag {
          display: inline-block;
          margin-right: 10px;
          padding: 5px 10px;
          background-color: #f0f0f0;
          border-radius: 15px;
          font-size: 12px;
          cursor: pointer;
        }

        .city-tag:active {
          background-color: #e0e0e0;
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 14px;
        }

        .date-selector {
          flex-direction: column;
          align-items: flex-start;
        }

        .date-inputs {
          width: 100%;
          display: flex;
          align-items: center;
          margin-top: 5px;
        }

        .date-input {
          flex: 1;
          padding: 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
        }

        .date-separator {
          margin: 0 10px;
          color: #999;
        }

        .search-button {
          width: 100%;
          padding: 12px;
          background-color: #1e88e5;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
        }

        .search-button:active {
          background-color: #1976d2;
        }

        .quick-tags-container {
          background-color: white;
          margin: 10px;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .quick-tags-container h3 {
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .quick-tags-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .quick-tag {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }

        .tag-icon {
          font-size: 24px;
          margin-bottom: 5px;
        }

        .tag-name {
          font-size: 12px;
          text-align: center;
        }

        .recommended-hotels {
          background-color: white;
          margin: 10px;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .recommended-hotels h3 {
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .hotel-preview {
          text-align: center;
          padding: 20px;
          color: #999;
        }

        /* 响应式样式 */
        @media (max-width: 480px) {
          .banner-item {
            width: 280px;
          }

          .quick-tags-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }

          .tag-icon {
            font-size: 20px;
          }

          .tag-name {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default HotelSearchPage;