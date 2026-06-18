import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { LoginResp } from '@/api/loginApi'

export interface UserState extends LoginResp {
  expire: boolean
}

const initialState: UserState = {
  // 登录状态过期
  expire: false,
  rst: 0,
  token: '',
  user_id: '',
  name: '',
  user_phone: '',
  is_admin: 0,
  userno: '',
  acco_id: '',
  is_phemr_ph: 0,
  emall_admin: 0,
  is_oo: 0,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo(state, action: PayloadAction<Partial<UserState>>) {
      Object.assign(state, action.payload)
    },
    resetUserInfo(state) {
      Object.assign(state, initialState)
    },
    setExpire(state, action: PayloadAction<boolean>) {
      state.expire = action.payload
    },
  },
})

export const { setUserInfo, resetUserInfo, setExpire } = userSlice.actions
export default userSlice.reducer
export const persist = true
