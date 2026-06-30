import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EnumsItem, GetEnumsApiReq } from '@/api/enums'
import { useGetPublicEnumsQueryHook } from '@/hooks/useGetPublicEnumsQueryHook'

export type { EnumsItem, GetEnumsApiReq } from '@/api/enums'

export type DocumentEditorEnumsContext = (data: GetEnumsApiReq) => EnumsItem[] | void

export const DocumentEditorEnumsContext = createContext<DocumentEditorEnumsContext | undefined>(
  undefined
)

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

export const DocumentEditorEnumsProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <DocumentEditorEnumsContext value={useGetPublicEnumsQueryHook}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </DocumentEditorEnumsContext>
  )
}
