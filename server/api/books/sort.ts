import prisma from '~/utils/prisma'

// 处理图书排序的API
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  // PUT 请求 - 批量更新图书排序
  if (method === 'PUT') {
    const body = await readBody(event)
    
    // 期望的数据格式: { books: [{ id: number, sortOrder: number }] }
    if (!body.books || !Array.isArray(body.books)) {
      return createError({
        statusCode: 400,
        message: '无效的请求数据格式'
      })
    }
    
    try {
      // 批量更新图书排序
      const updatePromises = body.books.map((book: { id: number, sortOrder: number }) => 
        prisma.book.update({
          where: { id: book.id },
          data: { sortOrder: book.sortOrder }
        })
      )
      
      await Promise.all(updatePromises)
      
      return { success: true, message: '排序更新成功' }
    } catch (error) {
      console.error('更新图书排序失败:', error)
      return createError({
        statusCode: 500,
        message: '更新图书排序失败'
      })
    }
  }
  
  return createError({
    statusCode: 405,
    message: '不支持的请求方法'
  })
}) 