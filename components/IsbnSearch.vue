<template>
  <div class="isbn-search">
    <h2>通过ISBN查询图书</h2>
    <div class="search-form">
      <div class="input-group">
        <input 
          v-model="isbn" 
          type="text" 
          placeholder="请输入ISBN编号，例如：9787115428028"
          @keyup.enter="searchBook"
        />
        <button @click="searchBook" :disabled="isLoading">
          {{ isLoading ? '查询中...' : '查询' }}
        </button>
      </div>
      <p class="hint">提示：ISBN通常是图书背面条形码下方的13位数字</p>
    </div>
    
    <!-- 加载状态提示 -->
    <div v-if="isLoading" class="loading">
      <p>正在查询图书信息，请稍候...</p>
    </div>
    
    <!-- 错误信息显示 -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
    
    <!-- 查询结果显示 -->
    <div v-if="bookInfo && !isLoading" class="search-result">
      <h3>查询结果</h3>
      <div class="book-info">
        <div class="book-cover" v-if="bookInfo.coverUrl">
          <img :src="bookInfo.coverUrl" :alt="bookInfo.title" />
        </div>
        <div class="book-details">
          <p class="book-title">{{ bookInfo.title }}</p>
          <p v-if="bookInfo.author"><strong>作者：</strong>{{ bookInfo.author }}</p>
          <p v-if="bookInfo.publisher"><strong>出版社：</strong>{{ bookInfo.publisher }}</p>
          <p v-if="bookInfo.pubdate"><strong>出版日期：</strong>{{ bookInfo.pubdate }}</p>
          <p v-if="bookInfo.price"><strong>价格：</strong>{{ bookInfo.price }}</p>
          <p v-if="bookInfo.summary" class="summary"><strong>简介：</strong>{{ bookInfo.summary }}</p>
          <button @click="saveBook" class="save-button">保存到我的图书馆</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 定义图书数据类型
interface BookInfo {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  pubdate: string;
  price: string | number;
  summary: string;
  coverUrl: string | null;
  pages: number;
  
  // 新增扩展字段
  pressPlace?: string;
  binding?: string;
  language?: string;
  format?: string;
  edition?: string;
  words?: string;
  clcCode?: string;
  clcName?: string;
  pictures?: string;
}

// 状态管理
const isbn = ref('')
const isLoading = ref(false)
const error = ref('')
const bookInfo = ref<BookInfo | null>(null)

// 通过ISBN查询图书信息
const searchBook = async () => {
  // 重置状态
  error.value = ''
  bookInfo.value = null
  
  // 验证ISBN格式
  if (!isbn.value.trim()) {
    error.value = '请输入ISBN编号'
    return
  }
  
  // 移除ISBN中的所有非数字字符
  const cleanedIsbn = isbn.value.replace(/[^0-9]/g, '')
  
  // 验证ISBN长度
  if (cleanedIsbn.length !== 10 && cleanedIsbn.length !== 13) {
    error.value = 'ISBN编号必须是10位或13位数字'
    return
  }
  
  // 加载状态
  isLoading.value = true
  
  try {
    // 调用后端API查询ISBN
    const response = await fetch(`/api/isbn?isbn=${cleanedIsbn}`)
    
    if (!response.ok) {
      throw new Error(`查询失败 (${response.status}): ${response.statusText}`)
    }
    
    const result = await response.json()
    
    // 检查API返回结果
    if (result && result.data) {
      // 根据API返回格式调整数据结构
      bookInfo.value = {
        isbn: cleanedIsbn,
        title: result.data.title || '未知标题',
        author: result.data.author || '未知作者',
        publisher: result.data.publisher || '未知出版社',
        pubdate: result.data.pubdate || '未知日期',
        price: result.data.price || '未知价格',
        summary: result.data.summary || '暂无简介',
        coverUrl: result.data.coverUrl || null,
        pages: result.data.pages || null,
        
        // 新增扩展字段
        pressPlace: result.data.pressPlace,
        binding: result.data.binding,
        language: result.data.language, 
        format: result.data.format,
        edition: result.data.edition,
        words: result.data.words,
        clcCode: result.data.clcCode,
        clcName: result.data.clcName,
        pictures: result.data.pictures
      }
    } else {
      throw new Error('未找到图书信息')
    }
  } catch (err: Error | unknown) {
    error.value = err instanceof Error ? err.message : '查询图书信息时出错，请稍后再试'
    console.error('ISBN查询错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 保存图书到数据库
const saveBook = async () => {
  if (!bookInfo.value) return
  
  try {
    isLoading.value = true
    
    const response = await fetch('/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookInfo.value)
    })
    
    if (!response.ok) {
      throw new Error(`保存失败 (${response.status}): ${response.statusText}`)
    }
    
    // 成功保存后
    alert('图书已成功添加到你的图书馆！')
    
    // 重置表单
    isbn.value = ''
    bookInfo.value = null
  } catch (err: Error | unknown) {
    error.value = err instanceof Error ? err.message : '保存图书信息时出错，请稍后再试'
    console.error('保存图书错误:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.isbn-search {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: var(--shadow);
  transition: background-color 0.3s ease;
}

h2 {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.search-form {
  margin-bottom: 1.5rem;
}

.input-group {
  display: flex;
  margin-bottom: 0.5rem;
}

input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

button {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #3a56d4;
}

button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.hint {
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.loading, .error-message {
  padding: 1rem;
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

.search-result {
  margin-top: 2rem;
}

.search-result h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.book-info {
  display: flex;
  gap: 1.5rem;
}

.book-cover {
  flex-shrink: 0;
  width: 150px;
  height: 200px;
  background-color: var(--secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px;
}

.book-cover img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.book-details {
  flex: 1;
}

.book-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.book-details p {
  margin-bottom: 0.5rem;
  color: var(--text-color);
  opacity: 0.8;
}

.summary {
  margin-top: 1rem;
  color: var(--text-color);
  opacity: 0.8;
  font-size: 0.95rem;
  max-height: 120px;
  overflow-y: auto;
  line-height: 1.5;
}

.save-button {
  margin-top: 1.5rem;
  width: 100%;
  padding: 0.75rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.save-button:hover {
  background-color: #059669;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .book-info {
    flex-direction: column;
  }
  
  .book-cover {
    width: 100%;
    height: 250px;
  }
}
</style> 