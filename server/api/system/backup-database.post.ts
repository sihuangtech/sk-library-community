import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    // 数据库文件路径
    const dbPath = join(process.cwd(), 'prisma', 'dev.db')
    
    // 检查数据库文件是否存在
    if (!existsSync(dbPath)) {
      return createError({
        statusCode: 404,
        statusMessage: '数据库文件不存在'
      })
    }
    
    // 读取数据库文件
    const dbBuffer = readFileSync(dbPath)
    
    // 设置响应头
    setHeader(event, 'Content-Type', 'application/octet-stream')
    setHeader(event, 'Content-Disposition', `attachment; filename="library-backup-${new Date().toISOString().split('T')[0]}.db"`)
    setHeader(event, 'Content-Length', dbBuffer.length.toString())
    
    return dbBuffer
    
  } catch (error) {
    console.error('数据库备份失败:', error)
    
    return createError({
      statusCode: 500,
      statusMessage: '数据库备份失败',
      data: {
        error: error instanceof Error ? error.message : '未知错误'
      }
    })
  }
}) 