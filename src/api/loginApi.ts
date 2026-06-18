import { useMutation } from '@tanstack/react-query'
import { createFetch } from '@/api/request'

const authFetch = createFetch('/api/auth')

export interface LoginReq {
  account: string
  password: string
}

export interface LoginResp {
  token: string
  name: string
  rst: number
  userno: string
  user_id: string
  acco_id: string
  user_phone: string
  is_phemr_ph: number
  is_admin: number
  emall_admin: number
  is_oo: number
  err?: string
}

export const loginApi = async (data: LoginReq): Promise<ApiResponse<LoginResp>> => {
  return authFetch<ApiResponse<LoginResp>>('/web/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: loginApi,
  })
}
