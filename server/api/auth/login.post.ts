export default defineEventHandler(async (event) => {
  // 获取配置中的管理员凭据
  const config = useRuntimeConfig(event)
  const { adminUsername, adminPassword, authSessionMaxAgeDays } = config
  
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
    // 从环境变量中获取会话有效期（单位：天）并转换为秒
    const sessionMaxAgeInSeconds = 60 * 60 * 24 * authSessionMaxAgeDays
    
    // 设置会话cookie
    setCookie(event, 'auth_session', 'authenticated', {
      httpOnly: true,
      path: '/',
      maxAge: sessionMaxAgeInSeconds,
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