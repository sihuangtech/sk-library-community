<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <MessageBox
      v-model:visible="messageVisible"
      :title="messageConfig.title"
      :message="messageConfig.message"
      :type="messageConfig.type"
      :button-text="messageConfig.buttonText"
      :show-cancel-button="messageConfig.showCancelButton"
      :cancel-button-text="messageConfig.cancelButtonText"
      :close-on-click-overlay="messageConfig.closeOnClickOverlay"
      @confirm="messageConfirm"
      @cancel="messageCancel"
      @close="messageClose"
    />
  </div>
</template>

<script setup lang="ts">
import { useMessage } from '~/composables/useMessage'

const { $auth } = useNuxtApp()

// 获取消息服务
const { visible: messageVisible, messageConfig, closeMessage } = useMessage()

// 在组件挂载时验证用户会话
onMounted(async () => {
  try {
    // 调用验证API
    const { isLoggedIn } = await $fetch<{ isLoggedIn: boolean }>('/api/auth/verify')
    
    // 更新登录状态
    $auth.setLoggedIn(isLoggedIn)
  } catch (error) {
    console.error('验证会话错误:', error)
    // 发生错误时默认为未登录
    $auth.setLoggedIn(false)
  }
})

// 消息关闭回调
const messageClose = (result: boolean) => {
  closeMessage(result)
}

// 消息确认回调
const messageConfirm = () => {
  closeMessage(true)
}

// 消息取消回调
const messageCancel = () => {
  closeMessage(false)
}
</script>

<style>
/* 全局样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* CSS变量定义 */
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #e9ecef;
  --card-bg: #ffffff;
  --primary-color: #4361ee;
  --secondary-color: #f8f9fa;
  --shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 深色模式变量 */
:root.dark {
  --bg-color: #1a1a1a;
  --text-color: #e2e8f0;
  --border-color: #4a5568;
  --card-bg: #2d3748;
  --primary-color: #4361ee;
  --secondary-color: #4a5568;
  --shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.6;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 确保深色模式下的滚动条样式 */
:root.dark ::-webkit-scrollbar {
  width: 8px;
}

:root.dark ::-webkit-scrollbar-track {
  background: #2d3748;
}

:root.dark ::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

:root.dark ::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>
