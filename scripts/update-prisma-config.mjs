import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

// 读取YAML配置
function loadConfig() {
  try {
    const configPath = path.join(process.cwd(), 'config.yaml')
    const fileContents = fs.readFileSync(configPath, 'utf8')
    return yaml.load(fileContents)
  } catch (error) {
    console.error('读取配置文件失败:', error)
    process.exit(1)
  }
}

// 更新Prisma配置文件
function updatePrismaConfig() {
  const config = loadConfig()
  const prismaSchemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
  
  try {
    let schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8')
    
    // 替换数据库URL
    const urlRegex = /url\s*=\s*"[^"]*"/
    const newUrl = `url = "${config.database.url}"`
    
    if (urlRegex.test(schemaContent)) {
      schemaContent = schemaContent.replace(urlRegex, newUrl)
      console.log('✅ 已更新Prisma数据库URL配置')
    } else {
      console.warn('⚠️  未找到数据库URL配置行')
    }
    
    // 写回文件
    fs.writeFileSync(prismaSchemaPath, schemaContent, 'utf8')
    console.log('✅ Prisma配置文件更新完成')
    
  } catch (error) {
    console.error('❌ 更新Prisma配置失败:', error)
    process.exit(1)
  }
}

// 执行更新
updatePrismaConfig() 