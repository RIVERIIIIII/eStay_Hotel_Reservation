# 易宿酒店预订平台

一个前后端分离的酒店预订平台基础框架，实现商家端的登录、注册、酒店信息管理及图片上传功能。

## 技术栈

### 后端
- Node.js + Express
- MongoDB
- JWT 认证
- bcrypt 密码加密
- multer 文件上传

### 前端
- React 18
- Vite
- React Router
- Axios

## 快速开始

### 环境要求
- Node.js 16+
- MongoDB 4.4+
- npm 或 yarn

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 数据库配置

1. 启动 MongoDB 服务
2. 设置数据库连接（默认：`mongodb://localhost:27017/hotel-booking`）

### 环境变量配置

后端项目根目录创建 `.env` 文件：

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotel-booking
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

### 启动应用

```bash
# 启动后端服务（在 backend 目录）
npm run dev

# 启动前端服务（在 frontend 目录）
npm run dev
```

应用将在以下地址访问：
- 前端：http://localhost:3000
- 后端：http://localhost:5000

## 核心功能

### 用户认证
- 商家注册/登录
- JWT Token 认证
- 基于角色的权限控制（商户/管理员）

### 酒店管理
- 酒店信息添加、编辑、删除
- 酒店状态管理（待审核/已通过/已拒绝）
- 房型信息管理
- 设施服务管理
- 酒店图片上传（支持多张图片，可设置主图）

### 管理员功能
- 酒店信息审核（通过/拒绝）
- 批量管理功能
- 查看所有酒店信息

### 移动端功能
- 酒店搜索
- 酒店列表展示
- 酒店详情查看

## API 文档

### 认证接口

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "merchant1",
  "password": "password123",
  "role": "merchant"
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "merchant1",
  "password": "password123"
}
```

#### 获取当前用户信息
```
GET /api/auth/me
Authorization: Bearer <token>
```

### 酒店管理接口

#### 创建酒店
```
POST /api/hotels
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "测试酒店",
  "name_en": "Test Hotel",
  "address": "测试地址",
  "starRating": 4,
  "price": 300,
  "openingTime": "2024-01-01",
  "description": "酒店描述",
  "roomTypes": [
    {
      "type": "标准大床房",
      "price": 300,
      "description": "房间描述"
    }
  ],
  "amenities": ["免费停车场", "无线网络"],
  "images": ["http://localhost:5000/uploads/hotel-123456789.jpg"],
  "mainImage": "http://localhost:5000/uploads/hotel-123456789.jpg"
}
```

#### 获取酒店列表
```
GET /api/hotels
Authorization: Bearer <token>
```

#### 获取单个酒店详情
```
GET /api/hotels/:id
Authorization: Bearer <token>
```

#### 更新酒店信息
```
PUT /api/hotels/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "更新后的酒店名称",
  "price": 350,
  "images": ["http://localhost:5000/uploads/hotel-123456789.jpg", "http://localhost:5000/uploads/hotel-987654321.jpg"],
  "mainImage": "http://localhost:5000/uploads/hotel-987654321.jpg"
}
```

#### 删除酒店
```
DELETE /api/hotels/:id
Authorization: Bearer <token>
```

#### 上传酒店图片
```
POST /api/hotels/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

# FormData 字段
images: [文件1, 文件2, ...]
```

### 管理员接口

#### 获取待审核酒店列表
```
GET /api/admin/hotels/pending
Authorization: Bearer <token>
```

#### 获取所有酒店列表
```
GET /api/admin/hotels
Authorization: Bearer <token>
```

#### 审核通过酒店
```
PUT /api/admin/hotels/:id/approve
Authorization: Bearer <token>
```

#### 审核拒绝酒店
```
PUT /api/admin/hotels/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "审核不通过原因"
}
```

### 移动端接口

#### 酒店搜索
```
GET /api/mobile/hotels/search
```

#### 获取酒店列表
```
GET /api/mobile/hotels
```

#### 获取酒店详情
```
GET /api/mobile/hotels/:id
```

## 项目结构

```
Hotel-Assistant/
├── backend/           # Node.js 后端
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   │   ├── database.js  # 数据库配置
│   │   │   └── upload.js    # 文件上传配置
│   │   ├── controllers/    # 控制器
│   │   │   ├── adminController.js  # 管理员控制器
│   │   │   ├── authController.js    # 认证控制器
│   │   │   ├── hotelController.js   # 酒店控制器
│   │   │   └── mobileController.js  # 移动端控制器
│   │   ├── middleware/     # 中间件
│   │   │   └── auth.js      # 认证中间件
│   │   ├── models/         # 数据模型
│   │   │   ├── Booking.js   # 预订模型
│   │   │   ├── Hotel.js     # 酒店模型
│   │   │   └── User.js      # 用户模型
│   │   ├── routes/         # 路由定义
│   │   │   ├── admin.js     # 管理员路由
│   │   │   ├── auth.js      # 认证路由
│   │   │   ├── hotels.js    # 酒店路由
│   │   │   └── mobile.js    # 移动端路由
│   │   └── server.js        # 服务器入口
│   ├── uploads/            # 上传文件存储目录
│   ├── .env                # 环境变量配置
│   ├── package-lock.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # 组件
│   │   │   ├── Layout.jsx       # 布局组件
│   │   │   └── ProtectedRoute.jsx  # 受保护路由组件
│   │   ├── contexts/       # 上下文状态
│   │   │   └── AuthContext.jsx  # 认证上下文
│   │   ├── pages/          # 页面
│   │   │   ├── mobile/     # 移动端页面
│   │   │   │   ├── HotelDetailPage.jsx  # 移动端酒店详情
│   │   │   │   ├── HotelListPage.jsx     # 移动端酒店列表
│   │   │   │   └── HotelSearchPage.jsx   # 移动端酒店搜索
│   │   │   ├── AddHotelPage.jsx   # 酒店添加/编辑页面
│   │   │   ├── HotelListPage.jsx  # 酒店列表页面
│   │   │   ├── LoginPage.jsx      # 登录页面
│   │   │   └── RegisterPage.jsx   # 注册页面
│   │   ├── services/       # API 服务
│   │   │   └── api.js      # API 配置
│   │   ├── App.jsx         # 应用入口组件
│   │   ├── index.css       # 全局样式
│   │   ├── main.jsx        # 应用入口文件
│   │   └── mobile.css      # 移动端样式
│   ├── index.html          # HTML 模板
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js      # Vite 配置
├── database/
│   └── init.js             # 数据库初始化脚本
└── test-integration.js     # 集成测试脚本
```

## 开发指南

### 后端开发
- 使用 ES6 模块语法
- 统一的错误处理机制
- 输入参数验证
- 数据库操作使用 Mongoose
- 文件上传使用 multer

### 前端开发
- 函数式组件 + Hooks
- 响应式设计
- 统一的 API 调用入口
- Token 自动管理
- 文件上传使用 FormData

### 图片上传功能说明

1. **支持的图片格式**：JPEG/JPG、PNG、GIF
2. **文件大小限制**：单张图片最大 5MB
3. **上传数量限制**：最多 10 张图片
4. **主图设置**：支持选择一张图片作为主图
5. **图片存储**：上传的图片存储在后端的 `uploads` 目录

## 许可证

MIT License