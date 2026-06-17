import { generate, type OpenApiDocument } from 'orval'
import transformer from './transformer'

interface CodegenApiConfig {
  generate: (content: OpenApiDocument) => Promise<void>
  openapiUrl?: string
  orvalPollInterval?: 3000
}

const codegenApiConfig: CodegenApiConfig = {
  async generate(content) {
    await generate({
      output: {
        mode: 'single',
        target: 'src/api/codegen/petstore.ts',
        schemas: 'src/api/codegen/schemas',
        client: 'react-query',
        override: {
          mutator: {
            path: './src/api/request.ts',
            name: 'customFetch',
          },
        },
      },
      input: {
        target: content,
        override: {
          transformer,
        },
        unsafeDisableValidation: true,
        filters: {
          mode: 'include',
          tags: [/文书阶段/, /GCS评分/, /信息溯源/],
        },
      },
    })
  },
  openapiUrl: process.env.OPENAPI_URL,
}

export default codegenApiConfig
