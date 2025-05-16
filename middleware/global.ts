export default defineNuxtRouteMiddleware(async (to) => {
  // 获取运行时配置
  const config = useRuntimeConfig()
  const enableDebug = config.public.enableDebug === 'true'
  
  // 如果目标路由是登录页，则不需要验证
  if (to.path === '/login') {
    return
  }
  
  // 处理调试页面访问权限
  if (to.path === '/debug') {
    // 如果调试模式未启用，重定向到首页
    if (!enableDebug) {
      console.log('调试功能未启用，无法访问调试页面')
      return navigateTo('/')
    }
  }
  
  // 获取Nuxt应用实例
  const nuxtApp = useNuxtApp()
  
  // 验证会话
  try {
    const { isLoggedIn } = await $fetch<{ isLoggedIn: boolean }>('/api/auth/verify')
    
    // 更新登录状态
    nuxtApp.$auth.setLoggedIn(isLoggedIn)
    
    // 如果用户未登录，重定向到登录页
    if (!isLoggedIn) {
      console.log('用户未登录，重定向到登录页')
      return navigateTo('/login')
    }
  } catch (error) {
    console.error('验证会话错误:', error)
    // 发生错误时重定向到登录页
    nuxtApp.$auth.setLoggedIn(false)
    return navigateTo('/login')
  }
}) 