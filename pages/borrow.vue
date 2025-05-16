<template>
  <div class="borrow-page">
    <h1>借阅管理</h1>
    
    <div class="tabs">
      <button 
        :class="{ 'active': activeTab === 'borrowed' }"
        @click="setActiveTab('borrowed')"
      >
        已借出图书
      </button>
      <button 
        :class="{ 'active': activeTab === 'available' }"
        @click="setActiveTab('available')"
      >
        可借阅图书
      </button>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      <p>加载图书信息中...</p>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
    
    <!-- 已借出图书列表 -->
    <div v-if="activeTab === 'borrowed' && !isLoading" class="book-section">
      <h2>已借出图书 ({{ borrowedBooks.length }})</h2>
      
      <!-- 空状态 -->
      <div v-if="borrowedBooks.length === 0" class="empty-state">
        <p>目前没有借出的图书</p>
      </div>
      
      <div v-else class="book-list">
        <div v-for="book in borrowedBooks" :key="book.id" class="book-card">
          <div class="book-info">
            <h3>{{ book.title }}</h3>
            <p v-if="book.author"><strong>作者：</strong>{{ book.author }}</p>
            <p v-if="book.borrowedBy"><strong>借阅人：</strong>{{ book.borrowedBy }}</p>
            <p v-if="book.borrowedAt">
              <strong>借出日期：</strong>{{ formatDate(book.borrowedAt) }}
            </p>
            <p v-if="book.returnDate">
              <strong>预计归还：</strong>
              <span :class="{ 'overdue': isOverdue(book.returnDate) }">
                {{ formatDate(book.returnDate) }}
                <span v-if="isOverdue(book.returnDate)"> (已逾期)</span>
              </span>
            </p>
          </div>
          
          <div class="actions">
            <button @click="returnBook(book.id)" class="return-button">归还</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 可借阅图书列表 -->
    <div v-if="activeTab === 'available' && !isLoading" class="book-section">
      <h2>可借阅图书 ({{ availableBooks.length }})</h2>
      
      <!-- 空状态 -->
      <div v-if="availableBooks.length === 0" class="empty-state">
        <p>暂无可借阅图书</p>
        <NuxtLink to="/books/add" class="add-button">添加图书</NuxtLink>
      </div>
      
      <div v-else class="book-list">
        <div v-for="book in availableBooks" :key="book.id" class="book-card">
          <div class="book-info">
            <h3>{{ book.title }}</h3>
            <p v-if="book.author"><strong>作者：</strong>{{ book.author }}</p>
            <p v-if="book.publisher"><strong>出版社：</strong>{{ book.publisher }}</p>
            <p><strong>状态：</strong><span class="available">可借阅</span></p>
          </div>
          
          <div class="actions">
            <button @click="openBorrowDialog(book)" class="borrow-button">借出</button>
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
const isLoading = ref(false)
const error = ref('')
const activeTab = ref('borrowed')

// 借阅相关状态
const showBorrowDialog = ref(false)
const selectedBook = ref<Book | null>(null)
const borrower = ref('')
const returnDate = ref('')

// 计算属性：已借出和可借阅的图书
const borrowedBooks = computed(() => {
  return books.value.filter(book => book.borrowedBy)
})

const availableBooks = computed(() => {
  return books.value.filter(book => !book.borrowedBy)
})

// 页面加载时获取所有图书
onMounted(async () => {
  await fetchBooks()
})

// 切换标签页
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

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
  } catch (err: Error | unknown) {
    error.value = err instanceof Error ? err.message : '获取图书列表失败，请稍后再试'
    console.error('获取图书错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 日期格式化
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 检查是否逾期
const isOverdue = (dateString: string) => {
  const today = new Date()
  const returnDate = new Date(dateString)
  return returnDate < today
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
  } catch (err: Error | unknown) {
    error.value = err instanceof Error ? err.message : '借出图书失败，请稍后再试'
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
  } catch (err: Error | unknown) {
    error.value = err instanceof Error ? err.message : '归还图书失败，请稍后再试'
    console.error('归还图书错误:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.borrow-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

h1 {
  color: #4361ee;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  text-align: center;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #ddd;
}

.tabs button {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  margin: 0 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: border-color 0.3s, color 0.3s;
}

.tabs button.active {
  border-bottom-color: #4361ee;
  color: #4361ee;
}

.book-section {
  margin-bottom: 2rem;
}

h2 {
  color: #4361ee;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.loading, .error-message, .empty-state {
  padding: 2rem;
  margin: 1rem 0;
  border-radius: 8px;
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

.book-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.book-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.book-info {
  flex: 1;
}

.book-info h3 {
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  color: #333;
}

.book-info p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.overdue {
  color: #f87171;
  font-weight: bold;
}

.available {
  color: #10b981;
  font-weight: bold;
}

.actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.add-button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #10b981;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
}

.borrow-button, .return-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
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
  .book-list {
    grid-template-columns: 1fr;
  }
  
  .tabs {
    flex-wrap: wrap;
  }
  
  .tabs button {
    flex: 1;
    white-space: nowrap;
  }
}
</style> 