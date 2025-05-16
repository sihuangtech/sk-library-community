export default defineEventHandler((event) => {
  // 检查会话cookie
  const authCookie = getCookie(event, 'auth_session')
  
  // 如果存在有效的会话cookie，则用户已登录
  if (authCookie === 'authenticated') {
    return { isLoggedIn: true }
  }
  
  // 否则用户未登录
  return { isLoggedIn: false }
}) 