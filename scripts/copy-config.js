import fs from 'fs'
import path from 'path'

// 复制配置文件到输出目录
function copyConfig() {
  const configSource = path.join(process.cwd(), 'config.yaml')
  const configDest = path.join(process.cwd(), '.output', 'config.yaml')
  
  // 确保输出目录存在
  const outputDir = path.dirname(configDest)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  // 复制配置文件
  if (fs.existsSync(configSource)) {
    fs.copyFileSync(configSource, configDest)
    console.log('✓ 配置文件已复制到输出目录')
  } else {
    console.error('✗ 配置文件不存在:', configSource)
    process.exit(1)
  }
}

copyConfig() 