# 易宿酒店预订平台需求文档

## 项目概述
构建一个前后端分离的酒店预订平台基础框架，实现商家端的登录、注册及酒店信息管理功能。

## 技术架构方案
- **前端技术栈**: React + Vite + React Router + Axios
- **后端技术栈**: Node.js + Express + MongoDB + JWT
- **通信协议**: RESTful API

## 核心功能需求
### 1. 商家端管理功能（PC端）
- 商家注册/登录系统（角色区分：商户/管理员）
- 酒店信息CRUD操作（录入、编辑、修改）
- 酒店信息审核流程（管理员功能）

### 2. 用户端预定流程（移动端）- 后续扩展
- 酒店查询与搜索功能
- 酒店列表展示
- 酒店详情页面

## 数据库设计
### 用户模型 (User)
- username: String (唯一)
- password: String (加密存储)
- role: String ('merchant' | 'admin')
- createdAt: Date

### 酒店信息模型 (Hotel)
- name: String (中英文)
- address: String
- starRating: Number
- roomTypes: Array
- price: Number
- openingTime: Date
- description: String
- status: String ('pending' | 'approved' | 'rejected')
- createdBy: ObjectId (关联User)
- createdAt: Date
- updatedAt: Date

## API接口设计
### 认证相关接口
- POST /api/auth/register - 商家注册
- POST /api/auth/login - 商家登录
- GET /api/auth/me - 获取当前用户信息

### 酒店管理接口
- POST /api/hotels - 创建酒店信息
- GET /api/hotels - 获取酒店列表
- GET /api/hotels/:id - 获取酒店详情
- PUT /api/hotels/:id - 更新酒店信息
- DELETE /api/hotels/:id - 删除酒店信息

### 管理员接口
- GET /api/admin/hotels - 获取待审核酒店列表
- PUT /api/admin/hotels/:id/approve - 审核通过酒店
- PUT /api/admin/hotels/:id/reject - 审核拒绝酒店

## 文件结构规划
```
app/
├── backend/ (Node.js后端)
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   ├── package.json
│   └── .env
├── frontend/ (React前端)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── database/ (数据库脚本)
└── README.md
```

## 实现细节
### 后端关键技术点
- 使用bcrypt进行密码加密
- JWT token认证机制
- MongoDB连接配置
- 输入参数验证中间件
- 错误处理统一封装

### 前端关键技术点
- React函数式组件
- React Router路由管理
- Axios HTTP请求封装
- 本地存储token管理
- 表单验证和错误提示

## 边界条件与异常处理
- 用户名重复注册校验
- 密码强度验证
- JWT token过期处理
- 权限校验（商户只能操作自己的酒店）
- 数据库连接异常处理

## 数据流动路径
1. 商家注册 → 数据库存储加密密码
2. 商家登录 → 生成JWT token → 前端存储
3. 添加酒店 → token验证 → 数据库存储
4. 查看酒店列表 → token验证 → 数据返回

## 预期成果
- 完整的商家注册登录系统
- 酒店信息管理功能
- RESTful API接口文档
- 可扩展的前后端项目结构