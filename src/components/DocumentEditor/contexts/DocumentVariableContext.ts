export type DocumentVariableContextType = Record<string, any>

export const DocumentVariableContext = createContext<DocumentVariableContextType>({})

export const useDocumentVariable = () => {
  return useContext(DocumentVariableContext)
}
