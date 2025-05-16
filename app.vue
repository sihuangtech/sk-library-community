<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { $auth } = useNuxtApp()

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
