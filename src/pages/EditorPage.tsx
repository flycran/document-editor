import { useState } from 'react'
import Editor from '@/components/Editor'

export default function EditorPage() {
  const [content, setContent] = useState('')

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold text-gray-800 m-0">文书编辑</h1>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        <Editor placeholder="请输入文书内容..." content={content} onUpdate={setContent} />
      </div>
    </div>
  )
}
