import { useQuery } from '@tanstack/react-query'

export const createFetch =
  (baseUrl: string) =>
  async <T>(url: string, options?: RequestInit) => {
    const headers = new Headers(options?.headers)
    headers.set('line', '1')
    headers.set('device', 'device')
    headers.set('os', 'os')
    headers.set('userAgent', navigator.userAgent)

    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      credentials: 'include',
      headers,
    })

    const data: ApiResponse<T> = await response.json()

    return {
      ...response,
      data: data.data,
      status: response.status,
    } as T
  }

const enumsFetch = createFetch('/api/questcenter/public/api/element')

export interface EnumsItem {
  code: string
  name: string
  sort: number
  rank: number
}

export interface GetEnumsApiReq {
  element_code: string
}

export const getPublicEnumsApi = (data: GetEnumsApiReq) => {
  return enumsFetch<ApiResponse<EnumsItem[]>>(
    `/range_value/get_enums?element_code=${data.element_code}`,
    {
      method: 'GET',
    }
  )
}

export const useGetPublicEnumsQuery = ({ element_code }: { element_code?: string }) => {
  return useQuery({
    queryKey: ['getEnums'],
    queryFn: () => getPublicEnumsApi({ element_code: element_code! }),
    enabled: !!element_code,
  })
}
