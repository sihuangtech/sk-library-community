/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  appId: "com.yourdomain.family-library",
  productName: "家庭图书管理系统",
  directories: {
    output: "dist",
  },
  files: [
    "electron/**/*",
    ".output/**/*",
    "!node_modules/**/*"
  ],
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      }
    ],
    icon: "public/favicon.ico" // 确保这个图标文件存在
  },
  mac: {
    target: ["dmg"],
    icon: "public/favicon.ico" // 确保这个图标文件存在
  },
  linux: {
    target: ["AppImage"],
    icon: "public/favicon.ico" // 确保这个图标文件存在
  }
} 