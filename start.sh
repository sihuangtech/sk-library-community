#!/bin/bash

echo "正在启动图书管理系统..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误：未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误：未找到npm，请先安装npm"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "正在配置环境变量..."
    
    # 创建.env文件并写入配置
    {
        echo "# API密钥"
        read -p "请输入ISBN API密钥: " ISBN_API_KEY
        echo "ISBN_API_KEY=$ISBN_API_KEY"
        echo
        
        echo "# 管理员账户"
        read -p "请输入管理员用户名: " ADMIN_USERNAME
        echo "NUXT_ADMIN_USERNAME=$ADMIN_USERNAME"
        read -p "请输入管理员密码: " ADMIN_PASSWORD
        echo "NUXT_ADMIN_PASSWORD=$ADMIN_PASSWORD"
        echo
        
        echo "# 应用配置"
        read -p "是否启用调试模式？(true/false): " ENABLE_DEBUG
        echo "NUXT_PUBLIC_ENABLE_DEBUG=$ENABLE_DEBUG"
        echo
        
        echo "# 数据库配置"
        echo 'DATABASE_URL="file:./library.db"'
    } > .env
    
    echo "环境变量配置完成！"
fi

# 安装依赖
echo "正在安装项目依赖..."
npm install

# 检查Prisma是否安装
if ! npx prisma --version &> /dev/null; then
    echo "正在安装Prisma..."
    npm install prisma --save-dev
fi

# 初始化数据库
echo "正在初始化数据库..."
npx prisma generate
npx prisma migrate dev

# 启动开发服务器
echo "正在启动开发服务器..."
npm run dev 