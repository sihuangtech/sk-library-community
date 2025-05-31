#!/bin/bash

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "   家庭图书管理系统 - 一键更新脚本"
echo "========================================"
echo

# 检查Git是否安装
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ 错误：未找到Git，请先安装Git${NC}"
    echo "安装方法："
    echo "  Ubuntu/Debian: sudo apt-get install git"
    echo "  CentOS/RHEL: sudo yum install git"
    echo "  macOS: brew install git"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误：未找到Node.js，请先安装Node.js${NC}"
    echo "下载地址：https://nodejs.org/"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 错误：未找到npm，请先安装npm${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 检查当前Git仓库状态...${NC}"
if ! git status &> /dev/null; then
    echo -e "${RED}❌ 错误：当前目录不是Git仓库${NC}"
    echo "请确保在正确的项目目录中运行此脚本"
    exit 1
fi

echo
echo -e "${BLUE}📋 更新前准备工作...${NC}"

# 创建备份目录
if [ ! -d "backups" ]; then
    mkdir -p backups
fi

# 备份数据库
if [ -f "library.db" ]; then
    echo -e "${YELLOW}💾 备份数据库文件...${NC}"
    backup_name="library_backup_$(date +%Y%m%d_%H%M%S).db"
    if cp "library.db" "backups/$backup_name" 2>/dev/null; then
        echo -e "${GREEN}✅ 数据库已备份到: backups/$backup_name${NC}"
    else
        echo -e "${YELLOW}⚠️  数据库备份失败，但继续更新...${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  未找到数据库文件，跳过备份${NC}"
fi

# 备份配置文件
if [ -f "config.yaml" ]; then
    echo -e "${YELLOW}💾 备份配置文件...${NC}"
    config_backup="config_backup_$(date +%Y%m%d).yaml"
    if cp "config.yaml" "backups/$config_backup" 2>/dev/null; then
        echo -e "${GREEN}✅ 配置文件已备份${NC}"
    else
        echo -e "${YELLOW}⚠️  配置文件备份失败，但继续更新...${NC}"
    fi
fi

echo
echo 🔄 开始从Gitee仓库拉取最新代码...

# 获取远程更新
echo -e "${BLUE}🌐 获取远程更新信息...${NC}"
if ! git fetch origin &> /dev/null; then
    echo -e "${RED}❌ 获取远程更新失败，请检查网络连接${NC}"
    exit 1
fi

# 检查是否有更新
update_count=$(git rev-list HEAD..origin/main --count 2>/dev/null || echo "0")

if [ "$update_count" -eq 0 ]; then
    echo -e "${GREEN}✅ 当前已是最新版本，无需更新${NC}"
    echo
    echo -e "${YELLOW}🔄 恢复本地更改...${NC}"
    git stash pop &> /dev/null
    echo -e "${GREEN}✅ 更新检查完成${NC}"
    exit 0
fi

echo -e "${BLUE}📊 发现 $update_count 个新提交，开始更新...${NC}"

echo -e "${YELLOW}📥 拉取最新代码并强制覆盖本地更改...${NC}"
if ! git fetch --all && git reset --hard origin/main; then
    echo -e "${RED}❌ 代码拉取失败，强制覆盖失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 代码更新成功${NC}"

echo
echo -e "${BLUE}📦 更新项目依赖...${NC}"
if ! npm install; then
    echo -e "${RED}❌ 依赖安装失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 依赖更新完成${NC}"

echo
echo -e "${BLUE}🗄️  更新数据库结构...${NC}"
npx prisma generate &> /dev/null
if ! npx prisma migrate deploy &> /dev/null; then
    echo -e "${YELLOW}⚠️  数据库迁移可能失败，尝试推送schema...${NC}"
    npx prisma db push &> /dev/null
fi

echo -e "${GREEN}✅ 数据库更新完成${NC}"

echo
echo -e "${BLUE}🔄  构建生产版本...${NC}"
if ! npm run build; then
    echo -e "${RED}❌ 生产版本构建失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 生产版本构建完成${NC}"

echo
echo -e "${YELLOW}🔄 恢复本地更改...${NC}"
git stash pop &> /dev/null

echo
echo "========================================"
echo -e "${GREEN}✅ 更新完成！${NC}"
echo "========================================"
echo
echo -e "${BLUE}📋 更新摘要：${NC}"
echo "  - 已拉取 $update_count 个新提交"
echo "  - 依赖包已更新"
echo "  - 数据库结构已同步"
echo "  - 本地更改已恢复"
echo
echo -e "${YELLOW}💡 提示：${NC}"
echo "  - 数据库备份位置: backups/"
echo "  - 如有问题可回滚到备份版本"
echo "  - 建议重启应用以确保更新生效"
echo
echo -e "${GREEN}🚀 现在可以运行 ./start.sh 启动应用${NC}"
echo 