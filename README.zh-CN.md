# 彩旗藏书社区版 - 图书管理系统

[English Version](README.md) | [简体中文版](README.zh-CN.md)

这是一个基于Nuxt.js开发的图书管理系统，可以帮助您管理图书收藏，追踪借阅情况。系统采用现代化的Web技术栈，提供直观易用的界面和强大的功能。

## ✨ 功能特点

- 📚 **图书管理**：添加、编辑、删除图书，支持ISBN自动获取信息
- 🔍 **智能搜索**：按标题、作者、ISBN等多维度搜索
- 📖 **借阅管理**：记录借出和归还情况，逾期提醒
- 📊 **数据统计**：图书数量、分类、借阅情况统计
- 🎨 **响应式设计**：适配各种设备屏幕
- 🗄️ **本地存储**：使用SQLite本地数据库，数据安全可控
- 🔐 **安全认证**：管理员登录保护，会话管理
- 🔄 **一键更新**：自动更新系统和数据库备份

## ☁️ 云托管选项

部署本系统需要服务器环境。如果您没有服务器部署经验或没有服务器资源，欢迎尝试我们的云托管版本：**彩旗藏书 (library.skstudio.cn)** - 这是一个完全托管的图书馆管理服务，即开即用，无需任何技术设置。

## 🚀 快速开始

### 环境要求

- Node.js 18.0+
- NPM 8.0+
- Git（用于更新功能）

### 一键启动

项目提供了自动化启动脚本，首次使用推荐此方式：

**Windows系统**
```bash
start.bat
```

**Mac/Linux系统**
```bash
chmod +x start.sh
./start.sh
```

启动脚本会自动：
- 检查环境依赖
- 引导配置系统（API密钥、管理员账户等）
- 安装项目依赖
- 初始化数据库
- 启动开发服务器

### 手动安装

```bash
# 1. 安装依赖
npm install

# 2. 配置系统（复制并编辑配置文件）
cp config.yaml.example config.yaml

# 3. 初始化数据库
npx prisma migrate dev --name init

# 4. 启动应用
npm run dev
```

应用将在 http://localhost:3008 启动。

## 📖 文档

详细的使用和部署文档位于 `docs/` 目录：

- **[部署文档](docs/DEPLOYMENT.md)** - 详细的部署步骤、配置说明和生产环境部署
- **[用户指南](docs/USER_GUIDE.md)** - 完整的功能使用说明和最佳实践
- **[更新文档](docs/UPDATE.md)** - 一键更新和回滚功能详解
- **[API文档](docs/API.md)** - 完整的API接口文档和使用示例

## 🔄 系统更新

项目提供了一键更新功能，可以安全地从仓库拉取最新代码：

**Windows系统**
```bash
update.bat
```

**Mac/Linux系统**
```bash
./update.sh
```

更新功能包含：
- 自动备份数据库和配置
- 智能检测新版本
- 安全的代码更新
- 依赖包同步
- 数据库迁移

如果更新出现问题，可以使用回滚脚本快速恢复：
```bash
rollback.bat    # Windows
./rollback.sh   # Mac/Linux
```

## 🛠️ 技术栈

这是一个基于现代Web技术构建的全栈应用，采用Nuxt.js作为主要框架，集成了Prisma ORM进行数据库管理，使用Tailwind CSS和Nuxt UI构建现代化界面，通过SQLite提供轻量级本地数据存储，并集成第三方ISBN API实现图书信息自动获取功能。

## 📁 项目结构

```
├── components/          # Vue组件
├── layouts/            # 页面布局
├── pages/              # 页面路由
├── server/api/         # API端点
├── prisma/             # 数据库配置
├── middleware/         # 中间件
├── plugins/            # 插件
├── docs/               # 项目文档
├── start.bat/sh        # 启动脚本
├── update.bat/sh       # 更新脚本
├── rollback.bat/sh     # 回滚脚本
└── config.yaml         # 系统配置
```

## 🔧 开发

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 数据库管理
npx prisma studio
```

## 🗄️ 数据库

系统使用SQLite作为本地数据库，数据文件为 `library.db`。

**Web界面初始化**（推荐）：
1. 登录系统后访问"系统设置"页面
2. 点击"一键初始化数据库"按钮

**命令行初始化**：
```bash
npx prisma migrate dev --name init
```

## 🔐 认证与安全

- 基于Cookie的会话认证
- 管理员账户保护
- 所有管理功能需要登录
- 配置文件中设置管理员凭据

## 📝 ISBN API

本项目使用 [ISBN Market API](https://market.isbn.work/) 获取图书信息。需要在配置文件中设置API密钥。

## 🤝 贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 GNU General Public License v3.0 (GPL-3.0) 许可证开源，这是一个禁止商业使用的开源许可证。查看 [LICENSE](LICENSE) 文件了解更多信息。

**重要限制**：
- 禁止商业使用
- 任何基于此软件的衍生作品必须同样开源
- 分发时必须提供完整的源代码

## 🆘 支持

- 📖 查阅 [用户指南](docs/USER_GUIDE.md) 了解详细使用方法
- 🚀 查阅 [部署文档](docs/DEPLOYMENT.md) 了解部署和配置
- 🔄 查阅 [更新文档](docs/UPDATE.md) 了解更新和维护
- 🔧 查阅 [API文档](docs/API.md) 了解接口详情
- 💬 在项目仓库提交 Issue 获取技术支持
- 🐧 加入QQ群：[彩旗开源交流群](https://qm.qq.com/q/SKoSDvRaMi) 获取社区支持和交流
- 🎮 加入Discord：[彩旗开源交流服务器](https://discord.gg/thWGWq7CwA) 获取国际社区支持

## ⭐️ 星标历史

[![Star History Chart](https://api.star-history.com/svg?repos=sihuangtech/sk-library-community&type=date&legend=top-left)](https://www.star-history.com/#sihuangtech/sk-library-community&type=date&legend=top-left)