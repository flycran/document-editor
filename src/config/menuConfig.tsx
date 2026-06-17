import { lazy } from 'react'
import type { NonIndexRouteObject } from 'react-router'

const EditorPage = lazy(() => import('@/pages/EditorPage'))
const PreviewPage = lazy(() => import('@/pages/PreviewPage'))

export interface MenuConfig extends NonIndexRouteObject {
  path: string
  label: string
}

export const menus: MenuConfig[] = [
  {
    path: 'editor',
    label: '编辑器',
    element: <EditorPage />,
  },
  {
    path: 'preview',
    label: '预览器',
    element: <PreviewPage />,
  },
]
