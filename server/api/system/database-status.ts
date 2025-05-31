import prisma from '~/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // 检查数据库连接
    await prisma.$connect()
    
    // 获取图书数量
    const bookCount = await prisma.book.count()
    
    // 获取分类数量（直接统计Category表）
    const categoryCount = await prisma.category.count()
    
    // 获取数据库版本信息
    const dbVersion = await prisma.$queryRaw`SELECT sqlite_version() as version` as any[]
    const version = dbVersion[0]?.version || 'Unknown'
    
    await prisma.$disconnect()
    
    return {
      connected: true,
      bookCount,
      categoryCount,
      version: `SQLite ${version}`,
      needsInit: false
    }
  } catch (error) {
    console.error('数据库状态检查失败:', error)
    
    // 检查是否是表不存在的错误
    const errorMessage = error instanceof Error ? error.message : String(error)
    const needsInit = errorMessage.includes('no such table') || 
                     errorMessage.includes('does not exist') ||
                     errorMessage.includes('SQLITE_ERROR')
    
    return {
      connected: false,
      bookCount: 0,
      categoryCount: 0,
      version: '',
      needsInit
    }
  }
}) 