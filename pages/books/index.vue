<template>
  <div class="books-page">
    <h1>我的图书馆</h1>
    <BookList />
  </div>
</template>

<script setup lang="ts">
// 图书列表页面，主要使用BookList组件
</script>

<style scoped>
.books-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

h1 {
  color: #4361ee;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  text-align: center;
}
</style> 