import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'
import prisma from '~/utils/prisma'
import { promisify } from 'util'
import { exec } from 'child_process'

const execAsync = promisify(exec)

export default defineEventHandler(async (event) => {
  try {
    console.log('开始初始化数据库...')
    
    // 1. 执行Prisma迁移
    console.log('执行数据库迁移...')
    try {
      const { stdout: migrateOutput, stderr: migrateError } = await execAsync('npx prisma migrate dev --name init')
      console.log('迁移输出:', migrateOutput)
      if (migrateError) {
        console.log('迁移警告:', migrateError)
      }
    } catch (migrateErr) {
      console.log('迁移可能已存在，尝试重置...')
      // 如果迁移失败，尝试推送schema
      const { stdout: pushOutput } = await execAsync('npx prisma db push')
      console.log('推送输出:', pushOutput)
    }
    
    // 2. 生成Prisma客户端
    console.log('生成Prisma客户端...')
    const { stdout: generateOutput } = await execAsync('npx prisma generate')
    console.log('生成输出:', generateOutput)
    
    // 3. 验证数据库连接
    console.log('验证数据库连接...')
    await prisma.$connect()
    
    // 4. 检查表是否创建成功
    const tableCheck = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='Book'
    ` as any[]
    
    if (tableCheck.length === 0) {
      throw new Error('数据表创建失败')
    }
    
    await prisma.$disconnect()
    
    console.log('数据库初始化完成！')
    
    return {
      success: true,
      message: '数据库初始化成功！',
      details: {
        migration: '数据库迁移完成',
        generation: 'Prisma客户端生成完成',
        connection: '数据库连接验证成功',
        tables: '数据表创建成功'
      }
    }
    
  } catch (error) {
    console.error('数据库初始化失败:', error)
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    return createError({
      statusCode: 500,
      statusMessage: '数据库初始化失败',
      data: {
        error: errorMessage,
        suggestion: '请检查Prisma配置文件和数据库连接设置'
      }
    })
  }
}) 