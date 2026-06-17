import { RouterProvider } from 'react-router'
import AppProvider from './AppProvider'
import router from './router'

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  )
}

export default App
