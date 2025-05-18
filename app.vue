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

body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}
</style>
