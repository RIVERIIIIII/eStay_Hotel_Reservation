# 易宿酒店预订平台

一个前后端分离的酒店预订平台基础框架，实现商家端的登录、注册及酒店信息管理功能。

## 技术栈

### 后端
- Node.js + Express
- MongoDB
- JWT 认证
- bcrypt 密码加密

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

### 管理员功能
- 酒店信息审核
- 批量管理功能

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
  "amenities": ["免费停车场", "无线网络"]
}
```

#### 获取酒店列表
```
GET /api/hotels
Authorization: Bearer <token>
```

## 项目结构

```
app/
├── backend/           # Node.js 后端
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   ├── middleware/     # 中间件
│   │   └── config/         # 配置文件
│   └── package.json
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API 服务
│   │   └── contexts/       # 上下文状态
│   └── package.json
└── database/          # 数据库脚本
```

## 开发指南

### 后端开发
- 使用 ES6 模块语法
- 统一的错误处理机制
- 输入参数验证
- 数据库操作使用 Mongoose

### 前端开发
- 函数式组件 + Hooks
- 响应式设计
- 统一的 API 调用入口
- Token 自动管理

## 许可证

MIT License]]