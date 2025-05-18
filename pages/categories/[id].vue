<template>
  <div class="category-books-page">
    <div class="header">
      <h1 v-if="category">{{ category.name }} 分类图书</h1>
      <h1 v-else>分类图书</h1>
      
      <div class="actions">
        <button @click="goBack" class="back-button">返回分类列表</button>
        <button @click="openAddBookDialog" class="add-button">添加图书到分类</button>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      <p>加载中...</p>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
    
    <!-- 图书列表 -->
    <div v-if="!isLoading && books.length > 0" class="books-list">
      <div v-for="book in books" :key="book.id" class="book-item">
        <div class="book-cover">
          <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" />
          <div v-else class="no-cover">暂无封面</div>
        </div>
        
        <div class="book-info">
          <h3 class="book-title">{{ book.title }}</h3>
          <p v-if="book.author" class="book-author">作者：{{ book.author }}</p>
          <p v-if="book.publisher" class="book-publisher">出版社：{{ book.publisher }}</p>
          <p v-if="book.pubdate" class="book-pubdate">出版日期：{{ book.pubdate }}</p>
          <p class="book-added">添加时间：{{ formatDate(book.addedAt) }}</p>
          
          <div class="book-status" :class="{ borrowed: book.borrowedBy }">
            <span v-if="book.borrowedBy">已借出给 {{ book.borrowedBy }}</span>
            <span v-else>在馆</span>
          </div>
        </div>
        
        <div class="book-actions">
          <button @click="viewBookDetails(book.id)" class="view-button">查看详情</button>
          <button @click="confirmRemoveBook(book)" class="remove-button">从分类移除</button>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="!isLoading && books.length === 0" class="empty-state">
      <p>该分类下暂无图书，请添加图书到此分类。</p>
    </div>
    
    <!-- 添加图书到分类对话框 -->
    <div v-if="showAddBookDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>添加图书到分类</h3>
        
        <div class="form-group">
          <label for="book-search">搜索图书</label>
          <input
            v-model="bookSearchQuery"
            type="text"
            id="book-search"
            placeholder="输入书名或ISBN搜索"
            @input="searchBooks"
          />
        </div>
        
        <div class="search-results" v-if="availableBooks.length > 0">
          <h4>可添加的图书</h4>
          <div class="book-list">
            <div
              v-for="book in availableBooks"
              :key="book.id"
              class="search-book-item"
              @click="addBookToCategory(book.id)"
            >
              <div class="search-book-cover">
                <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" />
                <div v-else class="no-cover">暂无封面</div>
              </div>
              <div class="search-book-info">
                <h5>{{ book.title }}</h5>
                <p v-if="book.author">{{ book.author }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="search-empty" v-else-if="bookSearchQuery && !isSearching">
          <p>没有找到相关图书</p>
        </div>
        
        <div class="dialog-actions">
          <button @click="closeAddBookDialog" class="cancel-button">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from '~/composables/useMessage'

// 类型定义
interface Book {
  id: number
  isbn: string
  title: string
  author?: string
  publisher?: string
  pubdate?: string
  coverUrl?: string
  addedAt: string
  borrowedBy?: string
  borrowedAt?: string
  returnDate?: string
}

interface Category {
  id: number
  name: string
  description?: string
}

// 状态
const route = useRoute()
const router = useRouter()
const message = useMessage()
const categoryId = parseInt(route.params.id as string)

const category = ref<Category | null>(null)
const books = ref<Book[]>([])
const availableBooks = ref<Book[]>([])
const isLoading = ref(true)
const isSearching = ref(false)
const error = ref('')

// 对话框状态
const showAddBookDialog = ref(false)
const bookSearchQuery = ref('')

// 页面加载时获取分类和图书信息
onMounted(async () => {
  if (isNaN(categoryId)) {
    error.value = '无效的分类ID'
    isLoading.value = false
    return
  }
  
  await Promise.all([
    fetchCategory(),
    fetchCategoryBooks()
  ])
})

// 获取分类信息
const fetchCategory = async () => {
  try {
    const response = await fetch(`/api/categories`)
    
    if (!response.ok) {
      throw new Error(`获取分类失败 (${response.status}): ${response.statusText}`)
    }
    
    const categories = await response.json()
    category.value = categories.find((c: Category) => c.id === categoryId) || null
    
    if (!category.value) {
      throw new Error('分类不存在')
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    error.value = errorMessage || '获取分类信息失败'
    console.error('获取分类错误:', err)
  }
}

// 获取分类下的图书
const fetchCategoryBooks = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await fetch(`/api/book-categories?categoryId=${categoryId}`)
    
    if (!response.ok) {
      throw new Error(`获取分类图书失败 (${response.status}): ${response.statusText}`)
    }
    
    books.value = await response.json()
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    error.value = errorMessage || '获取分类图书失败'
    console.error('获取分类图书错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 查看图书详情
const viewBookDetails = (bookId: number) => {
  router.push(`/books/${bookId}`)
}

// 返回分类列表
const goBack = () => {
  router.push('/categories')
}

// 打开添加图书对话框
const openAddBookDialog = () => {
  bookSearchQuery.value = ''
  availableBooks.value = []
  showAddBookDialog.value = true
}

// 关闭添加图书对话框
const closeAddBookDialog = () => {
  showAddBookDialog.value = false
}

// 搜索可添加的图书
const searchBooks = async () => {
  if (!bookSearchQuery.value.trim()) {
    availableBooks.value = []
    return
  }
  
  isSearching.value = true
  
  try {
    // 获取所有图书
    const response = await fetch('/api/books')
    
    if (!response.ok) {
      throw new Error(`获取图书失败 (${response.status}): ${response.statusText}`)
    }
    
    const allBooks = await response.json()
    
    // 过滤掉已经在分类中的图书
    const existingBookIds = books.value.map(book => book.id)
    
    // 根据搜索词过滤图书
    const query = bookSearchQuery.value.toLowerCase()
    availableBooks.value = allBooks.filter((book: Book) => 
      !existingBookIds.includes(book.id) &&
      (book.title.toLowerCase().includes(query) || 
       book.isbn.toLowerCase().includes(query) ||
       (book.author && book.author.toLowerCase().includes(query)))
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    console.error('搜索图书错误:', errorMessage)
    message.error(`搜索图书失败: ${errorMessage}`)
  } finally {
    isSearching.value = false
  }
}

// 添加图书到分类
const addBookToCategory = async (bookId: number) => {
  try {
    const response = await fetch('/api/book-categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookId,
        categoryId
      })
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || '添加图书到分类失败')
    }
    
    const result = await response.json()
    
    // 刷新分类图书列表
    await fetchCategoryBooks()
    
    // 更新可添加图书列表
    availableBooks.value = availableBooks.value.filter(book => book.id !== bookId)
    
    // 显示成功消息
    message.success(result.message || '图书已成功添加到分类')
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    message.error(errorMessage || '添加图书到分类失败')
    console.error('添加图书到分类错误:', err)
  }
}

// 确认从分类中移除图书
const confirmRemoveBook = async (book: Book) => {
  const confirmed = await message.confirm(`确定要从"${category.value?.name}"分类中移除《${book.title}》吗？`)
  
  if (confirmed) {
    await removeBookFromCategory(book.id)
  }
}

// 从分类中移除图书
const removeBookFromCategory = async (bookId: number) => {
  try {
    const response = await fetch('/api/book-categories', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookId,
        categoryId
      })
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || '从分类中移除图书失败')
    }
    
    const result = await response.json()
    
    // 刷新分类图书列表
    await fetchCategoryBooks()
    
    // 显示成功消息
    message.success(result.message || '图书已从分类中移除')
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    message.error(errorMessage || '从分类中移除图书失败')
    console.error('从分类中移除图书错误:', err)
  }
}
</script>

