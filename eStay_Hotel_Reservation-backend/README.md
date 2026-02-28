# eStay 酒店预订系统 - 后端API

## 项目概述

eStay是一个现代化的酒店预订平台，提供完整的酒店预订、管理和用户服务功能。本项目是eStay平台的后端API服务，基于Node.js和Express框架开发，使用MongoDB作为数据库，实现了用户认证、酒店管理、预订系统、评分系统、消息系统等核心功能。

## 技术栈

| 技术/框架 | 版本 | 用途 |
|----------|------|------|
| Node.js | - | 运行环境 |
| Express | ^4.18.2 | Web框架 |
| MongoDB | ^8.0.3 | 数据库 |
| Mongoose | ^8.0.3 | ODM框架 |
| JWT | ^9.0.2 | 用户认证 |
| bcryptjs | ^2.4.3 | 密码加密 |
| Socket.io | ^4.8.3 | 实时消息推送 |
| multer | ^2.0.2 | 文件上传 |
| express-validator | ^7.0.1 | 请求验证 |
| cors | ^2.8.5 | 跨域支持 |
| dotenv | ^16.3.1 | 环境配置 |

## 项目结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   │   ├── database.js  # 数据库连接配置
│   │   └── upload.js    # 文件上传配置
│   ├── controllers/     # 控制器
│   │   ├── adminController.js     # 管理员功能
│   │   ├── authController.js      # 用户认证
│   │   ├── hotelController.js     # 酒店管理
│   │   ├── messageController.js   # 消息管理
│   │   ├── mobileController.js    # 移动端API
│   │   └── ratingController.js    # 评分管理
│   ├── middleware/      # 中间件
│   │   └── auth.js      # 认证中间件
│   ├── models/          # 数据模型
│   │   ├── Booking.js   # 预订模型
│   │   ├── Hotel.js     # 酒店模型
│   │   ├── Message.js   # 消息模型
│   │   ├── Rating.js    # 评分模型
│   │   └── User.js      # 用户模型
│   ├── routes/          # 路由
│   │   ├── admin.js           # 管理员路由
│   │   ├── auth.js            # 认证路由
│   │   ├── booking.js         # 预订路由
│   │   ├── hotels.js          # 酒店管理路由
│   │   ├── message.js         # 消息路由
│   │   ├── mobile.js          # 移动端路由
│   │   ├── publicHotels.js    # 公共酒店查询路由
│   │   └── rating.js          # 评分路由
│   ├── seed/            # 测试数据
│   │   └── test-data.js       # 测试数据生成
│   └── server.js        # 服务器入口
├── test/                # 测试脚本
├── uploads/             # 文件上传目录
├── .env                 # 环境变量
├── .gitignore           # Git忽略文件
├── package.json         # 项目配置
└── README.md            # 项目说明
```

## 安装和运行

### 前提条件

- Node.js (v14.0.0+)
- MongoDB (v4.0+)

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd eStay_Hotel_Reservation/backend
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

创建`.env`文件并配置以下内容：

```env
MONGO_URI=mongodb://localhost:27017/hotel-booking
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

4. **启动开发服务器**

```bash
npm run dev
```

5. **启动生产服务器**

```bash
npm start
```

服务器将在`http://localhost:5000`启动。

## 配置文件

### .env 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| MONGO_URI | MongoDB连接URI | mongodb://localhost:27017/hotel-booking |
| PORT | 服务器端口 | 5000 |
| JWT_SECRET | JWT签名密钥 | your_jwt_secret_key_here |

### MongoDB配置

MongoDB数据存储路径：`D:\MyDoc\MongoDB\Server\4.4\data`
MongoDB日志路径：`D:\MyDoc\MongoDB\Server\4.4\log\mongod.log`

## API接口文档

### 认证接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 否 |
| POST | /api/auth/login | 用户登录 | 否 |
| POST | /api/auth/forget-password | 忘记密码 | 否 |
| POST | /api/auth/reset-password | 重置密码 | 否 |
| GET | /api/auth/me | 获取当前用户 | 是 |

