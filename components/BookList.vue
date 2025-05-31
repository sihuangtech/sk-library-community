<template>
  <div class="book-list">
    <!-- 过滤、搜索和分类管理工具 -->
    <div class="filters">
      <div class="filter-group">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索书名或作者..."
            @input="filterBooks"
          />
        </div>
        
        <div class="category-filter">
          <select v-model="selectedCategoryId" @change="filterByCategory">
            <option value="all">全部分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }} ({{ category.bookCount || 0 }})
            </option>
          </select>
          <button @click="openCategoryDialog" class="category-manage-button">管理分类</button>
        </div>
      </div>
      
      <div class="layout-switcher">
        <button 
          @click="layout = 'list'" 
          class="layout-button" 
          :class="{ active: layout === 'list' }"
          title="列表布局"
        >
          <span class="icon">☰</span>
        </button>
        <button 
          @click="layout = 'grid'" 
          class="layout-button" 
          :class="{ active: layout === 'grid' }"
          title="网格布局"
        >
          <span class="icon">▦</span>
        </button>
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
    
    <!-- 列表布局 -->
    <div v-if="!isLoading && filteredBooks.length > 0 && layout === 'list'" class="books-list">
      <div v-for="book in filteredBooks" :key="book.id" class="book-list-item">
        <div class="book-cover-small">
          <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" />
          <div v-else class="no-cover">
            <span>暂无封面</span>
          </div>
        </div>
        
        <div class="book-info-list">
          <h3 class="book-title">{{ book.title }}</h3>
          <div class="book-details-list">
            <p v-if="book.author"><strong>作者：</strong>{{ book.author }}</p>
            <p v-if="book.publisher"><strong>出版社：</strong>{{ book.publisher }}</p>
            <p v-if="book.pubdate"><strong>出版日期：</strong>{{ book.pubdate }}</p>
            <p v-if="book.price"><strong>价格：</strong>{{ formatPrice(book.price) }}</p>
          </div>
          
          <!-- 借阅状态 -->
          <div class="borrow-status" :class="{ borrowed: book.borrowedBy }">
            <span v-if="book.borrowedBy">
              已借出给 {{ book.borrowedBy }}
              <span v-if="book.borrowerPhone" class="phone-info">（{{ book.borrowerPhone }}）</span>
            </span>
            <span v-else>在馆</span>
          </div>
          
          <!-- 分类标签 -->
          <div v-if="bookCategories[book.id]?.length" class="book-categories">
            <span v-for="category in bookCategories[book.id]" :key="category.id" class="category-tag">
              {{ category.name }}
              <button @click.stop="removeBookFromCategory(book.id, category.id)" class="remove-tag">×</button>
            </span>
            <button @click="openAddCategoryDialog(book)" class="add-category-button">+</button>
          </div>
          <div v-else class="book-categories">
            <button @click="openAddCategoryDialog(book)" class="add-category-button">添加分类</button>
          </div>
        </div>
        
        <div class="actions-list">
          <button @click="viewBookDetails(book.id)" class="view-button">详情</button>
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
          <button @click="editBook(book.id)" class="edit-button">编辑</button>
          <button @click="confirmDeleteBook(book)" class="delete-button">删除</button>
        </div>
      </div>
    </div>
    
    <!-- 网格布局 -->
    <div v-if="!isLoading && filteredBooks.length > 0 && layout === 'grid'" class="books-grid">
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
          <p v-if="book.price"><strong>价格：</strong>{{ formatPrice(book.price) }}</p>
          
          <!-- 借阅状态 -->
          <div class="borrow-status" :class="{ borrowed: book.borrowedBy }">
            <span v-if="book.borrowedBy">
              已借出给 {{ book.borrowedBy }}
              <span v-if="book.borrowerPhone" class="phone-info">（{{ book.borrowerPhone }}）</span>
            </span>
            <span v-else>在馆</span>
          </div>
          
          <!-- 分类标签 -->
          <div v-if="bookCategories[book.id]?.length" class="book-categories">
            <span v-for="category in bookCategories[book.id]" :key="category.id" class="category-tag">
              {{ category.name }}
              <button @click.stop="removeBookFromCategory(book.id, category.id)" class="remove-tag">×</button>
            </span>
            <button @click="openAddCategoryDialog(book)" class="add-category-button">+</button>
          </div>
          <div v-else class="book-categories">
            <button @click="openAddCategoryDialog(book)" class="add-category-button">添加分类</button>
          </div>
          
          <div class="actions">
            <button @click="viewBookDetails(book.id)" class="view-button">详情</button>
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
            <button @click="editBook(book.id)" class="edit-button">编辑</button>
            <button @click="confirmDeleteBook(book)" class="delete-button">删除</button>
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
          <input v-model="borrower" type="text" id="borrower" placeholder="请输入借阅人姓名" />
        </div>
        
        <div class="form-group">
          <label for="borrowerPhone">借阅人手机号：</label>
          <input v-model="borrowerPhone" type="tel" id="borrowerPhone" placeholder="请输入手机号" />
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
    
    <!-- 分类管理对话框 -->
    <div v-if="showCategoryDialog" class="dialog-overlay">
      <div class="dialog category-dialog">
        <h3>分类管理</h3>
        
        <div class="category-list">
          <div v-if="categories.length === 0" class="empty-category">
            <p>暂无分类，请创建新分类</p>
          </div>
          
          <div v-else class="category-items">
            <div v-for="category in categories" :key="category.id" class="category-item">
              <div class="category-info">
                <h4>{{ category.name }}</h4>
                <p v-if="category.description">{{ category.description }}</p>
                <p class="category-count">图书数: {{ category.bookCount || 0 }}</p>
              </div>
              <div class="category-actions">
                <button @click="editCategory(category)" class="edit-button">编辑</button>
                <button @click="confirmDeleteCategory(category)" class="delete-button">删除</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="category-form">
          <h4>{{ isEditingCategory ? '编辑分类' : '添加新分类' }}</h4>
          
          <div class="form-group">
            <label for="categoryName">分类名称</label>
            <input v-model="categoryForm.name" type="text" id="categoryName" placeholder="输入分类名称" />
          </div>
          
          <div class="form-group">
            <label for="categoryDescription">分类描述</label>
            <textarea v-model="categoryForm.description" id="categoryDescription" placeholder="输入分类描述"></textarea>
          </div>
          
          <div class="form-actions">
            <button v-if="isEditingCategory" @click="cancelEditCategory" class="cancel-button">取消编辑</button>
            <button @click="saveCategory" class="save-button">{{ isEditingCategory ? '保存修改' : '创建分类' }}</button>
          </div>
        </div>
        
        <div class="dialog-actions">
          <button @click="closeCategoryDialog" class="close-button">关闭</button>
        </div>
      </div>
    </div>
    
    <!-- 添加图书到分类对话框 -->
    <div v-if="showAddCategoryDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>将《{{ selectedBook?.title }}》添加到分类</h3>
        
        <div class="available-categories">
          <div v-if="availableCategories.length === 0" class="empty-category">
            <p>没有可用的分类</p>
          </div>
          
          <div v-else class="category-items">
            <div v-for="category in availableCategories" :key="category.id" class="category-item selectable" @click="addBookToCategory(selectedBook?.id, category.id)">
              <div class="category-info">
                <h4>{{ category.name }}</h4>
                <p v-if="category.description">{{ category.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dialog-actions">
          <button @click="closeAddCategoryDialog" class="cancel-button">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from '~/composables/useMessage'

// 定义事件发射
const emit = defineEmits<{
  'books-loaded': [books: Book[]]
}>()

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
  borrowerPhone?: string | null;
}

// 定义分类数据类型
interface Category {
  id: number;
  name: string;
  description?: string;
  bookCount?: number;
}

// 状态管理
const books = ref<Book[]>([])
const filteredBooks = ref<Book[]>([])
const categories = ref<Category[]>([])
const bookCategories = ref<Record<number, Category[]>>({}) // 保存每本书的分类信息
const searchQuery = ref('')
const isLoading = ref(false)
const error = ref('')
const router = useRouter()
const layout = ref('list') // 默认列表布局
const message = useMessage() // 使用消息服务

// 分类筛选状态
const selectedCategoryId = ref<number | 'all'>('all')

// 借阅相关状态
const showBorrowDialog = ref(false)
const selectedBook = ref<Book | null>(null)
const borrower = ref('')
const borrowerPhone = ref('')
const returnDate = ref('')

// 分类管理状态
const showCategoryDialog = ref(false)
const isEditingCategory = ref(false)
const categoryForm = ref({
  id: 0,
  name: '',
  description: ''
})

// 添加图书到分类状态
const showAddCategoryDialog = ref(false)
const availableCategories = computed(() => {
  if (!selectedBook.value) return []
  
  const bookId = selectedBook.value.id
  const bookCats = bookCategories.value[bookId] || []
  const existingCategoryIds = bookCats.map(c => c.id)
  
  return categories.value.filter(c => !existingCategoryIds.includes(c.id))
})

// 格式化价格显示
const formatPrice = (price: string | number | null | undefined): string => {
  if (price === null || price === undefined || price === '') return '未知'
  
  // 如果已经是格式化的价格字符串，直接返回
  if (typeof price === 'string') {
    if (price.includes('¥') || price.includes('￥')) return price
    
    // 尝试转换为数字
    const numPrice = Number(price)
    if (isNaN(numPrice)) return price // 如果不是数字，直接返回原始字符串
    
    // 如果是有效数字，则格式化
    return `¥${numPrice.toFixed(2)}`
  }
  
  // 处理数字类型的价格
  if (typeof price === 'number') {
    if (price > 1000) { // 假设是以分为单位
      return `¥${(price / 100).toFixed(2)}`
    }
    return `¥${price.toFixed(2)}`
  }
  
  return '未知'
}

// 页面加载时获取所有图书和分类
onMounted(async () => {
  await Promise.all([
    fetchBooks(),
    fetchCategories()
  ])
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
    
    // 获取每本书的分类
    await fetchBookCategories()
    emit('books-loaded', data)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    error.value = errorMessage || '获取图书列表失败，请稍后再试'
    console.error('获取图书错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 获取所有分类
const fetchCategories = async () => {
  try {
    const response = await fetch('/api/categories')
    
    if (!response.ok) {
      throw new Error(`获取分类失败 (${response.status}): ${response.statusText}`)
    }
    
    categories.value = await response.json()
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    console.error('获取分类错误:', err)
    message.error('获取分类失败: ' + errorMessage)
  }
}

// 获取每本书的分类
const fetchBookCategories = async () => {
  try {
    // 初始化分类信息对象
    bookCategories.value = {}
    
    // 为每本书获取分类信息
    for (const book of books.value) {
      const response = await fetch(`/api/book-categories?bookId=${book.id}`)
      
      if (response.ok) {
        const categories = await response.json()
        bookCategories.value[book.id] = categories
      }
    }
  } catch (err: unknown) {
    const _errorMessage = err instanceof Error ? err.message : '未知错误'
    console.error('获取图书分类错误:', err)
  }
}

// 根据搜索查询过滤书籍
const filterBooks = () => {
  if (selectedCategoryId.value === 'all' && !searchQuery.value.trim()) {
    filteredBooks.value = books.value
    return
  }
  
  // 先按分类筛选
  let filtered = books.value
  
  if (selectedCategoryId.value !== 'all') {
    filtered = filtered.filter(book => {
      const bookCats = bookCategories.value[book.id] || []
      return bookCats.some(cat => cat.id === selectedCategoryId.value)
    })
  }
  
  // 再按搜索词筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(book => 
      book.title.toLowerCase().includes(query) || 
      (book.author && book.author.toLowerCase().includes(query))
    )
  }
  
  filteredBooks.value = filtered
}

// 按分类筛选图书
const filterByCategory = () => {
  filterBooks()
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
  borrowerPhone.value = ''
  
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
  if (!selectedBook.value || !borrower.value.trim() || !borrowerPhone.value.trim() || !returnDate.value) {
    message.warning('请填写完整信息（姓名、手机号、归还日期）')
    return
  }
  
  // 简单的手机号验证
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(borrowerPhone.value.trim())) {
    message.warning('请输入正确的手机号格式')
    return
  }
  
  try {
    isLoading.value = true
    
    // 保存图书信息，避免在closeBorrowDialog后访问null值
    const bookTitle = selectedBook.value.title
    const borrowerName = borrower.value.trim()
    
    const response = await fetch(`/api/books/${selectedBook.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        borrowedBy: borrowerName,
        borrowerPhone: borrowerPhone.value.trim(),
        borrowedAt: new Date().toISOString(),
        returnDate: new Date(returnDate.value).toISOString()
      })
    })
    
    if (!response.ok) {
      throw new Error(`借出失败 (${response.status}): ${response.statusText}`)
    }
    
    closeBorrowDialog()
    await fetchBooks()
    message.success(`成功借出《${bookTitle}》给 ${borrowerName}`)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    error.value = errorMessage || '借出图书失败，请稍后再试'
    message.error(`借出失败: ${errorMessage || '未知错误'}`)
    console.error('借出图书错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 归还图书
const returnBook = async (id: number) => {
  const confirmed = await message.confirm('确定要归还此图书吗？')
  if (!confirmed) {
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
        borrowerPhone: null,
        borrowedAt: null,
        returnDate: null
      })
    })
    
    if (!response.ok) {
      throw new Error(`归还失败 (${response.status}): ${response.statusText}`)
    }
    
    await fetchBooks()
    message.success('图书已成功归还')
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    error.value = errorMessage || '归还图书失败，请稍后再试'
    message.error(`归还失败: ${errorMessage || '未知错误'}`)
    console.error('归还图书错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 导航到编辑图书页面
const editBook = (id: number) => {
  router.push(`/books/edit/${id}`)
}

// 确认删除图书
const confirmDeleteBook = async (book: Book) => {
  const confirmed = await message.confirm(`确定要删除《${book.title}》吗？此操作不可恢复！`)
  if (confirmed) {
    deleteBook(book.id)
  }
}

// 删除图书
const deleteBook = async (id: number) => {
  try {
    isLoading.value = true
    
    await fetch(`/api/books/${id}`, {
      method: 'DELETE'
    })
    
    message.success('图书已成功删除')
    
    // 重新获取图书列表
    await fetchBooks()
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    error.value = `删除图书失败: ${errorMessage}`
    message.error(`删除图书失败: ${errorMessage}`)
    console.error('删除图书错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 打开分类管理对话框
const openCategoryDialog = () => {
  showCategoryDialog.value = true
  resetCategoryForm()
}

// 关闭分类管理对话框
const closeCategoryDialog = () => {
  showCategoryDialog.value = false
  resetCategoryForm()
}

// 重置分类表单
const resetCategoryForm = () => {
  categoryForm.value = {
    id: 0,
    name: '',
    description: ''
  }
  isEditingCategory.value = false
}

// 编辑分类
const editCategory = (category: Category) => {
  isEditingCategory.value = true
  categoryForm.value = {
    id: category.id,
    name: category.name,
    description: category.description || ''
  }
}

// 取消编辑分类
const cancelEditCategory = () => {
  resetCategoryForm()
}

// 保存分类
const saveCategory = async () => {
  if (!categoryForm.value.name.trim()) {
    message.warning('分类名称不能为空')
    return
  }
  
  try {
    isLoading.value = true
    let response
    
    if (isEditingCategory.value) {
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
      throw new Error(data.message || '保存分类失败')
    }
    
    await fetchCategories()
    message.success(isEditingCategory.value ? '分类已更新' : '分类已创建')
    resetCategoryForm()
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    message.error(errorMessage || '保存分类失败')
    console.error('保存分类错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 确认删除分类
const confirmDeleteCategory = async (category: Category) => {
  const confirmed = await message.confirm(`确定要删除"${category.name}"分类吗？该分类下的图书将不再属于此分类。`)
  if (confirmed) {
    await deleteCategory(category.id)
  }
}

// 删除分类
const deleteCategory = async (id: number) => {
  try {
    isLoading.value = true
    
    const response = await fetch('/api/categories', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || '删除分类失败')
    }
    
    await Promise.all([
      fetchCategories(),
      fetchBookCategories()
    ])
    
    message.success('分类已成功删除')
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    message.error(errorMessage || '删除分类失败')
    console.error('删除分类错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 打开添加图书到分类对话框
const openAddCategoryDialog = (book: Book) => {
  selectedBook.value = book
  showAddCategoryDialog.value = true
}

// 关闭添加图书到分类对话框
const closeAddCategoryDialog = () => {
  showAddCategoryDialog.value = false
  selectedBook.value = null
}

// 添加图书到分类
const addBookToCategory = async (bookId?: number, categoryId?: number) => {
  if (!bookId || !categoryId) {
    message.warning('添加失败，图书或分类信息不完整')
    return
  }
  
  try {
    isLoading.value = true
    
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
    message.success(result.message || '图书已添加到分类')
    
    await fetchBookCategories()
    closeAddCategoryDialog()
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    message.error(errorMessage || '添加图书到分类失败')
    console.error('添加图书到分类错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 从分类中移除图书
const removeBookFromCategory = async (bookId: number, categoryId: number) => {
  try {
    isLoading.value = true
    
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
    message.success(result.message || '图书已从分类中移除')
    
    await fetchBookCategories()
    
    // 如果正在按分类筛选，可能需要更新筛选结果
    if (selectedCategoryId.value !== 'all') {
      filterBooks()
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    message.error(errorMessage || '从分类中移除图书失败')
    console.error('从分类中移除图书错误:', err)
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
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.search-box {
  width: 300px;
}

.search-box input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.category-filter {
  display: flex;
  gap: 10px;
  align-items: center;
}

.category-filter select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  min-width: 150px;
  background-color: var(--card-bg);
  color: var(--text-color);
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.category-manage-button {
  padding: 0.75rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.layout-switcher {
  display: flex;
  gap: 5px;
}

.layout-button {
  background-color: var(--secondary-color);
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  color: var(--text-color);
}

.layout-button.active {
  background-color: var(--primary-color);
  color: white;
}

.layout-button .icon {
  font-size: 1.2rem;
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
  background-color: var(--secondary-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  opacity: 0.7;
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

.books-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.book-list-item {
  display: flex;
  background-color: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s ease;
}

.book-list-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.book-cover-small {
  flex: 0 0 120px;
  height: 160px;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-cover-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info-list {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.book-details-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.book-details-list p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
}

.book-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.remove-tag {
  background: none;
  border: none;
  color: #ff4d4f;
  margin-left: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0 4px;
}

.add-category-button {
  background-color: var(--secondary-color);
  color: var(--text-color);
  opacity: 0.7;
  border: none;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.8rem;
  cursor: pointer;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  justify-content: center;
}

.view-button, .borrow-button, .return-button, .edit-button, .delete-button {
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

.borrow-button, .edit-button {
  background-color: #10b981;
  color: white;
}

.return-button, .delete-button {
  background-color: #f59e0b;
  color: white;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.book-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s ease;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
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
  background-color: var(--secondary-color);
  color: var(--text-color);
  opacity: 0.5;
}

.book-info {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-info p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
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
  flex-wrap: wrap;
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
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: var(--shadow);
  transition: background-color 0.3s ease;
}

.dialog h3 {
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.dialog h4 {
  margin-bottom: 1rem;
  color: var(--text-color);
}

.dialog p {
  margin-bottom: 1rem;
  font-weight: bold;
  color: var(--text-color);
}

.category-dialog {
  max-width: 700px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.category-dialog h3 {
  grid-column: span 2;
  margin-bottom: 1rem;
}

.category-dialog .dialog-actions {
  grid-column: span 2;
  margin-top: 1rem;
}

.dialog h3 {
  margin-bottom: 0.5rem;
  color: #4361ee;
}

.dialog h4 {
  margin-bottom: 1rem;
  color: #333;
}

.dialog p {
  margin-bottom: 1rem;
  font-weight: bold;
}

.category-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1rem;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  padding: 10px;
  border-radius: 4px;
  background-color: var(--secondary-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-item.selectable {
  cursor: pointer;
  transition: background-color 0.2s;
}

.category-item.selectable:hover {
  background-color: #e6f7ff;
}

.category-info h4 {
  margin: 0 0 5px 0;
  font-size: 1rem;
  color: var(--text-color);
}

.category-info p {
  margin: 0;
  font-weight: normal;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
}

.category-count {
  font-size: 0.8rem !important;
  color: var(--text-color) !important;
  opacity: 0.5 !important;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.empty-category {
  padding: 2rem;
  text-align: center;
  color: var(--text-color);
  opacity: 0.5;
}

.available-categories {
  max-height: 300px;
  overflow-y: auto;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.cancel-button, .confirm-button, .save-button, .close-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-button {
  background-color: var(--secondary-color);
  color: var(--text-color);
}

.confirm-button, .save-button {
  background-color: #10b981;
  color: white;
}

.close-button {
  background-color: var(--primary-color);
  color: white;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
  
  .category-filter {
    width: 100%;
  }
  
  .category-dialog {
    grid-template-columns: 1fr;
  }
  
  .category-dialog h3,
  .category-dialog .dialog-actions {
    grid-column: 1;
  }
  
  .book-list-item {
    flex-direction: column;
  }
  
  .book-cover-small {
    width: 100%;
    height: 200px;
  }
  
  .actions-list {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .view-button, .borrow-button, .return-button, .edit-button, .delete-button {
    flex: 1 0 40%;
  }
}
</style> 