<template>
  <div class="login-layout">
    <div class="login-content">
      <slot />
    </div>
    <TheFooter />
  </div>
</template>

<style scoped>
.login-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  transition: background-color 0.3s ease;
}

.login-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style> 