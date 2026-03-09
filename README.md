# GitHub Stars Manager

智能管理你的 GitHub Stars，通过 AI 自动分析和分类项目。

## 功能特性

- 用户登录注册
- GitHub Token 配置
- 自动同步 GitHub Stars
- AI 多维度标签分析
- 项目筛选和搜索

## 技术栈

- Next.js 14 + React
- Prisma + PostgreSQL
- TailwindCSS
- 火山豆包 AI

## 本地开发

\`\`\`bash
npm install
npm run db:push
npm run dev
\`\`\`

## 环境变量

- DATABASE_URL - PostgreSQL 连接字符串
- NEXTAUTH_SECRET - NextAuth 密钥
- VOLCANO_API_KEY - 火山豆包 API Key
- VOLCANO_ENDPOINT_ID - 火山豆包 Endpoint ID
- ENCRYPTION_KEY - Token 加密密钥

## 部署

项目支持 Vercel 一键部署。
