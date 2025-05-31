<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="copyright">
        <p>© {{ new Date().getFullYear() }} {{ siteConfig?.copyright_owner }} - 由Nuxt强力驱动</p>
      </div>
      <div v-if="siteConfig?.filing?.show_filing && (siteConfig?.filing?.icp_number || siteConfig?.filing?.police_number)" class="filing-info">
        <p>
          <a v-if="siteConfig.filing.icp_number" 
             href="https://beian.miit.gov.cn/" 
             target="_blank" 
             rel="noopener noreferrer">
            {{ siteConfig.filing.icp_number }}
          </a>
          <span v-if="siteConfig.filing.icp_number && siteConfig.filing.police_number"> | </span>
          <a v-if="siteConfig.filing.police_number" 
             href="https://beian.mps.gov.cn/" 
             target="_blank" 
             rel="noopener noreferrer">
            {{ siteConfig.filing.police_number }}
          </a>
        </p>
      </div>
      <div class="additional-info">
        <p>{{ siteConfig?.name }} v{{ siteConfig?.version }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 网站配置接口
interface SiteConfig {
  name: string
  version: string
  copyright_owner: string
  filing: {
    icp_number: string
    police_number: string
    show_filing: boolean
  }
}

// 网站配置数据
const siteConfig = ref<SiteConfig | null>(null)

// 获取网站配置
const fetchSiteConfig = async () => {
  try {
    const response = await fetch('/api/site-config')
    if (response.ok) {
      siteConfig.value = await response.json()
    }
  } catch (error) {
    console.error('获取网站配置失败:', error)
  }
}

// 组件挂载时获取配置
onMounted(() => {
  fetchSiteConfig()
})
</script>

<style scoped>
.footer {
  background-color: var(--secondary-color);
  border-top: 1px solid var(--border-color);
  padding: 2rem 0;
  margin-top: auto;
  color: var(--text-color);
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.copyright {
  margin-bottom: 0.5rem;
}

.copyright p {
  font-size: 0.9rem;
  font-weight: 500;
}

.filing-info {
  margin-bottom: 0.5rem;
}

.filing-info p {
  font-size: 0.8rem;
  line-height: 1.5;
}

.filing-info a {
  color: var(--text-color);
  opacity: 0.7;
  text-decoration: none;
  margin: 0 0.25rem;
  transition: color 0.3s ease, opacity 0.3s ease;
}

.filing-info a:hover {
  color: var(--primary-color);
  opacity: 1;
  text-decoration: underline;
}

.additional-info {
  margin-top: 0.5rem;
}

.additional-info p {
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer {
    padding: 1.5rem 0;
  }
  
  .footer-content {
    padding: 0 1rem;
  }
  
  .filing-info p {
    font-size: 0.75rem;
  }
  
  .filing-info a {
    display: block;
    margin: 0.25rem 0;
  }
}
</style> 