import { EditOutlined, EyeOutlined } from '@ant-design/icons'
import { FloatButton } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router'

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const isEditor = location.pathname.startsWith('/editor')

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <FloatButton.Group>
        <FloatButton
          icon={<EditOutlined />}
          tooltip="编辑器"
          type={isEditor ? 'primary' : 'default'}
          onClick={() => navigate('/editor')}
        />
        <FloatButton
          icon={<EyeOutlined />}
          tooltip="预览器"
          type={!isEditor ? 'primary' : 'default'}
          onClick={() => navigate('/preview')}
        />
      </FloatButton.Group>
    </div>
  )
}
