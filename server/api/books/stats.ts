import prisma from '~/utils/prisma'

// 处理图书统计的API
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const query = getQuery(event)
  
  // GET 请求 - 获取图书统计信息
  if (method === 'GET') {
    try {
      // 获取所有图书的基本统计
      const totalBooks = await prisma.book.count()
      const borrowedBooks = await prisma.book.count({
        where: { borrowedBy: { not: null } }
      })
      
      // 获取所有图书的价格信息
      const allBooks = await prisma.book.findMany({
        select: { price: true }
      })
      
      // 计算总价值
      const totalValue = allBooks.reduce((sum, book) => {
        const price = parseFloat(book.price || '0')
        return sum + (isNaN(price) ? 0 : price)
      }, 0)
      
      // 如果指定了分类ID，获取该分类的统计
      let categoryStats = null
      if (query.categoryId) {
        const categoryId = Number(query.categoryId)
        
        if (!isNaN(categoryId)) {
          // 获取分类下的图书
          const categoryBooks = await prisma.bookCategory.findMany({
            where: { categoryId },
            include: { book: true }
          })
          
          const categoryBooksCount = categoryBooks.length
          const categoryBorrowedCount = categoryBooks.filter(cb => cb.book.borrowedBy).length
          
          // 计算分类总价值
          const categoryValue = categoryBooks.reduce((sum, cb) => {
            const price = parseFloat(cb.book.price || '0')
            return sum + (isNaN(price) ? 0 : price)
          }, 0)
          
          categoryStats = {
            totalBooks: categoryBooksCount,
            borrowedBooks: categoryBorrowedCount,
            availableBooks: categoryBooksCount - categoryBorrowedCount,
            totalValue: categoryValue
          }
        }
      }
      
      // 获取分类统计
      const categories = await prisma.category.findMany({
        include: {
          books: {
            include: { book: true }
          }
        }
      })
      
      const categoryBreakdown = categories.map(category => {
        const books = category.books
        const totalValue = books.reduce((sum, cb) => {
          const price = parseFloat(cb.book.price || '0')
          return sum + (isNaN(price) ? 0 : price)
        }, 0)
        
        return {
          id: category.id,
          name: category.name,
          bookCount: books.length,
          totalValue
        }
      })
      
      return {
        overall: {
          totalBooks,
          borrowedBooks,
          availableBooks: totalBooks - borrowedBooks,
          totalValue
        },
        category: categoryStats,
        categoryBreakdown
      }
    } catch (error) {
      console.error('获取图书统计失败:', error)
      return createError({
        statusCode: 500,
        message: '获取图书统计失败'
      })
    }
  }
  
  return createError({
    statusCode: 405,
    message: '不支持的请求方法'
  })
}) 