<template>
  <div class="categories-page">
    <h1>图书分类管理</h1>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      <p>加载分类信息中...</p>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
    
    <div class="categories-container">
      <div class="categories-actions">
        <button class="add-button" @click="openAddDialog">添加新分类</button>
      </div>
      
      <!-- 分类列表 -->
      <div v-if="!isLoading && categories.length > 0" class="categories-list">
        <div v-for="category in categories" :key="category.id" class="category-item">
          <div class="category-info">
            <h3 class="category-name">{{ category.name }}</h3>
            <p v-if="category.description" class="category-description">{{ category.description }}</p>
            <p class="category-meta">
              <span>创建时间: {{ formatDate(category.createdAt) }}</span>
              <span>图书数量: {{ category.bookCount || 0 }}</span>
            </p>
          </div>
          <div class="category-actions">
            <button class="view-button" @click="viewCategoryBooks(category.id)">查看图书</button>
            <button class="edit-button" @click="openEditDialog(category)">编辑</button>
            <button class="delete-button" @click="confirmDeleteCategory(category)">删除</button>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="!isLoading && categories.length === 0" class="empty-state">
        <p>暂无分类信息，请先添加分类。</p>
      </div>
    </div>
    
    <!-- 添加/编辑分类对话框 -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>{{ isEditing ? '编辑分类' : '添加分类' }}</h3>
        
        <div class="form-group">
          <label for="name">分类名称*</label>
          <input
            v-model="categoryForm.name"
            type="text"
            id="name"
            placeholder="请输入分类名称"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="description">分类描述</label>
          <textarea
            v-model="categoryForm.description"
            id="description"
            placeholder="请输入分类描述"
            rows="3"
          ></textarea>
        </div>
        
        <div class="dialog-actions">
          <button @click="closeDialog" class="cancel-button">取消</button>
          <button @click="saveCategory" class="confirm-button" :disabled="isSaving">
            {{ isSaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from '~/composables/useMessage'

// 类型定义
interface Category {
  id: number
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  bookCount?: number
}

// 状态管理
const router = useRouter()
const message = useMessage()
const categories = ref<Category[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')

// 对话框状态
const showDialog = ref(false)
const isEditing = ref(false)
const categoryForm = ref({
  id: 0,
  name: '',
  description: ''
})

// 页面加载时获取所有分类
onMounted(async () => {
  await fetchCategories()
})

// 获取分类列表
const fetchCategories = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await fetch('/api/categories')
    
    if (!response.ok) {
      throw new Error(`获取分类失败 (${response.status}): ${response.statusText}`)
    }
    
    categories.value = await response.json()
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '获取分类列表失败，请稍后再试'
    error.value = errorMessage
    console.error('获取分类错误:', err)
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

// 查看分类下的图书
const viewCategoryBooks = (categoryId: number) => {
  router.push(`/categories/${categoryId}`)
}

// 打开添加分类对话框
const openAddDialog = () => {
  isEditing.value = false
  categoryForm.value = {
    id: 0,
    name: '',
    description: ''
  }
  showDialog.value = true
}

// 打开编辑分类对话框
const openEditDialog = (category: Category) => {
  isEditing.value = true
  categoryForm.value = {
    id: category.id,
    name: category.name,
    description: category.description || ''
  }
  showDialog.value = true
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
}

// 保存分类
const saveCategory = async () => {
  // 表单验证
  if (!categoryForm.value.name.trim()) {
    message.warning('分类名称不能为空')
    return
  }
  
  isSaving.value = true
  
  try {
    let response
    
    if (isEditing.value) {
      // 更新分类
      response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryForm.value)
      })
    } else {
      // 创建分类
      response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: categoryForm.value.name,
          description: categoryForm.value.description
        })
      })
    }
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || `${isEditing.value ? '更新' : '创建'}分类失败`)
    }
    
    // 关闭对话框并刷新分类列表
    closeDialog()
    await fetchCategories()
    
    // 显示成功消息
    message.success(`${isEditing.value ? '更新' : '创建'}分类成功`)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : `${isEditing.value ? '更新' : '创建'}分类失败`
    message.error(errorMessage)
    console.error(`${isEditing.value ? '更新' : '创建'}分类错误:`, err)
  } finally {
    isSaving.value = false
  }
}

// 确认删除分类
const confirmDeleteCategory = async (category: Category) => {
  const confirmed = await message.confirm(`确定要删除"${category.name}"分类吗？此操作不可恢复！`)
  
  if (confirmed) {
    await deleteCategory(category.id)
  }
}

// 删除分类
const deleteCategory = async (categoryId: number) => {
  isLoading.value = true
  
  try {
    const response = await fetch('/api/categories', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: categoryId })
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || '删除分类失败')
    }
    
    // 刷新分类列表
    await fetchCategories()
    
    // 显示成功消息
    message.success('分类已成功删除')
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '删除分类失败'
    message.error(errorMessage)
    console.error('删除分类错误:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.categories-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #333;
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

.categories-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.add-button {
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-info {
  flex: 1;
}

.category-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.category-description {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.category-meta {
  display: flex;
  gap: 16px;
  color: #999;
  font-size: 12px;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.view-button, .edit-button, .delete-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.view-button {
  background-color: #52c41a;
  color: white;
}

.edit-button {
  background-color: #faad14;
  color: white;
}

.delete-button {
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
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.cancel-button,
.confirm-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-button {
  background-color: #f0f0f0;
  color: #333;
}

.confirm-button {
  background-color: #1890ff;
  color: white;
}

.confirm-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .category-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .category-actions {
    margin-top: 16px;
    align-self: flex-end;
  }
}
</style> 