### 酒店接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/public/hotels | 获取公共酒店列表 | 否 |
| GET | /api/public/hotels/:id | 获取酒店详情 | 否 |
| POST | /api/hotels | 创建酒店 | 是 (merchant/admin) |
| PUT | /api/hotels/:id | 更新酒店 | 是 (merchant/admin) |
| DELETE | /api/hotels/:id | 删除酒店 | 是 (merchant/admin) |
| GET | /api/hotels | 获取商家酒店列表 | 是 (merchant) |

### 预订接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/booking | 创建预订 | 是 |
| GET | /api/booking | 获取用户预订列表 | 是 |
| GET | /api/booking/:id | 获取预订详情 | 是 |
| PUT | /api/booking/:id | 更新预订 | 是 |
| DELETE | /api/booking/:id | 取消预订 | 是 |

### 评分接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/rating/:hotelId | 创建或更新评分 | 是 |
| GET | /api/rating/hotel/:hotelId | 获取酒店评分 | 否 |
| GET | /api/rating/user/:hotelId | 获取用户对酒店的评分 | 是 |
| DELETE | /api/rating/:ratingId | 删除评分 | 是 |

### 消息接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/message | 获取消息列表 | 是 |
| POST | /api/message | 发送消息 | 是 |
| PUT | /api/message/:messageId/read | 标记消息为已读 | 是 |
| GET | /api/message/unread-count | 获取未读消息数量 | 是 |

### 移动端接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/mobile/hotels | 移动端酒店列表 | 否 |
| GET | /api/mobile/hotels/featured | 推荐酒店 | 否 |
| GET | /api/mobile/hotels/:id | 移动端酒店详情 | 否 |

### 管理员接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/admin/hotels | 获取所有酒店 | 是 (admin) |
| PUT | /api/admin/hotels/:id/status | 更新酒店状态 | 是 (admin) |
| GET | /api/admin/users | 获取所有用户 | 是 (admin) |
| PUT | /api/admin/users/:id/role | 更新用户角色 | 是 (admin) |

## 核心功能

### 1. 用户认证与权限管理

- 支持用户名或邮箱登录
- JWT令牌认证
- 角色权限控制（user/merchant/admin）
- 忘记密码功能（验证码验证）

### 2. 酒店管理

- 酒店创建、更新、删除
- 酒店状态管理（pending/approved/rejected/published/offline）
- 酒店图片上传
- 地理位置支持（经纬度）

### 3. 预订系统

- 房间预订功能
- 入住日期选择
- 预订状态管理（pending/confirmed/cancelled/completed）
- 自动计算价格和入住天数

### 4. 评分系统

- 用户对酒店评分（0-5分）
- 自动计算酒店平均评分
- 评分评论功能
- 防止重复评分

### 5. 消息系统

- 用户间消息发送
- 实时消息推送（Socket.io）
- 消息已读状态管理
- 未读消息计数

### 6. 搜索与筛选

- 酒店搜索（关键词、位置、品牌）
- 价格范围筛选
- 星级筛选
- 设施标签筛选
- 距离排序和计算

## 开发和测试

### 测试脚本

测试脚本位于`test/`目录下，包含以下测试：

- 数据库连接测试
- 用户登录测试
- 消息发送测试
- WebSocket测试
- 管理员功能测试

运行测试脚本示例：

```bash
node test/check-db-connection.js
node test/test-login.js
```

### 代码规范

- 使用ES6+语法
- 遵循RESTful API设计规范
- 代码注释清晰

## 部署

### 生产环境部署

1. **安装依赖**

```bash
npm install --production
```

2. **设置环境变量**

确保生产环境的`.env`文件配置正确：

```env
MONGO_URI=mongodb://localhost:27017/hotel-booking
PORT=5000
JWT_SECRET=your_secure_jwt_secret
```

3. **启动服务器**

```bash
npm start
```

### 反向代理配置

推荐使用Nginx作为反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 数据备份与恢复

### 备份数据

```bash
mongodump --db hotel-booking --out /path/to/backup
```

### 恢复数据

```bash
mongorestore --db hotel-booking /path/to/backup/hotel-booking
```

## 许可证

ISC

## 联系方式

如有问题或建议，请联系项目团队。

---


