import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    base: './',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: 'index.html',
          i18n: 'i18n.js'
        },
        output: {
          entryFileNames: (chunkInfo) => {
            return chunkInfo.name === 'i18n' ? 'i18n.js' : 'assets/[name]-[hash].js'
          },
          manualChunks: {
            codemirror: ['codemirror', '@codemirror/lang-markdown', '@codemirror/state', '@codemirror/view'],
            markdown: ['marked', 'highlight.js', 'dompurify'],
            export: ['html2canvas', 'jspdf', 'file-saver']
          }
        }
      },
      // 复制静态文件到构建目录
      copyPublicDir: true
    },
    // 指定 public 目录
    publicDir: 'public',
    server: {
      port: 3000,
      open: true
    },
    plugins: [
      {
        name: 'process-manifest',
        generateBundle(options, bundle) {
          // 查找 manifest 文件
          const manifestKey = Object.keys(bundle).find(key => key.includes('site') && key.endsWith('.webmanifest'))
          if (manifestKey) {
            const manifestFile = bundle[manifestKey]
            if (manifestFile.type === 'asset') {
              let manifestContent = manifestFile.source.toString()
              
              // 查找对应的图标文件并替换路径
              Object.keys(bundle).forEach(key => {
                if (key.includes('favicon-16x16') && key.endsWith('.png')) {
                  manifestContent = manifestContent.replace('./assets/favicon-16x16.png', `./assets/${key.split('/').pop()}`)
                }
                if (key.includes('favicon-32x32') && key.endsWith('.png')) {
                  manifestContent = manifestContent.replace('./assets/favicon-32x32.png', `./assets/${key.split('/').pop()}`)
                }
                if (key.includes('apple-touch-icon') && key.endsWith('.png')) {
                  manifestContent = manifestContent.replace('./assets/apple-touch-icon.png', `./assets/${key.split('/').pop()}`)
                }
              })
              
              manifestFile.source = manifestContent
            }
          }
        }
      },
      {
        name: 'inject-analytics',
        transformIndexHtml: {
          enforce: 'post',
          transform(html, ctx) {
            // 只在生产构建时注入统计代码
            if (ctx.bundle && env.VITE_ENABLE_ANALYTICS === 'true') {
              const clarityProjectId = env.VITE_CLARITY_PROJECT_ID || 'tO0gxOtnk7'
              const analyticsScript = `
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityProjectId}");
    </script>`
              
              // 在 </head> 标签前插入统计代码
              return html.replace('</head>', `${analyticsScript}\n</head>`)
            }
            return html
          }
        }
      }
    ]
  }
})