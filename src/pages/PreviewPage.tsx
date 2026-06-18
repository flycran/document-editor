import { useOutletContext } from 'react-router'
import Previewer from '@/components/DocumentPreviewer'

interface OutletContext {
  content: string
  setContent: (content: string) => void
}

export default function PreviewPage() {
  const { content } = useOutletContext<OutletContext>()

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold text-gray-800 m-0">文书预览</h1>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        <Previewer content={content} />
      </div>
    </div>
  )
}
