export default defineNuxtPlugin((nuxtApp) => {
  // 使用useState在客户端创建一个响应式的登录状态
  const isLoggedIn = useState('auth:loggedIn', () => false)
  
  // 返回提供给应用程序的方法
  return {
    provide: {
      auth: {
        // 获取登录状态
        get isLoggedIn() {
          return isLoggedIn.value
        },
        
        // 设置登录状态
        setLoggedIn(value: boolean) {
          isLoggedIn.value = value
        },
        
        // 登录方法
        async login(username: string, password: string) {
          try {
            // 调用登录API验证凭据
            const response = await $fetch('/api/auth/login', {
              method: 'POST',
              body: { username, password }
            })
            
            // 如果登录成功，设置登录状态为true
            if (response.success) {
              isLoggedIn.value = true
              return { success: true }
            }
            
            return { success: false, message: response.message || '登录失败' }
          } catch (error) {
            return { success: false, message: '登录失败，请稍后重试' }
          }
        },
        
        // 登出方法
        async logout() {
          try {
            // 调用登出API
            await $fetch('/api/auth/logout', { method: 'POST' })
          } catch (error) {
            console.error('登出错误:', error)
          } finally {
            // 无论如何都设置登录状态为false
            isLoggedIn.value = false
          }
        }
      }
    }
  }
}) 