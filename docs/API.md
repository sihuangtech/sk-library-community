# API 文档

本文档详细介绍家庭图书管理系统的API接口。

## 基础信息

- **基础URL**: `http://localhost:3008/api`
- **认证方式**: Cookie-based Session
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证相关 API

### 登录

**POST** `/api/auth/login`

用户登录接口。

#### 请求参数

```json
{
  "username": "admin",
  "password": "password"
}
```

#### 响应

**成功 (200)**
```json
{
  "success": true,
  "message": "登录成功"
}
```

**失败 (401)**
```json
{
  "success": false,
  "message": "用户名或密码错误"
}
```

#### 示例

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'password'
  })
});

const result = await response.json();
```

### 登出

**POST** `/api/auth/logout`

用户登出接口。

#### 响应

**成功 (200)**
```json
{
  "success": true,
  "message": "登出成功"
}
```

#### 示例

```javascript
const response = await fetch('/api/auth/logout', {
  method: 'POST'
});
```

### 验证登录状态

**GET** `/api/auth/verify`

验证当前用户是否已登录。

#### 响应

**已登录 (200)**
```json
{
  "isLoggedIn": true
}
```

**未登录 (401)**
```json
{
  "isLoggedIn": false
}
```

## 图书管理 API

### 获取图书列表

**GET** `/api/books`

获取所有图书列表。

#### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认为1 |
| limit | number | 否 | 每页数量，默认为20 |
| search | string | 否 | 搜索关键词 |
| category | string | 否 | 分类筛选 |

#### 响应

**成功 (200)**
```json
{
  "books": [
    {
      "id": 1,
      "isbn": "9787111213826",
      "title": "深入理解计算机系统",
      "author": "Randal E. Bryant",
      "publisher": "机械工业出版社",
      "pubdate": "2011-01-01",
      "price": "99.00",
      "pages": 702,
      "binding": "平装",
      "category": "计算机",
      "description": "本书从程序员的视角详细阐述计算机系统的本质概念...",
      "coverUrl": "https://example.com/cover.jpg",
      "borrowedBy": null,
      "borrowedAt": null,
      "returnDate": null,
      "createdAt": "2024-12-15T06:30:22.000Z",
      "updatedAt": "2024-12-15T06:30:22.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

#### 示例

```javascript
// 获取第一页图书
const response = await fetch('/api/books?page=1&limit=10');
const data = await response.json();

// 搜索图书
const searchResponse = await fetch('/api/books?search=计算机');
const searchData = await searchResponse.json();
```

### 添加图书

**POST** `/api/books`

添加新图书。

#### 请求参数

```json
{
  "isbn": "9787111213826",
  "title": "深入理解计算机系统",
  "author": "Randal E. Bryant",
  "publisher": "机械工业出版社",
  "pubdate": "2011-01-01",
  "price": "99.00",
  "pages": 702,
  "binding": "平装",
  "category": "计算机",
  "description": "本书从程序员的视角详细阐述计算机系统的本质概念...",
  "coverUrl": "https://example.com/cover.jpg"
}
```

#### 响应

**成功 (201)**
```json
{
  "success": true,
  "message": "图书添加成功",
  "book": {
    "id": 1,
    "isbn": "9787111213826",
    "title": "深入理解计算机系统",
    // ... 其他字段
  }
}
```

**失败 (400)**
```json
{
  "success": false,
  "message": "ISBN已存在"
}
```

### 更新图书

**PUT** `/api/books/:id`

更新指定图书信息。

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 图书ID |

#### 请求参数

```json
{
  "title": "新的图书标题",
  "author": "新的作者",
  // ... 其他需要更新的字段
}
```

#### 响应

**成功 (200)**
```json
{
  "success": true,
  "message": "图书更新成功",
  "book": {
    // 更新后的图书信息
  }
}
```

### 删除图书

**DELETE** `/api/books/:id`

删除指定图书。

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 图书ID |

#### 响应

**成功 (200)**
```json
{
  "success": true,
  "message": "图书删除成功"
}
```

### 借阅图书

**POST** `/api/books/:id/borrow`

借阅指定图书。

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 图书ID |

#### 请求参数

```json
{
  "borrowerName": "张三",
  "returnDate": "2024-12-30"
}
```

#### 响应

**成功 (200)**
```json
{
  "success": true,
  "message": "借阅成功"
}
```

**失败 (400)**
```json
{
  "success": false,
  "message": "图书已被借阅"
}
```

### 归还图书

**POST** `/api/books/:id/return`

归还指定图书。

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 图书ID |

#### 响应

**成功 (200)**
```json
{
  "success": true,
  "message": "归还成功"
}
```

## ISBN 查询 API

### 根据ISBN获取图书信息

**GET** `/api/isbn/:isbn`

根据ISBN号查询图书详细信息。

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| isbn | string | ISBN号码 |

#### 响应

**成功 (200)**
```json
{
  "success": true,
  "data": {
    "isbn": "9787111213826",
    "title": "深入理解计算机系统",
    "author": "Randal E. Bryant",
    "publisher": "机械工业出版社",
    "pubdate": "2011-01-01",
    "price": "99.00",
    "pages": 702,
    "binding": "平装",
    "description": "本书从程序员的视角详细阐述计算机系统的本质概念...",
    "coverUrl": "https://example.com/cover.jpg"
  }
}
```

**失败 (404)**
```json
{
  "success": false,
  "message": "未找到该ISBN对应的图书信息"
}
```

#### 示例

```javascript
const isbn = '9787111213826';
const response = await fetch(`/api/isbn/${isbn}`);
const data = await response.json();

if (data.success) {
  console.log('图书信息:', data.data);
} else {
  console.error('查询失败:', data.message);
}
```

## 系统管理 API

### 获取系统信息

**GET** `/api/system/info`

获取系统基本信息。

#### 响应

**成功 (200)**
```json
{
  "name": "家庭图书管理系统",
  "version": "1.0.0",
  "nodeVersion": "v18.17.0",
  "platform": "win32",
  "uptime": 3600,
  "memory": {
    "used": 50.5,
    "total": 100.0
  }
}
```

### 获取数据库状态

**GET** `/api/system/database-status`

获取数据库连接状态和统计信息。

#### 响应

**成功 (200)**
```json
{
  "connected": true,
  "stats": {
    "totalBooks": 150,
    "borrowedBooks": 12,
    "totalCategories": 8,
    "databaseSize": "2.5MB",
    "lastBackup": "2024-12-15T10:30:00.000Z"
  },
  "version": "3.40.1"
}
```

### 初始化数据库

**POST** `/api/system/init-database`

初始化数据库结构。

#### 响应

**成功 (200)**
```json
{
  "success": true,
  "message": "数据库初始化成功"
}
```

**失败 (500)**
```json
{
  "success": false,
  "message": "数据库初始化失败: 错误详情"
}
```

### 备份数据库

**POST** `/api/system/backup-database`

创建数据库备份。

#### 响应

**成功 (200)**
```json
{
  "success": true,
  "message": "数据库备份成功",
  "backupFile": "library_backup_20241215_143022.db"
}
```

## 错误处理

### HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录） |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 错误响应格式

```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息（仅开发环境）"
}
```

### 常见错误

#### 认证错误
```json
{
  "success": false,
  "message": "请先登录"
}
```

#### 参数验证错误
```json
{
  "success": false,
  "message": "ISBN格式不正确"
}
```

#### 资源不存在
```json
{
  "success": false,
  "message": "图书不存在"
}
```

## 数据模型

### Book（图书）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 图书ID（自增） |
| isbn | string | 是 | ISBN号码（唯一） |
| title | string | 是 | 图书标题 |
| author | string | 是 | 作者 |
| publisher | string | 否 | 出版社 |
| pubdate | string | 否 | 出版日期 |
| price | string | 否 | 价格 |
| pages | number | 否 | 页数 |
| binding | string | 否 | 装帧方式 |
| category | string | 否 | 分类 |
| description | string | 否 | 描述 |
| coverUrl | string | 否 | 封面图片URL |
| borrowedBy | string | 否 | 借阅人 |
| borrowedAt | Date | 否 | 借阅时间 |
| returnDate | Date | 否 | 应还日期 |
| createdAt | Date | 是 | 创建时间 |
| updatedAt | Date | 是 | 更新时间 |

## 使用示例

### 完整的图书管理流程

```javascript
// 1. 登录
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'password'
  })
});

// 2. 通过ISBN查询图书信息
const isbnResponse = await fetch('/api/isbn/9787111213826');
const bookInfo = await isbnResponse.json();

// 3. 添加图书到系统
const addResponse = await fetch('/api/books', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookInfo.data)
});

// 4. 获取图书列表
const booksResponse = await fetch('/api/books');
const books = await booksResponse.json();

// 5. 借阅图书
const borrowResponse = await fetch('/api/books/1/borrow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    borrowerName: '张三',
    returnDate: '2024-12-30'
  })
});

// 6. 归还图书
const returnResponse = await fetch('/api/books/1/return', {
  method: 'POST'
});
```

### 错误处理示例

```javascript
async function addBook(bookData) {
  try {
    const response = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '添加图书失败');
    }

    return result;
  } catch (error) {
    console.error('添加图书时发生错误:', error.message);
    throw error;
  }
}
```

## 开发调试

### 启用调试模式

在 `config.yaml` 中设置：
```yaml
debug:
  enabled: true
```

### 查看API日志

开发模式下，所有API请求都会在控制台输出详细日志。

### 使用调试页面

访问 `/debug` 页面可以查看：
- 当前登录状态
- 系统配置信息
- 数据库连接状态
- 执行测试API调用

## 安全注意事项

### 1. 认证保护
- 所有管理API都需要登录认证
- 使用安全的Session管理

### 2. 输入验证
- 所有用户输入都经过验证
- 防止SQL注入和XSS攻击

### 3. 错误信息
- 生产环境不暴露敏感错误信息
- 记录详细错误日志用于调试

### 4. 访问控制
- 限制API访问频率
- 监控异常访问模式

如需更多技术细节，请参考源代码中的API实现。 