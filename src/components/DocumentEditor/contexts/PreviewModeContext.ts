import { createContext, useContext } from 'react'

export interface PreviewModeContextType {
  isPreview: boolean
  setPreview: (v: boolean) => void
}

export const PreviewModeContext = createContext<PreviewModeContextType>({
  isPreview: true,
  setPreview: () => {},
})

export const usePreviewMode = () => useContext(PreviewModeContext)
