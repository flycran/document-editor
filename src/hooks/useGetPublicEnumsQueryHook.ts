import { GetEnumsApiReq } from '@/api/enums'
import { useGetPublicEnumsQuery } from '@/api/enums-public'

export const useGetPublicEnumsQueryHook = (params: GetEnumsApiReq) => {
  const { data } = useGetPublicEnumsQuery(params)
  return data?.data
}
