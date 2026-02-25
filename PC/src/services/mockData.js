// 共享的模拟数据
// 实际项目中会通过数据库存储和API调用获取数据
export const mockHotels = [
  {
    id: 1,
    name: '豪华酒店',
    address: '北京市朝阳区建国路88号',
    star_rating: 5,
    description: '五星级豪华酒店，设施齐全，服务周到。',
    images: ['https://example.com/hotel1.jpg'],
    status: 'approved',
    merchant_id: 2,
    reject_reason: '',
    roomTypes: [
      { type: '大床房', price: '888' },
    ],
  },
  {
    id: 2,
    name: '商务酒店',
    address: '上海市浦东新区陆家嘴环路1000号',
    star_rating: 4,
    description: '四星级商务酒店，交通便利。',
    images: ['https://example.com/hotel2.jpg'],
    status: 'pending',
    merchant_id: 2,
    reject_reason: '',
    roomTypes: [
      { type: '大床房', price: '588' },
      { type: '双床房', price: '488' },
    ],
  },
  {
    id: 3,
    name: '度假酒店',
    address: '杭州市西湖区南山路1号',
    star_rating: 5,
    description: '五星级度假酒店，环境优美。',
    images: ['https://example.com/hotel3.jpg'],
    status: 'published',
    merchant_id: 2,
    reject_reason: '',
    roomTypes: [
      { type: '大床房', price: '1288' },
      { type: '家庭房', price: '1688' },
      { type: '套房', price: '2088' },
    ],
  },
];
