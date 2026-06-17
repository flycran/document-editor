import { config } from 'dotenv'
import type { OpenApiDocument } from 'orval'
import codegenApiConfig from './codegen-api-config'

config()
/**
 * 监听 OpenAPI 规范变更并自动重新生成 API 代码
 */

const OPENAPI_URL = codegenApiConfig.openapiUrl
const ORVAL_POLL_INTERVAL = codegenApiConfig.orvalPollInterval || 3000

let lastContent: string | null = null

function getTime() {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false })
}

async function poll(): Promise<void> {
  try {
    if (!OPENAPI_URL) {
      throw new Error('OPENAPI_URL is required')
    }
    const res = await fetch(OPENAPI_URL)
    if (res.status !== 200) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    const content = await res.text()
    if (content !== lastContent) {
      console.log(`[${getTime()}] 正在生成 API...`)
      codegenApiConfig.generate(JSON.parse(content) as OpenApiDocument)
      lastContent = content
    }
  } catch (err) {
    console.error('获取 OpenAPI 规范失败:', err instanceof Error ? err.message : err)
  }
}

async function run(): Promise<void> {
  await poll()
  setTimeout(run, ORVAL_POLL_INTERVAL)
}

if (process.argv.includes('--watch')) {
  run()
} else {
  poll()
}
