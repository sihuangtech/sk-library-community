import { config } from '~/utils/config'

export default defineEventHandler(async (event) => {
  try {
    // 返回网站配置信息（不包含敏感信息）
    return {
      name: config.site.name,
      version: config.site.version,
      copyright_owner: config.site.copyright_owner,
      filing: {
        icp_number: config.site.filing.icp_number,
        police_number: config.site.filing.police_number,
        show_filing: config.site.filing.show_filing
      }
    }
  } catch (error) {
    console.error('获取网站配置失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取网站配置失败'
    })
  }
}) 