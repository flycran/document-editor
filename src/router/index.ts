import { createBrowserRouter } from 'react-router'
import project from '@/config/project'
import routes from './routes'

export default createBrowserRouter(routes, {
  basename: import.meta.env.DEV ? '/' : `/${project.name}`,
})
