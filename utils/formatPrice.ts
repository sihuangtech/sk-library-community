/**
 * 统一的价格格式化工具函数
 * 用于在整个应用中统一价格显示格式
 * 
 * @param price 价格值，可以是字符串、数字或null/undefined
 * @returns 格式化后的价格字符串，如 "¥29.90" 或 "未知"
 */
export function formatPrice(price: string | number | null | undefined): string {
  // 处理空值情况
  if (price === null || price === undefined || price === '') {
    return '未知'
  }
  
  // 如果已经是格式化的价格字符串（包含货币符号），直接返回
  if (typeof price === 'string' && (price.includes('¥') || price.includes('￥'))) {
    return price
  }
  
  // 尝试转换为数字
  const numPrice = Number(price)
  
  // 如果不是有效数字，返回原始字符串或"未知"
  if (isNaN(numPrice)) {
    return typeof price === 'string' ? price : '未知'
  }
  
  // 格式化为货币格式，保留两位小数
  return `¥${numPrice.toFixed(2)}`
}

/**
 * 解析价格字符串为数字
 * 用于计算总价等场景
 * 
 * @param price 价格值
 * @returns 解析后的数字，如果无法解析则返回0
 */
export function parsePrice(price: string | number | null | undefined): number {
  if (price === null || price === undefined || price === '') {
    return 0
  }
  
  // 如果是数字类型，直接返回
  if (typeof price === 'number') {
    return isNaN(price) ? 0 : price
  }
  
  // 如果是字符串，移除货币符号后转换
  if (typeof price === 'string') {
    const cleanPrice = price.replace(/[¥￥]/g, '').trim()
    const numPrice = Number(cleanPrice)
    return isNaN(numPrice) ? 0 : numPrice
  }
  
  return 0
} 