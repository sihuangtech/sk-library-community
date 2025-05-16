export default defineEventHandler(async (event) => {
  // 获取配置中的管理员凭据
  const config = useRuntimeConfig(event)
  const { adminUsername, adminPassword } = config
  
  // 解析请求体
  const body = await readBody(event)
  const { username, password } = body
  
  // 验证用户名和密码
  if (!username || !password) {
    return { 
      success: false, 
      message: '请提供用户名和密码' 
    }
  }
  
  // 验证凭据是否匹配
  if (username === adminUsername && password === adminPassword) {
    // 设置cookie有效期为两星期（14天）
    const twoWeeksInSeconds = 60 * 60 * 24 * 14
    
    // 设置会话cookie
    setCookie(event, 'auth_session', 'authenticated', {
      httpOnly: true,
      path: '/',
      maxAge: twoWeeksInSeconds, // 两星期
      secure: process.env.NODE_ENV === 'production'
    })
    
    return { 
      success: true, 
      message: '登录成功' 
    }
  }
  
  // 凭据不匹配
  return { 
    success: false, 
    message: '用户名或密码错误' 
  }
}) 