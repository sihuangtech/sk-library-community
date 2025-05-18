const { app, BrowserWindow, shell } = require('electron')
const { join } = require('path')
const { URL } = require('url')

const isDev = process.env.npm_lifecycle_event === 'app:dev'
const devPath = 'http://localhost:3000'
const prodPath = 'file://' + join(__dirname, '../.output/public/index.html')

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: '家庭图书管理系统',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: !isDev
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  // 处理外部链接
  win.webContents.setWindowOpenHandler(({ url }) => {
    const parsedUrl = new URL(url)
    // 确保外部链接在默认浏览器中打开
    if (parsedUrl.origin !== devPath && !url.startsWith(prodPath)) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  // 在开发环境中加载本地服务器，在生产环境中加载打包后的文件
  const url = isDev ? devPath : prodPath
  await win.loadURL(url)

  // 在开发环境中打开开发者工具
  if (isDev) {
    win.webContents.openDevTools()
  }
}

app.whenReady().then(async () => {
  await createWindow()

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
}) 