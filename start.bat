@echo off
echo 正在启动家庭图书管理系统...

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误：未找到Node.js，请先安装Node.js
    exit /b 1
)

REM 检查npm是否安装
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误：未找到npm，请先安装npm
    exit /b 1
)

REM 检查环境变量文件
if not exist .env (
    echo 正在配置环境变量...
    echo # API密钥 > .env
    set /p ISBN_API_KEY=请输入ISBN API密钥: 
    echo ISBN_API_KEY=%ISBN_API_KEY% >> .env
    echo. >> .env
    
    echo # 管理员账户 >> .env
    set /p ADMIN_USERNAME=请输入管理员用户名: 
    echo NUXT_ADMIN_USERNAME=%ADMIN_USERNAME% >> .env
    set /p ADMIN_PASSWORD=请输入管理员密码: 
    echo NUXT_ADMIN_PASSWORD=%ADMIN_PASSWORD% >> .env
    echo. >> .env
    
    echo # 应用配置 >> .env
    set /p ENABLE_DEBUG=是否启用调试模式？(true/false): 
    echo NUXT_PUBLIC_ENABLE_DEBUG=%ENABLE_DEBUG% >> .env
    echo. >> .env
    
    echo # 数据库配置 >> .env
    echo DATABASE_URL="file:./library.db" >> .env
    
    echo 环境变量配置完成！
)

REM 安装依赖
echo 正在安装项目依赖...
call npm install

REM 检查Prisma是否安装
npx prisma --version >nul 2>nul
if %errorlevel% neq 0 (
    echo 正在安装Prisma...
    call npm install prisma --save-dev
)

REM 初始化数据库
echo 正在初始化数据库...
call npx prisma generate
call npx prisma migrate dev

REM 启动开发服务器
echo 正在启动开发服务器...
call npm run dev 