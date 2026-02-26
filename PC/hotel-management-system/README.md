# 酒店管理系统 - PC端

## 项目简介

酒店管理系统是一个为酒店商户和平台管理员设计的PC端应用，实现了酒店的创建、编辑、审核、发布等完整管理流程，以及商户与用户的在线沟通功能。

### 核心功能

- **商户功能**
  - 酒店列表管理（查看、编辑、删除）
  - 酒店创建与编辑（包含基本信息、房型、设施、图片等）
  - 在线客服聊天
  - 联系电话字段（新增必填项）

- **管理员功能**
  - 酒店审核（通过/拒绝）
  - 酒店详情查看
  - 酒店发布与下线管理
  - 待审核酒店列表

### 技术栈

- **前端框架**：React 19.2.0 + Vite 7.3.1
- **路由管理**：React Router 7.13.0
- **状态管理**：Context API
- **HTTP客户端**：Axios 1.13.5
- **样式处理**：CSS
- **后端服务**：Node.js + Express（独立仓库）

## 快速开始

### 前置要求

- Node.js 14.0 或更高版本
- npm 6.0 或更高版本

### 安装与运行

1. **克隆项目**

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动前端开发服务器**
   ```bash
   npm run dev
   ```

4. **启动后端服务**
   请参考后端项目的 README 文档

5. **访问应用**
   前端默认地址：http://localhost:5173/
   后端默认地址：http://localhost:5000/

### 测试账户

- **管理员账户**
  - 用户名：admin
  - 密码：admin123

- **商户账户**
  - 用户名：merchant
  - 密码：merchant123

## 项目结构

```
hotel-management-system/
├── src/
│   ├── components/          # 通用组件
│   │   └── Navbar.jsx       # 导航栏组件
│   ├── context/             # 上下文管理
│   │   └── AuthContext.jsx  # 认证上下文
│   ├── pages/               # 页面组件
│   │   ├── Admin/           # 管理员页面
│   │   │   ├── HotelDetail.jsx       # 酒店详情
│   │   │   ├── HotelManagement.jsx   # 酒店管理
│   │   │   └── HotelReview.jsx        # 酒店审核
│   │   ├── Auth/            # 认证页面
│   │   │   ├── Login.jsx     # 登录页面
│   │   │   ├── Register.jsx  # 注册页面
│   │   │   └── ForgotPassword.jsx  # 忘记密码
│   │   └── Merchant/        # 商户页面
│   │       ├── Chat.jsx      # 在线客服
│   │       ├── HotelForm.jsx # 酒店表单
│   │       └── HotelList.jsx # 酒店列表
│   ├── services/            # 服务层
│   │   ├── adminService.js  # 管理员服务
│   │   ├── apiConfig.js     # API配置
│   │   ├── authService.js   # 认证服务
│   │   ├── chatService.js   # 聊天服务
│   │   ├── hotelService.js  # 酒店服务
│   │   └── mockData.js      # 模拟数据（备用）
│   ├── App.css              # 应用样式
│   ├── App.jsx              # 应用主组件
│   ├── index.css            # 全局样式
│   └── main.jsx             # 应用入口
├── package.json             # 项目配置
└── vite.config.js           # Vite 配置
```

## 后端服务

本项目需要配合后端服务运行，后端项目地址：
- 路径：`d:\BaiduNetdiskDownload\Git\PC\eStay_Hotel_Reservation\backend`
- 技术栈：Node.js + Express + MongoDB

## 功能特性

- **完整的酒店管理流程**：从创建到审核、发布的全流程管理
- **多角色权限控制**：商户和管理员分离的功能权限
- **实时在线聊天**：商户与用户的沟通渠道
- **响应式设计**：适配不同屏幕尺寸
- **美观的用户界面**：现代化的设计风格和用户体验
- **完善的表单验证**：确保数据的准确性和完整性

## 开发与部署

### 开发环境

- 前端开发服务器：`npm run dev`
- 代码格式化：`npm run format`
- 代码检查：`npm run lint`

### 生产环境

1. **构建生产版本**
   ```bash
   npm run build
   ```

2. **部署**
   构建产物位于 `dist` 目录，可部署到任何静态文件服务器。

## 联系与支持

如有任何问题或建议，欢迎联系我们。