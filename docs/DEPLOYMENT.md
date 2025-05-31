# 部署文档

本文档详细介绍如何部署家庭图书管理系统。

## 环境要求

- Node.js 18.0+
- NPM 8.0+
- Git（用于更新功能）

## 快速部署

### 方式一：一键启动脚本（推荐）

项目提供了自动化启动脚本，可以自动完成环境配置、依赖安装和项目启动：

#### Windows系统
```bash
start.bat
```

#### Mac/Linux系统
```bash
chmod +x start.sh  # 只需要第一次运行时执行
./start.sh
```

启动脚本会自动：
1. 检查环境依赖（Node.js、npm）
2. 引导您输入配置信息（ISBN API密钥、管理员账户等）
3. 自动安装项目依赖
4. 初始化数据库
5. 启动开发服务器

### 方式二：手动部署

如果不使用快速启动脚本，可以按照以下步骤手动部署：

#### 1. 安装依赖
```bash
npm install
```

#### 2. 配置系统
复制配置模板并编辑：
```bash
cp config.yaml.example config.yaml
```

编辑 `config.yaml` 文件，设置必要的配置项。

#### 3. 初始化数据库
```bash
# 生成Prisma客户端
npx prisma generate

# 创建数据库结构
npx prisma migrate dev --name init
```

#### 4. 启动应用
```bash
npm run dev
```

应用将在 http://localhost:3008 启动。

## 端口架构说明

### 统一端口设计

Nuxt 3 使用统一端口架构，前端和后端API都运行在同一个端口上：

```
┌─────────────────────────────────────┐
│           Nuxt 3 应用               │
│         (端口: 3008)                │
├─────────────────────────────────────┤
│  前端路由:                          │
│  ├─ /                (首页)         │
│  ├─ /books           (图书列表)     │
│  ├─ /books/add       (添加图书)     │
│  └─ /login           (登录页)       │
├─────────────────────────────────────┤
│  API路由:                           │
│  ├─ /api/books       (图书API)      │
│  ├─ /api/isbn        (ISBN查询)     │
│  ├─ /api/auth/login  (登录API)      │
│  └─ /api/auth/logout (登出API)      │
└─────────────────────────────────────┘
```

### 端口配置覆盖

可以通过环境变量覆盖默认端口：

```bash
# 开发模式
PORT=4000 npm run dev

# 生产模式
PORT=4000 npm run preview
```

## 配置说明

### 配置文件结构

项目使用 `config.yaml` 文件进行配置，主要包含以下部分：

```yaml
# 服务器配置
server:
  port: 3008                    # 应用端口

# 网站信息配置
site:
  name: "家庭图书管理系统"
  version: "1.0.0"
  copyright_owner: "彩旗工作室"
  filing:
    icp_number: ""              # ICP备案号
    police_number: ""           # 公安备案号
    show_filing: false          # 是否显示备案信息

# API配置
api:
  isbn_key: "your-api-key"      # ISBN查询API密钥

# 数据库配置
database:
  url: "file:./library.db"      # SQLite数据库路径

# 管理员账户配置
admin:
  username: "admin"             # 管理员用户名
  password: "password"          # 管理员密码

# 身份验证配置
auth:
  session_max_age_days: 14      # 会话有效期（天）

# 调试配置
debug:
  enabled: false                # 调试模式开关
```

### 重要配置项说明

