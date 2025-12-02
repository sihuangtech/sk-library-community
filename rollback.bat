@echo off
chcp 65001 >nul
echo ========================================
echo    图书管理系统 - 回滚脚本
echo ========================================
echo.

REM 检查备份目录是否存在
if not exist "backups" (
    echo ❌ 错误：未找到备份目录
    echo 请确保之前已运行过更新脚本并创建了备份
    pause
    exit /b 1
)

echo 🔍 查找可用的备份文件...
echo.

REM 列出数据库备份文件
echo 📊 可用的数据库备份：
dir /b "backups\library_backup_*.db" 2>nul
if %errorlevel% neq 0 (
    echo   无数据库备份文件
) else (
    echo.
)

REM 列出配置文件备份
echo ⚙️  可用的配置文件备份：
dir /b "backups\config_backup_*.yaml" 2>nul
if %errorlevel% neq 0 (
    echo   无配置文件备份
) else (
    echo.
)

echo ========================================
echo 请选择回滚操作：
echo ========================================
echo 1. 回滚数据库到最新备份
echo 2. 回滚配置文件到最新备份
echo 3. 回滚代码到上一个提交
echo 4. 完全回滚（数据库+配置+代码）
echo 5. 查看Git提交历史
echo 0. 退出
echo ========================================
set /p choice=请输入选择 (0-5): 

if "%choice%"=="1" goto rollback_database
if "%choice%"=="2" goto rollback_config
if "%choice%"=="3" goto rollback_code
if "%choice%"=="4" goto rollback_all
if "%choice%"=="5" goto show_history
if "%choice%"=="0" goto exit
echo 无效选择，请重新运行脚本
pause
exit /b 1

:rollback_database
echo.
echo 🗄️  开始回滚数据库...

REM 找到最新的数据库备份
for /f "delims=" %%i in ('dir /b /o-d "backups\library_backup_*.db" 2^>nul') do (
    set latest_db=%%i
    goto found_db
)

echo ❌ 未找到数据库备份文件
pause
exit /b 1

:found_db
echo 📋 将使用备份文件: %latest_db%
set /p confirm=确定要回滚数据库吗？(y/N): 
if /i not "%confirm%"=="y" (
    echo 操作已取消
    pause
    exit /b 0
)

if exist "library.db" (
    echo 💾 备份当前数据库...
    copy "library.db" "library_current_backup_%date:~0,4%%date:~5,2%%date:~8,2%.db" >nul
)

copy "backups\%latest_db%" "library.db" >nul
if %errorlevel% equ 0 (
    echo ✅ 数据库回滚成功
) else (
    echo ❌ 数据库回滚失败
)
pause
exit /b 0

:rollback_config
echo.
echo ⚙️  开始回滚配置文件...

REM 找到最新的配置备份
for /f "delims=" %%i in ('dir /b /o-d "backups\config_backup_*.yaml" 2^>nul') do (
    set latest_config=%%i
    goto found_config
)

echo ❌ 未找到配置文件备份
pause
exit /b 1

:found_config
echo 📋 将使用备份文件: %latest_config%
set /p confirm=确定要回滚配置文件吗？(y/N): 
if /i not "%confirm%"=="y" (
    echo 操作已取消
    pause
    exit /b 0
)

if exist "config.yaml" (
    echo 💾 备份当前配置...
    copy "config.yaml" "config_current_backup_%date:~0,4%%date:~5,2%%date:~8,2%.yaml" >nul
)

copy "backups\%latest_config%" "config.yaml" >nul
if %errorlevel% equ 0 (
    echo ✅ 配置文件回滚成功
) else (
    echo ❌ 配置文件回滚失败
)
pause
exit /b 0

:rollback_code
echo.
echo 📝 开始回滚代码...
echo ⚠️  这将撤销最近的提交，请谨慎操作

git log --oneline -5
echo.
set /p confirm=确定要回滚到上一个提交吗？(y/N): 
if /i not "%confirm%"=="y" (
    echo 操作已取消
    pause
    exit /b 0
)

git reset --hard HEAD~1
if %errorlevel% equ 0 (
    echo ✅ 代码回滚成功
    echo 🔄 重新安装依赖...
    call npm install >nul
    echo ✅ 依赖重新安装完成
) else (
    echo ❌ 代码回滚失败
)
pause
exit /b 0

:rollback_all
echo.
echo 🔄 开始完全回滚...
echo ⚠️  这将回滚数据库、配置文件和代码

set /p confirm=确定要执行完全回滚吗？(y/N): 
if /i not "%confirm%"=="y" (
    echo 操作已取消
    pause
    exit /b 0
)

echo 1/3 回滚数据库...
for /f "delims=" %%i in ('dir /b /o-d "backups\library_backup_*.db" 2^>nul') do (
    copy "backups\%%i" "library.db" >nul
    echo ✅ 数据库已回滚
    goto rollback_all_config
)
echo ⚠️  跳过数据库回滚（无备份文件）

:rollback_all_config
echo 2/3 回滚配置文件...
for /f "delims=" %%i in ('dir /b /o-d "backups\config_backup_*.yaml" 2^>nul') do (
    copy "backups\%%i" "config.yaml" >nul
    echo ✅ 配置文件已回滚
    goto rollback_all_code
)
echo ⚠️  跳过配置文件回滚（无备份文件）

:rollback_all_code
echo 3/3 回滚代码...
git reset --hard HEAD~1 >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ 代码已回滚
    echo 🔄 重新安装依赖...
    call npm install >nul
    echo ✅ 依赖重新安装完成
) else (
    echo ⚠️  代码回滚失败或无需回滚
)

echo.
echo ✅ 完全回滚完成！
pause
exit /b 0

:show_history
echo.
echo 📜 最近的Git提交历史：
git log --oneline -10
echo.
pause
exit /b 0

:exit
echo 退出回滚脚本
exit /b 0 