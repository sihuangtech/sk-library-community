export default defineEventHandler((event) => {
  // 清除会话cookie
  deleteCookie(event, 'auth_session', {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production'
  })
  
  return { 
    success: true, 
    message: '已成功登出' 
  }
}) 