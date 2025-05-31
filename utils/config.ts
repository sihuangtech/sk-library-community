import { readFileSync } from 'fs'
import { load } from 'js-yaml'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

// 配置接口定义
export interface AppConfig {
  server: {
    port: number
    host: string
  }
  site: {
    name: string
    version: string
    copyright_owner: string
    filing: {
      icp_number: string
      police_number: string
      show_filing: boolean
    }
  }
  api: {
    isbn_key: string
  }
  database: {
    url: string
  }
  admin: {
    username: string
    password: string
  }
  auth: {
    session_max_age_days: number
  }
  debug: {
    enabled: boolean
  }
}

// 读取YAML配置文件
export function loadConfig(): AppConfig {
  const configFileName = 'config.yaml'
  
  // 定义可能的配置文件路径
  const possiblePaths = [
    join(process.cwd(), configFileName), // 当前工作目录
    join(dirname(fileURLToPath(import.meta.url)), configFileName), // 当前文件所在目录 (utils/config.ts)
    join(dirname(fileURLToPath(import.meta.url)), '..', '..', configFileName), // 从 utils 向上两级到项目根目录
    join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.output', configFileName) // 从 utils 到 .output 目录
  ]

  let configPath = '';
  for (const p of possiblePaths) {
    if (existsSync(p)) {
      configPath = p;
      break;
    }
  }

  if (!configPath) {
    console.error('✗ 无法找到配置文件 config.yaml')
    throw new Error('配置文件 config.yaml 未找到')
  }

  try {
    const fileContents = readFileSync(configPath, 'utf8')
    const config = load(fileContents) as AppConfig
    
    // 验证必要的配置项
    if (!config.api?.isbn_key) {
      throw new Error('缺少API密钥配置')
    }
    
    if (!config.admin?.username || !config.admin?.password) {
      throw new Error('缺少管理员账户配置')
    }
    
    if (!config.server?.port || !config.server?.host) {
      throw new Error('缺少服务器端口或主机配置')
    }
    
    return config
  } catch (error) {
    console.error('读取配置文件或验证失败:', error)
    throw error
  }
}

// 获取配置的便捷函数
export const config = loadConfig() 