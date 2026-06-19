import { JSONContent } from '@tiptap/react'
import { FloatButton, Spin } from 'antd'
import { useState } from 'react'
import { MdEdit, MdVisibility } from 'react-icons/md'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { useExpire } from '@/hooks/auth'
import { useAutoLogin } from '@/hooks/autoLogin'
import useGlobalKeepQuery from '@/hooks/globalKeepQuery'
import { useAppSelector } from '@/store/hooks'

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [content, setContent] = useState<JSONContent>()
  useGlobalKeepQuery()
  useAutoLogin()
  useExpire()
  const ready = useAppSelector((state) => !!state.user.token)

  const isEditor = location.pathname.startsWith('/editor')

  return ready ? (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-hidden">
        <Outlet context={{ content, setContent }} />
      </div>
      <FloatButton.Group>
        <FloatButton
          icon={<MdEdit />}
          type={isEditor ? 'primary' : 'default'}
          onClick={() => navigate('/editor')}
        />
        <FloatButton
          icon={<MdVisibility />}
          type={!isEditor ? 'primary' : 'default'}
          onClick={() => navigate('/preview')}
        />
      </FloatButton.Group>
    </div>
  ) : (
    <div className="h-screen flex items-center justify-center">
      <Spin description="正在登录到系统..." size="large" />
    </div>
  )
}
