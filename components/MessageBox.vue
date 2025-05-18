<template>
  <Teleport to="body">
    <transition name="message-fade">
      <div v-if="visible" class="message-overlay" @click.self="handleOverlayClick">
        <div :class="['message-box', `message-type-${type}`]">
          <div class="message-header">
            <span class="message-icon">
              <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" fill="currentColor"/>
              </svg>
              <svg v-else-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="currentColor"/>
              </svg>
              <svg v-else-if="type === 'warning'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M12.866 3l9.526 16.5a1 1 0 0 1-.866 1.5H2.474a1 1 0 0 1-.866-1.5L11.134 3a1 1 0 0 1 1.732 0zM11 16v2h2v-2h-2zm0-7v5h2V9h-2z" fill="currentColor"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" fill="currentColor"/>
              </svg>
            </span>
            <span class="message-title">{{ title }}</span>
            <button class="message-close" @click="close">×</button>
          </div>
          <div class="message-content">
            {{ message }}
          </div>
          <div class="message-footer">
            <button v-if="showCancelButton" class="message-cancel-button" @click="cancel">{{ cancelButtonText }}</button>
            <button class="message-button" @click="confirm">{{ buttonText }}</button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info', // info, success, warning, error
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  buttonText: {
    type: String,
    default: '确定'
  },
  showCancelButton: {
    type: Boolean,
    default: false
  },
  cancelButtonText: {
    type: String,
    default: '取消'
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'close', 'cancel', 'confirm'])

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    cancel()
  }
}

const confirm = () => {
  emit('update:visible', false)
  emit('confirm')
  emit('close', true)
}

const cancel = () => {
  emit('update:visible', false)
  emit('cancel')
  emit('close', false)
}

// 监听ESC键关闭弹窗
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.visible) {
    cancel()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.message-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.message-box {
  width: 400px;
  max-width: 90%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: message-in 0.3s ease;
}

.message-header {
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.message-icon {
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.message-type-info .message-icon {
  color: #1890ff;
}

.message-type-success .message-icon {
  color: #52c41a;
}

.message-type-warning .message-icon {
  color: #faad14;
}

.message-type-error .message-icon {
  color: #f5222d;
}

.message-title {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}

.message-close {
  border: none;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  color: #999;
  cursor: pointer;
  padding: 0;
}

.message-close:hover {
  color: #666;
}

.message-content {
  padding: 20px 16px;
  min-height: 60px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.message-footer {
  padding: 10px 16px 16px;
  text-align: right;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.message-button, .message-cancel-button {
  padding: 7px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.message-button {
  background-color: #1890ff;
  color: white;
}

.message-button:hover {
  background-color: #40a9ff;
}

.message-cancel-button {
  background-color: #f0f0f0;
  color: #333;
}

.message-cancel-button:hover {
  background-color: #d9d9d9;
}

.message-type-success .message-button {
  background-color: #52c41a;
}

.message-type-success .message-button:hover {
  background-color: #73d13d;
}

.message-type-warning .message-button {
  background-color: #faad14;
}

.message-type-warning .message-button:hover {
  background-color: #ffc53d;
}

.message-type-error .message-button {
  background-color: #f5222d;
}

.message-type-error .message-button:hover {
  background-color: #ff4d4f;
}

/* 动画效果 */
.message-fade-enter-active,
.message-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes message-in {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .message-box {
    width: 90%;
  }
  
  .message-footer {
    flex-direction: column;
  }
  
  .message-cancel-button {
    order: 2;
  }
  
  .message-button {
    order: 1;
  }
}
</style> 