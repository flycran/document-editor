import { generate } from 'orval'
import type { CodegenApiConfig } from '.'
import transformer from './transformer'

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
        filters: {
          mode: 'include',
          tags: ['模版设置 > 知情告知模版', '模版设置 > 知情告知模版'],
        },
        override: {
          transformer,
        },
        unsafeDisableValidation: true,
      },
    })
  },
  openapiUrl: new URL('../../openapi/openapi.json', import.meta.url),
}

export default codegenApiConfig
