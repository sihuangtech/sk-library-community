<template>
  <div class="add-book-page">
    <h1>添加新图书</h1>
    <p class="subtitle">通过ISBN码快速添加图书到您的图书馆</p>
    
    <IsbnSearch />
  </div>
</template>

<script setup lang="ts">
// 添加图书页面，主要使用IsbnSearch组件
</script>

<style scoped>
.add-book-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

h1 {
  color: #4361ee;
  margin-bottom: 0.5rem;
  font-size: 2rem;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}
</style> 