import { JSONContent } from '@tiptap/react'
import { FloatButton, Spin } from 'antd'
import { lazy, Suspense, useState } from 'react'
import { MdEdit, MdVisibility } from 'react-icons/md'
import { useExpire } from '@/hooks/auth'
import { useAutoLogin } from '@/hooks/autoLogin'
import useGlobalKeepQuery from '@/hooks/globalKeepQuery'
import { useAppSelector } from '@/store/hooks'

const EditorPage = lazy(() => import('@/pages/EditorPage'))
const PreviewPage = lazy(() => import('@/pages/PreviewPage'))

type ViewMode = 'editor' | 'preview'

export default function MainLayout() {
  const [viewMode, setViewMode] = useState<ViewMode>('editor')
  const [content, setContent] = useState<JSONContent>()
  useGlobalKeepQuery()
  const isDemo = import.meta.env.MODE === 'demo' && !import.meta.env.SSR
  if (!isDemo) {
    useAutoLogin()
    useExpire()
  }
  const ready = isDemo || useAppSelector((state) => !!state.user.token)

  const isEditor = viewMode === 'editor'

  return ready ? (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={null}>
          {isEditor ? (
            <EditorPage content={content} setContent={setContent} />
          ) : (
            <PreviewPage content={content} />
          )}
        </Suspense>
      </div>
      <FloatButton.Group>
        <FloatButton
          icon={<MdEdit />}
          type={isEditor ? 'primary' : 'default'}
          onClick={() => setViewMode('editor')}
        />
        <FloatButton
          icon={<MdVisibility />}
          type={!isEditor ? 'primary' : 'default'}
          onClick={() => setViewMode('preview')}
        />
      </FloatButton.Group>
    </div>
  ) : (
    <div className="h-screen flex items-center justify-center">
      <Spin description="正在登录到系统..." size="large" />
    </div>
  )
}
