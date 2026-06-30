import { type RouteObject } from 'react-router'
import MainLayout from '@/layouts/MainLayout'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
  },
]

export default routes
