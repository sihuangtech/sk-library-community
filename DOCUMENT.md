# 家庭图书管理系统 API 接口文档

## 基本信息

- **基础URL**: `https://您的服务器域名/api`
- **数据格式**: 所有请求和响应均使用 JSON 格式
- **认证方式**: Bearer Token（JWT）

## 认证接口

### 登录

- **URL**: `/auth/login`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "用户名",
      "role": "admin"
    }
  }
  ```

### 注册

- **URL**: `/auth/register`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码",
    "email": "email@example.com"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "注册成功"
  }
  ```

## 图书管理接口

### 获取图书列表

- **URL**: `/books`
- **方法**: GET
- **参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认10）
  - `search`: 搜索关键词
  - `category`: 分类ID
- **响应**:
  ```json
  {
    "total": 100,
    "page": 1,
    "limit": 10,
    "data": [
      {
        "id": 1,
        "title": "图书名称",
        "author": "作者",
        "isbn": "9787XXXXXXXXX",
        "coverUrl": "https://cover.url/image.jpg",
        "publisher": "出版社",
        "publishDate": "2023-01-01",
        "category": {
          "id": 1,
          "name": "小说"
        },
        "status": "available",
        "location": "客厅书架",
        "description": "图书简介"
      }
    ]
  }
  ```

### 通过ISBN查询图书信息

- **URL**: `/books/isbn/:isbn`
- **方法**: GET
- **参数**:
  - `isbn`: ISBN编码
- **响应**:
  ```json
  {
    "title": "图书名称",
    "author": "作者",
    "isbn": "9787XXXXXXXXX",
    "coverUrl": "https://cover.url/image.jpg",
    "publisher": "出版社",
    "publishDate": "2023-01-01",
    "description": "图书简介"
  }
  ```

### 添加图书

- **URL**: `/books`
- **方法**: POST
- **请求体**:
  ```json
  {
    "title": "图书名称",
    "author": "作者",
    "isbn": "9787XXXXXXXXX",
    "coverUrl": "https://cover.url/image.jpg",
    "publisher": "出版社",
    "publishDate": "2023-01-01",
    "categoryId": 1,
    "location": "客厅书架",
    "description": "图书简介"
  }
  ```
- **响应**:
  ```json
  {
    "id": 2,
    "title": "图书名称",
    "author": "作者",
    "isbn": "9787XXXXXXXXX",
    "coverUrl": "https://cover.url/image.jpg",
    "publisher": "出版社",
    "publishDate": "2023-01-01",
    "category": {
      "id": 1,
      "name": "小说"
    },
    "status": "available",
    "location": "客厅书架",
    "description": "图书简介",
    "createdAt": "2023-06-10T12:00:00Z"
  }
  ```

### 获取图书详情

- **URL**: `/books/:id`
- **方法**: GET
- **响应**:
  ```json
  {
    "id": 1,
    "title": "图书名称",
    "author": "作者",
    "isbn": "9787XXXXXXXXX",
    "coverUrl": "https://cover.url/image.jpg",
    "publisher": "出版社",
    "publishDate": "2023-01-01",
    "category": {
      "id": 1,
      "name": "小说"
    },
    "status": "available",
    "location": "客厅书架",
    "description": "图书简介",
    "createdAt": "2023-06-10T12:00:00Z",
    "borrowHistory": [
      {
        "id": 1,
        "borrower": "张三",
        "borrowDate": "2023-05-01T10:00:00Z",
        "returnDate": "2023-05-15T14:30:00Z",
        "status": "returned"
      }
    ]
  }
  ```

### 更新图书信息

- **URL**: `/books/:id`
- **方法**: PUT
- **请求体**:
  ```json
  {
    "title": "更新后的图书名称",
    "author": "作者",
    "publisher": "出版社",
    "categoryId": 2,
    "location": "卧室书架",
    "description": "更新后的图书简介"
  }
  ```
- **响应**:
  ```json
  {
    "id": 1,
    "title": "更新后的图书名称",
    "author": "作者",
    "isbn": "9787XXXXXXXXX",
    "coverUrl": "https://cover.url/image.jpg",
    "publisher": "出版社",
    "publishDate": "2023-01-01",
    "category": {
      "id": 2,
      "name": "科技"
    },
    "status": "available",
    "location": "卧室书架",
    "description": "更新后的图书简介",
    "updatedAt": "2023-06-15T09:30:00Z"
  }
  ```

