import { loadConfig } from '~/utils/config'
import { readFileSync } from 'fs'
import { join } from 'path'

// 记录服务器启动时间
const startTime = new Date().toISOString()

// 获取包版本信息
const getPackageVersions = () => {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
    
    return {
      nuxtVersion: dependencies.nuxt?.replace('^', '') || 'unknown',
      vueVersion: dependencies.vue?.replace('^', '') || 'unknown',
      prismaVersion: dependencies.prisma?.replace('^', '') || 'unknown',
      typescriptVersion: dependencies.typescript?.replace('^', '') || 'unknown'
    }
  } catch (error) {
    console.error('获取包版本信息失败:', error)
    return {
      nuxtVersion: 'unknown',
      vueVersion: 'unknown', 
      prismaVersion: 'unknown',
      typescriptVersion: 'unknown'
    }
  }
}

// 格式化内存使用信息
const formatMemoryUsage = (memoryUsage: NodeJS.MemoryUsage) => {
  const formatBytes = (bytes: number) => {
    const mb = bytes / 1024 / 1024
    return `${mb.toFixed(2)} MB`
  }
  
  return {
    rss: formatBytes(memoryUsage.rss),
    heapUsed: formatBytes(memoryUsage.heapUsed),
    heapTotal: formatBytes(memoryUsage.heapTotal),
    external: formatBytes(memoryUsage.external)
  }
}

