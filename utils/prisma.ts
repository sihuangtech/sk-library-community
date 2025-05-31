import { PrismaClient } from '@prisma/client'

// 创建全局 Prisma 客户端实例
declare global {
  var __prisma: PrismaClient | undefined
}

// 在开发环境中使用全局变量避免热重载时创建多个实例
// 在生产环境中直接创建新实例
export const prisma = globalThis.__prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

export default prisma 