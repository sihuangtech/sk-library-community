import { defineEventHandler } from 'h3'
import { parseCookies } from 'h3'

export default defineEventHandler((event) => {
  // 获取所有cookie
  const cookies = parseCookies(event)
  
  // 检查会话cookie
  const authCookie = cookies['auth_session']
  
  return {
    cookies: cookies,
    authSession: authCookie,
    isLoggedIn: authCookie === 'authenticated'
  }
})