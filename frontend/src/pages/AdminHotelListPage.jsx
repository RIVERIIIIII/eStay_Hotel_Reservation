import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AdminHotelListPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('pending'); // pending, approved, rejected, all
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const { isAdmin } = useAuth();

  // 加载酒店列表
  const loadHotels = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        page,
        limit,
        status: status === 'all' ? undefined : status
      };
      
      const response = status === 'pending'
        ? await adminAPI.getPendingHotels(params)
        : await adminAPI.getAllHotels(params);
      
      setHotels(response.data.hotels);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('加载酒店列表失败');
      console.error('加载酒店列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, [status, page, limit]);

  // 审核通过
  const handleApprove = async (id) => {
    try {
      await adminAPI.approveHotel(id);
      loadHotels();
    } catch (err) {
      setError('审核通过失败');
      console.error('审核通过失败:', err);
    }
  };

  // 审核拒绝
  const handleReject = async (id) => {
    const reason = prompt('请输入拒绝原因:');
    if (!reason) return;
    
    try {
      await adminAPI.rejectHotel(id, reason);
      loadHotels();
    } catch (err) {
      setError('审核拒绝失败');
      console.error('审核拒绝失败:', err);
    }
  };

  // 发布酒店
  const handlePublish = async (id) => {
    try {
      await adminAPI.publishHotel(id);
      loadHotels();
    } catch (err) {
      setError('发布酒店失败');
      console.error('发布酒店失败:', err);
    }
  };

  // 下线酒店
  const handleUnpublish = async (id) => {
    try {
      await adminAPI.unpublishHotel(id);
      loadHotels();
    } catch (err) {
      setError('下线酒店失败');
      console.error('下线酒店失败:', err);
    }
  };

  // 查看酒店详情
  const handleViewDetail = (hotel) => {
    setSelectedHotel(hotel);
    setShowDetailModal(true);
  };

  // 关闭详情模态框
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedHotel(null);
  };

  // 渲染酒店列表
  const renderHotelList = () => {
    if (hotels.length === 0) {
      return (
        <div className="text-center py-5">
          <p style={{ fontSize: '1.1rem', color: '#666' }}>暂无酒店数据</p>
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>酒店名称</th>
              <th>英文名称</th>
              <th>星级</th>
              <th>价格</th>
              <th>审核状态</th>
              <th>发布状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map(hotel => (
              <tr key={hotel._id}>
                <td>{hotel.name}</td>
                <td>{hotel.name_en}</td>
                <td>{hotel.starRating} 星</td>
                <td>¥{hotel.price}/晚</td>
                <td>
                  <span className={`badge ${getBadgeClass(hotel.status)}`}>
                    {getStatusText(hotel.status)}
                  </span>
                </td>
                <td>
                  <span className={`badge ${hotel.published ? 'badge-primary' : 'badge-secondary'}`}>
                    {hotel.published ? '已发布' : '已下线'}
                  </span>
                </td>
                <td>{new Date(hotel.createdAt).toLocaleString()}</td>
                <td>
                  <button 
                    className="btn btn-info btn-sm mr-2"
                    onClick={() => handleViewDetail(hotel)}
                    title="查看详情"
                  >
                    详情
                  </button>
                  
                  {hotel.status === 'pending' && (
                    <>
                      <button 
                        className="btn btn-success btn-sm mr-2"
                        onClick={() => handleApprove(hotel._id)}
                        title="审核通过"
                      >
                        通过
                      </button>
                      <button 
                        className="btn btn-danger btn-sm mr-2"
                        onClick={() => handleReject(hotel._id)}
                        title="审核拒绝"
                      >
                        拒绝
                      </button>
                    </>
                  )}
                  
                  {hotel.status === 'approved' && (
                    <>
                      {!hotel.published ? (
                        <button 
                          className="btn btn-primary btn-sm mr-2"
                          onClick={() => handlePublish(hotel._id)}
                          title="发布酒店"
                        >
                          发布
                        </button>
                      ) : (
                        <button 
                          className="btn btn-warning btn-sm mr-2"
                          onClick={() => handleUnpublish(hotel._id)}
                          title="下线酒店"
                        >
                          下线
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 获取状态徽章样式
  const getBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  // 获取状态文本
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'approved': return '已通过';
      case 'rejected': return '已拒绝';
      default: return status;
    }
  };

  return (
    <div>
      <h2 className="mb-4">酒店审核管理</h2>
      
      {/* 筛选条件 */}
      <div className="card mb-4 p-4">
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="status">酒店状态</label>
              <select 
                id="status"
                className="form-control"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="pending">待审核</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
                <option value="all">全部</option>
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="limit">每页显示</label>
              <select 
                id="limit"
                className="form-control"
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value));
                  setPage(1);
                }}
              >
                <option value="10">10条</option>
                <option value="20">20条</option>
                <option value="50">50条</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      {/* 酒店列表 */}
      <div className="card">
        <div className="card-header">
          <h4>{status === 'pending' ? '待审核酒店' : '酒店列表'}</h4>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="sr-only">加载中...</span>
              </div>
            </div>
          ) : (
            renderHotelList()
          )}
        </div>
      </div>

      {/* 分页 */}
      {!loading && totalPages > 1 && (
        <nav className="mt-4" aria-label="Page navigation example">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              >
                上一页
              </button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li 
                key={index} 
                className={`page-item ${page === index + 1 ? 'active' : ''}`}
              >
                <button 
                  className="page-link" 
                  onClick={() => setPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              >
                下一页
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* 酒店详情模态框 */}
      {showDetailModal && selectedHotel && (
        <div 
          className="modal fade show" 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 1050,
            overflowY: 'auto'
          }}
          onClick={handleCloseDetailModal}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered" 
            role="document"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '900px',
              width: '95%',
              animation: 'modalSlideIn 0.3s ease-out'
            }}
          >
            <div className="modal-content" style={{ 
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              border: 'none'
            }}>
              <div className="modal-header" style={{ 
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e9ecef',
                borderRadius: '12px 12px 0 0',
                padding: '1.5rem'
              }}>
                <h5 className="modal-title" style={{ 
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2c3e50'
                }}>
                  酒店详情
                </h5>
                <button 
                  type="button" 
                  className="close" 
                  onClick={handleCloseDetailModal}
                  style={{ 
                    fontSize: '1.5rem',
                    opacity: 0.7,
                    padding: '0.5rem',
                    lineHeight: '1'
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body" style={{ 
                padding: '1.5rem',
                maxHeight: '85vh',
                overflowY: 'auto'
              }}>
                {/* 酒店基本信息 */}
                <div className="row mb-4">
                  <div className="col-md-7">
                    <div className="hotel-info">
                      <h3 style={{ 
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: '#2c3e50',
                        marginBottom: '0.5rem'
                      }}>
                        {selectedHotel.name}
                      </h3>
                      <p style={{ 
                        fontSize: '1.1rem',
                        color: '#5a6c7d',
                        fontWeight: '500',
                        marginBottom: '1.5rem'
                      }}>
                        {selectedHotel.name_en}
                      </p>
                      
                      {/* 基本信息卡片 */}
                      <div className="card" style={{ 
                        border: 'none',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                        borderRadius: '8px',
                        marginBottom: '1.5rem'
                      }}>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-sm-6 mb-3">
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ 
                                  color: '#007bff',
                                  marginRight: '0.5rem',
                                  fontSize: '1.2rem'
                                }}>
                                  📍
                                </span>
                                <div>
                                  <div style={{ 
                                    fontSize: '0.85rem',
                                    color: '#495057',
                                    fontWeight: '600',
                                    marginBottom: '0.2rem'
                                  }}>
                                    地址
                                  </div>
                                  <div style={{ fontWeight: '500' }}>
                                    {selectedHotel.address}
                                  </div>
                                </div>
                              </div>
                              
                              {selectedHotel.city && (
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                  <span style={{ 
                                    color: '#007bff',
                                    marginRight: '0.5rem',
                                    fontSize: '1.2rem'
                                  }}>
                                    🏙️
                                  </span>
                                  <div>
                                    <div style={{ 
                                      fontSize: '0.85rem',
                                      color: '#6c757d',
                                      marginBottom: '0.2rem'
                                    }}>
                                      城市
                                    </div>
                                    <div style={{ fontWeight: '500' }}>
                                      {selectedHotel.city}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ 
                                  color: '#007bff',
                                  marginRight: '0.5rem',
                                  fontSize: '1.2rem'
                                }}>
                                  ⭐
                                </span>
                                <div>
                                  <div style={{ 
                                    fontSize: '0.85rem',
                                    color: '#6c757d',
                                    marginBottom: '0.2rem'
                                  }}>
                                    星级
                                  </div>
                                  <div style={{ fontWeight: '500' }}>
                                    {selectedHotel.starRating} 星
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="col-sm-6">
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ 
                                  color: '#007bff',
                                  marginRight: '0.5rem',
                                  fontSize: '1.2rem'
                                }}>
                                  💰
                                </span>
                                <div>
                                  <div style={{ 
                                    fontSize: '0.85rem',
                                    color: '#6c757d',
                                    marginBottom: '0.2rem'
                                  }}>
                                    价格
                                  </div>
                                  <div style={{ 
                                    fontWeight: '600',
                                    color: '#e74c3c'
                                  }}>
                                    ¥{selectedHotel.price}/晚起
                                  </div>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ 
                                  color: '#007bff',
                                  marginRight: '0.5rem',
                                  fontSize: '1.2rem'
                                }}>
                                  📅
                                </span>
                                <div>
                                  <div style={{ 
                                    fontSize: '0.85rem',
                                    color: '#6c757d',
                                    marginBottom: '0.2rem'
                                  }}>
                                    开业时间
                                  </div>
                                  <div style={{ fontWeight: '500' }}>
                                    {new Date(selectedHotel.openingTime).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ 
                                  color: '#007bff',
                                  marginRight: '0.5rem',
                                  fontSize: '1.2rem'
                                }}>
                                  📝
                                </span>
                                <div>
                                  <div style={{ 
                                    fontSize: '0.85rem',
                                    color: '#495057',
                                    fontWeight: '600',
                                    marginBottom: '0.2rem'
                                  }}>
                                    审核状态
                                  </div>
                                  <div>
                                    <span className={`badge ${getBadgeClass(selectedHotel.status)}`}>
                                      {getStatusText(selectedHotel.status)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ 
                                  color: '#007bff',
                                  marginRight: '0.5rem',
                                  fontSize: '1.2rem'
                                }}>
                                  🚩
                                </span>
                                <div>
                                  <div style={{ 
                                    fontSize: '0.85rem',
                                    color: '#495057',
                                    fontWeight: '600',
                                    marginBottom: '0.2rem'
                                  }}>
                                    发布状态
                                  </div>
                                  <div>
                                    <span className={`badge ${selectedHotel.published ? 'badge-primary' : 'badge-secondary'}`}>
                                      {selectedHotel.published ? '已发布' : '已下线'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 酒店简介和描述 */}
                      {selectedHotel.summary && (
                        <div className="mb-3">
                          <h5 style={{ 
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#2c3e50',
                            marginBottom: '0.5rem'
                          }}>
                            酒店简介
                          </h5>
                          <p style={{ 
                            lineHeight: '1.6',
                            color: '#495057'
                          }}>
                            {selectedHotel.summary}
                          </p>
                        </div>
                      )}
                      
                      {selectedHotel.description && (
                        <div className="mb-3">
                          <h5 style={{ 
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#2c3e50',
                            marginBottom: '0.5rem'
                          }}>
                            酒店描述
                          </h5>
                          <p style={{ 
                            lineHeight: '1.6',
                            color: '#495057'
                          }}>
                            {selectedHotel.description}
                          </p>
                        </div>
                      )}
                      
                      {/* 创建和更新时间 */}
                      <div style={{ 
                        fontSize: '0.85rem',
                        color: '#7f8c8d',
                        fontWeight: '500',
                        fontStyle: 'italic'
                      }}>
                        <p style={{ marginBottom: '0.25rem' }}>
                          创建时间: {new Date(selectedHotel.createdAt).toLocaleString()}
                        </p>
                        {selectedHotel.updatedAt && (
                          <p>
                            更新时间: {new Date(selectedHotel.updatedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 酒店图片 */}
                  <div className="col-md-5">
                    {selectedHotel.images && selectedHotel.images.length > 0 && (
                      <div className="hotel-images">
                        <h5 style={{ 
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#2c3e50',
                          marginBottom: '1rem'
                        }}>
                          酒店图片
                        </h5>
                        
                        {/* 主图 */}
                        <div className="main-image mb-3" style={{ 
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                        }}>
                          <img 
                            src={selectedHotel.images[0]} 
                            alt={`酒店图片 1`} 
                            style={{ 
                              width: '100%',
                              height: '250px',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                          />
                        </div>
                        
                        {/* 其他图片 */}
                        {selectedHotel.images.length > 1 && (
                          <div className="image-grid" style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap: '0.5rem',
                            marginTop: '1rem'
                          }}>
                            {selectedHotel.images.slice(1).map((image, index) => (
                              <div 
                                key={index} 
                                style={{ 
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                  minHeight: '100px'
                                }}
                              >
                                <img 
                                  src={image} 
                                  alt={`酒店图片 ${index + 2}`} 
                                  style={{ 
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s ease'
                                  }}
                                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    console.error('图片加载失败:', image);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 酒店设施 */}
                {selectedHotel.amenities && selectedHotel.amenities.length > 0 && (
                  <div className="mb-4">
                    <h5 style={{ 
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#2c3e50',
                      marginBottom: '1rem'
                    }}>
                      酒店设施
                    </h5>
                    <div style={{ 
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      {selectedHotel.amenities.map((amenity, index) => (
                        <span 
                          key={index} 
                          className="badge badge-secondary" 
                          style={{ 
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.9rem',
                            borderRadius: '20px',
                            backgroundColor: '#f8f9fa',
                            color: '#495057',
                            border: '1px solid #dee2e6',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#e9ecef';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#f8f9fa';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 房型信息 */}
                {selectedHotel.roomTypes && selectedHotel.roomTypes.length > 0 && (
                  <div className="mb-4">
                    <h5 style={{ 
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#2c3e50',
                      marginBottom: '1rem'
                    }}>
                      房型信息
                    </h5>
                    <div className="table-responsive" style={{ 
                          maxHeight: '300px',
                          overflowY: 'auto'
                        }}>
                      <table className="table" style={{ 
                        border: 'none',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                        minHeight: '200px',
                        textAlign: 'center'
                      }}>
                        <thead style={{ 
                          backgroundColor: '#f8f9fa',
                          borderBottom: '2px solid #dee2e6'
                        }}>
                          <tr>
                            <th style={{ 
                              fontWeight: '600',
                              color: '#2c3e50',
                              border: 'none',
                              textAlign: 'center'
                            }}>
                              房型
                            </th>
                            <th style={{ 
                              fontWeight: '600',
                              color: '#2c3e50',
                              border: 'none',
                              textAlign: 'center'
                            }}>
                              价格
                            </th>
                            <th style={{ 
                              fontWeight: '600',
                              color: '#2c3e50',
                              border: 'none',
                              textAlign: 'center'
                            }}>
                              描述
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedHotel.roomTypes.map((roomType, index) => (
                            <tr 
                              key={index} 
                              style={{ 
                                borderBottom: '1px solid #f1f3f5',
                                transition: 'background-color 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                              <td style={{ border: 'none', padding: '1rem', textAlign: 'center' }}>
                                <div style={{ fontWeight: '500' }}>{roomType.type}</div>
                              </td>
                              <td style={{ border: 'none', padding: '1rem', textAlign: 'center' }}>
                                <div style={{ 
                                  fontWeight: '700',
                                  color: '#e74c3c',
                                  fontSize: '1.1rem'
                                }}>
                                  ¥{roomType.price}/晚
                                </div>
                              </td>
                              <td style={{ border: 'none', padding: '1rem', textAlign: 'center' }}>
                                <div>{roomType.description || '-'}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* 拒绝原因 */}
                {selectedHotel.rejectReason && (
                  <div className="mb-3">
                    <h5 style={{ 
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#2c3e50',
                      marginBottom: '0.5rem'
                    }}>
                      拒绝原因
                    </h5>
                    <div className="alert alert-danger" style={{ 
                      borderRadius: '8px',
                      border: '1px solid #f5c6cb',
                      backgroundColor: '#f8d7da',
                      color: '#721c24'
                    }}>
                      {selectedHotel.rejectReason}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ 
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #e9ecef',
                borderRadius: '0 0 12px 12px',
                padding: '1rem 1.5rem'
              }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseDetailModal}
                  style={{ 
                    padding: '0.5rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    backgroundColor: '#6c757d',
                    border: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#5a6268';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6c757d';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 模态框遮罩层 */}
      {showDetailModal && (
        <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      )}
      
      {/* 模态框动画 */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminHotelListPage;
