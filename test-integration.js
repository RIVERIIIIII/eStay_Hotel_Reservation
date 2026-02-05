// 集成测试脚本 - 验证酒店预订平台核心流程
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

let authToken = '';
let hotelId = '';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const testStep = async (name, testFunc) => {
  console.log(`?? 测试: ${name}`);
  try {
    await testFunc();
    console.log('✅ 通过\n');
    return true;
  } catch (error) {
    console.log('❌ 失败:', error.message, '\n');
    return false;
  }
};

// 测试用户注册
const testRegister = async () => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'testuser',
      password: 'testpass123',
      role: 'merchant'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '注册失败');
  }

  const data = await response.json();
  if (!data.token) throw new Error('未返回token');
  authToken = data.token;
};

// 测试用户登录
const testLogin = async () => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'testuser',
      password: 'testpass123'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '登录失败');
  }

  const data = await response.json();
  if (!data.token) throw new Error('未返回token');
  authToken = data.token;
};

// 测试创建酒店
const testCreateHotel = async () => {
  const response = await fetch(`${BASE_URL}/hotels`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      name: '集成测试酒店',
      name_en: 'Integration Test Hotel',
      address: '测试地址123号',
      starRating: 4,
      price: 350,
      openingTime: '2024-01-01',
      description: '这是集成测试创建的酒店',
      roomTypes: [
        {
          type: '测试房型',
          price: 350,
          description: '测试房型描述'
        }
      ],
      amenities: ['测试设施']
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '创建酒店失败');
  }

  const data = await response.json();
  hotelId = data.hotel.id;
  if (!hotelId) throw new Error('未返回酒店ID');
};

// 测试获取酒店列表
const testGetHotels = async () => {
  const response = await fetch(`${BASE_URL}/hotels`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '获取酒店列表失败');
  }

  const data = await response.json();
  if (!Array.isArray(data.hotels)) throw new Error('返回的酒店列表格式不正确');
};

// 测试更新酒店
const testUpdateHotel = async () => {
  const response = await fetch(`${BASE_URL}/hotels/${hotelId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      name: '更新后的测试酒店',
      name_en: 'Updated Test Hotel',
      address: '更新地址456号',
      starRating: 5,
      price: 450,
      openingTime: '2024-01-01',
      description: '这是更新后的酒店描述',
      roomTypes: [
        {
          type: '更新房型',
          price: 450,
          description: '更新房型描述'
        }
      ],
      amenities: ['更新设施']
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '更新酒店失败');
  }
};

// 测试删除酒店
const testDeleteHotel = async () => {
  const response = await fetch(`${BASE_URL}/hotels/${hotelId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '删除酒店失败');
  }
};

// 主测试函数
const runTests = async () => {
  console.log('🚀 开始集成测试酒店预订平台核心流程\n');

  // 等待后端服务启动
  console.log('⏳ 等待后端服务启动...');
  await sleep(2000);

  let successCount = 0;
  const totalTests = 5;

  successCount += await testStep('用户注册', testRegister);
  successCount += await testStep('用户登录', testLogin);
  successCount += await testStep('创建酒店', testCreateHotel);
  successCount += await testStep('获取酒店列表', testGetHotels);
  successCount += await testStep('更新和删除酒店', async () => {
    await testUpdateHotel();
    await testDeleteHotel();
  });

  console.log(`📊 测试结果: ${successCount}/${totalTests} 通过`);
  
  if (successCount === totalTests) {
    console.log('?? 所有核心流程测试通过！');
  } else {
    console.log('⚠️ 部分测试失败，请检查系统状态');
  }
};

runTests().catch(console.error);