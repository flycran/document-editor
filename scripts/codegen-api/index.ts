import { readFile } from 'node:fs/promises'
import { config } from 'dotenv'
import type { OpenApiDocument } from 'orval'
import codegenApiConfig from './codegen-api-config'

export interface CodegenApiConfig {
  generate: (content: OpenApiDocument) => Promise<void>
  openapiUrl?: string | URL
  orvalPollInterval?: 3000
}

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

export async function getContent(resource: string | URL, encoding: BufferEncoding = 'utf8') {
  let url: URL

  if (resource instanceof URL) {
    url = resource
  } else {
    try {
      url = new URL(resource)
    } catch {
      // 普通路径
      return readFile(resource, encoding)
    }
  }

  switch (url.protocol) {
    case 'http:':
    case 'https:': {
      const res = await fetch(url)

      if (!res.ok) {
        throw new Error(`Failed to fetch ${url.href}: ${res.status} ${res.statusText}`)
      }

      return res.text()
    }

    case 'file:':
      return readFile(url, encoding)

    default:
      throw new Error(`Unsupported protocol: ${url.protocol}`)
  }
}

async function poll(): Promise<void> {
  try {
    if (!OPENAPI_URL) {
      throw new Error('OPENAPI_URL is required')
    }

    const content = await getContent(OPENAPI_URL)

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