### 删除图书

- **URL**: `/books/:id`
- **方法**: DELETE
- **响应**:
  ```json
  {
    "success": true,
    "message": "图书删除成功"
  }
  ```

## 借阅管理接口

### 借出图书

- **URL**: `/borrow`
- **方法**: POST
- **请求体**:
  ```json
  {
    "bookId": 1,
    "borrower": "张三",
    "borrowDate": "2023-06-01T10:00:00Z",
    "expectedReturnDate": "2023-06-15T10:00:00Z",
    "notes": "周末归还"
  }
  ```
- **响应**:
  ```json
  {
    "id": 2,
    "book": {
      "id": 1,
      "title": "图书名称"
    },
    "borrower": "张三",
    "borrowDate": "2023-06-01T10:00:00Z",
    "expectedReturnDate": "2023-06-15T10:00:00Z",
    "status": "borrowed",
    "notes": "周末归还"
  }
  ```

### 归还图书

- **URL**: `/borrow/:id/return`
- **方法**: PUT
- **请求体**:
  ```json
  {
    "returnDate": "2023-06-14T16:30:00Z",
    "condition": "良好",
    "notes": "按时归还"
  }
  ```
- **响应**:
  ```json
  {
    "id": 2,
    "book": {
      "id": 1,
      "title": "图书名称"
    },
    "borrower": "张三",
    "borrowDate": "2023-06-01T10:00:00Z",
    "returnDate": "2023-06-14T16:30:00Z",
    "status": "returned",
    "condition": "良好",
    "notes": "按时归还"
  }
  ```

### 获取借阅记录

- **URL**: `/borrow`
- **方法**: GET
- **参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认10）
  - `status`: 状态（borrowed/returned/all）
  - `borrower`: 借阅人
- **响应**:
  ```json
  {
    "total": 50,
    "page": 1,
    "limit": 10,
    "data": [
      {
        "id": 2,
        "book": {
          "id": 1,
          "title": "图书名称",
          "author": "作者",
          "isbn": "9787XXXXXXXXX",
          "coverUrl": "https://cover.url/image.jpg"
        },
        "borrower": "张三",
        "borrowDate": "2023-06-01T10:00:00Z",
        "expectedReturnDate": "2023-06-15T10:00:00Z",
        "returnDate": "2023-06-14T16:30:00Z",
        "status": "returned",
        "notes": "按时归还"
      }
    ]
  }
  ```

## 图书分类接口

### 获取所有分类

- **URL**: `/categories`
- **方法**: GET
- **响应**:
  ```json
  [
    {
      "id": 1,
      "name": "小说",
      "bookCount": 28
    },
    {
      "id": 2,
      "name": "科技",
      "bookCount": 15
    }
  ]
  ```

### 添加分类

- **URL**: `/categories`
- **方法**: POST
- **请求体**:
  ```json
  {
    "name": "历史"
  }
  ```
- **响应**:
  ```json
  {
    "id": 3,
    "name": "历史",
    "bookCount": 0
  }
  ```

### 更新分类

- **URL**: `/categories/:id`
- **方法**: PUT
- **请求体**:
  ```json
  {
    "name": "历史文学"
  }
  ```
- **响应**:
  ```json
  {
    "id": 3,
    "name": "历史文学",
    "bookCount": 5
  }
  ```

### 删除分类

- **URL**: `/categories/:id`
- **方法**: DELETE
- **响应**:
  ```json
  {
    "success": true,
    "message": "分类删除成功"
  }
  ```

## 错误处理

所有API在出错时将返回适当的HTTP状态码和JSON格式的错误信息：

```json
{
  "error": true,
  "code": "ERROR_CODE",
  "message": "错误描述信息"
}
```

常见错误码：
- `INVALID_CREDENTIALS`: 无效的认证信息
- `NOT_FOUND`: 资源不存在
- `VALIDATION_ERROR`: 输入验证错误
- `DUPLICATE_ENTRY`: 重复数据
- `SERVER_ERROR`: 服务器内部错误

## 注意事项

1. 所有请求头需要包含认证信息：`Authorization: Bearer 您的JWT令牌`
2. 日期时间格式遵循ISO 8601标准
3. 上传图片时需使用表单数据（multipart/form-data） 