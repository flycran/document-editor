import react from '@vitejs/plugin-react-swc'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgIconsPlugin from './plugins/vite-plugin-svg-icons'
import project from './src/config/project'

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'
  const isDev = mode === 'development'

  return {
    base: isLib || isDev ? undefined : `/${project.name}/`,
    server: isLib
      ? undefined
      : {
          port: project.port,
          proxy: {
            '/api': {
              target: project.origin.chagineProxy,
              changeOrigin: true,
            },
          },
        },
    plugins: [
      ...(isLib
        ? []
        : [codeInspectorPlugin({ bundler: 'vite' }), svgIconsPlugin(), devtoolsJson()]),
      tsconfigPaths(),
      react(),
      AutoImport({
        imports: ['react', { clsx: ['clsx'], dayjs: [['default', 'dayjs']] }],
        dts: './src/types/auto-imports.d.ts',
      }),
    ],
    build: isLib
      ? {
          lib: {
            entry: 'src/index.ts',
            name: 'DocumentEditor',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
          },
          rollupOptions: {
            external: [
              'react',
              'react-dom',
              'react/jsx-runtime',
              'antd',
              '@ant-design/icons',
              '@reduxjs/toolkit',
              'react-redux',
              'react-router',
              '@tanstack/react-query',
              '@tiptap/react',
              '@tiptap/starter-kit',
              '@tiptap/extension-color',
              '@tiptap/extension-font-size',
              '@tiptap/extension-highlight',
              '@tiptap/extension-placeholder',
              '@tiptap/extension-text-align',
              '@tiptap/extension-text-style',
              '@tiptap/extension-underline',
              '@tiptap/pm',
              'dayjs',
              'ahooks',
              'clsx',
              'react-icons',
            ],
            output: {
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
                antd: 'antd',
              },
            },
          },
        }
      : undefined,
  }
})
