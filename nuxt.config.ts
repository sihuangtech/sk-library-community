// https://nuxt.com/docs/api/configuration/nuxt-config
import { loadConfig } from './utils/config'

// 加载YAML配置
const appConfig = loadConfig()

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    // '@nuxt/content',
    // '@nuxt/fonts',
    '@nuxt/icon',
    // '@nuxt/image',  // 暂时禁用以解决初始化问题
    '@nuxt/scripts',
    '@nuxt/test-utils',
    // '@nuxt/ui'
  ],
  
  // 实验性功能配置 - 解决跨平台兼容性问题
  experimental: {
    // 禁用可能导致oxc-parser问题的功能
    scanPageMeta: false,
    // 使用传统的构建方式避免oxc-parser
    externalVue: false
  },
  
  // 开发服务器配置
  devServer: {
    port: appConfig.server.port,
    host: '0.0.0.0'
  },
  
  // 全局中间件配置
  app: {
    head: {
      title: appConfig.site.name,
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: `${appConfig.site.name} - 版本 ${appConfig.site.version}` }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },
  
  // 运行时配置（从YAML配置文件读取）
  runtimeConfig: {
    // 服务器端私有密钥（不暴露给客户端）
    isbnApiKey: appConfig.api.isbn_key,
    
    // 管理员密码配置（仅服务器端可访问）
    adminPassword: appConfig.admin.password,
    
    // 身份验证会话配置
    authSessionMaxAgeDays: appConfig.auth.session_max_age_days,
    
    // 公共配置（会暴露给客户端）
    public: {
      // 调试模式开关
      enableDebug: appConfig.debug.enabled,
      // 环境标识
      nodeEnv: process.env.NODE_ENV,
      // 应用端口
      appPort: appConfig.server.port,
      // 管理员用户名（可以暴露给客户端）
      adminUsername: appConfig.admin.username,
      // 网站信息
      siteName: appConfig.site.name,
      siteVersion: appConfig.site.version,
      copyrightOwner: appConfig.site.copyright_owner
    }
  },
  
  // Nitro服务器配置（生产模式）
  nitro: {
    output: {
      publicDir: '.output/public'
    },
    // 启用实验性 WASM 支持
    experimental: {
      wasm: true
    },
    // Rollup 配置，解决 Prisma 构建问题
    rollupConfig: {
      external: ['.prisma/client/index-browser', '.prisma/client', '@prisma/client']
    },
    // 添加 esbuild 配置
    esbuild: {
      options: {
        target: 'esnext'
      }
    }
  },
  
  // Vite 配置，进一步优化 Prisma 支持和解决oxc-parser问题
  vite: {
    define: {
      global: 'globalThis'
    },
    optimizeDeps: {
      include: ['@prisma/client'],
      // 排除有问题的包
      exclude: ['oxc-parser']
    },
    ssr: {
      noExternal: ['@prisma/client'],
      // 排除oxc-parser避免服务端渲染问题
      external: ['oxc-parser']
    }
  }
})