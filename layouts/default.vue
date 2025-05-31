<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <TheNavbar />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <slot />
    </main>
    
    <!-- 页脚 -->
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
// 这里不需要额外的脚本，因为TheNavbar组件已经处理了登出逻辑
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: var(--text-color);
  background-color: var(--bg-color);
  line-height: 1.6;
  transition: color 0.3s ease, background-color 0.3s ease;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
}
</style> 