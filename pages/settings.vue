<template>
  <div class="settings-page">
    <h1>系统设置</h1>
    
    <!-- 用户信息卡片 -->
    <div class="settings-card">
      <h2>用户信息</h2>
      <div class="user-info">
        <div class="user-avatar">
          <div class="avatar-circle">
            <span>{{ userInfo.username.charAt(0).toUpperCase() }}</span>
          </div>
        </div>
        <div class="user-details">
          <h3>{{ userInfo.username }}</h3>
          <p>管理员</p>
          <p>登录时间：{{ formatDate(userInfo.loginTime) }}</p>
        </div>
      </div>
    </div>
    
    <!-- 系统设置卡片 -->
    <div class="settings-card">
      <h2>界面设置</h2>
      <div class="setting-item">
        <div class="setting-info">
          <h3>主题模式</h3>
          <p>选择应用的主题外观</p>
        </div>
        <div class="setting-control">
          <select v-model="themeMode" @change="changeTheme">
            <option value="light">浅色模式</option>
            <option value="dark">深色模式</option>
            <option value="auto">跟随系统</option>
          </select>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <h3>自动保存</h3>
          <p>编辑图书信息时自动保存更改</p>
        </div>
        <div class="setting-control">
          <label class="switch">
            <input type="checkbox" v-model="autoSave" @change="toggleAutoSave">
            <span class="slider"></span>
          </label>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <h3>每页显示数量</h3>
          <p>设置图书列表每页显示的图书数量</p>
        </div>
        <div class="setting-control">
          <select v-model="pageSize" @change="updatePageSize">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- 数据库状态卡片 -->
    <div class="settings-card">
      <h2>数据库状态</h2>
      <div class="database-status">
        <div class="status-indicator" :class="{ 
          'status-success': dbStatus.connected, 
          'status-error': !dbStatus.connected && dbStatus.checked,
          'status-loading': !dbStatus.checked
        }">
          <span class="status-dot"></span>
          <span class="status-text">
            {{ dbStatus.connected ? '数据库连接正常' : 
               dbStatus.checked ? '数据库连接失败' : '检查中...' }}
          </span>
        </div>
        
        <div v-if="dbStatus.checked" class="database-info">
          <div class="info-item">
            <span class="label">图书总数：</span>
            <span class="value">{{ dbStatus.bookCount }}</span>
          </div>
          <div class="info-item">
            <span class="label">分类总数：</span>
            <span class="value">{{ dbStatus.categoryCount }}</span>
          </div>
          <div class="info-item">
            <span class="label">数据库版本：</span>
            <span class="value">{{ dbStatus.version }}</span>
          </div>
        </div>
        
        <div class="database-actions">
          <button @click="checkDatabaseStatus" class="check-button" :disabled="isCheckingDb">
            {{ isCheckingDb ? '检查中...' : '重新检查' }}
          </button>
          
          <button v-if="!dbStatus.connected || dbStatus.needsInit" 
                  @click="initializeDatabase" 
                  class="init-button" 
                  :disabled="isInitializingDb">
            {{ isInitializingDb ? '初始化中...' : '一键初始化数据库' }}
          </button>
          
          <button @click="showBackupDialog = true" class="backup-button">
            备份数据库
          </button>
        </div>
      </div>
    </div>
    
    <!-- 系统信息卡片 -->
    <div class="settings-card">
      <h2>系统信息</h2>
      <div class="system-info">
        <div class="info-item">
          <span class="label">系统版本：</span>
          <span class="value">{{ systemInfo.version }}</span>
        </div>
        <div class="info-item">
          <span class="label">运行环境：</span>
          <span class="value">{{ getEnvironmentText(systemInfo.environment) }}</span>
        </div>
        <div class="info-item">
          <span class="label">启动时间：</span>
          <span class="value">{{ formatDate(systemInfo.startTime) }}</span>
        </div>
        <div class="info-item">
          <span class="label">Node.js版本：</span>
          <span class="value">{{ systemInfo.nodeVersion }}</span>
        </div>
        <div class="info-item">
          <span class="label">Nuxt版本：</span>
          <span class="value">{{ systemInfo.nuxtVersion }}</span>
        </div>
        <div class="info-item">
          <span class="label">Vue版本：</span>
          <span class="value">{{ systemInfo.vueVersion }}</span>
        </div>
        <div class="info-item">
          <span class="label">Prisma版本：</span>
          <span class="value">{{ systemInfo.prismaVersion }}</span>
        </div>
        <div class="info-item">
          <span class="label">TypeScript版本：</span>
          <span class="value">{{ systemInfo.typescriptVersion }}</span>
        </div>
        <div class="info-item">
          <span class="label">运行时长：</span>
          <span class="value">{{ getUptime(systemInfo.startTime) }}</span>
        </div>
        <div class="info-item memory-info">
          <span class="label">内存使用：</span>
          <div class="memory-container">
            <div class="memory-details">
              <div class="memory-item">
                <span class="memory-label">物理内存 (RSS)：</span>
                <span class="memory-value">{{ systemInfo.memoryUsage.rss }}</span>
              </div>
              <div class="memory-item">
                <span class="memory-label">堆内存已用：</span>
                <span class="memory-value">{{ systemInfo.memoryUsage.heapUsed }}</span>
              </div>
              <div class="memory-item">
                <span class="memory-label">堆内存总计：</span>
                <span class="memory-value">{{ systemInfo.memoryUsage.heapTotal }}</span>
              </div>
              <div class="memory-item">
                <span class="memory-label">外部内存：</span>
                <span class="memory-value">{{ systemInfo.memoryUsage.external }}</span>
              </div>
            </div>
            <div class="memory-explanation">
              <div class="explanation-title"><strong>说明：</strong></div>
              <div class="explanation-item">物理内存是进程实际占用的系统内存</div>
              <div class="explanation-item">堆内存是JavaScript对象使用的内存</div>
              <div class="explanation-item">外部内存是C++对象使用的内存</div>
            </div>
          </div>
        </div>
        <div class="info-item">
          <span class="label">平台信息：</span>
          <span class="value">{{ systemInfo.platform }}</span>
        </div>
        <div class="info-item">
          <span class="label">CPU架构：</span>
          <span class="value">{{ systemInfo.arch }}</span>
        </div>
      </div>
    </div>
    
    <!-- 备份对话框 -->
    <div v-if="showBackupDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>备份数据库</h3>
        <p>确定要创建数据库备份吗？备份文件将保存到downloads文件夹。</p>
        
        <div class="dialog-actions">
          <button @click="showBackupDialog = false" class="cancel-button">取消</button>
          <button @click="backupDatabase" class="confirm-button" :disabled="isBackingUp">
            {{ isBackingUp ? '备份中...' : '确认备份' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from '~/composables/useMessage'

// 使用消息服务
const message = useMessage()

// 获取运行时配置
const config = useRuntimeConfig()

// 用户信息
const userInfo = ref({
  username: '',
  loginTime: new Date().toISOString()
})

// 设置状态
const themeMode = ref('light')
const autoSave = ref(true)
const pageSize = ref('20')

// 数据库状态
const dbStatus = ref({
  connected: false,
  checked: false,
  needsInit: false,
  bookCount: 0,
  categoryCount: 0,
  version: ''
})

// 系统信息
const systemInfo = ref({
  version: '1.0.0',
  environment: 'development',
  startTime: new Date().toISOString(),
  nodeVersion: '',
  nuxtVersion: '',
  vueVersion: '',
  prismaVersion: '',
  typescriptVersion: '',
  memoryUsage: {
    rss: '0 MB',
    heapUsed: '0 MB',
    heapTotal: '0 MB',
    external: '0 MB'
  },
  platform: '',
  arch: ''
})

// 加载状态
const isCheckingDb = ref(false)
const isInitializingDb = ref(false)
const isBackingUp = ref(false)
const showBackupDialog = ref(false)

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取环境文本（中文显示）
const getEnvironmentText = (env: string) => {
  const envMap: Record<string, string> = {
    'development': '开发模式',
    'production': '生产模式',
    'test': '测试模式',
    'staging': '预发布模式'
  }
  return envMap[env] || env
}

// 计算运行时长
const getUptime = (startTime: string) => {
  const start = new Date(startTime)
  const now = new Date()
  const diff = now.getTime() - start.getTime()
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分钟`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

// 检查数据库状态
const checkDatabaseStatus = async () => {
  isCheckingDb.value = true
  
  try {
    const response = await fetch('/api/system/database-status')
    if (response.ok) {
      const data = await response.json()
      dbStatus.value = { ...data, checked: true }
    } else {
      dbStatus.value = { 
        connected: false, 
        checked: true, 
        needsInit: true,
        bookCount: 0,
        categoryCount: 0,
        version: ''
      }
    }
  } catch (error) {
    console.error('检查数据库状态失败:', error)
    dbStatus.value = { 
      connected: false, 
      checked: true, 
      needsInit: true,
      bookCount: 0,
      categoryCount: 0,
      version: ''
    }
  } finally {
    isCheckingDb.value = false
  }
}

// 初始化数据库
const initializeDatabase = async () => {
  const confirmed = await message.confirm('确定要初始化数据库吗？这将创建必要的数据表。')
  if (!confirmed) return
  
  isInitializingDb.value = true
  
  try {
    const response = await fetch('/api/system/init-database', {
      method: 'POST'
    })
    
    if (response.ok) {
      message.success('数据库初始化成功！')
      await checkDatabaseStatus()
    } else {
      const error = await response.json()
      throw new Error(error.message || '初始化失败')
    }
  } catch (error) {
    console.error('数据库初始化失败:', error)
    message.error(`数据库初始化失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    isInitializingDb.value = false
  }
}

// 备份数据库
const backupDatabase = async () => {
  isBackingUp.value = true
  
  try {
    const response = await fetch('/api/system/backup-database', {
      method: 'POST'
    })
    
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `library-backup-${new Date().toISOString().split('T')[0]}.db`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      message.success('数据库备份成功！')
      showBackupDialog.value = false
    } else {
      throw new Error('备份失败')
    }
  } catch (error) {
    console.error('数据库备份失败:', error)
    message.error(`数据库备份失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    isBackingUp.value = false
  }
}

// 切换主题模式
const changeTheme = () => {
  localStorage.setItem('themeMode', themeMode.value)
  applyTheme(themeMode.value)
  
  const themeNames: Record<string, string> = {
    light: '浅色模式',
    dark: '深色模式',
    auto: '跟随系统'
  }
  message.info(`已切换到${themeNames[themeMode.value]}`)
}

// 应用主题
const applyTheme = (mode: string) => {
  const html = document.documentElement
  
  // 移除所有主题类
  html.classList.remove('light', 'dark')
  
  if (mode === 'auto') {
    // 跟随系统主题
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    html.classList.add(prefersDark ? 'dark' : 'light')
  } else {
    // 手动设置主题
    html.classList.add(mode)
  }
}

// 监听系统主题变化
const setupSystemThemeListener = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleSystemThemeChange = () => {
    if (themeMode.value === 'auto') {
      applyTheme('auto')
    }
  }
  
  mediaQuery.addEventListener('change', handleSystemThemeChange)
  
  // 清理函数
  return () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }
}

// 切换自动保存
const toggleAutoSave = () => {
  localStorage.setItem('autoSave', autoSave.value.toString())
  message.info(autoSave.value ? '已启用自动保存' : '已禁用自动保存')
}

// 更新每页显示数量
const updatePageSize = () => {
  localStorage.setItem('pageSize', pageSize.value)
  message.info(`每页显示数量已设置为 ${pageSize.value}`)
}

// 获取系统信息
const getSystemInfo = async () => {
  try {
    const response = await fetch('/api/system/info')
    if (response.ok) {
      const data = await response.json()
      systemInfo.value = data
    }
  } catch (error) {
    console.error('获取系统信息失败:', error)
  }
}

// 加载用户设置
const loadUserSettings = () => {
  // 从localStorage加载设置
  const savedThemeMode = localStorage.getItem('themeMode')
  if (savedThemeMode !== null) {
    themeMode.value = savedThemeMode
    applyTheme(themeMode.value)
  }
  
  const savedAutoSave = localStorage.getItem('autoSave')
  if (savedAutoSave !== null) {
    autoSave.value = savedAutoSave === 'true'
  }
  
  const savedPageSize = localStorage.getItem('pageSize')
  if (savedPageSize) {
    pageSize.value = savedPageSize
  }
}

// 页面加载时执行
onMounted(async () => {
  // 设置用户名从运行时配置中获取
  userInfo.value.username = config.public.adminUsername || 'admin'
  
  loadUserSettings()
  setupSystemThemeListener()
  await Promise.all([
    checkDatabaseStatus(),
    getSystemInfo()
  ])
})
</script>

<style scoped>
.settings-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #4361ee;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.settings-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.settings-card h2 {
  color: var(--text-color);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 0.5rem;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-avatar .avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4361ee, #7209b7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

.user-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--text-color);
}

.user-details p {
  margin: 0.25rem 0;
  color: var(--text-color);
  opacity: 0.7;
}

/* 设置项样式 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 1.1rem;
}

.setting-info p {
  margin: 0;
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.9rem;
}

.setting-control select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4361ee;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* 数据库状态样式 */
.database-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ccc;
}

.status-success .status-dot {
  background-color: #10b981;
}

.status-error .status-dot {
  background-color: #ef4444;
}

.status-loading .status-dot {
  background-color: #f59e0b;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.database-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background-color: var(--secondary-color);
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.label {
  color: var(--text-color);
  opacity: 0.7;
}

.value {
  font-weight: 500;
  color: var(--text-color);
}

.database-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.check-button, .init-button, .backup-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.check-button {
  background-color: #6b7280;
  color: white;
}

.init-button {
  background-color: #10b981;
  color: white;
}

.backup-button {
  background-color: #f59e0b;
  color: white;
}

.check-button:hover, .init-button:hover, .backup-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.check-button:disabled, .init-button:disabled, .backup-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 系统信息样式 */
.system-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* 内存信息样式 */
.memory-info {
  flex-direction: column;
  align-items: flex-start !important;
}

.memory-container {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
  width: 100%;
  align-items: flex-start;
}

.memory-details {
  flex: 2;
  min-width: 300px;
}

.memory-item {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  border-bottom: 1px solid var(--border-color);
}

.memory-item:last-child {
  border-bottom: none;
}

.memory-label {
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.9rem;
}

.memory-value {
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.9rem;
}

.memory-explanation {
  flex: 1.5;
  padding: 0.75rem;
  background-color: var(--secondary-color);
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
  min-width: 320px;
  max-width: 450px;
}

.explanation-title {
  color: var(--text-color);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.explanation-item {
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.5;
  margin-bottom: 0.3rem;
  font-size: 0.85rem;
}

.explanation-item:last-child {
  margin-bottom: 0;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: var(--shadow);
  transition: background-color 0.3s ease;
}

.dialog h3 {
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.dialog p {
  margin-bottom: 1.5rem;
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-button, .confirm-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-button {
  background-color: #f3f4f6;
  color: #374151;
}

.confirm-button {
  background-color: #10b981;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-page {
    padding: 1rem;
  }
  
  .settings-card {
    padding: 1.5rem;
  }
  
  .user-info {
    flex-direction: column;
    text-align: center;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .database-actions {
    flex-direction: column;
  }
  
  .database-info {
    grid-template-columns: 1fr;
  }
  
  .system-info {
    grid-template-columns: 1fr;
  }
  
  .memory-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .memory-explanation {
    min-width: auto;
  }
}

/* 深色模式支持 */
:global(.dark) .settings-card {
  background-color: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

:global(.dark) .settings-card h2 {
  color: #e2e8f0;
}

:global(.dark) .setting-info h3 {
  color: #e2e8f0;
}

:global(.dark) .setting-info p {
  color: #a0aec0;
}

:global(.dark) .user-details h3 {
  color: #e2e8f0;
}

:global(.dark) .user-details p {
  color: #a0aec0;
}

:global(.dark) .database-info {
  background-color: #4a5568;
}

:global(.dark) .label {
  color: #a0aec0;
}

:global(.dark) .value {
  color: #e2e8f0;
}
</style> 