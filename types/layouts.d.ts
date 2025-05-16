declare module 'nuxt/schema' {
  interface NuxtConfig {
    layouts?: Record<string, boolean>
  }
}

declare module '#app' {
  interface PageMeta {
    layout?: 'default' | 'login' | false
  }
}

export {} 