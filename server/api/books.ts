// 引入Prisma客户端
import { PrismaClient } from '@prisma/client'

// 初始化Prisma客户端
const prisma = new PrismaClient()

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
    
    try {
      const book = await prisma.book.create({
        data: body
      })
      return book
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage: '创建书籍失败',
        data: error
      })
    }
  }
  
  // PUT 请求 - 更新书籍
  if (method === 'PUT') {
    const body = await readBody(event)
    const id = Number(url.pathname.split('/').pop())
    
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的书籍ID'
      })
    }
    
    try {
      const book = await prisma.book.update({
        where: { id },
        data: body
      })
      return book
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage: '更新书籍失败',
        data: error
      })
    }
  }
  
  // DELETE 请求 - 删除书籍
  if (method === 'DELETE') {
    const id = Number(url.pathname.split('/').pop())
    
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的书籍ID'
      })
    }
    
    try {
      await prisma.book.delete({
        where: { id }
      })
      return { message: '删除成功' }
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage: '删除书籍失败',
        data: error
      })
    }
  }
}) 