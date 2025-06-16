# 家庭图书管理系统 - 数据库更新指南

## 📋 概述

本文档详细说明了在更新家庭图书管理系统项目时，如何正确处理数据库结构变更和数据迁移。

## 🗂️ 当前数据库状态

### 数据库文件结构
```
prisma/
├── library.db              # SQLite 数据库文件 (36KB)
├── schema.prisma           # 数据库模型定义
└── migrations/             # 迁移文件目录
    ├── migration_lock.toml
    ├── 20250516045551_init/
    ├── 20250518150652_add_extended_book_fields/
    ├── 20250518160127_init/
    ├── 20250531105917_add_borrower_phone/
    └── 20250616133235_add_sort_order/  # 最新迁移
```

### 最新迁移内容
最新的迁移 `20250616133235_add_sort_order` 添加了排序功能：
```sql
-- AlterTable
ALTER TABLE "Book" ADD COLUMN "sortOrder" INTEGER;

-- AlterTable
ALTER TABLE "BookCategory" ADD COLUMN "sortOrder" INTEGER;
```

## 🔄 数据库更新操作方案

### 方案一：保留现有数据（推荐用于生产环境）

适用场景：
- 生产环境更新
- 有重要数据需要保留
- 数据库结构变更较小

操作步骤：
```bash
# 1. 备份现有数据库（重要！）
cp prisma/library.db prisma/library.db.backup.$(date +%Y%m%d_%H%M%S)

# 2. 拉取最新代码
git pull origin master

# 3. 安装依赖（如有新增）
npm install

# 4. 检查迁移状态
npx prisma migrate status

# 5. 应用新的迁移（如果有）
npx prisma migrate deploy

# 6. 重新生成 Prisma 客户端
npx prisma generate

# 7. 验证数据库状态
npx prisma migrate status
```

### 方案二：重置数据库（适用于开发环境）

适用场景：
- 开发环境
- 测试环境
- 数据可以重新生成

操作步骤：
```bash
# 1. 备份数据库（可选）
cp prisma/library.db prisma/library.db.backup

# 2. 重置数据库并应用所有迁移
npx prisma migrate reset

# 3. 生成客户端
npx prisma generate

# 4. 验证状态
npx prisma migrate status
```

### 方案三：全新开始

适用场景：
- 全新部署
- 数据库损坏需要重建
- 开发环境重新开始

操作步骤：
```bash
# 1. 删除现有数据库文件
rm prisma/library.db

# 2. 应用所有迁移创建新数据库
npx prisma migrate deploy

# 3. 生成客户端
npx prisma generate

# 4. 初始化基础数据（可选）
npm run db:init
```

## ⚠️ 重要注意事项

### 生产环境更新
1. **必须备份**：更新前务必备份数据库文件
2. **测试验证**：在测试环境先验证更新流程
3. **停机维护**：建议在低峰期进行更新
4. **回滚准备**：准备回滚方案以防更新失败

### 开发环境更新
1. **数据无关紧要**：可以直接重置数据库
2. **快速迭代**：使用 `prisma migrate reset` 快速重建
3. **测试数据**：可以使用脚本重新生成测试数据

## 🛠️ 常用命令参考

### 迁移相关命令
```bash
# 查看迁移状态
npx prisma migrate status

# 应用迁移（生产环境）
npx prisma migrate deploy

# 重置数据库（开发环境）
npx prisma migrate reset

# 创建新迁移
npx prisma migrate dev --name 迁移描述

# 生成客户端
npx prisma generate
```

### 数据库管理命令
```bash
# 打开数据库管理界面
npx prisma studio

# 初始化数据库数据
npm run db:init

# 验证配置
npm run config:validate
```

## 🔍 故障排除

### 常见问题及解决方案

#### 1. 迁移失败
```bash
# 错误信息：Migration failed to apply
# 解决方案：
npx prisma migrate resolve --applied 迁移名称
npx prisma migrate deploy
```

#### 2. 客户端版本不匹配
```bash
# 错误信息：Client version mismatch
# 解决方案：
npx prisma generate
```

#### 3. 数据库锁定
```bash
# 错误信息：Database is locked
# 解决方案：
rm prisma/library.db-journal  # 删除日志文件
```

#### 4. 权限问题
```bash
# 错误信息：Permission denied
# 解决方案：
chmod 664 prisma/library.db
```

## 📊 数据库结构概览

### 主要数据表
- **Book**: 图书信息表（包含排序字段 sortOrder）
- **Category**: 分类表
- **BookCategory**: 图书分类关联表（包含排序字段 sortOrder）

### 关键字段说明
- `sortOrder`: 新增的排序字段，支持自定义排序
- `borrowerPhone`: 借阅人手机号字段
- `isbn`: 图书ISBN，唯一索引

## 🔄 版本兼容性

### 当前版本要求
- Node.js: >= 16.0.0
- Prisma: ^6.8.2
- SQLite: 3.x

### 迁移历史
1. `20250516045551_init`: 初始化数据库结构
2. `20250518150652_add_extended_book_fields`: 扩展图书字段
3. `20250518160127_init`: 重新初始化
4. `20250531105917_add_borrower_phone`: 添加借阅人手机号
5. `20250616133235_add_sort_order`: 添加排序功能

## 📞 技术支持

如果在数据库更新过程中遇到问题：

1. 检查错误日志
2. 确认备份文件完整性
3. 参考本文档的故障排除部分
4. 必要时可以回滚到备份版本

---

**最后更新时间**: 2025年6月16日  
**文档版本**: v1.0  
**适用系统版本**: v1.0.0+ 