<style scoped>
.category-books-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  margin: 0;
  color: #333;
}

.actions {
  display: flex;
  gap: 10px;
}

.back-button, .add-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.back-button {
  background-color: #f0f0f0;
  color: #333;
}

.add-button {
  background-color: #1890ff;
  color: white;
}

.loading, .error-message, .empty-state {
  padding: 20px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
}

.error-message {
  color: #ff4d4f;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
}

.books-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.book-item {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.book-item:hover {
  transform: translateY(-5px);
}

.book-cover {
  height: 200px;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #999;
}

.book-info {
  padding: 15px;
  flex: 1;
}

.book-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.book-author, .book-publisher, .book-pubdate, .book-added {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.book-status {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.book-status.borrowed {
  background-color: #fff7e6;
  color: #fa8c16;
}

.book-actions {
  display: flex;
  padding: 10px 15px;
  background-color: #f9f9f9;
  gap: 10px;
}

.view-button, .remove-button {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.view-button {
  background-color: #1890ff;
  color: white;
}

.remove-button {
  background-color: #ff4d4f;
  color: white;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

.dialog h4 {
  margin: 15px 0 10px 0;
  color: #555;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.search-empty {
  text-align: center;
  padding: 20px;
  color: #999;
}

.book-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.search-book-item {
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.search-book-item:hover {
  transform: scale(1.05);
}

.search-book-cover {
  height: 120px;
  overflow: hidden;
}

.search-book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.search-book-info {
  padding: 8px;
  background-color: #f9f9f9;
}

.search-book-info h5 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-book-info p {
  margin: 0;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #f0f0f0;
  color: #333;
  cursor: pointer;
  font-size: 14px;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .actions {
    width: 100%;
  }
  
  .back-button, .add-button {
    flex: 1;
  }
  
  .books-list {
    grid-template-columns: 1fr;
  }
}
</style> 