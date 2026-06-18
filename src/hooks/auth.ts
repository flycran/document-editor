import { useMutation } from '@tanstack/react-query'
import { message } from 'antd'
import { type LoginReq, loginApi } from '@/api/loginApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { resetUserInfo, setExpire, setUserInfo } from '@/store/slice/userSlice'

export const useLogin = () => {
  const dispatch = useAppDispatch()
  const { mutateAsync: loginMutation } = useMutation({ mutationFn: loginApi })
  const searchParams = new URLSearchParams(window.location.search)

  return async (form: LoginReq) => {
    const res = await loginMutation(form).catch((error: ErrorResponse) => ({ error }))
    if ('error' in res) {
      message.error(res.error.message)
      return
    }
    if (res.data?.rst !== 0) {
      message.error(res.data?.err)
    }
    dispatch(setUserInfo(res.data || {}))
    const visit_no = searchParams.get('visit_no')
    if (!visit_no) throw new Error('visit_no is required')
    return res
  }
}

export const useLogout = () => {
  const dispatch = useAppDispatch()

  return () => {
    dispatch(resetUserInfo())
  }
}

export const useExpire = () => {
  const expire = useAppSelector((state) => state.user.expire)
  const dispatch = useAppDispatch()
  const logout = useLogout()

  useEffect(() => {
    if (expire) {
      dispatch(setExpire(false))
      logout()
    }
  }, [expire])
}
