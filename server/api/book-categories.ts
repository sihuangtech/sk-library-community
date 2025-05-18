// 引入Prisma客户端
import { PrismaClient } from '@prisma/client'

// 初始化Prisma客户端
const prisma = new PrismaClient()

// 定义与图书分类关联相关的API
export default defineEventHandler(async (event) => {
  // 获取请求方法
  const method = getMethod(event)
  
  // GET 请求 - 获取图书的所有分类或分类下的所有图书
  if (method === 'GET') {
    const query = getQuery(event)
    
    // 根据bookId获取图书的所有分类
    if (query.bookId) {
      const bookId = parseInt(query.bookId as string)
      
      if (isNaN(bookId)) {
        return createError({
          statusCode: 400,
          message: '无效的图书ID'
        })
      }
      
      try {
        // 检查图书是否存在
        const book = await prisma.book.findUnique({
          where: { id: bookId }
        })
        
        if (!book) {
          return createError({
            statusCode: 404,
            message: '图书不存在'
          })
        }
        
        // 获取图书的所有分类
        const bookCategories = await prisma.bookCategory.findMany({
          where: { bookId },
          include: { category: true }
        })
        
        // 提取分类信息
        const categories = bookCategories.map(bc => bc.category)
        
        return categories
      } catch (error) {
        console.error('获取图书分类失败:', error)
        return createError({
          statusCode: 500,
          message: '获取图书分类失败'
        })
      }
    }
    
    // 根据categoryId获取分类下的所有图书
    if (query.categoryId) {
      const categoryId = parseInt(query.categoryId as string)
      
      if (isNaN(categoryId)) {
        return createError({
          statusCode: 400,
          message: '无效的分类ID'
        })
      }
      
      try {
        // 检查分类是否存在
        const category = await prisma.category.findUnique({
          where: { id: categoryId }
        })
        
        if (!category) {
          return createError({
            statusCode: 404,
            message: '分类不存在'
          })
        }
        
        // 获取分类下的所有图书
        const bookCategories = await prisma.bookCategory.findMany({
          where: { categoryId },
          include: { book: true }
        })
        
        // 提取图书信息
        const books = bookCategories.map(bc => bc.book)
        
        return books
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
    
    // 验证请求体中是否包含图书ID和分类ID
    if (!body.bookId || !body.categoryId) {
      return createError({
        statusCode: 400,
        message: '图书ID和分类ID不能为空'
      })
    }
    
    const bookId = parseInt(body.bookId)
    const categoryId = parseInt(body.categoryId)
    
    if (isNaN(bookId) || isNaN(categoryId)) {
      return createError({
        statusCode: 400,
        message: '无效的图书ID或分类ID'
      })
    }
    
    try {
      // 检查图书和分类是否存在
      const book = await prisma.book.findUnique({
        where: { id: bookId }
      })
      
      if (!book) {
        return createError({
          statusCode: 404,
          message: '图书不存在'
        })
      }
      
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })
      
      if (!category) {
        return createError({
          statusCode: 404,
          message: '分类不存在'
        })
      }
      
      // 检查关联是否已存在
      const existingRelation = await prisma.bookCategory.findUnique({
        where: {
          bookId_categoryId: {
            bookId,
            categoryId
          }
        }
      })
      
      if (existingRelation) {
        return createError({
          statusCode: 400,
          message: '图书已添加到该分类'
        })
      }
      
      // 创建图书与分类的关联
      const bookCategory = await prisma.bookCategory.create({
        data: {
          bookId,
          categoryId
        },
        include: {
          book: true,
          category: true
        }
      })
      
      return {
        success: true,
        message: `已将《${book.title}》添加到"${category.name}"分类`,
        data: bookCategory
      }
    } catch (error) {
      console.error('添加图书到分类失败:', error)
      return createError({
        statusCode: 500,
        message: '添加图书到分类失败'
      })
    }
  }
  
  // DELETE 请求 - 从分类中移除图书
  if (method === 'DELETE') {
    const body = await readBody(event)
    
    // 验证请求体中是否包含图书ID和分类ID
    if (!body.bookId || !body.categoryId) {
      return createError({
        statusCode: 400,
        message: '图书ID和分类ID不能为空'
      })
    }
    
    const bookId = parseInt(body.bookId)
    const categoryId = parseInt(body.categoryId)
    
    if (isNaN(bookId) || isNaN(categoryId)) {
      return createError({
        statusCode: 400,
        message: '无效的图书ID或分类ID'
      })
    }
    
    try {
      // 检查关联是否存在
      const existingRelation = await prisma.bookCategory.findUnique({
        where: {
          bookId_categoryId: {
            bookId,
            categoryId
          }
        },
        include: {
          book: true,
          category: true
        }
      })
      
      if (!existingRelation) {
        return createError({
          statusCode: 404,
          message: '图书未添加到该分类'
        })
      }
      
      // 删除图书与分类的关联
      await prisma.bookCategory.delete({
        where: {
          bookId_categoryId: {
            bookId,
            categoryId
          }
        }
      })
      
      return {
        success: true,
        message: `已从"${existingRelation.category.name}"分类中移除《${existingRelation.book.title}》`,
      }
    } catch (error) {
      console.error('从分类中移除图书失败:', error)
      return createError({
        statusCode: 500,
        message: '从分类中移除图书失败'
      })
    }
  }
}) 