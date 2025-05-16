// ISBN查询API服务
// 调用 https://data.isbn.work/ 提供的ISBN查询接口

export default defineEventHandler(async (event) => {
  // 从运行时配置获取API密钥
  const config = useRuntimeConfig()
  const API_KEY = config.isbnApiKey
  
  const query = getQuery(event)
  
  // 检查是否提供了ISBN
  if (!query.isbn) {
    throw createError({
      statusCode: 400,
      statusMessage: '请提供ISBN编号'
    })
  }
  
  try {
    // 调用ISBN查询API
    const response = await fetch(`https://data.isbn.work/openApi/getInfoByIsbn?isbn=${query.isbn}&appKey=${API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `ISBN查询失败: ${response.statusText}`
      })
    }
    
    const result = await response.json()
    
    // 检查API返回结果是否成功
    if (!result.success || result.code !== 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '未找到图书信息或API返回错误'
      })
    }
    
    // 转换数据格式以适应前端组件期望的格式
    const bookData = {
      data: {
        title: result.data.bookName,
        author: result.data.author,
        publisher: result.data.press,
        pubdate: result.data.pressDate,
        price: (result.data.price / 100).toFixed(2) + '元', // 价格从分转换为元
        summary: result.data.bookDesc,
        pages: parseInt(result.data.pages) || 0,
        coverUrl: null
      }
    }
    
    // 处理封面图片（pictures是JSON格式的数组字符串）
    try {
      const pictures = JSON.parse(result.data.pictures)
      if (pictures && pictures.length > 0) {
        bookData.data.coverUrl = pictures[0]
      }
    } catch (e) {
      // 如果解析图片URL失败，不设置封面URL
      console.error('解析图书封面失败:', e)
    }
    
    return bookData
  } catch (error) {
    console.error('ISBN查询错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '无法连接到ISBN服务',
      data: error
    })
  }
}) 