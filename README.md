# SK Library Community Edition - Library Management System

<p align="center">[简体中文版](README.zh-CN.md) | [English Version](README.md)</p>

A modern library management system built with Nuxt.js that helps you manage book collections and track borrowing activities. The system uses modern web technology stack to provide an intuitive interface and powerful features.

## ✨ Features

- 📚 **Book Management**: Add, edit, delete books with ISBN auto-fetching
- 🔍 **Smart Search**: Search by title, author, ISBN, and multiple criteria
- 📖 **Borrowing Management**: Track lending and returns with overdue reminders
- 📊 **Data Statistics**: Book counts, categories, and borrowing statistics
- 🎨 **Responsive Design**: Adapts to various device screens
- 🗄️ **Local Storage**: Uses SQLite local database for secure data control
- 🔐 **Security Authentication**: Admin login protection with session management
- 🔄 **One-Click Updates**: Automatic system updates with database backup

## ☁️ Cloud Hosting Option

Deploying this system requires a server environment. If you don't have server deployment experience or don't have access to a server, we recommend trying our cloud-hosted version: **SK Library ([library.skstudio.cn](https://library.skstudio.cn))** - a fully managed library management service that is ready to use immediately and requires no technical setup.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0+
- NPM 8.0+
- Git (for update functionality)

### One-Click Startup

Automated startup scripts are provided for easy setup:

**Windows System**
```bash
start.bat
```

**Mac/Linux System**
```bash
chmod +x start.sh
./start.sh
```

The startup script automatically:
- Checks environment dependencies
- Guides system configuration (API keys, admin accounts, etc.)
- Installs project dependencies
- Initializes database
- Starts development server

### Manual Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure system (copy and edit config file)
cp config.yaml.example config.yaml

# 3. Initialize database
npx prisma migrate dev --name init

# 4. Start application
npm run dev
```

The application will start at http://localhost:3008.

## 📖 Documentation

Detailed usage and deployment documentation is available in the `docs/` directory:

- **[Deployment Guide](docs/DEPLOYMENT.md)** - Detailed deployment steps, configuration instructions, and production deployment
- **[User Guide](docs/USER_GUIDE.md)** - Complete feature usage instructions and best practices
- **[Update Guide](docs/UPDATE.md)** - One-click update and rollback functionality explained
- **[API Documentation](docs/API.md)** - Complete API interface documentation with usage examples

## 🔄 System Updates

The project provides one-click update functionality to safely pull the latest code from the repository:

**Windows System**
```bash
update.bat
```

**Mac/Linux System**
```bash
./update.sh
```

Update functionality includes:
- Automatic database and configuration backup
- Smart new version detection
- Safe code updates
- Dependency package synchronization
- Database migrations

If issues occur during updates, use the rollback script to quickly restore:
```bash
rollback.bat    # Windows
./rollback.sh   # Mac/Linux
```

## 🛠️ Technology Stack

This is a full-stack application built with modern web technologies, using Nuxt.js as the main framework, integrated with Prisma ORM for database management, Tailwind CSS and Nuxt UI for modern interface design, SQLite for lightweight local data storage, and third-party ISBN API integration for automatic book information retrieval.

## 📁 Project Structure

```
├── components/          # Vue components
├── layouts/            # Page layouts
├── pages/              # Page routing
├── server/api/         # API endpoints
├── prisma/             # Database configuration
├── middleware/         # Middleware
├── plugins/            # Plugins
├── docs/               # Project documentation
├── start.bat/sh        # Startup scripts
├── update.bat/sh       # Update scripts
├── rollback.bat/sh     # Rollback scripts
└── config.yaml         # System configuration
```

## 🔧 Development

```bash
# Development mode
npm run dev

# Build production version
npm run build

# Preview production version
npm run preview

# Database management
npx prisma studio
```

## 🗄️ Database

The system uses SQLite as the local database, with the data file being `library.db`.

**Web Interface Initialization** (Recommended):
1. Log in to the system and access the "System Settings" page
2. Click the "One-Click Database Initialization" button

**Command Line Initialization**:
```bash
npx prisma migrate dev --name init
```

## 🔐 Authentication & Security

- Cookie-based session authentication
- Admin account protection
- All management functions require login
- Admin credentials set in configuration file

## 📝 ISBN API

This project uses [ISBN Market API](https://market.isbn.work/) to retrieve book information. API key needs to be set in the configuration file.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under GNU General Public License v3.0 (GPL-3.0), an open-source license that prohibits commercial use. See [LICENSE](LICENSE) file for more information.

**Important Restrictions**:
- Commercial use is prohibited
- Any derivative works based on this software must also be open-source
- Full source code must be provided when distributing

## 🆘 Support

- 📖 Check [User Guide](docs/USER_GUIDE.md) for detailed usage instructions
- 🚀 Check [Deployment Guide](docs/DEPLOYMENT.md) for deployment and configuration
- 🔄 Check [Update Guide](docs/UPDATE.md) for updates and maintenance
- 🔧 Check [API Documentation](docs/API.md) for interface details
- 💬 Submit Issues in the project repository for technical support
- 🐧 Join QQ Group: [SK Opensource Exchange Group](https://qm.qq.com/q/SKoSDvRaMi) for community support and discussion
- 🎮 Join Discord: [SK Opensource Exchange Server](https://discord.gg/thWGWq7CwA) for international community support

## ⭐️ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=sihuangtech/sk-library-community&type=date&legend=top-left)](https://www.star-history.com/#sihuangtech/sk-library-community&type=date&legend=top-left)