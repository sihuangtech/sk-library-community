<template>
  <div class="edit-book-container">
    <h1>编辑图书信息</h1>
    
    <div v-if="isLoading" class="loading">
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="goBack" class="back-button">返回</button>
    </div>
    
    <form v-else @submit.prevent="saveBook" class="book-form">
      <div class="form-column">
        <div class="form-group">
          <label for="title">书名*</label>
          <input id="title" v-model="bookForm.title" required />
        </div>
        
        <div class="form-group">
          <label for="author">作者</label>
          <input id="author" v-model="bookForm.author" />
        </div>
        
        <div class="form-group">
          <label for="publisher">出版社</label>
          <input id="publisher" v-model="bookForm.publisher" />
        </div>
        
        <div class="form-group">
          <label for="pubdate">出版日期</label>
          <input id="pubdate" v-model="bookForm.pubdate" placeholder="例：2023-05" />
        </div>
        
        <div class="form-group">
          <label for="pressPlace">出版地</label>
          <input id="pressPlace" v-model="bookForm.pressPlace" />
        </div>
        
        <div class="form-group">
          <label for="isbn">ISBN*</label>
          <input id="isbn" v-model="bookForm.isbn" required />
        </div>
        
        <div class="form-group">
          <label for="price">价格</label>
          <input id="price" v-model="bookForm.price" placeholder="例：59.8" />
        </div>
        
        <div class="form-group">
          <label for="coverUrl">封面图片URL</label>
          <input id="coverUrl" v-model="bookForm.coverUrl" placeholder="http://example.com/image.jpg" />
        </div>
      </div>
      
      <div class="form-column">
        <div class="form-group">
          <label for="pages">页数</label>
          <input id="pages" v-model="bookForm.pages" type="number" min="1" />
        </div>
        
        <div class="form-group">
          <label for="binding">装帧</label>
          <input id="binding" v-model="bookForm.binding" placeholder="例：平装/精装" />
        </div>
        
        <div class="form-group">
          <label for="language">语言</label>
          <input id="language" v-model="bookForm.language" />
        </div>
        
        <div class="form-group">
          <label for="format">开本</label>
          <input id="format" v-model="bookForm.format" placeholder="例：16开" />
        </div>
        
        <div class="form-group">
          <label for="edition">版次</label>
          <input id="edition" v-model="bookForm.edition" />
        </div>
        
        <div class="form-group">
          <label for="words">字数</label>
          <input id="words" v-model="bookForm.words" />
        </div>
        
        <div class="form-group">
          <label for="clcCode">分类号</label>
          <input id="clcCode" v-model="bookForm.clcCode" />
        </div>
        
        <div class="form-group">
          <label for="clcName">分类名称</label>
          <input id="clcName" v-model="bookForm.clcName" />
        </div>
      </div>
      
      <div class="form-group full-width">
        <label for="summary">简介</label>
        <textarea id="summary" v-model="bookForm.summary" rows="5"></textarea>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="goBack" class="cancel-button">取消</button>
        <button type="submit" class="save-button" :disabled="isSaving">
          {{ isSaving ? '保存中...' : '保存修改' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from '~/composables/useMessage'

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref(null)
const message = useMessage()

// 图书表单
const bookForm = ref({
  isbn: '',
  title: '',
  author: '',
  publisher: '',
  pubdate: '',
  price: '',
  summary: '',
  coverUrl: '',
  pages: '',
  pressPlace: '',
  binding: '',
  language: '',
  format: '',
  edition: '',
  words: '',
  clcCode: '',
  clcName: '',
})

// 加载图书详情
onMounted(async () => {
  await fetchBookDetails()
})

// 获取图书详情
async function fetchBookDetails() {
  isLoading.value = true
  error.value = null

  try {
    const bookId = parseInt(route.params.id)
    
    if (isNaN(bookId)) {
      throw new Error('无效的图书ID')
    }
    
    const bookData = await $fetch(`/api/books/${bookId}`)
    
    if (!bookData) {
      throw new Error('找不到图书')
    }
    
    // 将图书数据赋值给表单
    Object.keys(bookForm.value).forEach(key => {
      if (key in bookData) {
        bookForm.value[key] = bookData[key]
      }
    })
  } catch (err) {
    console.error('获取图书详情失败:', err)
    error.value = err.message || '获取图书详情失败'
  } finally {
    isLoading.value = false
  }
}

// 保存图书
async function saveBook() {
  isSaving.value = true
  error.value = null
  
  try {
    const bookId = parseInt(route.params.id)
    
    if (isNaN(bookId)) {
      throw new Error('无效的图书ID')
    }
    
    // 准备要提交的数据（处理数值类型）
    const formData = { ...bookForm.value }
    
    // 如果pages是字符串且有值，转换为数字
    if (formData.pages && typeof formData.pages === 'string') {
      formData.pages = parseInt(formData.pages)
    }
    
    // 价格直接保存，不进行任何转换
    // 价格格式化将在前端显示时处理
    
    // 提交到API
    await $fetch(`/api/books/${bookId}`, {
      method: 'PUT',
      body: formData
    })
    
    message.success('图书信息已成功更新')
    
    // 返回图书详情页
    router.push(`/books/${bookId}`)
  } catch (err) {
    console.error('保存图书失败:', err)
    error.value = err.message || '保存图书失败'
    message.error(`保存失败: ${err.message || '未知错误'}`)
  } finally {
    isSaving.value = false
  }
}

// 返回上一页
function goBack() {
  router.back()
}
</script>

<style scoped>
.edit-book-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  margin: 20px 0;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.error {
  color: #e74c3c;
  border: 1px solid #f8d7da;
  background-color: #fff5f5;
}

.book-form {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.form-column {
  flex: 1;
  min-width: 300px;
}

.form-group {
  margin-bottom: 15px;
}

.full-width {
  width: 100%;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input, textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  resize: vertical;
}

.form-actions {
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-button, .save-button, .back-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.cancel-button {
  background-color: #7f8c8d;
  color: white;
}

.save-button {
  background-color: #2ecc71;
  color: white;
}

.save-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.back-button {
  background-color: #7f8c8d;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .book-form {
    flex-direction: column;
  }
  
  .form-column {
    width: 100%;
  }
}
</style> 