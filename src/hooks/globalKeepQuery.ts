import { useEffect } from 'react'
import { useBlocker, useLocation, useNavigate } from 'react-router'
import project from '@/config/project'
import router from '@/router'

const mergeKeepParams = (
  fromParams: URLSearchParams,
  toParams: URLSearchParams,
  keepKeys: string[]
): URLSearchParams => {
  const merged = new URLSearchParams(toParams)

  keepKeys.forEach((key) => {
    const value = fromParams.get(key)
    if (value && !merged.has(key)) {
      merged.set(key, value)
    }
  })

  return merged
}

/**
 * 使用 useBlocker 拦截器保持全局查询参数
 * 在导航发生时自动将保留的参数附加到目标 URL
 */
export const useGlobalKeepQuery = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const blocker = useBlocker(true)

  useEffect(() => {
    if (!project.keepQueryKey) return
    if (blocker.state !== 'blocked') return

    const fromParams = new URLSearchParams(location.search)
    const toParams = new URLSearchParams(blocker.location.search)

    const mergedParams = mergeKeepParams(fromParams, toParams, project.keepQueryKey)
    const mergedSearch = mergedParams.toString()
    const originalSearch = toParams.toString()

    if (mergedSearch === originalSearch) {
      blocker.proceed()
      return
    }
    /**
     * 补丁：修复React Router 的 basename问题，官方修复后可以移除这段代码
     * https://github.com/remix-run/react-router/issues/10549
     */
    let pathname = blocker.location.pathname
    if (router.basename && pathname.startsWith(router.basename)) {
      pathname = pathname.slice(router.basename.length)
    }

    navigate(
      {
        pathname,
        search: mergedSearch,
        hash: blocker.location.hash,
      },
      {
        replace: false,
        state: blocker.location.state,
      }
    )
  }, [blocker])
}

export default useGlobalKeepQuery
