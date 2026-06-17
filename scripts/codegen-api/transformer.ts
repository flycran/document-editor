import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { snakeCase } from 'change-case'
import { type OpenApiDocument } from 'orval'

function isRef(
  schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
): schema is OpenAPIV3_1.ReferenceObject {
  return '$ref' in schema
}

function transformSchema(schema: OpenAPIV3_1.SchemaObject): void {
  if (schema.type === 'object') {
    const properties = schema.properties as OpenAPIV3_1.BaseSchemaObject['properties']
    if (!properties) return
    for (const key of Object.keys(properties)) {
      const newKey = snakeCase(key)
      const value = properties[key]
      if (!isRef(value)) {
        transformSchema(value)
      }
      if (key !== newKey) {
        properties[newKey] = properties[key]
        delete properties[key]
      }
    }
  }
}

const methods: OpenAPIV3_1.HttpMethods[] = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'trace',
]

export default (doc: OpenApiDocument) => {
  if (doc.paths)
    for (const path of Object.values(doc.paths)) {
      if (!path) continue
      for (const methodName of methods) {
        const method = path[methodName]
        if (!method) continue
        if (method.parameters) {
          for (const param of method.parameters) {
            if (!isRef(param) && param.schema && !isRef(param.schema)) {
              transformSchema(param.schema)
            }
          }
        }
        if (method.requestBody) {
          if (!isRef(method.requestBody)) {
            const jsonContent = method.requestBody.content?.['application/json']
            if (jsonContent?.schema && !isRef(jsonContent.schema)) {
              transformSchema(jsonContent.schema)
            }
          }
        }
        if (method.responses) {
          for (const response of Object.values(method.responses)) {
            if (!isRef(response)) {
              const jsonContent = response.content?.['application/json']
              if (jsonContent?.schema && !isRef(jsonContent.schema)) {
                transformSchema(jsonContent.schema)
              }
            }
          }
        }
      }
    }

  if (doc.components?.schemas) {
    for (const schema of Object.values(doc.components?.schemas)) {
      transformSchema(schema)
    }
  }

  return doc
}
