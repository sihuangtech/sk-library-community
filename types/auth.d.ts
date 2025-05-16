// 定义身份验证相关的类型
declare interface AuthPlugin {
  isLoggedIn: boolean
  setLoggedIn(value: boolean): void
  login(username: string, password: string): Promise<{ success: boolean, message?: string }>
  logout(): Promise<void>
}

// 扩展Nuxt应用类型
declare module '#app' {
  interface NuxtApp {
    $auth: AuthPlugin
  }
}

// 声明模块增强，为$auth提供类型支持
export {} 