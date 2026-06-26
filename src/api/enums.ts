import { useQuery } from '@tanstack/react-query'
import { createFetch } from './request'

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

export const getEnumsApi = (data: GetEnumsApiReq) => {
  return enumsFetch<ApiResponse<EnumsItem[]>>(
    `/range_value/get_enums?element_code=${data.element_code}`,
    {
      method: 'GET',
    }
  )
}

export const useGetEnumsQuery = ({ element_code }: { element_code?: string }) => {
  return useQuery({
    queryKey: ['getEnums'],
    queryFn: () => getEnumsApi({ element_code: element_code! }),
    enabled: !!element_code,
  })
}
