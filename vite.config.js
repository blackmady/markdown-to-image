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
        output: {
          manualChunks: {
            codemirror: ['codemirror', '@codemirror/lang-markdown', '@codemirror/state', '@codemirror/view'],
            markdown: ['marked', 'highlight.js', 'dompurify'],
            export: ['html2canvas', 'jspdf', 'file-saver']
          }
        }
      }
    },
    server: {
      port: 3000,
      open: true
    },
    plugins: [
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