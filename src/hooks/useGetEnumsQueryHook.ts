import { GetEnumsApiReq, useGetEnumsQuery } from '@/api/enums'

export const useGetEnumsQueryHook = (params: GetEnumsApiReq) => {
  const { data } = useGetEnumsQuery(params)
  return data?.data
}
