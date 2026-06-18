import { combineReducers, configureStore } from '@reduxjs/toolkit'
import userSlice from './slice/userSlice'

const rootReducer = combineReducers({
  user: userSlice,
})

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
    return middleware
  },
})

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// 防止热重载后状态丢失
if (import.meta.hot) {
  import.meta.hot.accept()
}
