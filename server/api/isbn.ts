// ISBN查询API服务
// 调用 https://data.isbn.work/ 提供的ISBN查询接口

export default defineEventHandler(async (event) => {
  // 从运行时配置获取API密钥
  const config = useRuntimeConfig()
  const API_KEY = config.isbnApiKey
  
  const query = getQuery(event)
  
  // 检查是否提供了ISBN
  if (!query.isbn) {
    return createError({
      statusCode: 400,
      message: '请提供ISBN编号'
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
      return createError({
        statusCode: response.status,
        message: `ISBN查询失败: ${response.statusText}`
      })
    }
    
    const result = await response.json()
    
    // 检查API返回结果是否成功
    if (!result.success || result.code !== 0) {
      return createError({
        statusCode: 404,
        message: '未找到图书信息或API返回错误'
      })
    }
    
    // 转换数据格式以适应前端组件期望的格式
    const bookData = {
      data: {
        isbn: result.data.isbn,
        title: result.data.bookName,
        author: result.data.author,
        publisher: result.data.press,
        pubdate: result.data.pressDate,
        // 将价格从整数（单位：分）转换为带小数点的字符串（单位：元）
        price: result.data.price ? String((Number(result.data.price) / 100).toFixed(2)) : null,
        summary: result.data.bookDesc,
        pages: parseInt(result.data.pages) || null,
        
        // 新增扩展字段
        pressPlace: result.data.pressPlace,
        binding: result.data.binding,
        language: result.data.language,
        format: result.data.format,
        edition: result.data.edition,
        words: result.data.words,
        clcCode: result.data.clcCode,
        clcName: result.data.clcName,
        pictures: result.data.pictures, // 保留原始图片JSON字符串
        
        // 处理封面图片
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
    
    // 记录完整的数据结构，方便调试
    console.log('处理后的图书数据:', JSON.stringify(bookData, null, 2))
    
    return bookData
  } catch (error) {
    console.error('ISBN查询错误:', error)
    
    return createError({
      statusCode: 500,
      message: '无法连接到ISBN服务'
    })
  }
}) 