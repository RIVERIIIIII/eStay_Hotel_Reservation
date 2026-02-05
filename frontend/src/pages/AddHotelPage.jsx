import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hotelAPI } from '../services/api';

const AddHotelPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    address: '',
    starRating: 3,
    price: '',
    openingTime: '',
    description: '',
    amenities: [],
    roomTypes: [{ type: '', price: '' }]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchHotel();
    }
  }, [id, isEdit]);

  const fetchHotel = async () => {
    try {
      setLoading(true);
      const response = await hotelAPI.getById(id);
      const hotel = response.data.hotel;
      
      setFormData({
        name: hotel.name || '',
        name_en: hotel.name_en || '',
        address: hotel.address || '',
        starRating: hotel.starRating || 3,
        price: hotel.price || '',
        openingTime: hotel.openingTime ? hotel.openingTime.split('T')[0] : '',
        description: hotel.description || '',
        amenities: hotel.amenities || [],
        roomTypes: hotel.roomTypes?.length > 0 ? hotel.roomTypes : [{ type: '', price: '' }]
      });
    } catch (error) {
      setError('获取酒店信息失败');
      console.error('Error fetching hotel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRoomTypeChange = (index, field, value) => {
    const updatedRoomTypes = [...formData.roomTypes];
    updatedRoomTypes[index][field] = value;
    setFormData(prev => ({ ...prev, roomTypes: updatedRoomTypes }));
  };

  const addRoomType = () => {
    setFormData(prev => ({
      ...prev,
      roomTypes: [...prev.roomTypes, { type: '', price: '' }]
    }));
  };

  const removeRoomType = (index) => {
    if (formData.roomTypes.length > 1) {
      const updatedRoomTypes = formData.roomTypes.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, roomTypes: updatedRoomTypes }));
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (index) => {
    const updatedAmenities = formData.amenities.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, amenities: updatedAmenities }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.name_en || !formData.address || !formData.price || !formData.openingTime) {
      return '请填写所有必填字段';
    }

    if (formData.roomTypes.some(room => !room.type || !room.price)) {
      return '请填写完整的房型信息';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        roomTypes: formData.roomTypes.map(room => ({
          ...room,
          price: parseFloat(room.price)
        }))
      };

      if (isEdit) {
        await hotelAPI.update(id, submitData);
      } else {
        await hotelAPI.create(submitData);
      }
      
      navigate('/hotels');
    } catch (error) {
      setError(error.response?.data?.message || '保存失败');
      console.error('Error saving hotel:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && loading) {
    return (
      <div className="flex-center" style={{ minHeight: '200px' }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-3">{isEdit ? '编辑酒店' : '添加新酒店'}</h1>

      {error && (
        <div className="text-error mb-2">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card mb-3">
          <h3 className="mb-2">基本信息</h3>
          
          <div className="form-group">
            <label className="form-label">酒店名称（中文）*</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="请输入酒店中文名称"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">酒店名称（英文）*</label>
            <input
              type="text"
              name="name_en"
              className="form-input"
              value={formData.name_en}
              onChange={handleChange}
              placeholder="请输入酒店英文名称"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">地址*</label>
            <input
              type="text"
              name="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
              placeholder="请输入酒店地址"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">星级*</label>
            <select
              name="starRating"
              className="form-input"
              value={formData.starRating}
              onChange={handleChange}
              disabled={loading}
            >
              {[1, 2, 3, 4, 5].map(star => (
                <option key={star} value={star}>{star}星</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">起价（元）*</label>
            <input
              type="number"
              name="price"
              className="form-input"
              value={formData.price}
              onChange={handleChange}
              placeholder="请输入起始价格"
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">开业时间*</label>
            <input
              type="date"
              name="openingTime"
              className="form-input"
              value={formData.openingTime}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">描述</label>
            <textarea
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              placeholder="请输入酒店描述"
              rows="3"
              disabled={loading}
            />
          </div>
        </div>

        <div className="card mb-3">
          <h3 className="mb-2">房型信息*</h3>
          {formData.roomTypes.map((room, index) => (
            <div key={index} className="form-group" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <div className="flex" style={{ gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">房型名称</label>
                  <input
                    type="text"
                    className="form-input"
                    value={room.type}
                    onChange={(e) => handleRoomTypeChange(index, 'type', e.target.value)}
                    placeholder="如：标准大床房"
                    disabled={loading}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">价格（元）</label>
                  <input
                    type="number"
                    className="form-input"
                    value={room.price}
                    onChange={(e) => handleRoomTypeChange(index, 'price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                {formData.roomTypes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRoomType(index)}
                    className="btn btn-danger"
                    disabled={loading}
                  >
                    删除
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addRoomType}
            className="btn btn-secondary"
            disabled={loading}
          >
            添加房型
          </button>
        </div>

        <div className="card mb-3">
          <h3 className="mb-2">设施服务</h3>
          <div className="form-group">
            <div className="flex" style={{ gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="输入设施名称，如：免费停车场"
                disabled={loading}
              />
              <button
                type="button"
                onClick={addAmenity}
                className="btn btn-secondary"
                disabled={loading}
              >
                添加
              </button>
            </div>
          </div>
          
          {formData.amenities.length > 0 && (
            <div>
              <label className="form-label">已添加的设施:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#e9ecef',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc3545',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                      }}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex" style={{ gap: '1rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '保存中...' : (isEdit ? '更新酒店' : '创建酒店')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/hotels')}
            className="btn btn-secondary"
            disabled={loading}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddHotelPage;