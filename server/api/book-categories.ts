import { loadConfig } from '~/utils/config'
import prisma from '~/utils/prisma'

// 定义与图书分类关联相关的API
export default defineEventHandler(async (event) => {
  // 获取请求方法
  const method = getMethod(event)
  const query = getQuery(event)
  
  // GET 请求 - 获取图书的分类或分类的图书
  if (method === 'GET') {
    // 如果提供了bookId，获取该图书的所有分类
    if (query.bookId) {
      const bookId = Number(query.bookId)
      
      if (isNaN(bookId)) {
        return createError({
          statusCode: 400,
          message: '无效的图书ID'
        })
      }
      
      try {
        const bookCategories = await prisma.bookCategory.findMany({
          where: { bookId },
          include: {
            category: true
          },
          orderBy: { sortOrder: 'asc' } // 按分类内排序顺序排列
        })
        
        return bookCategories.map(bc => bc.category)
      } catch (error) {
        console.error('获取图书分类失败:', error)
        return createError({
          statusCode: 500,
          message: '获取图书分类失败'
        })
      }
    }
    
    // 如果提供了categoryId，获取该分类的所有图书
    if (query.categoryId) {
      const categoryId = Number(query.categoryId)
      
      if (isNaN(categoryId)) {
        return createError({
          statusCode: 400,
          message: '无效的分类ID'
        })
      }
      
      try {
        const categoryBooks = await prisma.bookCategory.findMany({
          where: { categoryId },
          include: {
            book: true
          },
          orderBy: { sortOrder: 'asc' } // 按分类内排序顺序排列
        })
        
        return categoryBooks.map(cb => cb.book)
      } catch (error) {
        console.error('获取分类图书失败:', error)
        return createError({
          statusCode: 500,
          message: '获取分类图书失败'
        })
      }
    }
    
    return createError({
      statusCode: 400,
      message: '请提供bookId或categoryId参数'
    })
  }
  
  // POST 请求 - 添加图书到分类
  if (method === 'POST') {
    const body = await readBody(event)
    
    if (!body.bookId || !body.categoryId) {
      return createError({
        statusCode: 400,
        message: '缺少必要参数：bookId和categoryId'
      })
    }
    
    try {
      // 获取该分类中当前最大的sortOrder
      const maxSortOrder = await prisma.bookCategory.findFirst({
        where: { categoryId: body.categoryId },
        orderBy: { sortOrder: 'desc' }
      })
      
      const newSortOrder = (maxSortOrder?.sortOrder || 0) + 1
      
      const bookCategory = await prisma.bookCategory.create({
        data: {
          bookId: body.bookId,
          categoryId: body.categoryId,
          sortOrder: newSortOrder
        }
      })
      
      return bookCategory
    } catch (error) {
      console.error('添加图书到分类失败:', error)
      return createError({
        statusCode: 500,
        message: '添加图书到分类失败'
      })
    }
  }
  
  // PUT 请求 - 更新分类内图书排序
  if (method === 'PUT') {
    const body = await readBody(event)
    
    // 期望的数据格式: { categoryId: number, books: [{ bookId: number, sortOrder: number }] }
    if (!body.categoryId || !body.books || !Array.isArray(body.books)) {
      return createError({
        statusCode: 400,
        message: '无效的请求数据格式'
      })
    }
    
    try {
      // 批量更新分类内图书排序
      const updatePromises = body.books.map((item: { bookId: number, sortOrder: number }) => 
        prisma.bookCategory.update({
          where: {
            bookId_categoryId: {
              bookId: item.bookId,
              categoryId: body.categoryId
            }
          },
          data: { sortOrder: item.sortOrder }
        })
      )
      
      await Promise.all(updatePromises)
      
      return { success: true, message: '分类内排序更新成功' }
    } catch (error) {
      console.error('更新分类内排序失败:', error)
      return createError({
        statusCode: 500,
        message: '更新分类内排序失败'
      })
    }
  }
  
  // DELETE 请求 - 从分类中移除图书
  if (method === 'DELETE') {
    const body = await readBody(event)
    
    if (!body.bookId || !body.categoryId) {
      return createError({
        statusCode: 400,
        message: '缺少必要参数：bookId和categoryId'
      })
    }
    
    try {
      await prisma.bookCategory.delete({
        where: {
          bookId_categoryId: {
            bookId: body.bookId,
            categoryId: body.categoryId
          }
        }
      })
      
      return { success: true }
    } catch (error) {
      console.error('从分类中移除图书失败:', error)
      return createError({
        statusCode: 500,
        message: '从分类中移除图书失败'
      })
    }
  }
  
  return createError({
    statusCode: 405,
    message: '不支持的请求方法'
  })
}) 