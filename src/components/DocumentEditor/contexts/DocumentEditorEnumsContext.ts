import { EnumsItem, GetEnumsApiReq } from '@/api/enums'

export type DocumentEditorEnumsContext = (data: GetEnumsApiReq) => EnumsItem[] | void

export const DocumentEditorEnumsContext = createContext<DocumentEditorEnumsContext | undefined>(
  undefined
)
