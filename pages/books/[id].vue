<template>
  <div class="book-detail-container">
    <div v-if="isLoading" class="loading">
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <h1>获取图书详情失败</h1>
      <p>{{ error }}</p>
      <button @click="goBack" class="back-button">返回</button>
    </div>
    
    <div v-else-if="book" class="book-detail">
      <div class="book-header">
        <div class="book-cover">
          <img v-if="book.coverUrl" :src="book.coverUrl" alt="封面" />
          <div v-else class="no-cover">暂无封面</div>
        </div>
        
        <div class="book-info">
          <h1 class="book-title">{{ book.title }}</h1>
          <p class="book-author" v-if="book.author">作者：{{ book.author }}</p>
          <p class="book-publisher" v-if="book.publisher">出版社：{{ book.publisher }}</p>
          <p class="book-pubinfo" v-if="book.pubdate || book.pressPlace">
            {{ book.pressPlace || '' }} {{ book.pubdate || '' }}
          </p>
          <p class="book-price" v-if="book.price">定价：{{ formatPrice(book.price) }}</p>
          <p class="book-isbn">ISBN：{{ book.isbn }}</p>
          
          <div class="book-status">
            <p v-if="book.borrowedBy">
              借阅状态：已借出
              <span v-if="book.borrowedBy">借阅人：{{ book.borrowedBy }}</span>
              <span v-if="book.borrowedAt">借阅时间：{{ formatDate(book.borrowedAt) }}</span>
              <span v-if="book.returnDate">预计归还：{{ formatDate(book.returnDate) }}</span>
            </p>
            <p v-else>借阅状态：可借阅</p>
          </div>
          
          <div class="actions">
            <button v-if="!book.borrowedBy" @click="borrowBook" class="borrow-button">借阅此书</button>
            <button v-else-if="book.borrowedBy" @click="returnBook" class="return-button">归还此书</button>
            <button @click="editBook" class="edit-button">编辑信息</button>
            <button @click="confirmDelete" class="delete-button">删除图书</button>
            <button @click="goBack" class="back-button">返回</button>
          </div>
        </div>
      </div>
      
      <div class="book-details">
        <h2>图书详情</h2>
        <table class="details-table">
          <tr v-if="book.isbn">
            <td class="label">ISBN</td>
            <td>{{ book.isbn }}</td>
          </tr>
          <tr v-if="book.title">
            <td class="label">书名</td>
            <td>{{ book.title }}</td>
          </tr>
          <tr v-if="book.author">
            <td class="label">作者</td>
            <td>{{ book.author }}</td>
          </tr>
          <tr v-if="book.publisher">
            <td class="label">出版社</td>
            <td>{{ book.publisher }}</td>
          </tr>
          <tr v-if="book.pressPlace">
            <td class="label">出版地</td>
            <td>{{ book.pressPlace }}</td>
          </tr>
          <tr v-if="book.pubdate">
            <td class="label">出版日期</td>
            <td>{{ book.pubdate }}</td>
          </tr>
          <tr v-if="book.price">
            <td class="label">价格</td>
            <td>{{ formatPrice(book.price) }}</td>
          </tr>
          <tr v-if="book.binding">
            <td class="label">装帧</td>
            <td>{{ book.binding }}</td>
          </tr>
          <tr v-if="book.pages">
            <td class="label">页数</td>
            <td>{{ book.pages }}页</td>
          </tr>
          <tr v-if="book.format">
            <td class="label">开本</td>
            <td>{{ book.format }}</td>
          </tr>
          <tr v-if="book.language">
            <td class="label">语言</td>
            <td>{{ book.language }}</td>
          </tr>
          <tr v-if="book.edition">
            <td class="label">版次</td>
            <td>{{ book.edition }}</td>
          </tr>
          <tr v-if="book.words">
            <td class="label">字数</td>
            <td>{{ book.words }}</td>
          </tr>
          <tr v-if="book.clcCode || book.clcName">
            <td class="label">分类</td>
            <td>{{ book.clcName || '' }} {{ book.clcCode ? `(${book.clcCode})` : '' }}</td>
          </tr>
        </table>
      </div>
      
      <div class="book-summary" v-if="book.summary">
        <h2>图书简介</h2>
        <div class="summary-content">{{ book.summary }}</div>
      </div>
      
      <div class="book-pictures" v-if="book.pictures">
        <h2>图书图片</h2>
        <div class="pictures-container">
          <img v-for="(pic, index) in parsePictures" :key="index" :src="pic" alt="图书图片" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from '~/composables/useMessage'

const route = useRoute()
const router = useRouter()
const book = ref(null)
const isLoading = ref(true)
const error = ref(null)
const message = useMessage()

// 获取图书详情
async function fetchBookDetail() {
  isLoading.value = true
  error.value = null
  
  try {
    // 从路由参数获取图书ID
    const bookId = parseInt(route.params.id)
    
    if (isNaN(bookId)) {
      throw new Error('无效的图书ID')
    }
    
    // 调用API获取图书详情
    const response = await $fetch(`/api/books/${bookId}`)
    book.value = response
  } catch (err) {
    console.error('获取图书详情失败:', err)
    error.value = err.message || '获取图书详情失败'
  } finally {
    isLoading.value = false
  }
}

