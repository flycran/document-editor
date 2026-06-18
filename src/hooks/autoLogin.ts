import { message } from 'antd'
import { useSearchParams } from 'react-router'
import { useAppSelector } from '@/store/hooks'
import { useLogin } from './auth'

/**
 * 自动登录
 */
export const useAutoLogin = () => {
  const token = useAppSelector((state) => state.user.token)
  const user = useAppSelector((state) => state.user)
  const [searchParams] = useSearchParams()
  const account = searchParams.get('account')
  const password = searchParams.get('password')
  const login = useLogin()
  const loginStatusRef = useRef<'none' | 'login' | 'logined'>('none')

  const autoLogin = async () => {
    if (account && password) {
      try {
        loginStatusRef.current = 'login'
        const res = await login({ account, password })
        if (res) {
          loginStatusRef.current = 'logined'
        }
      } catch (error) {
        console.error(error)
      } finally {
        loginStatusRef.current = 'none'
      }
    } else {
      message.warning('未提供账号')
    }
  }

  useEffect(() => {
    if (loginStatusRef.current === 'none') {
      autoLogin()
    }
  }, [account, token, user])
}
