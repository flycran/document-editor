export type DocumentVariableContextType = {
  variables: Record<string, any>
  setVariables: (v: Record<string, any>) => void
}

export const DocumentVariableContext = createContext<DocumentVariableContextType>({
  variables: {},
  setVariables: () => {},
})

export const useDocumentVariable = () => useContext(DocumentVariableContext)
