interface ProjectMeta {
  /** 项目名称(影响生产环境的路由前缀) */
  name: string
  /** 项目端口 */
  port?: number
  /** 保持查询参数的键 */
  keepQueryKey?: string[]
  /** 接口地址 */
  origin: Record<string, string>
}

const project = {
  name: 'document-editor',
  port: 4004,
  keepQueryKey: ['password', 'tenant_id', 'password'],
  origin: {
    /** 测试 */
    chagineProxy: 'https://wry.chagine.cn',
    /** mock */
    mock: 'http://localhost:3000',
  },
} satisfies ProjectMeta
export default project
