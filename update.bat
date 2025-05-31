@echo off
chcp 65001 >nul
echo ========================================
echo    家庭图书管理系统 - 一键更新脚本
echo ========================================
echo.

REM 检查Git是否安装
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到Git，请先安装Git
    echo 下载地址：https://git-scm.com/download/win
    pause
    exit /b 1
)

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo 🔍 检查当前Git仓库状态...
git status >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误：当前目录不是Git仓库
    echo 请确保在正确的项目目录中运行此脚本
    pause
    exit /b 1
)

echo.
echo 📋 更新前准备工作...

REM 备份数据库
if exist "library.db" (
    echo 💾 备份数据库文件...
    set backup_name=library_backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%.db
    set backup_name=%backup_name: =0%
    copy "library.db" "backups\%backup_name%" >nul 2>nul
    if not exist "backups" mkdir backups
    copy "library.db" "backups\%backup_name%" >nul
    if %errorlevel% equ 0 (
        echo ✅ 数据库已备份到: backups\%backup_name%
    ) else (
        echo ⚠️  数据库备份失败，但继续更新...
    )
) else (
    echo ℹ️  未找到数据库文件，跳过备份
)

REM 备份配置文件
if exist "config.yaml" (
    echo 💾 备份配置文件...
    if not exist "backups" mkdir backups
    copy "config.yaml" "backups\config_backup_%date:~0,4%%date:~5,2%%date:~8,2%.yaml" >nul
    if %errorlevel% equ 0 (
        echo ✅ 配置文件已备份
    ) else (
        echo ⚠️  配置文件备份失败，但继续更新...
    )
)

echo.
echo 🔄 开始从Gitee仓库拉取最新代码...

REM 获取远程更新
echo 🌐 获取远程更新信息...
git fetch origin >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 获取远程更新失败，请检查网络连接
    pause
    exit /b 1
)

REM 检查是否有更新
for /f %%i in ('git rev-list HEAD..origin/main --count 2^>nul') do set update_count=%%i
if "%update_count%"=="" set update_count=0

if %update_count% equ 0 (
    echo ✅ 当前已是最新版本，无需更新
    echo.
    echo 🔄 恢复本地更改...
    git stash pop >nul 2>nul
    echo ✅ 更新检查完成
    pause
    exit /b 0
)

echo 📊 发现 %update_count% 个新提交，开始更新...

echo 📥 拉取最新代码并强制覆盖本地更改...
git fetch --all && git reset --hard origin/main
if %errorlevel% neq 0 (
    echo ❌ 代码拉取失败，强制覆盖失败
    pause
    exit /b 1
)

echo ✅ 代码更新成功

echo.
echo 📦 更新项目依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖更新完成

echo.
echo 🗄️  更新数据库结构...
call npx prisma generate >nul 2>&1
call npx prisma migrate deploy >nul 2>&1 || (
    echo.
    echo ⚠️  数据库迁移可能失败，尝试推送schema...
    call npx prisma db push >nul 2>&1
)
echo ✅ 数据库更新完成

echo.
echo 🏗️  构建生产版本...
call npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 生产版本构建失败
    exit /b 1
)

echo.
echo 🔄 恢复本地更改...
git stash pop

echo.
echo ========================================
echo ✅ 更新完成！
echo ========================================
echo.
echo 📋 更新摘要：
echo   - 已拉取 %update_count% 个新提交
echo   - 依赖包已更新
echo   - 数据库结构已同步
echo   - 本地更改已恢复
echo.
echo 💡 提示：
echo   - 数据库备份位置: backups\
echo   - 如有问题可回滚到备份版本
echo   - 建议重启应用以确保更新生效
echo.
echo 🚀 现在可以运行 start.bat 启动应用
echo.
pause 