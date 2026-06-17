import { Navigate, type RouteObject } from 'react-router'
import { menus } from '@/config/menuConfig'
import MainLayout from '@/layouts/MainLayout'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [{ path: '', element: <Navigate to="editor" /> }, ...menus],
  },
]

export default routes
