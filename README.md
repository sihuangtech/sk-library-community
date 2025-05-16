# 家庭图书管理系统

这是一个基于Nuxt.js开发的家庭图书管理系统，可以帮助您管理家庭图书收藏，追踪借阅情况。

## 功能特点

- 通过ISBN自动获取图书信息
- 图书管理：添加、编辑、删除图书
- 借阅管理：记录借出和归还情况
- 响应式设计：适配各种设备屏幕
- 本地数据库：使用SQLite本地存储数据

## 环境要求

- Node.js 18.0+
- NPM 8.0+

## 快速启动

项目提供了方便的启动脚本，可以自动完成环境配置、依赖安装和项目启动：

### Windows系统
```bash
start.bat
```

### Mac/Linux系统
```bash
chmod +x start.sh  # 只需要第一次运行时执行
./start.sh
```

启动脚本会引导您：
1. 输入必要的配置信息（ISBN API密钥、管理员账户等）
2. 自动安装项目依赖
3. 初始化数据库
4. 启动开发服务器

## 环境变量配置

项目使用环境变量进行配置，启动脚本会自动创建`.env`文件并引导您填写信息。如需手动配置，请创建`.env`文件：

```
# API密钥
ISBN_API_KEY=your_isbn_api_key_here

# 管理员账户
NUXT_ADMIN_USERNAME=admin
NUXT_ADMIN_PASSWORD=secret_password

# 应用配置
NUXT_PUBLIC_ENABLE_DEBUG=false

# 数据库配置
DATABASE_URL="file:./dev.db"
```

重要的环境变量说明：
- `NUXT_ADMIN_USERNAME` 和 `NUXT_ADMIN_PASSWORD`：管理员登录凭据
- `NUXT_PUBLIC_ENABLE_DEBUG`：是否启用调试页面（true/false）

## 手动安装

如果不使用快速启动脚本，可以按照以下步骤手动安装：

```bash
# 安装依赖
npm install

# 创建数据库
npx prisma migrate dev
```

## 开发服务器

启动开发服务器，访问 `http://localhost:3000`：

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## 生产环境

构建生产环境应用：

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

本地预览生产环境构建：

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

## 调试模式

系统包含一个调试页面，可以帮助开发者查看会话状态和执行调试操作。

1. 在`.env`文件中设置`NUXT_PUBLIC_ENABLE_DEBUG=true`
2. 重启应用
3. 访问`/debug`路径

注意：调试页面仅在设置环境变量后才能访问，且需要管理员登录。

## 项目结构

- `components/` - Vue组件
  - `IsbnSearch.vue` - ISBN搜索组件
  - `BookList.vue` - 图书列表组件
- `layouts/` - 页面布局
  - `default.vue` - 默认布局
- `pages/` - 页面路由
  - `index.vue` - 首页
  - `books/index.vue` - 图书列表页
  - `books/add.vue` - 添加图书页
  - `borrow.vue` - 借阅管理页
  - `debug.vue` - 调试页面
- `prisma/` - Prisma数据库配置
  - `schema.prisma` - 数据库模型定义
- `server/api/` - API端点
  - `books.ts` - 图书API
  - `isbn.ts` - ISBN查询API
  - `auth/` - 认证相关API
- `start.bat` - Windows系统启动脚本
- `start.sh` - Mac/Linux系统启动脚本

## 认证与授权

系统使用基于Cookie的认证机制。所有非登录页面都受到保护，未登录用户会被重定向到登录页面。

## ISBN API

本项目使用 [ISBN Market API](https://market.isbn.work/) 来获取图书信息。

## 关于数据库

本项目使用SQLite作为本地数据库，通过Prisma ORM进行交互。数据库文件存储在`prisma/dev.db`。

## 贡献指南

1. Fork本仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 版权信息

根据 MIT 许可证开源。查看 [`LICENSE`](LICENSE) 文件了解更多信息。
