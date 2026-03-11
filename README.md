# 食谱健康APP

一款集食材价格查询、智能食谱推荐、减肥计划定制、体重管理于一体的综合性健康饮食管理应用。

## 技术栈

### 前端
- **框架**: uni-app (Vue3)
- **状态管理**: Pinia
- **UI**: 自定义组件 + uni-ui
- **支持平台**: 微信小程序、H5、iOS App、Android App

### 后端
- **框架**: Node.js + Express
- **数据库**: SQLite (开发) / MySQL (生产)
- **认证**: JWT

## 项目结构

```
recipe-health-app/
├── server/                    # 后端服务
│   ├── src/
│   │   ├── app.js            # 应用入口
│   │   ├── database/
│   │   │   └── init.js       # 数据库初始化
│   │   └── routes/           # API路由
│   │       ├── auth.js       # 认证接口
│   │       ├── ingredients.js # 食材价格接口
│   │       ├── recipes.js    # 食谱接口
│   │       ├── dietPlans.js  # 减肥计划接口
│   │       ├── weight.js     # 体重记录接口
│   │       └── users.js      # 用户接口
│   ├── package.json
│   └── .env
│
└── client/                    # 前端应用
    ├── pages/                 # 页面
    │   ├── index/            # 首页
    │   ├── ingredients/      # 食材价格
    │   ├── recipe/           # 食谱相关
    │   ├── diet-plan/        # 减肥计划
    │   ├── weight/           # 体重记录
    │   ├── user/             # 用户中心
    │   └── login/            # 登录
    ├── stores/               # Pinia状态管理
    ├── utils/                # 工具函数
    ├── components/           # 公共组件
    ├── static/               # 静态资源
    ├── App.vue
    ├── main.js
    ├── pages.json
    └── manifest.json
```

## 快速开始

### 环境要求
- Node.js >= 16.0
- npm >= 8.0
- 微信开发者工具 (小程序开发)

### 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 启动后端服务

```bash
cd server
npm run dev
```

后端服务将在 http://localhost:3000 运行

### 启动前端应用

```bash
cd client

# H5模式
npm run dev:h5

# 微信小程序模式
npm run dev:mp-weixin

# App模式
npm run dev:app
```

### 初始化数据库

```bash
cd server
npm run init-db
```

## 功能模块

### 1. 每日食材价格更新
- 实时查看当地超市/市场食材价格
- 价格涨跌幅排行榜
- 食材价格趋势图
- 按分类筛选食材

### 2. 每日推荐一日三餐
- 根据用户健康数据智能推荐
- 支持自定义目标热量
- 营养均衡配比
- 食谱详情包含做法、食材、营养信息

### 3. 减肥计划食谱
- 设置减重目标和周期
- 自动生成每日食谱计划
- 显示预估花费
- 进度追踪

### 4. 体重记录
- 每日体重记录
- 体重变化曲线图
- 数据统计分析

### 5. 随机推荐
- 单顿推荐
- 一日三餐随机推荐
- 菜系筛选

## API接口

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/wechat-login` - 微信登录

### 食材
- `GET /api/ingredients/list` - 获取食材列表
- `GET /api/ingredients/categories` - 获取食材分类
- `GET /api/ingredients/price-trend/:id` - 获取价格趋势
- `GET /api/ingredients/top-changes` - 获取价格涨跌榜

### 食谱
- `GET /api/recipes/list` - 获取食谱列表
- `GET /api/recipes/detail/:id` - 获取食谱详情
- `POST /api/recipes/daily-menu` - 生成每日食谱
- `POST /api/recipes/random` - 随机推荐

### 减肥计划
- `POST /api/diet-plans/create` - 创建计划
- `GET /api/diet-plans/my-plans` - 获取我的计划
- `GET /api/diet-plans/detail/:id` - 获取计划详情

### 体重记录
- `POST /api/weight/record` - 记录体重
- `GET /api/weight/history` - 获取历史记录
- `GET /api/weight/today` - 获取今日记录

### 用户
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息
- `PUT /api/users/preferences` - 更新饮食偏好
- `GET /api/users/favorites` - 获取收藏食谱

## 部署说明

### 微信小程序部署
1. 在微信开发者工具中导入 `client/dist/dev/mp-weixin` 目录
2. 在 `manifest.json` 中配置小程序 appid
3. 上传代码并提交审核

### H5部署
1. 执行 `npm run build:h5`
2. 将 `dist/build/h5` 目录部署到服务器

### App打包
1. 使用 HBuilderX 打开项目
2. 选择 发行 -> 原生App-云打包

### 后端部署
1. 修改 `.env` 文件配置生产环境参数
2. 使用 PM2 管理进程: `pm2 start src/app.js --name recipe-health-api`

## 注意事项

1. 食材价格数据需要对接真实数据源或定期更新
2. 生产环境建议使用 MySQL 替代 SQLite
3. 建议配置 HTTPS 证书
4. 小程序需要配置合法域名

## License

MIT
