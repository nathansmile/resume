#!/bin/bash

echo "🚀 简历智能筛选系统 - 快速启动脚本"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装 Node.js，请先安装 Node.js 20+"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 检查 PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  未检测到 PostgreSQL，请确保已安装并运行"
fi

echo ""
echo "📦 安装依赖..."

# 后端依赖
cd backend
if [ ! -d "node_modules" ]; then
    echo "安装后端依赖..."
    npm install
fi

# 前端依赖
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

cd ..

echo ""
echo "⚙️  配置环境变量..."

# 后端环境变量
if [ ! -f "backend/.env" ]; then
    echo "创建后端 .env 文件..."
    cat > backend/.env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/resume_db?schema=public"
DASHSCOPE_API_KEY="your-dashscope-api-key-here"
DASHSCOPE_MODEL="qwen-plus"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
NODE_ENV=development
EOF
    echo "⚠️  请编辑 backend/.env 文件，填入正确的数据库连接和 API 密钥"
fi

# 前端环境变量
if [ ! -f "frontend/.env" ]; then
    echo "创建前端 .env 文件..."
    echo "VITE_API_URL=http://localhost:3000/api" > frontend/.env
fi

echo ""
echo "🗄️  初始化数据库..."
cd backend
npx prisma generate
echo "请手动运行: cd backend && npx prisma migrate dev"

echo ""
echo "✅ 设置完成！"
echo ""
echo "启动步骤："
echo "1. 确保 PostgreSQL 正在运行"
echo "2. 编辑 backend/.env 填入数据库连接和 API 密钥"
echo "3. 运行数据库迁移: cd backend && npx prisma migrate dev"
echo "4. 启动后端: cd backend && npm run start:dev"
echo "5. 启动前端: cd frontend && npm run dev"
echo ""
echo "访问 http://localhost:5173 开始使用！"