// 解析图片列表字符串
const parsePictures = computed(() => {
  if (!book.value?.pictures) return []
  
  try {
    return JSON.parse(book.value.pictures)
  } catch (e) {
    console.error('解析图片列表失败:', e)
    return []
  }
})

// 格式化价格
function formatPrice(price) {
  if (!price) return '未知'
  
  // 如果price是数字且以分为单位（如5980表示59.80元）
  if (typeof price === 'number') {
    return `¥${(price / 100).toFixed(2)}`
  }
  
  // 如果price是字符串但可以转换为数字
  if (typeof price === 'string' && !isNaN(Number(price))) {
    const numPrice = Number(price)
    // 判断是否需要除以100（根据大小判断）
    if (numPrice > 1000) { // 可能是以分为单位
      return `¥${(numPrice / 100).toFixed(2)}`
    }
    return `¥${numPrice.toFixed(2)}`
  }
  
  // 如果price已经是格式化的字符串
  return price.includes('¥') ? price : `¥${price}`
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 返回上一页
function goBack() {
  router.back()
}

// 借阅图书
async function borrowBook() {
  try {
    // 弹出输入框，让用户输入借阅人姓名
    const borrower = prompt('请输入借阅人姓名:')
    
    if (!borrower) return // 用户取消
    
    // 调用API更新图书状态
    await $fetch(`/api/books/${book.value.id}`, {
      method: 'PUT',
      body: {
        borrowedBy: borrower,
        borrowedAt: new Date(),
        // 默认借期为30天
        returnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
    
    // 刷新图书详情
    await fetchBookDetail()
    message.success(`借阅成功，已借给${borrower}`)
    
  } catch (err) {
    message.error(`借阅失败: ${err.message || '未知错误'}`)
  }
}

// 归还图书
async function returnBook() {
  try {
    // 调用API更新图书状态
    await $fetch(`/api/books/${book.value.id}`, {
      method: 'PUT',
      body: {
        borrowedBy: null,
        borrowedAt: null,
        returnDate: null
      }
    })
    
    // 刷新图书详情
    await fetchBookDetail()
    message.success('图书已成功归还')
    
  } catch (err) {
    message.error(`归还失败: ${err.message || '未知错误'}`)
  }
}

// 编辑图书
function editBook() {
  // 导航到图书编辑页面
  router.push(`/books/edit/${book.value.id}`)
}

// 确认删除图书
async function confirmDelete() {
  const confirmed = await message.confirm(`确定要删除《${book.value.title}》吗？此操作不可恢复！`)
  if (!confirmed) {
    return
  }
  
  deleteBook()
}

// 删除图书
async function deleteBook() {
  try {
    isLoading.value = true
    
    await $fetch(`/api/books/${book.value.id}`, {
      method: 'DELETE'
    })
    
    message.success('图书已成功删除')
    
    // 返回图书列表页
    router.push('/books')
  } catch (err) {
    console.error('删除图书失败:', err)
    message.error(`删除图书失败: ${err.message || '未知错误'}`)
  } finally {
    isLoading.value = false
  }
}

// 页面加载时获取图书详情
fetchBookDetail()
</script>

<style scoped>
.book-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 50px 0;
}

.error {
  color: #e74c3c;
}

.book-header {
  display: flex;
  margin-bottom: 30px;
  gap: 30px;
}

.book-cover {
  flex: 0 0 250px;
  height: 350px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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
  background-color: #f5f5f5;
  color: #999;
}

.book-info {
  flex: 1;
}

.book-title {
  font-size: 24px;
  margin-top: 0;
  margin-bottom: 10px;
}

.book-author, .book-publisher, .book-pubinfo, .book-price, .book-isbn {
  margin: 5px 0;
  color: #555;
}

.book-status {
  margin-top: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.book-status span {
  display: block;
  margin-top: 5px;
  font-size: 14px;
  color: #777;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.borrow-button, .return-button, .edit-button, .delete-button, .back-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.borrow-button {
  background-color: #2ecc71;
  color: white;
}

.return-button {
  background-color: #3498db;
  color: white;
}

.edit-button {
  background-color: #f39c12;
  color: white;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
}

.back-button {
  background-color: #7f8c8d;
  color: white;
}

.book-details, .book-summary, .book-pictures {
  margin-top: 30px;
}

.details-table {
  width: 100%;
  border-collapse: collapse;
}

.details-table tr {
  border-bottom: 1px solid #eee;
}

.details-table td {
  padding: 10px;
}

.details-table .label {
  width: 120px;
  font-weight: bold;
  color: #555;
}

.summary-content {
  line-height: 1.6;
  color: #333;
  white-space: pre-line;
}

.pictures-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
}

.pictures-container img {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style> 