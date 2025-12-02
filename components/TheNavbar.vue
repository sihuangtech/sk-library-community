<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <h1>图书管理系统</h1>
    </div>
    
    <!-- 导航菜单 -->
    <div class="navbar-menu">
      <NuxtLink to="/" class="nav-link">首页</NuxtLink>
      <NuxtLink to="/books" class="nav-link">图书管理</NuxtLink>
      <NuxtLink to="/books/add" class="nav-link">添加图书</NuxtLink>
      <NuxtLink to="/borrow" class="nav-link">借阅管理</NuxtLink>
      <NuxtLink to="/settings" class="nav-link">系统设置</NuxtLink>
    </div>
    
    <div class="navbar-actions">
      <button class="logout-button" @click="handleLogout">
        登出
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { $auth } = useNuxtApp()
const router = useRouter()

// 处理登出操作
async function handleLogout() {
  try {
    // 调用登出方法
    await $auth.logout()
    
    // 重定向到登录页
    router.push('/login')
  } catch (error) {
    console.error('登出错误:', error)
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--primary-color);
  color: white;
  box-shadow: var(--shadow);
  transition: background-color 0.3s ease;
}

.navbar-brand h1 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.navbar-menu {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.logout-button {
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid white;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background-color: white;
  color: var(--primary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .navbar-menu {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
  
  .nav-link {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style> 