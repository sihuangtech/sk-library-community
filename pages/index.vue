<template>
  <div class="home-page">
    <div class="hero">
      <h1>家庭图书管理系统</h1>
      <p>轻松管理您家庭的图书收藏，追踪借阅情况</p>
      
      <div v-if="isDebugMode" class="user-info">
        <p>欢迎回来，管理员！</p>
        <p class="login-status">登录状态：{{ isLoggedIn ? '已登录' : '未登录' }}</p>
      </div>
      
      <div class="action-buttons">
        <NuxtLink to="/books/add" class="add-button">添加图书</NuxtLink>
        <NuxtLink to="/books" class="view-button">查看图书馆</NuxtLink>
      </div>
    </div>
    
    <div class="features">
      <div class="feature-card">
        <div class="icon">📚</div>
        <h3>图书管理</h3>
        <p>轻松添加、编辑和管理您的图书收藏</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">🔍</div>
        <h3>ISBN查询</h3>
        <p>通过ISBN自动获取图书详细信息</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">📝</div>
        <h3>借阅记录</h3>
        <p>记录图书借出和归还情况</p>
      </div>
    </div>
    
    <div class="quick-search">
      <h2>快速添加图书</h2>
      <IsbnSearch />
    </div>
  </div>
</template>

<script setup lang="ts">
// 获取登录状态和环境配置
const { $auth } = useNuxtApp()
const config = useRuntimeConfig()
const router = useRouter()
const isLoggedIn = computed(() => $auth.isLoggedIn)

// 检查是否处于调试模式
const isDebugMode = computed(() => config.public.enableDebug === 'true')

// 检查登录状态并重定向
onMounted(async () => {
  // 如果未登录，重定向到登录页面
  if (!isLoggedIn.value) {
    console.log('用户未登录，重定向到登录页面')
    await router.push('/login')
  }
})
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.hero h1 {
  color: #4361ee;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.add-button, .view-button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
}

.add-button {
  background-color: #10b981;
  color: white;
}

.add-button:hover {
  background-color: #059669;
}

.view-button {
  background-color: #4361ee;
  color: white;
}

.view-button:hover {
  background-color: #3a56d4;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.feature-card {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #4361ee;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #666;
}

.quick-search {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quick-search h2 {
  color: #4361ee;
  text-align: center;
  margin-bottom: 1.5rem;
}

.user-info {
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background-color: #f0f7ff;
  border-radius: 4px;
  display: inline-block;
}

.login-status {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
  
  .hero p {
    font-size: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .add-button, .view-button {
    width: 100%;
    text-align: center;
  }
}
</style> 