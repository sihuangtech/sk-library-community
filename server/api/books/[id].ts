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
    
    // 价格处理：直接保存用户输入的价格，不进行自动转换
    if (body.price !== null && body.price !== undefined && body.price !== '') {
      const priceNum = Number(body.price)
      if (!isNaN(priceNum)) {
        // 直接保存数值，保留用户输入的原始值
        body.price = priceNum.toString()
      }
      // 如果不是有效数字，保持原始字符串
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