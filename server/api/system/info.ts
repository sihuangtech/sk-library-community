import { loadConfig } from '~/utils/config'

// 记录服务器启动时间
const startTime = new Date().toISOString()

export default defineEventHandler(async (event) => {
  try {
    const config = loadConfig()
    
    return {
      version: config.site.version,
      environment: process.env.NODE_ENV || 'development',
      startTime,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: Math.floor(process.uptime()),
      memoryUsage: process.memoryUsage(),
      siteName: config.site.name
    }
  } catch (error) {
    console.error('获取系统信息失败:', error)
  }
}) 