// 获取详细的平台信息
const getDetailedPlatformInfo = async () => {
  const platform = process.platform
  const arch = process.arch
  const release = process.release
  
  let platformInfo = ''
  
  if (platform === 'win32') {
    // Windows 系统
    try {
      const { execSync } = await import('child_process')
      
      // 使用 PowerShell 获取 Windows 版本信息，避免编码问题
      const psCommand = 'powershell -Command "[System.Environment]::OSVersion.Version.ToString()"'
      const versionOutput = execSync(psCommand, { encoding: 'utf8' }).trim()
      
      if (versionOutput && versionOutput.match(/^\d+\.\d+\.\d+/)) {
        const versionNumber = versionOutput
        
        // 根据版本号判断Windows版本
        if (versionNumber.startsWith('10.0.26')) {
          platformInfo = 'Windows 11 24H2'
        } else if (versionNumber.startsWith('10.0.22')) {
          platformInfo = 'Windows 11'
        } else if (versionNumber.startsWith('10.0.19')) {
          platformInfo = 'Windows 10 22H2'
        } else if (versionNumber.startsWith('10.0.18')) {
          platformInfo = 'Windows 10 21H2'
        } else if (versionNumber.startsWith('10.0')) {
          platformInfo = 'Windows 10'
        } else if (versionNumber.startsWith('6.3')) {
          platformInfo = 'Windows 8.1'
        } else if (versionNumber.startsWith('6.2')) {
          platformInfo = 'Windows 8'
        } else if (versionNumber.startsWith('6.1')) {
          platformInfo = 'Windows 7'
        } else {
          platformInfo = `Windows ${versionNumber}`
        }
      } else {
        // 如果 PowerShell 失败，尝试使用 wmic 命令
        try {
          const wmicCommand = 'wmic os get Version /value'
          const wmicOutput = execSync(wmicCommand, { encoding: 'utf8' })
          const versionMatch = wmicOutput.match(/Version=([\d.]+)/)
          
          if (versionMatch) {
            const versionNumber = versionMatch[1]
            
            if (versionNumber.startsWith('10.0.26')) {
              platformInfo = 'Windows 11 24H2'
            } else if (versionNumber.startsWith('10.0.22')) {
              platformInfo = 'Windows 11'
            } else if (versionNumber.startsWith('10.0')) {
              platformInfo = 'Windows 10'
            } else {
              platformInfo = `Windows ${versionNumber}`
            }
          } else {
            platformInfo = 'Windows'
          }
        } catch {
          platformInfo = 'Windows'
        }
      }
    } catch {
      platformInfo = 'Windows'
    }
  } else if (platform === 'darwin') {
    // macOS 系统
    try {
      const { execSync } = await import('child_process')
      const version = execSync('sw_vers -productVersion', { encoding: 'utf8' }).trim()
      const name = execSync('sw_vers -productName', { encoding: 'utf8' }).trim()
      platformInfo = `${name} ${version}`
    } catch {
      platformInfo = 'macOS'
    }
  } else if (platform === 'linux') {
    // Linux 系统 - 尝试识别发行版
    try {
      const { readFileSync } = await import('fs')
      
      // 尝试读取 /etc/os-release
      try {
        const osRelease = readFileSync('/etc/os-release', 'utf8')
        const lines = osRelease.split('\n')
        let name = ''
        let version = ''
        
        for (const line of lines) {
          if (line.startsWith('PRETTY_NAME=')) {
            name = line.split('=')[1].replace(/"/g, '')
            break
          } else if (line.startsWith('NAME=') && !name) {
            name = line.split('=')[1].replace(/"/g, '')
          } else if (line.startsWith('VERSION=') && !version) {
            version = line.split('=')[1].replace(/"/g, '')
          }
        }
        platformInfo = name || 'Linux'
      } catch {
        // 尝试其他方法
        try {
          const { execSync } = await import('child_process')
          
          // 尝试 lsb_release
          try {
            const lsbInfo = execSync('lsb_release -d -s', { encoding: 'utf8' }).trim().replace(/"/g, '')
            platformInfo = lsbInfo
          } catch {
            // 尝试读取其他发行版文件
            const distroFiles = [
              '/etc/redhat-release',
              '/etc/debian_version',
              '/etc/ubuntu-release',
              '/etc/centos-release',
              '/etc/fedora-release'
            ]
            
            for (const file of distroFiles) {
              try {
                const content = readFileSync(file, 'utf8').trim()
                if (content) {
                  platformInfo = content
                  break
                }
              } catch {
                continue
              }
            }
            
            if (!platformInfo) {
              platformInfo = 'Linux'
            }
          }
        } catch {
          platformInfo = 'Linux'
        }
      }
    } catch {
      platformInfo = 'Linux'
    }
  } else {
    // 其他系统
    const platformMap: Record<string, string> = {
      'freebsd': 'FreeBSD',
      'openbsd': 'OpenBSD',
      'netbsd': 'NetBSD',
      'aix': 'AIX',
      'sunos': 'SunOS'
    }
    platformInfo = platformMap[platform] || platform
  }
  
  return {
    platform: platformInfo,
    arch: arch,
    nodeVersion: process.version
  }
}

export default defineEventHandler(async (event) => {
  try {
    const config = loadConfig()
    const packageVersions = getPackageVersions()
    const memoryUsage = process.memoryUsage()
    const platformInfo = await getDetailedPlatformInfo()
    
    return {
      version: config.site.version,
      environment: process.env.NODE_ENV || 'development',
      startTime,
      nodeVersion: platformInfo.nodeVersion,
      platform: platformInfo.platform,
      arch: platformInfo.arch,
      uptime: Math.floor(process.uptime()),
      memoryUsage: formatMemoryUsage(memoryUsage),
      siteName: config.site.name,
      ...packageVersions
    }
  } catch (error) {
    console.error('获取系统信息失败:', error)
    const fallbackPlatformInfo = await getDetailedPlatformInfo().catch(() => ({
      platform: 'Unknown',
      arch: process.arch,
      nodeVersion: process.version
    }))
    
    return {
      version: '1.0.0',
      environment: 'development',
      startTime,
      nodeVersion: fallbackPlatformInfo.nodeVersion,
      platform: fallbackPlatformInfo.platform,
      arch: fallbackPlatformInfo.arch,
      uptime: 0,
      memoryUsage: {
        rss: '0 MB',
        heapUsed: '0 MB', 
        heapTotal: '0 MB',
        external: '0 MB'
      },
      siteName: '家庭图书管理系统',
      nuxtVersion: 'unknown',
      vueVersion: 'unknown',
      prismaVersion: 'unknown',
      typescriptVersion: 'unknown'
    }
  }
}) 