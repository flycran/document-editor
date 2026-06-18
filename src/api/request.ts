import { message } from 'antd'
import store from '@/store'
import { setExpire } from '@/store/slice/userSlice'

export const createFetch =
  (baseUrl: string) =>
  async <T>(url: string, options?: RequestInit) => {
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

    const response = await fetch(baseUrl + url, {
      ...options,
      credentials: 'include',
      headers,
    })

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
