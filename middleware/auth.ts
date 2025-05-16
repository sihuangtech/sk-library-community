export default defineNuxtRouteMiddleware((to) => {
  // 在服务器端和客户端都需要验证
  const { $auth } = useNuxtApp()
  
  // 如果目标路由是登录页，则允许访问
  if (to.path === '/login') {
    return
  }
  
  // 检查用户是否已登录，未登录则重定向到登录页
  if (!$auth.isLoggedIn) {
    return navigateTo('/login')
  }
}) 