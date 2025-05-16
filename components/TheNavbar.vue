<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <h1>家庭图书管理系统</h1>
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
  background-color: #4a90e2;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand h1 {
  margin: 0;
  font-size: 1.2rem;
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
  color: #4a90e2;
}
</style> 