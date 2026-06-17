import { App, ConfigProvider } from 'antd'
import locale from 'antd/locale/zh_CN'

import 'dayjs/locale/zh-cn'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import themeConfig from './config/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60 * 1000,
      gcTime: 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
})
dayjs.locale('zh-cn')

export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={locale} theme={themeConfig}>
        <App>{children}</App>
      </ConfigProvider>
    </QueryClientProvider>
  )
}
