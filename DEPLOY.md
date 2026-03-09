# Vercel 部署指南

## 快速部署

### 方式一：Vercel CLI 部署

```bash
npm i -g vercel
vercel
```

### 方式二：Git 集成部署

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（见下方）

## 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| DATABASE_URL | Supabase PostgreSQL 连接字符串 | postgresql://... |
| NEXTAUTH_SECRET | NextAuth 密钥 | 生成随机字符串 |
| ENCRYPTION_KEY | Token 加密密钥 | 32位随机字符串 |
| VOLCANO_API_KEY | 火山引擎 API Key | 可选 |
| VOLCANO_ENDPOINT_ID | 火山引擎 Endpoint ID | 可选 |

### 生成密钥

```bash
# 生成 NEXTAUTH_SECRET
openssl rand -base64 32

# 生成 ENCRYPTION_KEY
openssl rand -hex 32
```

## 数据库设置

1. 在 Supabase 创建 PostgreSQL 数据库
2. 获取连接字符串（pooler 格式）
3. 在 Vercel 环境变量中配置
4. 运行 `npx prisma db push` 初始化表结构

## 部署后检查

- [ ] 登录功能正常
- [ ] GitHub Token 配置正常
- [ ] 同步功能正常
- [ ] 项目列表展示正常
- [ ] 标签筛选正常
