# GitHub Observe

智能管理你的 GitHub Stars — 自动同步、AI 分析、标签分类、数据可视化。

## 功能特性

- **OAuth 登录** — 支持 GitHub / Google 一键登录，自动同步用户信息
- **Stars 同步** — 自动拉取 GitHub Starred 仓库，支持增量同步
- **AI 智能分析** — 基于火山引擎 AI 自动分析项目用途、分类、标签
- **标签管理** — 自动生成标签，按分类浏览和筛选项目
- **收藏与笔记** — 收藏重点项目，添加个人笔记
- **分享功能** — 生成带过期时间的分享链接
- **数据看板** — 语言分布、标签分布、最近项目等可视化统计
- **深色/浅色主题** — 支持系统主题自动跟随

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| UI | shadcn/ui + Radix UI + Tailwind CSS |
| 动画 | Framer Motion |
| 图表 | Recharts |
| 图标 | Lucide React |
| 认证 | NextAuth.js (GitHub + Google OAuth) |
| 数据库 | PostgreSQL (Prisma ORM) |
| AI | 火山引擎 (ByteDance) |
| 加密 | AES-256-GCM |
| 部署 | Vercel |

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL
- pnpm (推荐)

### 安装

```bash
pnpm install
```

### 环境变量

复制 `.env.example` 为 `.env.local`，配置以下变量：

```env
# 数据库
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# 加密密钥 (32字节 hex)
ENCRYPTION_KEY="..."

# 火山引擎 AI
ARK_API_KEY="..."
ARK_MODEL_ID="..."
```

### 初始化数据库

```bash
pnpm db:push
pnpm db:generate
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── api/                # API 路由
│   │   ├── auth/           # NextAuth 认证
│   │   ├── dashboard/      # 数据看板
│   │   ├── projects/       # 项目 CRUD
│   │   ├── share/          # 分享功能
│   │   ├── sync/           # GitHub Stars 同步
│   │   └── user/           # 用户设置
│   ├── login/              # 登录页
│   ├── projects/           # 项目列表页
│   ├── project/[id]/       # 项目详情页
│   ├── tags/               # 标签管理页
│   ├── sync/               # 同步页
│   └── settings/           # 设置页
├── components/
│   ├── ui/                 # shadcn/ui 基础组件
│   └── layout/             # 布局组件 (Sidebar, AuthLayout)
├── providers/              # Context Providers
│   ├── auth-provider.tsx   # NextAuth 会话管理
│   └── theme-provider.tsx  # 主题管理
└── lib/
    ├── api.ts              # API 客户端
    ├── auth.ts             # 服务端认证工具
    ├── ai.ts               # AI 分析
    ├── encrypt.ts          # AES-256-GCM 加密
    ├── github.ts           # GitHub API 客户端
    ├── next-auth.ts        # NextAuth 配置
    ├── prisma.ts           # Prisma 客户端
    └── utils.ts            # 工具函数

prisma/
└── schema.prisma           # 数据库模型
```

## 部署

项目已配置 Vercel 部署，`vercel.json` 中的 build 命令会自动执行 `prisma db push`。

1. 在 Vercel 中导入 GitHub 仓库
2. 配置环境变量
3. 部署

## License

MIT
