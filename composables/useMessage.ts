import { ref } from 'vue'

interface MessageOptions {
  title?: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  buttonText?: string
  showCancelButton?: boolean
  cancelButtonText?: string
  duration?: number
  closeOnClickOverlay?: boolean
}

// 创建一个全局状态来管理消息框
const visible = ref(false)
const messageConfig = ref<MessageOptions>({
  title: '提示',
  message: '',
  type: 'info',
  buttonText: '确定',
  showCancelButton: false,
  cancelButtonText: '取消',
  closeOnClickOverlay: false
})

// 关闭消息后执行的回调
let resolvePromise: ((value: boolean) => void) | null = null

// 消息服务
export function useMessage() {
  // 显示消息的方法
  const showMessage = (options: MessageOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolvePromise = resolve
      
      // 更新配置
      messageConfig.value = {
        title: options.title || '提示',
        message: options.message,
        type: options.type || 'info',
        buttonText: options.buttonText || '确定',
        showCancelButton: options.showCancelButton || false,
        cancelButtonText: options.cancelButtonText || '取消',
        closeOnClickOverlay: options.closeOnClickOverlay || false
      }
      
      // 显示消息框
      visible.value = true
      
      // 如果设置了自动关闭
      if (options.duration) {
        setTimeout(() => {
          closeMessage(true)
        }, options.duration)
      }
    })
  }
  
  // 关闭消息
  const closeMessage = (result: boolean = true) => {
    visible.value = false
    
    // 执行关闭回调
    if (resolvePromise) {
      resolvePromise(result)
      resolvePromise = null
    }
  }
  
  // 快捷方法
  const info = (message: string, options?: Partial<MessageOptions>) => {
    return showMessage({ message, type: 'info', ...options })
  }
  
  const success = (message: string, options?: Partial<MessageOptions>) => {
    return showMessage({ message, type: 'success', ...options })
  }
  
  const warning = (message: string, options?: Partial<MessageOptions>) => {
    return showMessage({ message, type: 'warning', ...options })
  }
  
  const error = (message: string, options?: Partial<MessageOptions>) => {
    return showMessage({ message, type: 'error', ...options })
  }
  
  const confirm = (message: string, options?: Partial<MessageOptions>) => {
    return showMessage({ 
      message, 
      type: 'warning',
      title: '确认',
      buttonText: '确定',
      showCancelButton: true,
      cancelButtonText: '取消',
      ...options 
    })
  }
  
  return {
    visible,
    messageConfig,
    showMessage,
    closeMessage,
    info,
    success,
    warning,
    error,
    confirm
  }
} 