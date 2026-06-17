import { describe, expect, it } from 'bun:test'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import transformer from './transformer'

/**
 * 辅助函数：创建一个最小化的 OpenAPI 文档，方便测试 transformer
 */
function makeDoc(overrides?: Partial<OpenAPIV3_1.Document>): OpenAPIV3_1.Document {
  return {
    openapi: '3.1.0',
    info: { title: 'Test', version: '1.0.0' },
    paths: {},
    ...overrides,
  }
}

/**
 * 辅助函数：创建带 schema 的 JSON 响应
 */
function jsonResponse(schema: OpenAPIV3_1.SchemaObject): OpenAPIV3_1.ResponseObject {
  return {
    description: 'OK',
    content: {
      'application/json': { schema },
    },
  }
}

/**
 * 辅助函数：创建带 schema 的 JSON 请求体
 */
function jsonRequestBody(schema: OpenAPIV3_1.SchemaObject): OpenAPIV3_1.RequestBodyObject {
  return {
    content: {
      'application/json': { schema },
    },
  }
}

describe('transformer', () => {
  // ==================== 基础场景 ====================

  it('应该返回原文档（空 paths，空 components）', () => {
    const doc = makeDoc()
    const result = transformer(doc)
    expect(result).toBe(doc)
  })

  it('应该处理 doc.paths 为 undefined', () => {
    const doc = makeDoc({ paths: undefined })
    expect(() => transformer(doc)).not.toThrow()
  })

  it('应该处理 doc.components 为 undefined', () => {
    const doc = makeDoc({ components: undefined })
    expect(() => transformer(doc)).not.toThrow()
  })

  it('应该处理 doc.components.schemas 为 undefined', () => {
    const doc = makeDoc({
      components: { schemas: undefined } as unknown as OpenAPIV3_1.ComponentsObject,
    })
    expect(() => transformer(doc)).not.toThrow()
  })

  // ==================== paths 参数转换 ====================

  it('应该转换 query 参数中的 object schema 属性名', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            parameters: [
              {
                name: 'filter',
                in: 'query',
                schema: {
                  type: 'object',
                  properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    emailAddress: { type: 'string' },
                  },
                },
              },
            ],
            responses: { '200': jsonResponse({ type: 'string' }) },
          },
        },
      },
    })

    const result = transformer(doc)
    const param = result.paths!['/users']!.get!.parameters![0] as OpenAPIV3_1.ParameterObject
    const props = (param.schema as OpenAPIV3_1.SchemaObject).properties!
    expect(Object.keys(props)).toEqual(['first_name', 'last_name', 'email_address'])
    // 旧 key 应被删除
    expect(props.firstName).toBeUndefined()
  })

  it('应该忽略非 object 类型的参数 schema', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            parameters: [
              {
                name: 'id',
                in: 'query',
                schema: { type: 'integer' },
              },
            ],
            responses: { '200': jsonResponse({ type: 'string' }) },
          },
        },
      },
    })

    expect(() => transformer(doc)).not.toThrow()
    const result = transformer(doc)
    const param = result.paths!['/users']!.get!.parameters![0] as OpenAPIV3_1.ParameterObject
    expect((param.schema as OpenAPIV3_1.SchemaObject).type).toBe('integer')
  })

  it('应该跳过 $ref 参数', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            parameters: [{ $ref: '#/components/parameters/PageParam' }],
            responses: { '200': jsonResponse({ type: 'string' }) },
          },
        },
      },
    })

    expect(() => transformer(doc)).not.toThrow()
  })

  it('应该跳过 $ref schema 的参数', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            parameters: [
              {
                name: 'filter',
                in: 'query',
                schema: { $ref: '#/components/schemas/Filter' },
              },
            ],
            responses: { '200': jsonResponse({ type: 'string' }) },
          },
        },
      },
    })

    expect(() => transformer(doc)).not.toThrow()
  })

  it('应该处理没有 parameters 的 method', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: { '200': jsonResponse({ type: 'string' }) },
          },
        },
      },
    })

    expect(() => transformer(doc)).not.toThrow()
  })

  // ==================== requestBody 转换 ====================

  it('应该转换 JSON requestBody 中的 object schema 属性名', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          post: {
            requestBody: jsonRequestBody({
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                dateOfBirth: { type: 'string', format: 'date' },
              },
            }),
            responses: { '201': jsonResponse({ type: 'string' }) },
          },
        },
      },
    })

    const result = transformer(doc)
    const requestBody = result.paths!['/users']!.post!.requestBody as OpenAPIV3_1.RequestBodyObject
    const schema = requestBody.content!['application/json']!.schema as OpenAPIV3_1.SchemaObject
    expect(Object.keys(schema.properties!)).toEqual(['first_name', 'last_name', 'date_of_birth'])
  })

  it('应该跳过 $ref requestBody', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          post: {
            requestBody: { $ref: '#/components/requestBodies/UserBody' },
            responses: { '201': jsonResponse({ type: 'string' }) },
          },
        },
      },
    })

    expect(() => transformer(doc)).not.toThrow()
  })

  it('应该处理没有 content 的 requestBody', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          post: {
            requestBody: { content: {} },
            responses: { '201': jsonResponse({ type: 'string' }) },
          },
        },
      },
    })

    expect(() => transformer(doc)).not.toThrow()
  })

  it('应该处理没有 application/json content 的 requestBody', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'multipart/form-data': {
                  schema: { type: 'object', properties: { fileName: { type: 'string' } } },
                },
              },
            },
            responses: { '201': jsonResponse({ type: 'string' }) },
          },
        },
      },
    })

    const result = transformer(doc)
    const requestBody = result.paths!['/users']!.post!.requestBody as OpenAPIV3_1.RequestBodyObject
    const schema = requestBody.content!['multipart/form-data']!.schema as OpenAPIV3_1.SchemaObject
    // multipart/form-data 不应被转换（只处理 application/json）
    expect(Object.keys(schema.properties!)).toEqual(['fileName'])
  })

  it('应该跳过 $ref schema 的 requestBody', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/User' } },
              },
            },
            responses: { '201': jsonResponse({ type: 'string' }) },
          },
        },
      },
    })

    expect(() => transformer(doc)).not.toThrow()
  })

  // ==================== responses 转换 ====================

  it('应该转换 JSON response 中的 object schema 属性名', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: {
              '200': jsonResponse({
                type: 'object',
                properties: {
                  userId: { type: 'integer' },
                  userName: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              }),
            },
          },
        },
      },
    })

    const result = transformer(doc)
    const response = result.paths!['/users']!.get!.responses!['200'] as OpenAPIV3_1.ResponseObject
    const schema = response.content!['application/json']!.schema as OpenAPIV3_1.SchemaObject
    expect(Object.keys(schema.properties!)).toEqual(['user_id', 'user_name', 'created_at'])
  })

  it('应该跳过 $ref response', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: { '200': { $ref: '#/components/responses/UserResponse' } },
          },
        },
      },
    })

    expect(() => transformer(doc)).not.toThrow()
  })

  it('应该处理没有 content 的 response', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: { '204': { description: 'No Content' } },
          },
        },
      },
    })

    expect(() => transformer(doc)).not.toThrow()
  })

  it('应该处理没有 application/json content 的 response', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'text/html': { schema: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    })

    expect(() => transformer(doc)).not.toThrow()
  })

  // ==================== 嵌套 object ====================

  it('应该递归转换嵌套 object 的属性名', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: {
              '200': jsonResponse({
                type: 'object',
                properties: {
                  userInfo: {
                    type: 'object',
                    properties: {
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      contactInfo: {
                        type: 'object',
                        properties: {
                          phoneNumber: { type: 'string' },
                          emailAddress: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              }),
            },
          },
        },
      },
    })

    const result = transformer(doc)
    const response = result.paths!['/users']!.get!.responses!['200'] as OpenAPIV3_1.ResponseObject
    const rootSchema = response.content!['application/json']!.schema as OpenAPIV3_1.SchemaObject
    const rootProps = rootSchema.properties!

    // 第一层
    expect(Object.keys(rootProps)).toEqual(['user_info'])
    expect(rootProps.userInfo).toBeUndefined()

    // 第二层
    const userInfo = rootProps.user_info as OpenAPIV3_1.SchemaObject
    expect(Object.keys(userInfo.properties!)).toEqual(['first_name', 'last_name', 'contact_info'])
    expect(userInfo.properties!.firstName).toBeUndefined()

    // 第三层
    const contactInfo = userInfo.properties!.contact_info as OpenAPIV3_1.SchemaObject
    expect(Object.keys(contactInfo.properties!)).toEqual(['phone_number', 'email_address'])
  })

  // ==================== components/schemas 转换 ====================

  it('应该转换 components/schemas 中的 object schema 属性名', () => {
    const doc = makeDoc({
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              userId: { type: 'integer' },
              userName: { type: 'string' },
              emailAddress: { type: 'string' },
            },
          },
          Address: {
            type: 'object',
            properties: {
              streetAddress: { type: 'string' },
              postalCode: { type: 'string' },
            },
          },
        },
      },
    })

    const result = transformer(doc)
    const userSchema = result.components!.schemas!.User as OpenAPIV3_1.SchemaObject
    expect(Object.keys(userSchema.properties!)).toEqual(['user_id', 'user_name', 'email_address'])

    const addressSchema = result.components!.schemas!.Address as OpenAPIV3_1.SchemaObject
    expect(Object.keys(addressSchema.properties!)).toEqual(['street_address', 'postal_code'])
  })

  it('应该跳过 components/schemas 中的非 object 类型', () => {
    const doc = makeDoc({
      components: {
        schemas: {
          ErrorMessage: { type: 'string' },
          Count: { type: 'integer' },
        },
      },
    })

    expect(() => transformer(doc)).not.toThrow()
  })

  it('应该跳过 components/schemas 中没有 properties 的 object', () => {
    const doc = makeDoc({
      components: {
        schemas: {
          EmptyObject: { type: 'object' },
        },
      },
    })

    expect(() => transformer(doc)).not.toThrow()
  })

  // ==================== 边缘情况 ====================

  it('应该处理已为 snake_case 的属性（不变）', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: {
              '200': jsonResponse({
                type: 'object',
                properties: {
                  user_id: { type: 'integer' },
                  first_name: { type: 'string' },
                },
              }),
            },
          },
        },
      },
    })

    const result = transformer(doc)
    const response = result.paths!['/users']!.get!.responses!['200'] as OpenAPIV3_1.ResponseObject
    const schema = response.content!['application/json']!.schema as OpenAPIV3_1.SchemaObject
    expect(Object.keys(schema.properties!)).toEqual(['user_id', 'first_name'])
  })

  it('应该处理混合 camelCase / PascalCase / snake_case 属性', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: {
              '200': jsonResponse({
                type: 'object',
                properties: {
                  UserId: { type: 'integer' }, // PascalCase
                  userName: { type: 'string' }, // camelCase
                  first_name: { type: 'string' }, // 已 snake_case
                  'kebab-case': { type: 'string' }, // kebab-case
                },
              }),
            },
          },
        },
      },
    })

    const result = transformer(doc)
    const response = result.paths!['/users']!.get!.responses!['200'] as OpenAPIV3_1.ResponseObject
    const schema = response.content!['application/json']!.schema as OpenAPIV3_1.SchemaObject
    const keys = Object.keys(schema.properties!)
    // for...in 遍历顺序不确定，只验证内容
    expect(keys).toHaveLength(4)
    expect(keys).toContain('user_id')
    expect(keys).toContain('user_name')
    expect(keys).toContain('first_name')
    expect(keys).toContain('kebab_case')
  })

  it('应该处理单字母属性名', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: {
              '200': jsonResponse({
                type: 'object',
                properties: {
                  a: { type: 'string' },
                  b: { type: 'string' },
                  X: { type: 'string' },
                },
              }),
            },
          },
        },
      },
    })

    const result = transformer(doc)
    const response = result.paths!['/users']!.get!.responses!['200'] as OpenAPIV3_1.ResponseObject
    const schema = response.content!['application/json']!.schema as OpenAPIV3_1.SchemaObject
    // 单字母小写不变，大写变小写
    expect(Object.keys(schema.properties!)).toEqual(['a', 'b', 'x'])
  })

  it('应该处理全大写属性名', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: {
              '200': jsonResponse({
                type: 'object',
                properties: {
                  ID: { type: 'integer' },
                  URL: { type: 'string' },
                  HTTPStatus: { type: 'integer' },
                },
              }),
            },
          },
        },
      },
    })

    const result = transformer(doc)
    const response = result.paths!['/users']!.get!.responses!['200'] as OpenAPIV3_1.ResponseObject
    const schema = response.content!['application/json']!.schema as OpenAPIV3_1.SchemaObject
    const keys = Object.keys(schema.properties!)
    expect(keys).toContain('id')
    expect(keys).toContain('url')
    expect(keys).toContain('http_status')
  })

  it('应该处理数字开头的属性名', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: {
              '200': jsonResponse({
                type: 'object',
                properties: {
                  '1stField': { type: 'string' },
                  '2ndField': { type: 'string' },
                },
              }),
            },
          },
        },
      },
    })

    const result = transformer(doc)
    const response = result.paths!['/users']!.get!.responses!['200'] as OpenAPIV3_1.ResponseObject
    const schema = response.content!['application/json']!.schema as OpenAPIV3_1.SchemaObject
    expect(Object.keys(schema.properties!)).toEqual(['1st_field', '2nd_field'])
  })

  it('应该处理空 properties 对象', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: {
              '200': jsonResponse({
                type: 'object',
                properties: {},
              }),
            },
          },
        },
      },
    })

    expect(() => transformer(doc)).not.toThrow()
  })

  it('应该处理 path 为 null/undefined 的情况', () => {
    const doc = makeDoc({
      paths: {
        '/users': null,
        '/posts': undefined,
        '/comments': {
          get: {
            responses: { '200': jsonResponse({ type: 'string' }) },
          },
        },
      } as unknown as OpenAPIV3_1.PathsObject,
    })

    expect(() => transformer(doc)).not.toThrow()
  })

  it('应该处理所有 HTTP methods', () => {
    const methods = ['delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace'] as const
    for (const method of methods) {
      const doc = makeDoc({
        paths: {
          '/test': {
            [method]: {
              responses: {
                '200': jsonResponse({
                  type: 'object',
                  properties: { testField: { type: 'string' } },
                }),
              },
            },
          },
        },
      })

      const result = transformer(doc)
      const operation = (result.paths!['/test'] as Record<string, unknown>)[
        method
      ] as OpenAPIV3_1.OperationObject
      const response = operation.responses!['200'] as OpenAPIV3_1.ResponseObject
      const schema = response.content!['application/json']!.schema as OpenAPIV3_1.SchemaObject
      expect(Object.keys(schema.properties!)).toEqual(['test_field'])
    }
  })

  it('应该处理嵌套 object 中的 $ref 属性（不递归进入 $ref）', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: {
              '200': jsonResponse({
                type: 'object',
                properties: {
                  userData: {
                    type: 'object',
                    properties: {
                      firstName: { type: 'string' },
                      addressRef: { $ref: '#/components/schemas/Address' },
                    },
                  },
                },
              }),
            },
          },
        },
      },
    })

    const result = transformer(doc)
    const response = result.paths!['/users']!.get!.responses!['200'] as OpenAPIV3_1.ResponseObject
    const rootSchema = response.content!['application/json']!.schema as OpenAPIV3_1.SchemaObject
    const rootProps = rootSchema.properties!
    expect(Object.keys(rootProps)).toEqual(['user_data'])

    const userData = rootProps.user_data as OpenAPIV3_1.SchemaObject
    expect(Object.keys(userData.properties!)).toEqual(['first_name', 'address_ref'])
    // $ref 属性应保持不变
    const addressRef = userData.properties!.address_ref as OpenAPIV3_1.ReferenceObject
    expect(addressRef.$ref).toBe('#/components/schemas/Address')
  })

  it('应该处理数组类型 schema（非 object，不转换）', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: {
              '200': jsonResponse({
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    userId: { type: 'integer' },
                    userName: { type: 'string' },
                  },
                },
              }),
            },
          },
        },
      },
    })

    // 数组本身的 type 不是 object，transformSchema 不会处理
    // 这是当前实现的行为——数组 items 中的 object 不会被递归转换
    expect(() => transformer(doc)).not.toThrow()
  })

  it('应该处理多个 path 和多个 method', () => {
    const doc = makeDoc({
      paths: {
        '/users': {
          get: {
            responses: {
              '200': jsonResponse({
                type: 'object',
                properties: { userId: { type: 'integer' } },
              }),
            },
          },
          post: {
            requestBody: jsonRequestBody({
              type: 'object',
              properties: { userName: { type: 'string' } },
            }),
            responses: { '201': jsonResponse({ type: 'string' }) },
          },
        },
        '/posts': {
          get: {
            parameters: [
              {
                name: 'filter',
                in: 'query',
                schema: {
                  type: 'object',
                  properties: { postTitle: { type: 'string' } },
                },
              },
            ],
            responses: {
              '200': jsonResponse({
                type: 'object',
                properties: { postId: { type: 'integer' } },
              }),
            },
          },
        },
      },
    })

    const result = transformer(doc)

    // /users GET response
    const usersGetResp = result.paths!['/users']!.get!.responses![
      '200'
    ] as OpenAPIV3_1.ResponseObject
    const usersGetSchema = usersGetResp.content!['application/json']!
      .schema as OpenAPIV3_1.SchemaObject
    expect(Object.keys(usersGetSchema.properties!)).toEqual(['user_id'])

    // /users POST requestBody
    const usersPostReq = result.paths!['/users']!.post!.requestBody as OpenAPIV3_1.RequestBodyObject
    const usersPostSchema = usersPostReq.content!['application/json']!
      .schema as OpenAPIV3_1.SchemaObject
    expect(Object.keys(usersPostSchema.properties!)).toEqual(['user_name'])

    // /posts GET response
    const postsGetResp = result.paths!['/posts']!.get!.responses![
      '200'
    ] as OpenAPIV3_1.ResponseObject
    const postsGetSchema = postsGetResp.content!['application/json']!
      .schema as OpenAPIV3_1.SchemaObject
    expect(Object.keys(postsGetSchema.properties!)).toEqual(['post_id'])

    // /posts GET parameter
    const postsParam = result.paths!['/posts']!.get!.parameters![0] as OpenAPIV3_1.ParameterObject
    const postsParamSchema = postsParam.schema as OpenAPIV3_1.SchemaObject
    expect(Object.keys(postsParamSchema.properties!)).toEqual(['post_title'])
  })

  it('应该处理连续大写字母（如 XMLParser → xml_parser）', () => {
    const doc = makeDoc({
      paths: {
        '/test': {
          get: {
            responses: {
              '200': jsonResponse({
                type: 'object',
                properties: {
                  XMLParser: { type: 'string' },
                  HTTPSConnection: { type: 'string' },
                  userID: { type: 'string' },
                },
              }),
            },
          },
        },
      },
    })

    const result = transformer(doc)
    const response = result.paths!['/test']!.get!.responses!['200'] as OpenAPIV3_1.ResponseObject
    const schema = response.content!['application/json']!.schema as OpenAPIV3_1.SchemaObject
    const keys = Object.keys(schema.properties!)
    // change-case snakeCase 行为：XMLParser → xml_parser, HTTPSConnection → https_connection
    expect(keys).toContain('xml_parser')
    expect(keys).toContain('https_connection')
    expect(keys).toContain('user_id')
  })

  it('应该处理含特殊字符的属性名', () => {
    const doc = makeDoc({
      paths: {
        '/test': {
          get: {
            responses: {
              '200': jsonResponse({
                type: 'object',
                properties: {
                  'user name': { type: 'string' },
                  'email@address': { type: 'string' },
                },
              }),
            },
          },
        },
      },
    })

    const result = transformer(doc)
    const response = result.paths!['/test']!.get!.responses!['200'] as OpenAPIV3_1.ResponseObject
    const schema = response.content!['application/json']!.schema as OpenAPIV3_1.SchemaObject
    const keys = Object.keys(schema.properties!)
    // change-case 会把空格和特殊字符转成下划线
    expect(keys).toContain('user_name')
    expect(keys).toContain('email_address')
  })

  it('应该保持返回的文档是同一个引用', () => {
    const doc = makeDoc({
      paths: {
        '/test': {
          get: {
            responses: { '200': jsonResponse({ type: 'string' }) },
          },
        },
      },
    })

    const result = transformer(doc)
    // transformer 直接修改并返回原文档
    expect(result).toBe(doc)
  })

  it('应该处理 components.schemas 为空对象', () => {
    const doc = makeDoc({
      components: { schemas: {} },
    })

    expect(() => transformer(doc)).not.toThrow()
  })

  it('应该处理 responses 为空对象', () => {
    const doc = makeDoc({
      paths: {
        '/test': {
          get: { responses: {} },
        },
      },
    })

    expect(() => transformer(doc)).not.toThrow()
  })
})
