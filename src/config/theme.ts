import type { ThemeConfig } from 'antd'

const themeConfig: ThemeConfig = {
  components: {
    Form: {
      labelColor: '#333',
    },
    Button: {
      // 去除按钮阴影
      defaultShadow: 'none',
      primaryShadow: 'none',
      borderRadius: 4,
    },
    Table: {
      headerBg: '#E5F3F4',
      headerColor: '#008f91',
      borderRadius: 0,
    },
  },
  token: {
    colorPrimary: '#008F91',
    borderRadius: 4,
  },
}

export default themeConfig
