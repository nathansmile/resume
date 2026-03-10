# 简历智能筛选系统

一个基于 AI 的全栈简历筛选系统，支持批量上传、智能解析、岗位匹配评分和候选人管理。

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 5
- Ant Design
- TanStack Query (React Query)
- React Router v6
- Axios
- Tailwind CSS

### 后端
- NestJS 10 (Node.js 20+)
- TypeScript
- Prisma ORM
- PostgreSQL
- Anthropic Claude API
- pdf-parse

## 功能特性

### ✅ 已实现功能

1. **简历上传与解析**
   - 批量上传 PDF 简历（最多 5 份）
   - 拖拽上传支持
   - PDF 文本提取和清洗
   - 文件格式和大小验证

2. **AI 智能信息提取**
   - 使用 Claude API 提取结构化信息
   - SSE 流式返回，实时展示提取进度
   - 提取基本信息、教育背景、工作经历、技能标签、项目经历

3. **岗位匹配与智能评分**
   - 创建和管理岗位描述（JD）
   - AI 自动评分（技能匹配、经验相关性、教育背景）
   - 生成 AI 评语

4. **候选人管理面板**
   - 候选人列表（分页、搜索、筛选）
   - 候选人详情页
   - 状态管理（待筛选、初筛通过、面试中、已录用、已淘汰）
   - 完整信息展示

## 本地开发环境搭建

### 前置要求

- Node.js 20+
- PostgreSQL 15+
- npm 或 yarn

### 1. 克隆项目

```bash
git clone <repository-url>
cd resume
```

### 2. 后端设置

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入数据库连接和 API 密钥

# 运行数据库迁移
npx prisma migrate dev

# 启动后端服务
npm run start:dev
```

后端将运行在 `http://localhost:3000`

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 启动前端开发服务器
npm run dev
```

前端将运行在 `http://localhost:5173`

### 4. 环境变量配置

#### 后端 (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/resume_db"
ANTHROPIC_API_KEY="your-anthropic-api-key"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

#### 前端 (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

## 项目架构

```
resume/
├── backend/                 # NestJS 后端
│   ├── prisma/             # 数据库 schema 和迁移
│   ├── src/
│   │   ├── modules/
│   │   │   ├── resumes/    # 简历上传模块
│   │   │   ├── candidates/ # 候选人管理模块
│   │   │   ├── jobs/       # 岗位管理模块
│   │   │   ├── evaluations/# 评分模块
│   │   │   ├── ai/         # AI 服务模块
│   │   │   └── prisma/     # Prisma 服务
│   │   └── main.ts
│   └── uploads/            # 上传文件存储
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── lib/            # API 客户端
│   │   ├── types/          # TypeScript 类型
│   │   └── App.tsx
│   └── public/
└── docs/                   # 文档
```

## API 文档

### 简历上传
- `POST /api/resumes/upload` - 批量上传简历
- `GET /api/resumes` - 获取简历列表
- `GET /api/resumes/:id` - 获取简历详情

### 候选人管理
- `GET /api/candidates/:id` - 获取候选人详情
- `PATCH /api/candidates/:id/status` - 更新候选人状态
- `PATCH /api/candidates/:id` - 更新候选人信息
- `GET /api/candidates/:id/extract` (SSE) - AI 提取信息

### 岗位管理
- `POST /api/jobs` - 创建岗位
- `GET /api/jobs` - 获取岗位列表
- `GET /api/jobs/:id` - 获取岗位详情
- `PATCH /api/jobs/:id` - 更新岗位
- `DELETE /api/jobs/:id` - 删除岗位

### 评分
- `POST /api/evaluations` - 创建评分
- `GET /api/evaluations` - 获取评分列表
- `GET /api/evaluations/candidate/:id` - 获取候选人的所有评分
- `GET /api/evaluations/job/:id` - 获取岗位的所有评分

## 关键技术决策

### 1. 为什么选择 NestJS？
- 需求明确要求 Node.js + NestJS
- TypeScript 全栈统一，类型共享方便
- 模块化架构清晰，易于维护

### 2. 为什么选择 Anthropic Claude API？
- 在 Claude Code 环境下开发，与 Claude API 集成更自然
- 支持流式输出（SSE），用户体验更好
- 模块化设计，后期可轻松切换到其他 AI 提供商

### 3. 为什么选择 Prisma？
- TypeScript 原生支持，类型安全
- 迁移管理简单
- 查询 API 直观易用

### 4. 为什么选择 Ant Design？
- 企业级 UI 组件库，功能完整
- 中文文档友好
- 开箱即用的表格、表单、上传等组件

## 部署

### 后端部署（Railway/Render）

1. 创建 PostgreSQL 数据库
2. 设置环境变量
3. 运行 `npx prisma migrate deploy`
4. 启动应用 `npm run start:prod`

### 前端部署（Vercel）

1. 连接 GitHub 仓库
2. 设置构建命令：`npm run build`
3. 设置输出目录：`dist`
4. 配置环境变量 `VITE_API_URL`

## 开发进度

- [x] 项目初始化
- [x] 数据库设计
- [x] 简历上传与解析
- [x] AI 信息提取（SSE）
- [x] 岗位管理
- [x] 评分系统
- [x] 候选人管理 UI
- [ ] PDF 预览功能
- [ ] 候选人对比功能
- [ ] 暗色主题
- [ ] 单元测试
- [ ] E2E 测试
- [ ] 生产环境部署

## 许可证

MIT
