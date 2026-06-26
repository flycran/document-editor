import { message } from 'antd'
import project from '@/config/project'
import store from '@/store'
import { setExpire } from '@/store/slice/userSlice'

/** API 路径 → demo JSON 文件映射 */
const demoApiMap: Record<string, () => Promise<unknown>> = {
  '/questcenter/informed_template/get_medical_template_list': () =>
    import('./demo/get_medical_template_list.json'),
  '/questcenter/informed_template/get_template_detail_by_medical_id': () =>
    import('./demo/get_template_detail_by_medical_id.json'),
}

const isDemo = import.meta.env.MODE === 'production' && !import.meta.env.SSR

export const createFetch =
  (baseUrl: string) =>
  async <T>(url: string, options?: RequestInit) => {
    // Demo 模式：匹配 demo JSON 文件返回固定响应
    if (isDemo) {
      const pathname = url.split('?')[0]
      const loader = demoApiMap[pathname]
      if (loader) {
        const data = (await loader()) as { default: T }
        return data.default as T
      }
      console.warn(`[Demo] 未找到 ${pathname} 的 mock 数据，请求将失败`)
    }

    const state = store.getState()
    const urlParams = new URLSearchParams(window.location.search)

    const headers = new Headers(options?.headers)
    headers.set('tenantId', urlParams.get('tenant_id') || '100003')
    headers.set('line', '1')
    headers.set('device', 'device')
    headers.set('os', 'os')
    headers.set('userAgent', navigator.userAgent)
    if (state.user.token) headers.set('token', state.user.token)
    if (state.user.user_id) headers.set('userId', state.user.user_id)

    const response = await fetch(
      `${import.meta.env.MODE === 'demo' ? project.origin.chagineProxy : ''}${baseUrl}${url}`,
      {
        ...options,
        credentials: 'include',
        headers,
      }
    )

    if (response.status === 401) {
      store.dispatch(setExpire(true))
      throw new Error('Unauthorized')
    }

    const data: ApiResponse<T> = await response.json()

    if (data.status !== '000') {
      if (data.status) {
        data.message && message.error(data.message)
      }
      throw data
    }

    return {
      ...response,
      data: data.data,
      status: response.status,
    } as T
  }

export const customFetch = createFetch('/api')

export type ErrorType<Error> = Error
