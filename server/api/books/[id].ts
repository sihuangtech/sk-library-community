import { loadConfig } from '~/utils/config'
import prisma from '~/utils/prisma'

// 定义处理单本图书的API
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  // 获取URL中的图书ID参数
  const id = Number(event.context.params?.id)
  
  if (isNaN(id)) {
    return createError({
      statusCode: 400,
      message: '无效的图书ID'
    })
  }
  
  // GET请求 - 获取特定图书详情
  if (method === 'GET') {
    try {
      const book = await prisma.book.findUnique({
        where: { id }
      })
      
      if (!book) {
        return createError({
          statusCode: 404,
          message: '未找到该图书'
        })
      }
      
      return book
    } catch (error) {
      console.error('获取图书详情失败:', error)
      return createError({
        statusCode: 500,
        message: '获取图书详情失败'
      })
    }
  }
  
  // PUT请求 - 更新图书信息
  if (method === 'PUT') {
    const body = await readBody(event)
    
    // 处理价格：如果是大于100的整数，假定它是以分为单位，转换为元并格式化
    if (body.price !== null && body.price !== undefined) {
      const priceNum = Number(body.price)
      if (!isNaN(priceNum) && priceNum > 100) { // 可能是以分为单位
        body.price = (priceNum / 100).toFixed(2)
      } else if (!isNaN(priceNum)) {
        body.price = priceNum.toFixed(2)
      }
      // 如果已经是字符串格式且包含小数点，则保持不变
    }
    
    try {
      const updatedBook = await prisma.book.update({
        where: { id },
        data: body
      })
      
      return updatedBook
    } catch (error) {
      console.error('更新图书失败:', error)
      return createError({
        statusCode: 500,
        message: '更新图书失败'
      })
    }
  }
  
  // DELETE请求 - 删除图书
  if (method === 'DELETE') {
    try {
      await prisma.book.delete({
        where: { id }
      })
      
      return { success: true }
    } catch (error) {
      console.error('删除图书失败:', error)
      return createError({
        statusCode: 500,
        message: '删除图书失败'
      })
    }
  }
}) 