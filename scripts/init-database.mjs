#!/usr/bin/env node

import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync } from 'fs'
import { join } from 'path'

const execAsync = promisify(exec)

console.log('🚀 开始初始化图书管理系统数据库...\n')

async function initDatabase() {
  try {
    // 检查数据库文件是否已存在
    const dbPath = join(process.cwd(), 'prisma', 'dev.db')
    const dbExists = existsSync(dbPath)
    
    if (dbExists) {
      console.log('📊 数据库文件已存在，跳过初始化')
      return
    }
    
    console.log('📝 1. 生成Prisma客户端...')
    await execAsync('npx prisma generate')
    console.log('✅ Prisma客户端生成完成')
    
    console.log('\n📝 2. 执行数据库迁移...')
    await execAsync('npx prisma migrate dev --name init')
    console.log('✅ 数据库迁移完成')
    
    console.log('\n📝 3. 验证数据库连接...')
    // 简单的连接测试
    await execAsync('npx prisma db push --accept-data-loss')
    console.log('✅ 数据库连接验证成功')
    
    console.log('\n🎉 数据库初始化完成！')
    console.log('📍 数据库文件位置:', dbPath)
    console.log('🔧 你现在可以运行 npm run dev 启动应用')
    
  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error.message)
    console.log('\n🔧 请尝试以下步骤:')
    console.log('1. 确保已安装所有依赖: npm install')
    console.log('2. 检查 prisma/schema.prisma 文件是否存在')
    console.log('3. 检查 config.yaml 文件配置是否正确')
    console.log('4. 手动运行: npx prisma migrate dev --name init')
    
    process.exit(1)
  }
}

// 运行初始化
initDatabase() 