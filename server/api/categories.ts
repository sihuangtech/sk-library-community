// 引入Prisma客户端
import { PrismaClient } from '@prisma/client'

// 初始化Prisma客户端
const prisma = new PrismaClient()

// 定义与分类相关的API
export default defineEventHandler(async (event) => {
  // 获取请求方法和URL
  const method = getMethod(event)
  
  // GET 请求 - 获取所有分类
  if (method === 'GET') {
    try {
      const categories = await prisma.category.findMany({
        include: {
          // 包含每个分类下的图书数量
          _count: {
            select: {
              books: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
      
      // 转换结果，添加bookCount字段
      const result = categories.map(category => ({
        ...category,
        bookCount: category._count.books,
        _count: undefined
      }))
      
      return result
    } catch (error) {
      console.error('获取分类列表失败:', error)
      return createError({
        statusCode: 500,
        message: '获取分类列表失败'
      })
    }
  }
  
  // POST 请求 - 添加新分类
  if (method === 'POST') {
    const body = await readBody(event)
    
    // 验证请求体中是否包含分类名称
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return createError({
        statusCode: 400,
        message: '分类名称不能为空'
      })
    }
    
    try {
      // 检查分类名称是否已存在
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: body.name
        }
      })
      
      if (existingCategory) {
        return createError({
          statusCode: 400,
          message: '分类名称已存在'
        })
      }
      
      // 创建新分类
      const newCategory = await prisma.category.create({
        data: {
          name: body.name,
          description: body.description || null
        }
      })
      
      return newCategory
    } catch (error) {
      console.error('创建分类失败:', error)
      return createError({
        statusCode: 500,
        message: '创建分类失败'
      })
    }
  }
  
  // PUT 请求 - 更新分类
  if (method === 'PUT') {
    const body = await readBody(event)
    
    // 验证请求体中是否包含分类ID和名称
    if (!body.id || !body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return createError({
        statusCode: 400,
        message: '分类ID和名称不能为空'
      })
    }
    
    try {
      // 检查分类是否存在
      const existingCategory = await prisma.category.findUnique({
        where: {
          id: body.id
        }
      })
      
      if (!existingCategory) {
        return createError({
          statusCode: 404,
          message: '分类不存在'
        })
      }
      
      // 检查更新的名称是否与其他分类重名
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name: body.name,
          id: {
            not: body.id
          }
        }
      })
      
      if (duplicateCategory) {
        return createError({
          statusCode: 400,
          message: '分类名称已存在'
        })
      }
      
      // 更新分类
      const updatedCategory = await prisma.category.update({
        where: {
          id: body.id
        },
        data: {
          name: body.name,
          description: body.description
        }
      })
      
      return updatedCategory
    } catch (error) {
      console.error('更新分类失败:', error)
      return createError({
        statusCode: 500,
        message: '更新分类失败'
      })
    }
  }
  
  // DELETE 请求 - 删除分类
  if (method === 'DELETE') {
    const body = await readBody(event)
    
    // 验证请求体中是否包含分类ID
    if (!body.id) {
      return createError({
        statusCode: 400,
        message: '分类ID不能为空'
      })
    }
    
    try {
      // 检查分类是否存在
      const existingCategory = await prisma.category.findUnique({
        where: {
          id: body.id
        }
      })
      
      if (!existingCategory) {
        return createError({
          statusCode: 404,
          message: '分类不存在'
        })
      }
      
      // 删除分类（关联的BookCategory会因为级联删除而自动删除）
      await prisma.category.delete({
        where: {
          id: body.id
        }
      })
      
      return { success: true, message: '分类已成功删除' }
    } catch (error) {
      console.error('删除分类失败:', error)
      return createError({
        statusCode: 500,
        message: '删除分类失败'
      })
    }
  }
}) 