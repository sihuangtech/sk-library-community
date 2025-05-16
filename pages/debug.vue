<template>
  <div v-if="showDebugPage" class="debug-page">
    <h1>调试信息</h1>
    
    <div class="debug-section">
      <h2>登录状态</h2>
      <p>当前登录状态: {{ isLoggedIn ? '已登录' : '未登录' }}</p>
      <button @click="checkLoginStatus" class="debug-button">检查登录状态</button>
    </div>
    
    <div class="debug-section">
      <h2>会话信息</h2>
      <div v-if="sessionInfo">
        <pre>{{ sessionInfo }}</pre>
      </div>
      <div v-else>
        <p>未获取会话信息</p>
      </div>
      <button @click="checkSession" class="debug-button">检查会话状态</button>
    </div>
    
    <div class="debug-section">
      <h2>环境信息</h2>
      <pre>{{ envInfo }}</pre>
    </div>
    
    <div class="debug-section">
      <h2>操作</h2>
      <button @click="logout" class="debug-button danger">登出</button>
      <button @click="clearAllCookies" class="debug-button danger">清除所有Cookie</button>
    </div>
    
    <div class="debug-section">
      <h2>导航</h2>
      <NuxtLink to="/" class="debug-link">返回首页</NuxtLink>
      <NuxtLink to="/login" class="debug-link">去登录页</NuxtLink>
    </div>
  </div>
  <div v-else class="debug-disabled">
    <h1>调试功能已禁用</h1>
    <p>请在环境变量中设置 NUXT_PUBLIC_ENABLE_DEBUG=true 启用调试功能</p>
    <NuxtLink to="/" class="debug-link">返回首页</NuxtLink>
  </div>
</template>

<script setup lang="ts">
// 获取环境变量和认证状态
const { $auth } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const router = useRouter()

// 响应式状态
const isLoggedIn = ref($auth.isLoggedIn)
const sessionInfo = ref<string | null>(null)
const showDebugPage = ref(false)
const envInfo = ref<string>('')

// 检查登录状态并重定向未登录用户
onMounted(async () => {
  // 检查是否启用调试功能
  showDebugPage.value = runtimeConfig.public.enableDebug === 'true' || false
  
  // 获取环境信息
  envInfo.value = JSON.stringify({
    nodeEnv: runtimeConfig.public.nodeEnv || process.env.NODE_ENV,
    enableDebug: runtimeConfig.public.enableDebug,
    apiBase: runtimeConfig.public.apiBase || '未设置'
  }, null, 2)
  
  // 检查登录状态
  await checkLoginStatus()
  
  // 如果未登录，重定向到登录页面
  if (!isLoggedIn.value) {
    router.push('/login')
  }
})

// 检查登录状态
async function checkLoginStatus() {
  try {
    const result = await $fetch<{ isLoggedIn: boolean }>('/api/auth/verify')
    isLoggedIn.value = result.isLoggedIn
    $auth.setLoggedIn(result.isLoggedIn)
    sessionInfo.value = JSON.stringify(result, null, 2)
  } catch (error) {
    console.error('验证登录状态错误:', error)
    sessionInfo.value = JSON.stringify({error: '验证失败'}, null, 2)
  }
}

// 检查会话信息
async function checkSession() {
  try {
    const result = await $fetch('/api/auth/session')
    sessionInfo.value = JSON.stringify(result, null, 2)
  } catch (error) {
    console.error('获取会话信息错误:', error)
    sessionInfo.value = JSON.stringify({error: '获取会话信息失败'}, null, 2)
  }
}

// 登出
async function logout() {
  await $auth.logout()
  isLoggedIn.value = false
  sessionInfo.value = JSON.stringify({message: '已登出'}, null, 2)
  // 登出后重定向到登录页面
  router.push('/login')
}

// 清除所有Cookie
function clearAllCookies() {
  if (import.meta.client) {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i]
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    }
    sessionInfo.value = JSON.stringify({message: '已清除所有Cookie'}, null, 2)
  }
}
</script>

<style scoped>
.debug-page, .debug-disabled {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #4361ee;
  margin-bottom: 1.5rem;
}

.debug-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

h2 {
  color: #4361ee;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1rem 0;
}

.debug-button {
  background-color: #4361ee;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-right: 0.5rem;
  margin-top: 1rem;
}

.debug-button:hover {
  background-color: #3a56d4;
}

.debug-button.danger {
  background-color: #e53935;
}

.debug-button.danger:hover {
  background-color: #c62828;
}

.debug-link {
  display: inline-block;
  margin-right: 1rem;
  color: #4361ee;
  text-decoration: none;
}

.debug-link:hover {
  text-decoration: underline;
}

.debug-disabled {
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}
</style>