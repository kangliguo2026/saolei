# 在线扫雷游戏

一个带登录注册功能的在线扫雷游戏，支持三种难度、排行榜系统，前后端完整。

## 技术栈

- **前端**: Next.js 14 + React 18
- **后端**: Next.js API Routes (Node.js Serverless)
- **数据库**: Vercel KV (Upstash Redis)
- **认证**: JWT + bcryptjs (httpOnly Cookie)
- **部署**: Vercel

## 功能

- 用户注册/登录/登出
- 三种难度：简单 (9x9, 10雷) / 中等 (16x16, 40雷) / 困难 (16x30, 99雷)
- 计时器、地雷计数器
- 右键标记旗帜 / 移动端长按标记
- 标记模式切换（移动端友好）
- 胜利后自动保存成绩
- 排行榜系统
- 首次点击安全（不会踩雷）

## 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量文件并填写
cp .env.example .env.local

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入该仓库
3. 在 Vercel 项目设置中创建 KV Storage（Storage -> Create KV）
4. 确保 JWT_SECRET 环境变量已设置
5. 部署完成

## 环境变量

| 变量 | 说明 |
|------|------|
| KV_URL / KV_REST_API_URL | Vercel KV 自动配置 |
| KV_REST_API_TOKEN | Vercel KV 自动配置 |
| JWT_SECRET | JWT 签名密钥，请使用强随机字符串 |

## 项目结构

```
saolei/
├── components/
│   ├── Minesweeper.js    # 扫雷游戏组件
│   ├── Navbar.js          # 导航栏
│   └── withAuth.js        # 路由守卫 HOC
├── lib/
│   ├── db.js              # KV 数据库操作
│   ├── auth.js            # JWT 认证工具
│   └── gameLogic.js        # 扫雷游戏逻辑
├── pages/
│   ├── _app.js            # App 组件
│   ├── _document.js       # Document 组件
│   ├── index.js           # 首页
│   ├── login.js           # 登录页
│   ├── register.js        # 注册页
│   ├── game.js            # 游戏页（需登录）
│   ├── leaderboard.js     # 排行榜
│   └── api/
│       ├── auth/
│       │   ├── register.js  # 注册 API
│       │   ├── login.js     # 登录 API
│       │   ├── me.js        # 获取当前用户
│       │   └── logout.js    # 登出 API
│       └── scores.js        # 分数 API
├── styles/
│   └── globals.css        # 全局样式
├── package.json
├── next.config.js
└── .env.example
```
