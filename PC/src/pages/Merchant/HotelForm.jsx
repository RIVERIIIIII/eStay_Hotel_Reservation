import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import hotelService from '../../services/hotelService';

// 自定义地图点击事件组件
const MapClickHandler = ({ onMapClick }) => {
  const mapEvents = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      console.log('地图点击位置:', lng, lat);
      onMapClick({ lat, lng });
    }
  });
  return null;
};

const HotelForm = () => {
  // 内联样式
  const styles = {
    facilityTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginBottom: '15px',
    },
    facilityTag: {
      padding: '8px 16px',
      border: '2px solid #e0e0e0',
      borderRadius: '20px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px',
    },
    facilityTagSelected: {
      backgroundColor: '#2196f3',
      color: '#fff',
      borderColor: '#2196f3',
    },
    selectedFacilities: {
      marginTop: '10px',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      fontSize: '14px',
    },
  };
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    address: '',
    star_rating: '',
    opening_time: '',
    description: '',
    facilities: [],
    images: [],
    roomTypes: [],
    latitude: '',
    longitude: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchHotelDetails();
    }
  }, [id]);

  // 处理地图点击事件
  const handleMapClick = ({ lat, lng }) => {
    // 使用setTimeout避免在事件处理中直接修改状态导致的问题
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6)
      }));
    }, 0);
  };

  const fetchHotelDetails = async () => {
    try {
      console.log('Fetching hotel details for ID:', id);
      const hotelData = await hotelService.getHotelById(id);
      console.log('Hotel details data:', hotelData);
      
      let roomTypes = [];
      if (hotelData.roomTypes && Array.isArray(hotelData.roomTypes)) {
        roomTypes = hotelData.roomTypes.map(rt => ({
          type: rt.type,
          price: rt.price
        }));
      } else if (hotelData.room_types) {
        roomTypes = hotelData.room_types.split('、').map(item => {
          const [type, price] = item.split(':');
          return { type, price };
        });
      }
      
      // 处理日期格式
      let openingTime = hotelData.opening_time || hotelData.openingTime;
      if (openingTime && typeof openingTime === 'string' && openingTime.includes('T')) {
        // 转换ISO8601格式为YYYY/MM/DD
        const date = new Date(openingTime);
        openingTime = date.toISOString().split('T')[0];
      }
      
      setFormData({
        name: hotelData.name,
        name_en: hotelData.name_en,
        address: hotelData.address,
        star_rating: hotelData.star_rating || hotelData.starRating,
        opening_time: openingTime,
        description: hotelData.description,
        facilities: typeof hotelData.facilities === 'string' ? hotelData.facilities.split('、').filter(f => f) : hotelData.facilities || hotelData.amenities || [],
        images: hotelData.images || [],
        roomTypes: roomTypes,
        latitude: hotelData.latitude || '',
        longitude: hotelData.longitude || '',
      });
    } catch (err) {
      console.error('Error fetching hotel details:', err);
      console.error('Error response:', err.response?.data);
      setError('获取酒店详情失败');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const handleFacilityToggle = (facility) => {
    setFormData((prev) => {
      const currentFacilities = prev.facilities;
      if (currentFacilities.includes(facility)) {
        return {
          ...prev,
          facilities: currentFacilities.filter(f => f !== facility),
        };
      } else {
        return {
          ...prev,
          facilities: [...currentFacilities, facility],
        };
      }
    });
  };

  const handleRoomTypePriceChange = (index, price) => {
    setFormData((prev) => {
      const newRoomTypes = [...prev.roomTypes];
      newRoomTypes[index].price = price;
      return {
        ...prev,
        roomTypes: newRoomTypes,
      };
    });
  };

  const handleAddRoomType = () => {
    setFormData((prev) => {
      const usedTypes = prev.roomTypes.map(rt => rt.type);
      const availableTypes = ['大床房', '双床房', '家庭房', '套房'].filter(type => !usedTypes.includes(type));
      if (availableTypes.length === 0) {
        return prev;
      }
      return {
        ...prev,
        roomTypes: [...prev.roomTypes, { type: availableTypes[0], price: '' }],
      };
    });
  };

  const handleRemoveRoomType = (index) => {
    setFormData((prev) => {
      const newRoomTypes = prev.roomTypes.filter((_, i) => i !== index);
      return {
        ...prev,
        roomTypes: newRoomTypes,
      };
    });
  };

  const getAvailableRoomTypes = () => {
    const usedTypes = formData.roomTypes.map(rt => rt.type);
    return ['大床房', '双床房', '家庭房', '套房'].filter(type => !usedTypes.includes(type));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('请填写酒店名称（中文）');
      return;
    }
    if (!formData.address.trim()) {
      setError('请填写地址');
      return;
    }
    if (!formData.star_rating) {
      setError('请选择星级');
      return;
    }
    if (!formData.opening_time) {
      setError('请选择开业时间');
      return;
    }
    if (!formData.latitude.trim()) {
      setError('请填写酒店纬度');
      return;
    }
    if (!formData.longitude.trim()) {
      setError('请填写酒店经度');
      return;
    }
    if (formData.roomTypes.length === 0) {
      setError('请至少添加一种房型');
      return;
    }
    for (let i = 0; i < formData.roomTypes.length; i++) {
      if (!formData.roomTypes[i].type) {
        setError('请选择房型');
        return;
      }
      if (!formData.roomTypes[i].price || formData.roomTypes[i].price <= 0) {
        setError('请填写房型价格');
        return;
      }
    }
    
    const usedTypes = formData.roomTypes.map(rt => rt.type);
    const uniqueTypes = new Set(usedTypes);
    if (usedTypes.length !== uniqueTypes.size) {
      setError('房型不能重复选择');
      return;
    }
    
    setLoading(true);
    try {
      // 计算最低价格作为酒店基础价格
      const prices = formData.roomTypes.map(rt => parseFloat(rt.price)).filter(p => !isNaN(p));
      const basePrice = prices.length > 0 ? Math.min(...prices) : 0;
      
      // 确保name_en有值
      const hotelNameEn = formData.name_en.trim() || formData.name.trim() || 'Hotel';
      
      // 转换日期为ISO8601格式
      const openingTimeISO = new Date(formData.opening_time).toISOString();
      
      // 过滤出实际的文件对象（如果有）
      const imageFiles = formData.images.filter(image => image instanceof File);
      let uploadedImageUrls = [];
      
      // 如果有图片文件，先上传图片
      if (imageFiles.length > 0) {
        const uploadResult = await hotelService.uploadImages(imageFiles);
        uploadedImageUrls = uploadResult.imageUrls || [];
      }
      
      // 合并已有的图片URL和新上传的图片URL
      const existingImageUrls = formData.images.filter(image => typeof image === 'string');
      const allImageUrls = [...existingImageUrls, ...uploadedImageUrls];
      
      const submitData = {
        name: formData.name,
        name_en: hotelNameEn,
        address: formData.address,
        starRating: parseInt(formData.star_rating) || 1,
        price: basePrice,
        openingTime: openingTimeISO,
        description: formData.description,
        amenities: formData.facilities,
        roomTypes: formData.roomTypes.map(rt => ({
          type: rt.type,
          price: parseFloat(rt.price) || 0
        })),
        images: allImageUrls,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
      };
      if (isEditing) {
        await hotelService.updateHotel(id, submitData);
      } else {
        await hotelService.createHotel(submitData);
      }
      // 先隐藏地图，避免跳转时的DOM清理问题
      setShowMap(false);
      // 延迟跳转，确保地图完全卸载
      setTimeout(() => {
        navigate('/merchant/hotels');
      }, 100);
    } catch (err) {
      console.error('Save hotel error:', err.response?.data);
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.msg).join('\n'));
      } else {
        setError(err.response?.data?.message || '保存酒店失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hotel-form-container">
      <div className="hotel-form">
        <h2>{isEditing ? '编辑酒店' : '添加酒店'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">酒店名称（中文）<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="name_en">酒店名称（英文）</label>
              <input
                type="text"
                id="name_en"
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="address">地址<span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>位置<span style={{ color: 'red' }}>*</span></label>
            <div style={{ marginBottom: '10px' }}>
              <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                请在地图上点击选择酒店位置
              </p>
              {!showMap ? (
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2196f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  📍 打开地图选点
                </button>
              ) : (
                <>
                  {/* Leaflet 地图容器 */}
                  <div 
                    style={{ 
                      width: '100%', 
                      height: '400px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      zIndex: 1
                    }}
                  >
                    <MapContainer 
                      center={[parseFloat(formData.latitude) || 39.915, parseFloat(formData.longitude) || 116.404]} 
                      zoom={13} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}"
                        subdomains={['1', '2', '3', '4']}
                        attribution='&copy; <a href="https://www.amap.com">高德地图</a>'
                      />
                      {formData.latitude && formData.longitude && (
                        <Marker 
                          position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
                        >
                          <Popup>
                            选择的酒店位置<br />
                            纬度: {formData.latitude}<br />
                            经度: {formData.longitude}
                          </Popup>
                        </Marker>
                      )}
                      <MapClickHandler onMapClick={handleMapClick} />
                    </MapContainer>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <p style={{ 
                      marginTop: '10px', 
                      fontSize: '14px', 
                      color: '#4CAF50',
                      textAlign: 'center'
                    }}>
                      已选择位置：纬度 {formData.latitude}，经度 {formData.longitude}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="star_rating">星级<span style={{ color: 'red' }}>*</span></label>
              <select
                id="star_rating"
                name="star_rating"
                value={formData.star_rating}
                onChange={handleChange}
                required
              >
                <option value="">选择星级</option>
                <option value="1">一星</option>
                <option value="2">二星</option>
                <option value="3">三星</option>
                <option value="4">四星</option>
                <option value="5">五星</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="opening_time">开业时间<span style={{ color: 'red' }}>*</span></label>
            <input
              type="date"
              id="opening_time"
              name="opening_time"
              value={formData.opening_time}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>房型<span style={{ color: 'red' }}>*</span></label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formData.roomTypes.map((roomType, index) => {
                const usedTypes = formData.roomTypes.map((rt, i) => i !== index ? rt.type : null).filter(Boolean);
                const availableTypes = ['大床房', '双床房', '家庭房', '套房'].filter(type => !usedTypes.includes(type));
                return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <select
                    value={roomType.type}
                    onChange={(e) => {
                      const newRoomTypes = [...formData.roomTypes];
                      newRoomTypes[index].type = e.target.value;
                      setFormData({ ...formData, roomTypes: newRoomTypes });
                    }}
                    required
                    style={{ 
                      flex: 2,
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">选择房型</option>
                    {availableTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                    {roomType.type && !availableTypes.includes(roomType.type) && (
                      <option value={roomType.type}>{roomType.type}</option>
                    )}
                  </select>
                  <input
                      type="number"
                      placeholder="请输入价格（元/晚）"
                      value={roomType.price}
                      onChange={(e) => handleRoomTypePriceChange(index, e.target.value)}
                      required
                      min="0"
                      style={{ 
                        flex: 3, 
                        padding: '8px 12px', 
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRoomType(index)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#f44336',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginLeft: '10px',
                        fontSize: '12px',
                        height: '32px',
                        minWidth: '50px',
                        width: '50px',
                        textAlign: 'center'
                      }}
                    >
                      删除
                    </button>
                </div>
                );
              })}
              <button
                type="button"
                onClick={handleAddRoomType}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px',
                  fontSize: '14px',
                  alignSelf: 'flex-start',
                }}
              >
                + 添加房型
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>设施</label>
            <div style={styles.facilityTags}>
              {['含早餐', '免费停车', '接送机', '静音房', '影音房', '近地铁', '4.8分+'].map((facility) => (
                <div
                  key={facility}
                  style={{
                    ...styles.facilityTag,
                    ...(formData.facilities.includes(facility) ? styles.facilityTagSelected : {}),
                  }}
                  onClick={() => handleFacilityToggle(facility)}
                >
                  {facility}
                </div>
              ))}
            </div>
            <div style={styles.selectedFacilities}>
              <p>已选择: {formData.facilities.length > 0 ? formData.facilities.join('、') : '无'}</p>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="description">描述</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="酒店描述"
            />
          </div>
          <div className="form-group">
            <label htmlFor="images">图片</label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              onChange={handleImageChange}
            />
            {formData.images.length > 0 && (
              <div className="image-preview">
                <p>已选择 {formData.images.length} 张图片</p>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? '保存中...' : (isEditing ? '更新' : '创建')}
            </button>
            <button type="button" onClick={() => navigate('/merchant/hotels')}>
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelForm;