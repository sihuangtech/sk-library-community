#!/bin/bash

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "   图书管理系统 - 回滚脚本"
echo "========================================"
echo

# 检查备份目录是否存在
if [ ! -d "backups" ]; then
    echo -e "${RED}❌ 错误：未找到备份目录${NC}"
    echo "请确保之前已运行过更新脚本并创建了备份"
    exit 1
fi

echo -e "${BLUE}🔍 查找可用的备份文件...${NC}"
echo

# 列出数据库备份文件
echo -e "${BLUE}📊 可用的数据库备份：${NC}"
if ls backups/library_backup_*.db 1> /dev/null 2>&1; then
    ls -1 backups/library_backup_*.db | sed 's|backups/||'
else
    echo "  无数据库备份文件"
fi
echo

# 列出配置文件备份
echo -e "${BLUE}⚙️  可用的配置文件备份：${NC}"
if ls backups/config_backup_*.yaml 1> /dev/null 2>&1; then
    ls -1 backups/config_backup_*.yaml | sed 's|backups/||'
else
    echo "  无配置文件备份"
fi
echo

echo "========================================"
echo "请选择回滚操作："
echo "========================================"
echo "1. 回滚数据库到最新备份"
echo "2. 回滚配置文件到最新备份"
echo "3. 回滚代码到上一个提交"
echo "4. 完全回滚（数据库+配置+代码）"
echo "5. 查看Git提交历史"
echo "0. 退出"
echo "========================================"
read -p "请输入选择 (0-5): " choice

case $choice in
    1) rollback_database ;;
    2) rollback_config ;;
    3) rollback_code ;;
    4) rollback_all ;;
    5) show_history ;;
    0) exit 0 ;;
    *) echo "无效选择，请重新运行脚本"; exit 1 ;;
esac

rollback_database() {
    echo
    echo -e "${BLUE}🗄️  开始回滚数据库...${NC}"
    
    # 找到最新的数据库备份
    latest_db=$(ls -1t backups/library_backup_*.db 2>/dev/null | head -n1)
    
    if [ -z "$latest_db" ]; then
        echo -e "${RED}❌ 未找到数据库备份文件${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}📋 将使用备份文件: $(basename "$latest_db")${NC}"
    read -p "确定要回滚数据库吗？(y/N): " confirm
    
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 0
    fi
    
    if [ -f "library.db" ]; then
        echo -e "${YELLOW}💾 备份当前数据库...${NC}"
        cp "library.db" "library_current_backup_$(date +%Y%m%d).db"
    fi
    
    if cp "$latest_db" "library.db"; then
        echo -e "${GREEN}✅ 数据库回滚成功${NC}"
    else
        echo -e "${RED}❌ 数据库回滚失败${NC}"
    fi
}

rollback_config() {
    echo
    echo -e "${BLUE}⚙️  开始回滚配置文件...${NC}"
    
    # 找到最新的配置备份
    latest_config=$(ls -1t backups/config_backup_*.yaml 2>/dev/null | head -n1)
    
    if [ -z "$latest_config" ]; then
        echo -e "${RED}❌ 未找到配置文件备份${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}📋 将使用备份文件: $(basename "$latest_config")${NC}"
    read -p "确定要回滚配置文件吗？(y/N): " confirm
    
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 0
    fi
    
    if [ -f "config.yaml" ]; then
        echo -e "${YELLOW}💾 备份当前配置...${NC}"
        cp "config.yaml" "config_current_backup_$(date +%Y%m%d).yaml"
    fi
    
    if cp "$latest_config" "config.yaml"; then
        echo -e "${GREEN}✅ 配置文件回滚成功${NC}"
    else
        echo -e "${RED}❌ 配置文件回滚失败${NC}"
    fi
}

rollback_code() {
    echo
    echo -e "${BLUE}📝 开始回滚代码...${NC}"
    echo -e "${YELLOW}⚠️  这将撤销最近的提交，请谨慎操作${NC}"
    echo
    
    git log --oneline -5
    echo
    read -p "确定要回滚到上一个提交吗？(y/N): " confirm
    
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 0
    fi
    
    if git reset --hard HEAD~1; then
        echo -e "${GREEN}✅ 代码回滚成功${NC}"
        echo -e "${BLUE}🔄 重新安装依赖...${NC}"
        npm install > /dev/null
        echo -e "${GREEN}✅ 依赖重新安装完成${NC}"
    else
        echo -e "${RED}❌ 代码回滚失败${NC}"
    fi
}

rollback_all() {
    echo
    echo -e "${BLUE}🔄 开始完全回滚...${NC}"
    echo -e "${YELLOW}⚠️  这将回滚数据库、配置文件和代码${NC}"
    echo
    
    read -p "确定要执行完全回滚吗？(y/N): " confirm
    
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 0
    fi
    
    echo -e "${BLUE}1/3 回滚数据库...${NC}"
    latest_db=$(ls -1t backups/library_backup_*.db 2>/dev/null | head -n1)
    if [ -n "$latest_db" ]; then
        cp "$latest_db" "library.db"
        echo -e "${GREEN}✅ 数据库已回滚${NC}"
    else
        echo -e "${YELLOW}⚠️  跳过数据库回滚（无备份文件）${NC}"
    fi
    
    echo -e "${BLUE}2/3 回滚配置文件...${NC}"
    latest_config=$(ls -1t backups/config_backup_*.yaml 2>/dev/null | head -n1)
    if [ -n "$latest_config" ]; then
        cp "$latest_config" "config.yaml"
        echo -e "${GREEN}✅ 配置文件已回滚${NC}"
    else
        echo -e "${YELLOW}⚠️  跳过配置文件回滚（无备份文件）${NC}"
    fi
    
    echo -e "${BLUE}3/3 回滚代码...${NC}"
    if git reset --hard HEAD~1 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 代码已回滚${NC}"
        echo -e "${BLUE}🔄 重新安装依赖...${NC}"
        npm install > /dev/null
        echo -e "${GREEN}✅ 依赖重新安装完成${NC}"
    else
        echo -e "${YELLOW}⚠️  代码回滚失败或无需回滚${NC}"
    fi
    
    echo
    echo -e "${GREEN}✅ 完全回滚完成！${NC}"
}

show_history() {
    echo
    echo -e "${BLUE}📜 最近的Git提交历史：${NC}"
    git log --oneline -10
    echo
} 