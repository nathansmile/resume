# 简历智能筛选系统 - 开发任务清单

## 阶段一：项目初始化

### 1.1 项目结构搭建
- [x] 创建项目根目录结构
- [ ] 初始化 Git 仓库配置
- [ ] 创建 .gitignore 文件

### 1.2 后端初始化 (NestJS)
- [ ] 初始化 NestJS 项目
- [ ] 配置 TypeScript 和 ESLint
- [ ] 安装核心依赖
  - [ ] @nestjs/platform-express
  - [ ] @nestjs/config
  - [ ] @prisma/client
  - [ ] pdf-parse
  - [ ] @anthropic-ai/sdk
  - [ ] class-validator, class-transformer
  - [ ] ioredis
- [ ] 配置环境变量 (.env)
- [ ] 设置 Prisma ORM
- [ ] 创建基础模块结构

### 1.3 前端初始化 (Vite + React)
- [ ] 初始化 Vite + React + TypeScript 项目
- [ ] 配置 Tailwind CSS
- [ ] 安装 UI 组件库
  - [ ] antd
  - [ ] shadcn/ui (可选)
  - [ ] @radix-ui/react-*
- [ ] 安装核心依赖
  - [ ] react-router-dom
  - [ ] @tanstack/react-query
  - [ ] zustand
  - [ ] react-hook-form + zod
  - [ ] recharts
  - [ ] react-pdf
  - [ ] react-dropzone
  - [ ] axios
- [ ] 配置路由结构
- [ ] 创建基础布局组件

## 阶段二：数据库设计

### 2.1 Prisma Schema 设计
- [ ] 定义 Candidate 模型（候选人）
- [ ] 定义 Education 模型（教育背景）
- [ ] 定义 WorkExperience 模型（工作经历）
- [ ] 定义 Project 模型（项目经历）
- [ ] 定义 JobDescription 模型（岗位描述）
- [ ] 定义 Evaluation 模型（评分记录）
- [ ] 定义关系和索引
- [ ] 运行 Prisma migrate

### 2.2 数据库初始化
- [ ] 配置 PostgreSQL 连接
- [ ] 创建数据库
- [ ] 运行初始迁移
- [ ] 配置 Redis 连接

## 阶段三：模块一 - 简历上传与解析

### 3.1 后端实现
- [ ] 创建 ResumesModule
- [ ] 实现文件上传端点 (POST /api/resumes/upload)
  - [ ] 配置 multer 文件存储
  - [ ] 文件格式验证（PDF only）
  - [ ] 文件大小限制（10MB）
  - [ ] 批量上传支持（最多5个）
- [ ] 实现 PDF 解析服务
  - [ ] 使用 pdf-parse 提取文本
  - [ ] 文本清洗和格式化
  - [ ] 多页 PDF 支持
- [ ] 实现文件存储服务
  - [ ] 本地磁盘存储
  - [ ] 文件路径管理
- [ ] 保存简历记录到数据库

### 3.2 前端实现
- [ ] 创建上传页面组件
- [ ] 实现拖拽上传组件 (react-dropzone)
  - [ ] 拖拽区域 UI
  - [ ] 文件选择器
  - [ ] 格式限制提示
- [ ] 实现批量上传功能
  - [ ] 文件列表展示
  - [ ] 上传进度条
  - [ ] 上传状态管理（pending/uploading/success/error）
- [ ] 实现 PDF 缩略图预览 (react-pdf)
- [ ] 错误处理和用户反馈

## 阶段四：模块二 - AI 智能信息提取

### 4.1 后端实现
- [ ] 创建 AIService
  - [ ] 配置 Anthropic Claude API
  - [ ] 设计信息提取 Prompt
  - [ ] 实现流式调用
- [ ] 实现 SSE 端点 (GET /api/resumes/:id/extract)
  - [ ] 使用 @Sse() 装饰器
  - [ ] 流式返回提取结果
  - [ ] 错误处理
- [ ] 实现信息提取逻辑
  - [ ] 基本信息提取
  - [ ] 教育背景提取
  - [ ] 工作经历提取
  - [ ] 技能标签提取
  - [ ] 项目经历提取（加分项）
- [ ] 保存提取结果到数据库
- [ ] 实现手动修正接口 (PATCH /api/resumes/:id)

### 4.2 前端实现
- [ ] 创建信息提取页面
- [ ] 实现 SSE 客户端
  - [ ] EventSource 连接
  - [ ] 实时数据接收
  - [ ] 连接状态管理
- [ ] 实现逐步渲染 UI
  - [ ] 基本信息卡片
  - [ ] 教育背景列表
  - [ ] 工作经历时间线
  - [ ] 技能标签云
  - [ ] 项目经历卡片
- [ ] 实现手动修正功能（加分项）
  - [ ] 可编辑表单
  - [ ] 保存修正
- [ ] Loading 状态和骨架屏

## 阶段五：模块三 - 岗位匹配与智能评分

### 5.1 后端实现
- [ ] 创建 JobDescriptionsModule
- [ ] 实现 JD 管理接口
  - [ ] 创建 JD (POST /api/job-descriptions)
  - [ ] 获取 JD 列表 (GET /api/job-descriptions)
  - [ ] 更新 JD (PATCH /api/job-descriptions/:id)
