import { loadConfig } from '~/utils/config'
import prisma from '~/utils/prisma'

// 定义与书籍相关的API
export default defineEventHandler(async (event) => {
  // 获取请求方法和URL
  const method = getMethod(event)
  const url = getRequestURL(event)
  
  // 根据不同的请求方法执行不同的操作
  // GET 请求 - 获取所有书籍或单本书籍
  if (method === 'GET') {
    const query = getQuery(event)
    
    // 如果提供了ISBN，则获取特定书籍
    if (query.isbn) {
      const book = await prisma.book.findUnique({
        where: { isbn: query.isbn as string }
      })
      return book
    }
    
    // 否则获取所有书籍，按添加时间降序排列
    const books = await prisma.book.findMany({
      orderBy: { addedAt: 'desc' }
    })
    return books
  }
  
  // POST 请求 - 添加新书籍
  if (method === 'POST') {
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
      const newBook = await prisma.book.create({
        data: body
      })
      
      return newBook
    } catch (error) {
      console.error('创建书籍失败:', error)
      return createError({
        statusCode: 500,
        message: '创建书籍失败'
      })
    }
  }
  
  // PUT 请求 - 更新书籍
  if (method === 'PUT') {
    const body = await readBody(event)
    const id = Number(url.pathname.split('/').pop())
    
    if (isNaN(id)) {
      return createError({
        statusCode: 400,
        message: '无效的书籍ID'
      })
    }
    
    try {
      const updatedBook = await prisma.book.update({
        where: { id },
        data: body
      })
      
      return updatedBook
    } catch (error) {
      console.error('更新书籍失败:', error)
      return createError({
        statusCode: 500,
        message: '更新书籍失败'
      })
    }
  }
  
  // DELETE 请求 - 删除书籍
  if (method === 'DELETE') {
    const id = Number(url.pathname.split('/').pop())
    
    if (isNaN(id)) {
      return createError({
        statusCode: 400,
        message: '无效的书籍ID'
      })
    }
    
    try {
      await prisma.book.delete({
        where: { id }
      })
      
      return { success: true }
    } catch (error) {
      console.error('删除书籍失败:', error)
      return createError({
        statusCode: 500,
        message: '删除书籍失败'
      })
    }
  }
}) 