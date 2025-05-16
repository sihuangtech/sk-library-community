<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="logo">
        <h1>家庭图书管理系统</h1>
      </div>
      <nav class="nav">
        <ul>
          <li>
            <NuxtLink to="/">首页</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/books">图书列表</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/books/add">添加图书</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/borrow">借阅管理</NuxtLink>
          </li>
          <li>
            <a href="#" @click.prevent="logout" class="logout-btn">退出登录</a>
          </li>
        </ul>
      </nav>
    </header>
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <slot />
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <p>© {{ new Date().getFullYear() }} 家庭图书管理系统 - 由Nuxt强力驱动</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 获取auth服务
const { $auth } = useNuxtApp()
const router = useRouter()

// 登出方法
async function logout() {
  await $auth.logout()
  router.push('/login')
}
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
  background-color: #f5f5f5;
  line-height: 1.6;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 顶部导航栏样式 */
.header {
  background-color: #4361ee;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav ul {
  display: flex;
  list-style: none;
  gap: 1.5rem;
}

.nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav a:hover, .nav a.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

/* 页脚样式 */
.footer {
  background-color: #f0f0f0;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
  font-size: 0.9rem;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    padding: 1rem;
  }
  
  .nav {
    margin-top: 1rem;
    width: 100%;
  }
  
  .nav ul {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .main-content {
    padding: 1rem;
  }
}

/* 登出按钮样式 */
.logout-btn {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.1);
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style> 