- [ ] 创建 EvaluationsModule
- [ ] 实现评分算法
  - [ ] 技能匹配度计算（40%）
  - [ ] 经验相关性计算（35%）
  - [ ] 教育背景契合度（25%）
  - [ ] 综合评分计算
- [ ] 实现 AI 评分接口 (POST /api/evaluations/score)
  - [ ] 调用 Claude API 生成评语
  - [ ] 计算各维度评分
  - [ ] 保存评分结果
- [ ] 实现多 JD 对比（加分项）

### 5.2 前端实现
- [ ] 创建 JD 编辑器页面
  - [ ] 岗位描述输入
  - [ ] 必备技能标签输入
  - [ ] 加分技能标签输入
  - [ ] 保存和管理 JD
- [ ] 创建评分页面
  - [ ] 选择候选人和 JD
  - [ ] 触发评分
  - [ ] 展示评分结果
- [ ] 实现评分可视化
  - [ ] 雷达图（技能、经验、教育）
  - [ ] 环形进度条（综合评分）
  - [ ] 柱状图对比
- [ ] 展示 AI 评语
- [ ] 多 JD 对比功能（加分项）

## 阶段六：模块四 - 候选人管理面板

### 6.1 后端实现
- [ ] 实现候选人列表接口 (GET /api/candidates)
  - [ ] 分页支持
  - [ ] 排序（评分、时间）
  - [ ] 筛选（技能、状态）
  - [ ] 关键字搜索
- [ ] 实现候选人详情接口 (GET /api/candidates/:id)
- [ ] 实现状态管理接口 (PATCH /api/candidates/:id/status)
- [ ] 实现候选人对比接口 (POST /api/candidates/compare)

### 6.2 前端实现
- [ ] 创建候选人列表页
  - [ ] 表格视图（Ant Design Table）
  - [ ] 卡片视图
  - [ ] 视图切换
- [ ] 实现筛选和排序
  - [ ] 评分排序
  - [ ] 时间排序
  - [ ] 技能筛选
  - [ ] 状态筛选
- [ ] 实现搜索功能
  - [ ] 关键字搜索
  - [ ] 实时搜索
- [ ] 实现分页/虚拟滚动
- [ ] 创建候选人详情页
  - [ ] 完整信息展示
  - [ ] 评分详情
  - [ ] PDF 预览
- [ ] 实现状态管理
  - [ ] 状态选择器
  - [ ] 状态变更动画
  - [ ] 状态流转记录
- [ ] 实现候选人对比功能（加分项）
  - [ ] 选择 2-3 人
  - [ ] 并排对比视图
  - [ ] 各维度对比

## 阶段七：前端工程质量优化

### 7.1 组件化架构
- [ ] 拆分可复用组件
  - [ ] FileUploader
  - [ ] ResumeCard
  - [ ] ScoreChart
  - [ ] StatusBadge
  - [ ] SearchBar
  - [ ] FilterPanel
- [ ] 创建 hooks
  - [ ] useResumes
  - [ ] useEvaluations
  - [ ] useSSE
  - [ ] useDebounce

### 7.2 UI/UX 优化
- [ ] 响应式布局（≥1280px）
- [ ] 全局错误处理
- [ ] Loading 状态管理
- [ ] 骨架屏加载态（加分项）
- [ ] 暗色/亮色主题切换（加分项）
- [ ] 键盘快捷键支持（加分项）
- [ ] 动画过渡效果（加分项）

### 7.3 代码质量
- [ ] TypeScript 类型完善
- [ ] ESLint 配置和修复
- [ ] 代码格式化（Prettier）
- [ ] 组件文档注释

## 阶段八：测试与部署

### 8.1 测试
- [ ] 后端单元测试
- [ ] 前端组件测试
- [ ] E2E 测试（可选）
- [ ] API 接口测试

### 8.2 部署准备
- [ ] 配置生产环境变量
- [ ] 构建优化
- [ ] Docker 配置（可选）
- [ ] 数据库迁移脚本

### 8.3 部署
- [ ] 部署 PostgreSQL 数据库（Railway）
- [ ] 部署后端（Railway/Render）
- [ ] 部署前端（Vercel）
- [ ] 配置 CORS
- [ ] 配置域名和 HTTPS

### 8.4 文档
- [ ] 完善 README.md
  - [ ] 项目架构说明
  - [ ] 技术选型及理由
  - [ ] 本地开发环境搭建指南
  - [ ] 部署方式说明
  - [ ] 关键技术决策与思考
- [ ] API 文档（Swagger）
- [ ] 部署说明文档
- [ ] 功能演示截图/视频

## 优先级说明

### P0 - 必选功能
- 模块一：简历上传与解析
- 模块二：AI 智能信息提取（基本信息、教育、工作、技能）
- 模块三：岗位匹配与智能评分
- 模块四：候选人管理面板（列表、详情、状态管理）

### P1 - 加分项
- 项目经历提取
- 手动修正 AI 提取信息
- 多 JD 对比
- 候选人对比功能
- 暗色主题
- 骨架屏
- 键盘快捷键
- 动画效果

---

**创建时间**: 2026-03-10
**预计完成时间**: 根据开发进度调整