#### 1. ISBN API密钥
- 在 [ISBN Market API](https://market.isbn.work/) 申请API密钥
- 将密钥填入 `api.isbn_key` 字段

#### 2. 管理员账户
- `admin.username`：管理员登录用户名
- `admin.password`：管理员登录密码
- **重要**：请修改默认密码以确保安全

#### 3. 数据库配置
- 默认使用SQLite数据库
- 数据库文件位置：项目根目录下的 `library.db`

#### 4. 调试模式
- 设置 `debug.enabled: true` 可启用调试页面
- 调试页面路径：`/debug`

## 生产环境部署

### 1. 构建生产版本
```bash
npm run build
```

### 2. 启动生产服务器
```bash
npm run preview
```

### 3. 使用PM2部署（推荐）
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs
```

### 4. 使用 Systemd 部署 (Linux)

Systemd 是 Linux 系统中广泛使用的初始化系统和服务管理器。您可以使用 Systemd 将 Nuxt 生产构建作为后台服务运行，实现开机自启动、崩溃自动重启等功能。

**前提条件：**

1.  已完成 `npm run build` 构建，生成 `.output` 目录。
2.  您的服务器使用 Systemd。
3.  具备 `sudo` 权限。

**步骤：**

1.  **创建 Systemd 服务文件**

    使用文本编辑器创建一个新的服务文件，例如 `family-library.service`，并将其保存在 `/etc/systemd/system/` 目录下。

    ```bash
    sudo nano /etc/systemd/system/family-library.service
    ```

2.  **编辑服务文件内容**

    将以下内容复制到 `family-library.service` 文件中。请根据您的实际情况修改 `WorkingDirectory` 和 `ExecStart` 中的路径。

    ```ini
    [Unit]
    Description=Family Library Nuxt Application
    After=network.target

    [Service]
    Type=simple
    User=ubuntu  # 替换为你创建的用于运行应用的用户，例如: familylib
    Group=ubuntu # 替换为你创建的用于运行应用的用户组，通常与用户同名
    WorkingDirectory=/path/to/your/app
    ExecStart=/usr/bin/npm start
    Restart=on-failure
    StandardOutput=syslog
    StandardError=syslog
    SyslogIdentifier=family-library

    [Install]
    WantedBy=multi-user.target
    ```

    *   `Description`: 服务的描述。
    *   `After=network.target`: 确保在网络服务启动后才启动此服务。
    *   `User` / `Group`: 强烈建议使用非 `root` 用户运行服务。
    *   `WorkingDirectory`: 您的项目根目录的绝对路径。
    *   `ExecStart`: 启动服务的命令。这里直接运行 `npm start` 命令。请确保 `/usr/bin/npm` 是正确的 npm 路径，`/path/to/your/app/` 是您的项目根目录路径。
    *   `Restart=on-failure`: 当服务进程因错误退出时自动重启。
    *   `StandardOutput`/`StandardError`: 将标准输出和错误输出重定向到 Systemd 日志 (`syslog`)。

3.  **重新加载 Systemd 配置**

    通知 Systemd 有新的服务文件。

    ```bash
    sudo systemctl daemon-reload
    ```

4.  **启用服务**

    设置服务开机自启动。

    ```bash
    sudo systemctl enable family-library.service
    ```

5.  **启动服务**

    立即启动服务。

    ```bash
    sudo systemctl start family-library.service
    ```

6.  **检查服务状态**

    查看服务是否正常运行。

    ```bash
    sudo systemctl status family-library.service
    ```

7.  **查看服务日志**

    使用 `journalctl` 查看服务的日志输出。

    ```bash
    sudo journalctl -u family-library -f
    ```

现在，您的家庭图书管理系统就会作为 Systemd 服务在后台运行了。

### 5. Nginx反向代理配置
```nginx
# HTTP 服务器 - 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://localhost:3008;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**配置说明：**

1. **SSL 证书配置**：
   - 将 `/path/to/your/certificate.crt` 替换为你的 SSL 证书文件路径
   - 将 `/path/to/your/private.key` 替换为你的私钥文件路径

2. **获取 SSL 证书的方式**：
   
   **方式一：使用 Let's Encrypt（免费）**
   ```bash
   # 安装 Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # 获取证书
   sudo certbot --nginx -d your-domain.com
   ```
   
   **方式二：使用 Cloudflare（免费）**
   - 将域名 DNS 托管到 Cloudflare
   - 在 Cloudflare 面板开启 SSL/TLS 加密
   - 使用 Cloudflare 的 Origin 证书
   
   **方式三：购买商业证书**
   - 从 SSL 证书提供商购买
   - 按照提供商说明安装

3. **配置文件位置**：
   ```bash
   # 创建配置文件
   sudo nano /etc/nginx/sites-available/family-library
   
   # 启用站点
   sudo ln -s /etc/nginx/sites-available/family-library /etc/nginx/sites-enabled/
   
   # 测试配置
   sudo nginx -t
   
   # 重新加载 Nginx
   sudo systemctl reload nginx
   ```

## 数据库管理

### 数据库初始化

#### 方式一：Web界面初始化（推荐）
1. 启动应用后登录管理员账户
2. 访问"系统设置"页面
3. 点击"一键初始化数据库"按钮

#### 方式二：命令行初始化
```bash
# 生成Prisma客户端
npx prisma generate

# 创建数据库结构
npx prisma migrate dev --name init
```

### 数据库管理工具

#### Prisma Studio
```bash
npx prisma studio
```
- 访问 http://localhost:5555
- 图形化界面管理数据库

#### 常用命令
```bash
# 重置数据库（清空所有数据）
npx prisma migrate reset

# 查看数据库状态
npx prisma db pull

# 生成客户端
npx prisma generate
```

## 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 查看端口占用
netstat -ano | findstr :3008  # Windows
lsof -i :3008                 # Linux/Mac

# 修改端口
# 编辑 config.yaml 中的 server.port
```

#### 2. 数据库连接失败
```bash
# 检查数据库文件权限
ls -la library.db

# 重新初始化数据库
npx prisma migrate reset
npx prisma migrate dev --name init
```

#### 3. 依赖安装失败
```bash
# 清除缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 4. Git相关问题
```bash
# 检查Git配置
git config --list

# 重新设置远程仓库
git remote set-url origin <your-repo-url>
```

### 日志查看

#### 应用日志
- 开发模式：控制台直接输出
- 生产模式：使用PM2查看 `pm2 logs`

#### 数据库日志
- Prisma查询日志在控制台输出
- 可在 `prisma/schema.prisma` 中配置日志级别

## 安全建议

### 1. 密码安全
- 修改默认管理员密码
- 使用强密码（包含大小写字母、数字、特殊字符）
- 定期更换密码

### 2. 网络安全
- 使用HTTPS（生产环境）
- 配置防火墙规则
- 限制管理员IP访问

### 3. 数据安全
- 定期备份数据库
- 备份文件加密存储
- 监控异常访问

### 4. 系统安全
- 及时更新系统和依赖
- 监控系统资源使用
- 配置日志审计

## 性能优化

### 1. 数据库优化
- 定期清理过期数据
- 添加必要的索引
- 监控查询性能

### 2. 应用优化
- 启用Gzip压缩
- 配置静态资源缓存
- 使用CDN加速

### 3. 服务器优化
- 配置合适的内存限制
- 使用SSD存储
- 监控服务器性能

## 监控与维护

### 1. 健康检查
- 定期检查应用状态
- 监控数据库连接
- 检查磁盘空间

### 2. 日志监控
- 配置日志轮转
- 监控错误日志
- 设置告警机制

### 3. 备份策略
- 每日自动备份
- 异地备份存储
- 定期测试恢复

## 更新维护

详细的更新和回滚操作请参考 [更新文档](UPDATE.md)。 