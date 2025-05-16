<template>
  <div class="book-list">
    <h2>我的图书馆</h2>
    
    <!-- 过滤和搜索工具 -->
    <div class="filters">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索书名或作者..."
          @input="filterBooks"
        />
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      <p>加载图书信息中...</p>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
    
    <!-- 空状态 -->
    <div v-if="!isLoading && filteredBooks.length === 0" class="empty-state">
      <p>暂无图书信息，请先添加图书。</p>
      <button @click="navigateToAddBook" class="add-button">添加图书</button>
    </div>
    
    <!-- 图书列表 -->
    <div v-if="!isLoading && filteredBooks.length > 0" class="books-grid">
      <div v-for="book in filteredBooks" :key="book.id" class="book-card">
        <div class="book-cover">
          <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" />
          <div v-else class="no-cover">
            <span>暂无封面</span>
          </div>
        </div>
        
        <div class="book-info">
          <h3 class="book-title">{{ book.title }}</h3>
          <p v-if="book.author"><strong>作者：</strong>{{ book.author }}</p>
          <p v-if="book.publisher"><strong>出版社：</strong>{{ book.publisher }}</p>
          
          <!-- 借阅状态 -->
          <div class="borrow-status" :class="{ borrowed: book.borrowedBy }">
            <span v-if="book.borrowedBy">
              已借出给 {{ book.borrowedBy }}
            </span>
            <span v-else>在馆</span>
          </div>
          
          <div class="actions">
            <button @click="viewBookDetails(book.id)" class="view-button">查看详情</button>
            <button 
              v-if="!book.borrowedBy" 
              @click="openBorrowDialog(book)" 
              class="borrow-button"
            >
              借出
            </button>
            <button 
              v-else 
              @click="returnBook(book.id)" 
              class="return-button"
            >
              归还
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 借出对话框 -->
    <div v-if="showBorrowDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>借出图书</h3>
        <p>《{{ selectedBook?.title }}》</p>
        
        <div class="form-group">
          <label for="borrower">借阅人姓名：</label>
          <input v-model="borrower" type="text" id="borrower" />
        </div>
        
        <div class="form-group">
          <label for="returnDate">预计归还日期：</label>
          <input v-model="returnDate" type="date" id="returnDate" />
        </div>
        
        <div class="dialog-actions">
          <button @click="closeBorrowDialog" class="cancel-button">取消</button>
          <button @click="borrowBook" class="confirm-button">确认借出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

// 定义图书数据类型
interface Book {
  id: number;
  isbn: string;
  title: string;
  author?: string;
  publisher?: string;
  pubdate?: string;
  price?: string;
  summary?: string;
  coverUrl?: string | null;
  pages?: number;
  addedAt: string;
  borrowedBy?: string | null;
  borrowedAt?: string | null;
  returnDate?: string | null;
}

// 状态管理
const books = ref<Book[]>([])
const filteredBooks = ref<Book[]>([])
const searchQuery = ref('')
const isLoading = ref(false)
const error = ref('')
const router = useRouter()

// 借阅相关状态
const showBorrowDialog = ref(false)
const selectedBook = ref<Book | null>(null)
const borrower = ref('')
const returnDate = ref('')

// 页面加载时获取所有图书
onMounted(async () => {
  await fetchBooks()
})

// 从API获取图书列表
const fetchBooks = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await fetch('/api/books')
    
    if (!response.ok) {
      throw new Error(`获取图书失败 (${response.status}): ${response.statusText}`)
    }
    
    const data = await response.json()
    books.value = data
    filteredBooks.value = data
  } catch (err: any) {
    error.value = err.message || '获取图书列表失败，请稍后再试'
    console.error('获取图书错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 根据搜索查询过滤书籍
const filterBooks = () => {
  if (!searchQuery.value.trim()) {
    filteredBooks.value = books.value
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  filteredBooks.value = books.value.filter(book => 
    book.title.toLowerCase().includes(query) || 
    (book.author && book.author.toLowerCase().includes(query))
  )
}

// 导航到添加图书页面
const navigateToAddBook = () => {
  router.push('/books/add')
}

// 查看图书详情
const viewBookDetails = (id: number) => {
  router.push(`/books/${id}`)
}

// 打开借出对话框
const openBorrowDialog = (book: Book) => {
  selectedBook.value = book
  borrower.value = ''
  
  // 设置默认归还日期为30天后
  const date = new Date()
  date.setDate(date.getDate() + 30)
  returnDate.value = date.toISOString().split('T')[0]
  
  showBorrowDialog.value = true
}

// 关闭借出对话框
const closeBorrowDialog = () => {
  showBorrowDialog.value = false
  selectedBook.value = null
}

// 借出图书
const borrowBook = async () => {
  if (!selectedBook.value || !borrower.value.trim() || !returnDate.value) {
    alert('请填写完整信息')
    return
  }
  
  try {
    isLoading.value = true
    
    const response = await fetch(`/api/books/${selectedBook.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        borrowedBy: borrower.value,
        borrowedAt: new Date().toISOString(),
        returnDate: new Date(returnDate.value).toISOString()
      })
    })
    
    if (!response.ok) {
      throw new Error(`借出失败 (${response.status}): ${response.statusText}`)
    }
    
    closeBorrowDialog()
    await fetchBooks()
    alert(`成功借出《${selectedBook.value.title}》给 ${borrower.value}`)
  } catch (err: any) {
    error.value = err.message || '借出图书失败，请稍后再试'
    console.error('借出图书错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 归还图书
const returnBook = async (id: number) => {
  if (!confirm('确定要归还此图书吗？')) {
    return
  }
  
  try {
    isLoading.value = true
    
    const response = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        borrowedBy: null,
        borrowedAt: null,
        returnDate: null
      })
    })
    
    if (!response.ok) {
      throw new Error(`归还失败 (${response.status}): ${response.statusText}`)
    }
    
    await fetchBooks()
    alert('图书归还成功')
  } catch (err: any) {
    error.value = err.message || '归还图书失败，请稍后再试'
    console.error('归还图书错误:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.book-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

h2 {
  color: #4361ee;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.filters {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.search-box {
  width: 300px;
}

.search-box input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.loading, .error-message, .empty-state {
  padding: 2rem;
  margin: 1rem 0;
  border-radius: 4px;
  text-align: center;
}

.loading {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
}

.error-message {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
}

.empty-state {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  color: #666;
}

.add-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.book-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.book-cover {
  height: 180px;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #999;
  background-color: #eee;
  font-size: 0.9rem;
}

.book-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-info p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.borrow-status {
  margin: 0.5rem 0;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  background-color: #e6f7ff;
  color: #1890ff;
  text-align: center;
}

.borrow-status.borrowed {
  background-color: #fff7e6;
  color: #fa8c16;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.view-button, .borrow-button, .return-button {
  flex: 1;
  padding: 0.6rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  text-align: center;
}

.view-button {
  background-color: #4361ee;
  color: white;
}

.borrow-button {
  background-color: #10b981;
  color: white;
}

.return-button {
  background-color: #f59e0b;
  color: white;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog h3 {
  margin-bottom: 0.5rem;
  color: #4361ee;
}

.dialog p {
  margin-bottom: 1rem;
  font-weight: bold;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.cancel-button, .confirm-button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-button {
  background-color: #f3f4f6;
  color: #374151;
}

.confirm-button {
  background-color: #10b981;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  
  .filters {
    flex-direction: column;
  }
  
  .search-box {
    width: 100%;
    margin-bottom: 1rem;
  }
}
</style> 