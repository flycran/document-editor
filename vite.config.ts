import react from '@vitejs/plugin-react-swc'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgIconsPlugin from './plugins/vite-plugin-svg-icons'
import project from './src/config/project'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  base: isDev ? undefined : `/${project.name}/`,
  server: {
    port: project.port,
    proxy: {
      '/api': {
        target: project.origin.chagineProxy,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    codeInspectorPlugin({
      bundler: 'vite',
    }),
    svgIconsPlugin(),
    tsconfigPaths(),
    react(),
    AutoImport({
      imports: [
        'react',
        {
          clsx: ['clsx'],
          dayjs: [['default', 'dayjs']],
        },
      ],
      dts: './src/types/auto-imports.d.ts',
    }),
    devtoolsJson(),
  ],
})
