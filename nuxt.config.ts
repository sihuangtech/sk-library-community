// https://nuxt.com/docs/api/configuration/nuxt-config

// 检测是否在Electron环境中运行
const isElectron = process.env.npm_lifecycle_event?.startsWith('app:')

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    // '@nuxt/content',
    // '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    // '@nuxt/ui'
  ],
  
  // 全局中间件配置
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    // 注册全局中间件
    middleware: ['global']
  },
  
  // 运行时配置（包括环境变量）
  runtimeConfig: {
    // 服务器端私有密钥（不暴露给客户端）
    isbnApiKey: process.env.ISBN_API_KEY,
    
    // 管理员账户配置（仅服务器端可访问）
    adminUsername: process.env.NUXT_ADMIN_USERNAME,
    adminPassword: process.env.NUXT_ADMIN_PASSWORD,
    
    // 身份验证会话配置
    authSessionMaxAgeDays: parseInt(process.env.NUXT_AUTH_SESSION_MAX_AGE_DAYS),
    
    // 公共配置（会暴露给客户端）
    public: {
      // 调试模式开关（默认禁用）
      enableDebug: process.env.NUXT_PUBLIC_ENABLE_DEBUG,
      // 环境标识
      nodeEnv: process.env.NODE_ENV,
      // 是否在Electron中运行
      isElectron: isElectron
    }
  },
  
  // 在Electron模式下使用客户端渲染
  ssr: isElectron ? false : true,
  
  // 当在Electron中运行时的额外配置
  nitro: {
    output: {
      publicDir: '.output/public'
    }
  }
})