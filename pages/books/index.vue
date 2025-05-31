<template>
  <div class="books-page">
    <div class="page-header">
      <h1>我的图书馆</h1>
      <div class="library-stats">
        <div class="stat-item">
          <span class="stat-number">{{ totalBooks }}</span>
          <span class="stat-label">总图书数</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ availableBooks }}</span>
          <span class="stat-label">可借阅</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ borrowedBooks }}</span>
          <span class="stat-label">已借出</span>
        </div>
      </div>
    </div>
    <BookList @books-loaded="handleBooksLoaded" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 定义图书接口
interface Book {
  id: number
  title: string
  author?: string
  borrowedBy?: string | null
  borrowerPhone?: string | null
}

// 图书统计数据
const totalBooks = ref(0)
const availableBooks = ref(0)
const borrowedBooks = ref(0)

// 处理图书数据加载完成
const handleBooksLoaded = (books: Book[]) => {
  totalBooks.value = books.length
  availableBooks.value = books.filter(book => !book.borrowedBy).length
  borrowedBooks.value = books.filter(book => book.borrowedBy).length
}
</script>

<style scoped>
.books-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

h1 {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-size: 2rem;
  text-align: center;
}

.library-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  min-width: 120px;
  box-shadow: var(--shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.stat-item:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-item:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .library-stats {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .stat-item {
    min-width: 200px;
  }
}
</style> 