# 食谱健康APP - Supabase 配置指南

## 第一步：创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并登录/注册
2. 点击 **"New Project"** 创建新项目
3. 填写项目信息：
   - **Name**: recipe-health-app
   - **Database Password**: 设置一个强密码（记住它）
   - **Region**: 选择离你最近的区域（如 Singapore）
4. 点击 **"Create new project"**，等待项目创建完成（约2分钟）

## 第二步：获取 API 密钥

1. 项目创建后，进入 **Settings** > **API**
2. 复制以下信息：
   - **Project URL** → 这就是 `SUPABASE_URL`
   - **anon public** key → 这就是 `SUPABASE_ANON_KEY`

## 第三步：创建数据库表

1. 进入 **SQL Editor**
2. 点击 **"New query"**
3. 复制 `database/schema.sql` 文件的全部内容
4. 粘贴到编辑器中
5. 点击 **"Run"** 执行SQL

## 第四步：配置环境变量

### 本地开发
1. 复制 `server/.env.example` 为 `server/.env`
2. 填入你的 Supabase 信息：
```env
SUPABASE_URL=https://你的项目ID.supabase.co
SUPABASE_ANON_KEY=你的anon_key
JWT_SECRET=随便设置一个复杂的字符串
```

### Vercel 部署
1. 进入 Vercel 项目设置
2. 找到 **Environment Variables**
3. 添加以下变量：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `JWT_SECRET`

## 第五步：安装依赖并启动

```bash
cd server
npm install
npm run dev
```

## 验证配置

访问 http://localhost:3000/api/health 应该返回：
```json
{"status":"ok","message":"服务运行正常"}
```

## 常见问题

### Q: Supabase 连接失败？
A: 检查 URL 和 Key 是否正确复制，注意不要有多余空格

### Q: 数据库表创建失败？
A: 确保 SQL 语句完整复制，可以分批执行

### Q: Vercel 部署后数据不持久？
A: 确保在 Vercel 环境变量中正确配置了 Supabase 信息
