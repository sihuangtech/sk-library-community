<template>
  <div class="login-container">
    <div class="login-form">
      <h1>家庭图书管理系统</h1>
      <h2>管理员登录</h2>
      
      <div class="form-group">
        <label for="username">用户名</label>
        <input 
          id="username" 
          v-model="username" 
          type="text" 
          placeholder="请输入用户名"
          @keyup.enter="submitLogin"
        >
      </div>
      
      <div class="form-group">
        <label for="password">密码</label>
        <input 
          id="password" 
          v-model="password" 
          type="password" 
          placeholder="请输入密码"
          @keyup.enter="submitLogin"
        >
      </div>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <button 
        class="login-button" 
        :disabled="isLoading"
        @click="submitLogin" 
      >
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义使用登录布局
definePageMeta({
  layout: 'login',
})

const { $auth } = useNuxtApp()
const router = useRouter()

// 响应式状态
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

// 提交登录
async function submitLogin() {
  // 清除之前的错误信息
  errorMessage.value = ''
  
  // 表单验证
  if (!username.value.trim() || !password.value.trim()) {
    errorMessage.value = '请输入用户名和密码'
    return
  }
  
  try {
    isLoading.value = true
    
    // 调用登录方法
    const result = await $auth.login(username.value, password.value)
    
    if (result.success) {
      // 登录成功，重定向到首页
      router.push('/')
    } else {
      // 显示错误信息
      errorMessage.value = result.message || '登录失败'
    }
  } catch (error) {
    errorMessage.value = '登录失败，请稍后重试'
    console.error('登录错误:', error)
  } finally {
    isLoading.value = false
  }
}

// 检查用户是否已登录，如果已登录则重定向到首页
onMounted(async () => {
  try {
    // 验证当前登录状态
    const { isLoggedIn } = await $fetch<{ isLoggedIn: boolean }>('/api/auth/verify')
    if (isLoggedIn) {
      $auth.setLoggedIn(true)
      router.push('/')
    }
  } catch (error) {
    console.error('验证登录状态错误:', error)
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-color);
  transition: background-color 0.3s ease;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: var(--shadow);
  transition: background-color 0.3s ease;
}

h1 {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

h2 {
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  opacity: 0.7;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #3a56d4;
}

.login-button:disabled {
  background-color: #a0c5f0;
  cursor: not-allowed;
}

.error-message {
  color: #e53935;
  margin-bottom: 1rem;
  text-align: center;
}
</style> 