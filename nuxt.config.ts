// https://nuxt.com/docs/api/configuration/nuxt-config
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
    
    // 公共配置（会暴露给客户端）
    public: {
      // 调试模式开关（默认禁用）
      enableDebug: process.env.NUXT_PUBLIC_ENABLE_DEBUG,
      // 环境标识
      nodeEnv: process.env.NODE_ENV
    }
  }
})