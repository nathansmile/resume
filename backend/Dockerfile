# ---- 使用官方 Node.js 23 的 Alpine 版本作为基础镜像 ----
FROM node:23-alpine AS builder
#FROM node:23-alpine
# 设置工作目录
WORKDIR /app

# ---- 依赖安装阶段 ----
# 复制 package 文件 (利用 Docker 缓存，避免每次重新安装)
COPY package*.json ./
# 安装项目依赖
RUN npm ci --only=production

# ---- 构建阶段 ----
# 复制源代码
COPY . .
# 如果你的应用需要构建 (例如 NestJS)，取消下一行注释
RUN npm run build

# ---- 运行阶段 ----
FROM node:23-alpine

WORKDIR /app

# 从构建阶段复制必要的文件，减小最终镜像体积
#COPY --from=builder /app/node_modules ./node_modules
#COPY --from=builder /app/package*.json ./
# 复制构建后的代码 (例如 dist 文件夹)，根据实际项目结构调整
###COPY --from=builder /app/dist ./dist
# 或复制所有源代码 (如果没有构建步骤)
COPY . .

# 创建非 root 用户并以该用户运行 (提升安全性) [citation:1]
# Alpine Linux 的正确用户创建语法
#RUN addgroup -g 1000 -S nodejs && \
#    adduser -u 1000 -S nodejs -G nodejs
# 不需要自己创建用户
USER node

# 切换到非 root 用户
#USER nodejs

# 暴露应用运行的端口 (例如 3000)
EXPOSE 3000

# 定义容器启动时执行的命令
CMD ["node", "dist/main.js"]
