import { EditorView, basicSetup } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorState } from '@codemirror/state'
import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { saveAs } from 'file-saver'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import mermaid from 'mermaid'

// 自定义通知系统
class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notificationContainer')
        this.notifications = []
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div')
        notification.className = `notification ${type}`
        notification.textContent = message
        
        // 添加到容器
        this.container.appendChild(notification)
        this.notifications.push(notification)
        
        // 触发显示动画
        setTimeout(() => {
            notification.classList.add('show')
        }, 10)
        
        // 自动隐藏
        setTimeout(() => {
            this.hide(notification)
        }, duration)
        
        return notification
    }
    
    hide(notification) {
        notification.classList.remove('show')
        notification.classList.add('hide')
        
        // 动画完成后移除元素
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification)
            }
            const index = this.notifications.indexOf(notification)
            if (index > -1) {
                this.notifications.splice(index, 1)
            }
        }, 300)
    }
    
    success(message, duration = 3000) {
        return this.show(message, 'success', duration)
    }
    
    error(message, duration = 4000) {
        return this.show(message, 'error', duration)
    }
    
    warning(message, duration = 3500) {
        return this.show(message, 'warning', duration)
    }
    
    info(message, duration = 3000) {
        return this.show(message, 'info', duration)
    }
}

// 创建全局通知实例
const notify = new NotificationSystem()

class MarkdownEditor {
    constructor() {
        this.editor = null
        this.isDarkMode = false
        this.isFullscreen = false
        this.isTocVisible = false
        this.syncScroll = true
        this.wordWrap = true
        this.currentFile = null
        this.dbName = 'MarkdownEditorDB'
        this.dbVersion = 1
        this.db = null
        
        this.init()
    }

    // 生成有效的CSS ID
    generateValidId(text, index) {
        // 移除所有非字母数字字符，只保留字母、数字、空格和连字符
        let id = text.toLowerCase()
            .replace(/[^\w\s-]/g, '') // 移除特殊字符
            .replace(/\s+/g, '-')     // 空格替换为连字符
            .replace(/-+/g, '-')      // 多个连字符合并为一个
            .replace(/^-|-$/g, '')    // 移除开头和结尾的连字符
        
        // 确保ID不为空且以字母开头（CSS规范要求）
        if (!id || !/^[a-zA-Z]/.test(id)) {
            id = `heading-${index}`
        }
        
        // 确保ID至少有一个字符
        if (id.length === 0) {
            id = `heading-${index}`
        }
        
        return id
    }

    setupTocClickHandler() {
        const tocContent = document.getElementById('tocContent')
        
        // 移除旧的事件监听器（如果存在）
        if (this.tocClickHandler) {
            tocContent.removeEventListener('click', this.tocClickHandler)
        }
        
        // 创建新的事件处理器
        this.tocClickHandler = (e) => {
            const tocItem = e.target.closest('.toc-item')
            if (tocItem) {
                e.preventDefault()
                
                console.log('TOC click event triggered', tocItem)
                console.log('Processing toc-item click:', tocItem)
                console.log('TOC item HTML:', tocItem.outerHTML)
                
                const href = tocItem.getAttribute('href')
                const dataLine = tocItem.getAttribute('data-line')
                const headingIndex = tocItem.getAttribute('data-heading-index')
                
                console.log('href:', href, 'data-line:', dataLine, 'heading-index:', headingIndex)
                
                if (href) {
                    const targetId = href.substring(1) // 移除 # 号
                    
                    // 验证targetId是否为有效的CSS选择器
                    if (!targetId || targetId.trim() === '' || targetId === '-') {
                        console.error('Invalid target ID:', targetId)
                        return
                    }
                    
                    console.log('Looking for target element with ID:', targetId)
                    
                    // 滚动预览区域
                    const previewElement = document.getElementById('preview')
                    let targetElement = null
                    
                    // 安全地查询元素，使用try-catch防止无效选择器
                    try {
                        targetElement = previewElement.querySelector(`#${CSS.escape(targetId)}`)
                    } catch (error) {
                        console.error('Invalid CSS selector for ID:', targetId, error)
                        return
                    }
                    
                    if (targetElement) {
                        console.log('Target element found, scrolling to it')
                        targetElement.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        })
                        
                        // 同步滚动编辑器
                        if (dataLine) {
                            try {
                                const lineNumber = parseInt(dataLine)
                                console.log('Syncing editor to line:', lineNumber + 1)
                                
                                if (lineNumber >= 0 && lineNumber < this.editor.state.doc.lines) {
                                    const pos = this.editor.state.doc.line(Math.max(1, lineNumber + 1)).from
                                    this.editor.dispatch({
                                        selection: { anchor: pos, head: pos },
                                        scrollIntoView: true
                                    })
                                    this.editor.focus()
                                } else {
                                    console.warn('Line number out of bounds:', lineNumber)
                                }
                            } catch (error) {
                                console.error('Error syncing editor scroll:', error)
                            }
                        }
                    } else {
                        console.log('Exact match failed, searching all headings...')
                        const allHeadings = previewElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
                        console.log('All headings in preview:')
                        allHeadings.forEach((h, i) => {
                            console.log(`  ${i}: id="${h.id}", text="${h.textContent.trim()}"`)
                        })
                        
                        // 尝试根据标题索引匹配
                        if (headingIndex !== null) {
                            const index = parseInt(headingIndex)
                            if (index >= 0 && index < allHeadings.length) {
                                const targetByIndex = allHeadings[index]
                                console.log('Found target by index:', targetByIndex)
                                targetByIndex.scrollIntoView({ 
                                    behavior: 'smooth', 
                                    block: 'start' 
                                })
                                
                                // 同步滚动编辑器
                                if (dataLine) {
                                    try {
                                        const lineNumber = parseInt(dataLine)
                                        console.log('Syncing editor to line:', lineNumber + 1)
                                        
                                        if (lineNumber >= 0 && lineNumber < this.editor.state.doc.lines) {
                                            const pos = this.editor.state.doc.line(Math.max(1, lineNumber + 1)).from
                                            this.editor.dispatch({
                                                selection: { anchor: pos, head: pos },
                                                scrollIntoView: true
                                            })
                                            this.editor.focus()
                                        }
                                    } catch (error) {
                                        console.error('Error syncing editor scroll:', error)
                                    }
                                }
                                return
                            }
                        }
                        
                        console.error('Target element not found:', targetId)
                        console.log('Available elements in preview:', previewElement.innerHTML.substring(0, 500) + '...')
                    }
                }
            }
        }
        
        // 绑定新的事件监听器
        tocContent.addEventListener('click', this.tocClickHandler)
    }

    init() {
        this.setupEditor()
        this.setupEventListeners()
        this.setupMarked()
        this.loadTheme()
        this.setupMermaid()
        this.updatePreview()
        this.updateToc()
        this.setupTocClickHandler()
        this.initIndexedDB()
    }

    setupEditor() {
        const editorElement = document.getElementById('editor')
        
        const extensions = [
            basicSetup,
            markdown(),
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    this.updatePreview()
                    this.updateToc()
                }
            }),
            EditorView.theme({
                '&': {
                    height: '100%',
                    fontSize: '14px'
                },
                '.cm-content': {
                    padding: '16px',
                    minHeight: '100%'
                },
                '.cm-focused': {
                    outline: 'none'
                },
                '.cm-editor': {
                    height: '100%'
                },
                '.cm-scroller': {
                    fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
                }
            })
        ]

        this.editor = new EditorView({
            state: EditorState.create({
                doc: this.getDefaultContent(),
                extensions
            }),
            parent: editorElement
        })

        // 设置滚动同步
        this.setupScrollSync()
    }

    setupScrollSync() {
        // 清除之前的事件监听器
        if (this.editorScrollHandler) {
            this.editor.scrollDOM.removeEventListener('scroll', this.editorScrollHandler)
        }
        if (this.previewScrollHandler) {
            const previewWrapper = document.querySelector('.preview-wrapper')
            if (previewWrapper) {
                previewWrapper.removeEventListener('scroll', this.previewScrollHandler)
            }
        }

        const editorScroller = this.editor.scrollDOM
        const previewWrapper = document.querySelector('.preview-wrapper')
        
        if (!editorScroller || !previewWrapper) return
        
        let isEditorScrolling = false
        let isPreviewScrolling = false

        // 编辑器滚动同步到预览
        this.editorScrollHandler = () => {
            if (!this.syncScroll || isPreviewScrolling) return
            
            isEditorScrolling = true
            const scrollRatio = editorScroller.scrollTop / Math.max(1, editorScroller.scrollHeight - editorScroller.clientHeight)
            const previewScrollTop = scrollRatio * Math.max(0, previewWrapper.scrollHeight - previewWrapper.clientHeight)
            previewWrapper.scrollTop = previewScrollTop
            
            setTimeout(() => { isEditorScrolling = false }, 100)
        }

        // 预览滚动同步到编辑器
        this.previewScrollHandler = () => {
            if (!this.syncScroll || isEditorScrolling) return
            
            isPreviewScrolling = true
            const scrollRatio = previewWrapper.scrollTop / Math.max(1, previewWrapper.scrollHeight - previewWrapper.clientHeight)
            const editorScrollTop = scrollRatio * Math.max(0, editorScroller.scrollHeight - editorScroller.clientHeight)
            editorScroller.scrollTop = editorScrollTop
            
            setTimeout(() => { isPreviewScrolling = false }, 100)
        }

        editorScroller.addEventListener('scroll', this.editorScrollHandler)
        previewWrapper.addEventListener('scroll', this.previewScrollHandler)
    }

    setupEventListeners() {
        // 工具栏按钮事件
        document.getElementById('toggleToc').addEventListener('click', () => this.toggleToc())
        document.getElementById('toggleFullscreen').addEventListener('click', () => this.toggleFullscreen())
        document.getElementById('toggleTheme').addEventListener('click', () => this.toggleTheme())
        document.getElementById('newFile').addEventListener('click', () => this.newFile())
        document.getElementById('openFile').addEventListener('click', () => this.openFile())
        document.getElementById('saveFile').addEventListener('click', () => this.saveFile())
        document.getElementById('syncScroll').addEventListener('click', () => this.toggleSyncScroll())
        document.getElementById('wordWrap').addEventListener('click', () => this.toggleWordWrap())
        document.getElementById('closeToc').addEventListener('click', () => this.toggleToc())

        // 文件输入事件
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileLoad(e))

        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e))

        // 设置语言选择器
        this.setupLanguageSelector()
        
        // 设置导出菜单
        this.setupExportMenu()
        
        // 设置历史菜单
        this.setupHistoryMenu()
        
        // 设置富文本编辑器工具栏
        this.setupEditorToolbar()
    }

    // 设置富文本编辑器工具栏
    setupEditorToolbar() {
        const toolbar = document.querySelector('.editor-toolbar')
        if (!toolbar) return

        // 绑定所有工具栏按钮事件
        toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('.editor-toolbar-btn, .dropdown-item')
            if (!btn) return

            const action = btn.dataset.action
            if (action) {
                this.handleToolbarAction(action)
            }
        })
    }

    // 处理工具栏操作
    handleToolbarAction(action) {
        const editor = this.editor
        if (!editor) return

        const state = editor.state
        const selection = state.selection.main
        const selectedText = state.doc.sliceString(selection.from, selection.to)

        let insertText = ''
        let cursorOffset = 0

        switch (action) {
            case 'bold':
                insertText = `**${selectedText || '粗体文本'}**`
                cursorOffset = selectedText ? 0 : -4
                break
            case 'italic':
                insertText = `*${selectedText || '斜体文本'}*`
                cursorOffset = selectedText ? 0 : -3
                break
            case 'strikethrough':
                insertText = `~~${selectedText || '删除线文本'}~~`
                cursorOffset = selectedText ? 0 : -5
                break
            case 'code':
                insertText = `\`${selectedText || '代码'}\``
                cursorOffset = selectedText ? 0 : -2
                break
            case 'h1':
                insertText = `# ${selectedText || '一级标题'}`
                cursorOffset = selectedText ? 0 : -4
                break
            case 'h2':
                insertText = `## ${selectedText || '二级标题'}`
                cursorOffset = selectedText ? 0 : -4
                break
            case 'h3':
                insertText = `### ${selectedText || '三级标题'}`
                cursorOffset = selectedText ? 0 : -4
                break
            case 'ul':
                insertText = `- ${selectedText || '列表项'}`
                cursorOffset = selectedText ? 0 : -3
                break
            case 'ol':
                insertText = `1. ${selectedText || '列表项'}`
                cursorOffset = selectedText ? 0 : -3
                break
            case 'quote':
                insertText = `> ${selectedText || '引用文本'}`
                cursorOffset = selectedText ? 0 : -4
                break
            case 'codeblock':
                insertText = `\`\`\`\n${selectedText || '代码块'}\n\`\`\``
                cursorOffset = selectedText ? 0 : -5
                break
            case 'link':
                insertText = `[${selectedText || '链接文本'}](url)`
                cursorOffset = selectedText ? -5 : -9
                break
            case 'image':
                insertText = `![${selectedText || '图片描述'}](图片链接)`
                cursorOffset = selectedText ? -7 : -11
                break
            case 'table':
                insertText = `| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容1 | 内容2 | 内容3 |`
                cursorOffset = 0
                break
            case 'mermaid-flowchart':
                insertText = `\`\`\`mermaid\ngraph TD\n    A[开始] --> B{判断条件}\n    B -->|是| C[执行操作]\n    B -->|否| D[其他操作]\n    C --> E[结束]\n    D --> E\n\`\`\``
                cursorOffset = 0
                break
            case 'mermaid-sequence':
                insertText = `\`\`\`mermaid\nsequenceDiagram\n    participant A as 用户\n    participant B as 系统\n    A->>B: 发送请求\n    B-->>A: 返回响应\n\`\`\``
                cursorOffset = 0
                break
            case 'mermaid-gantt':
                insertText = `\`\`\`mermaid\ngantt\n    title 项目进度\n    dateFormat  YYYY-MM-DD\n    section 阶段1\n    任务1    :done, des1, 2024-01-01, 2024-01-15\n    任务2    :active, des2, 2024-01-16, 3d\n    section 阶段2\n    任务3    :des3, after des2, 5d\n\`\`\``
                cursorOffset = 0
                break
            case 'mermaid-pie':
                insertText = `\`\`\`mermaid\npie title 数据分布\n    "类别A" : 42.96\n    "类别B" : 50.05\n    "类别C" : 10.01\n\`\`\``
                cursorOffset = 0
                break
            case 'latex-inline':
                insertText = `$${selectedText || 'E = mc^2'}$`
                cursorOffset = selectedText ? 0 : -1
                break
            case 'latex-block':
                insertText = `$$\n${selectedText || '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}'}\n$$`
                cursorOffset = selectedText ? 0 : -4
                break
            case 'latex-fraction':
                insertText = `$\\frac{${selectedText || 'a'}}{b}$`
                cursorOffset = selectedText ? -3 : -5
                break
            case 'latex-integral':
                insertText = `$\\int_{${selectedText || 'a'}}^{b} f(x) dx$`
                cursorOffset = selectedText ? -12 : -14
                break
            case 'latex-matrix':
                insertText = `$$\n\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}\n$$`
                cursorOffset = 0
                break
            default:
                return
        }

        // 插入文本到编辑器
        this.insertTextAtCursor(insertText, cursorOffset)
    }

    // 在光标位置插入文本
    insertTextAtCursor(text, cursorOffset = 0) {
        const editor = this.editor
        if (!editor) return

        const state = editor.state
        const selection = state.selection.main
        
        // 如果有选中文本，替换选中的文本
        const from = selection.from
        const to = selection.to
        
        const transaction = state.update({
            changes: { from, to, insert: text },
            selection: { 
                anchor: from + text.length + cursorOffset, 
                head: from + text.length + cursorOffset 
            }
        })
        
        editor.dispatch(transaction)
        editor.focus()
    }

    setupLanguageSelector() {
        const languageBtn = document.getElementById('languageBtn')
        const languageMenu = document.querySelector('.language-menu')
        
        // 切换语言菜单显示/隐藏
        languageBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            languageMenu.classList.toggle('show')
        })
        
        // 点击其他地方关闭菜单
        document.addEventListener('click', () => {
            languageMenu.classList.remove('show')
        })
        
        // 语言选择事件
        languageMenu.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-lang')) {
                const lang = e.target.getAttribute('data-lang')
                if (typeof setLanguage === 'function') {
                    setLanguage(lang)
                }
                languageMenu.classList.remove('show')
            }
        })
    }

    setupExportMenu() {
        const exportBtn = document.getElementById('exportBtn')
        const exportDropdown = exportBtn.parentElement
        const exportMenu = exportDropdown.querySelector('.export-menu')
        
        // 鼠标悬停显示菜单
        exportDropdown.addEventListener('mouseenter', () => {
            exportDropdown.classList.add('active')
        })
        
        // 鼠标离开隐藏菜单
        exportDropdown.addEventListener('mouseleave', () => {
            exportDropdown.classList.remove('active')
        })
        
        exportMenu.addEventListener('click', (e) => {
            e.stopPropagation()
            const format = e.target.dataset.format
            if (format) {
                this.exportFile(format)
                exportDropdown.classList.remove('active')
            }
        })
    }

    setupHistoryMenu() {
        const historyBtn = document.getElementById('historyBtn')
        const historyDropdown = historyBtn.parentElement
        const historyMenu = historyDropdown.querySelector('.history-menu')
        
        // 鼠标悬停显示菜单并加载历史文档
        historyDropdown.addEventListener('mouseenter', async () => {
            historyDropdown.classList.add('active')
            await this.loadHistoryList()
        })
        
        // 鼠标离开隐藏菜单
        historyDropdown.addEventListener('mouseleave', () => {
            historyDropdown.classList.remove('active')
        })
        
        // 阻止菜单内部点击事件冒泡
        historyMenu.addEventListener('click', (e) => {
            e.stopPropagation()
        })
    }

    // 加载历史文档列表
    async loadHistoryList() {
        const historyList = document.getElementById('historyList')
        
        try {
            const documents = await this.getDocumentsFromIndexedDB()
            
            if (documents.length === 0) {
                historyList.innerHTML = '<div class="history-empty" data-i18n="history.empty">暂无保存的文档</div>'
                return
            }
            
            // 按更新时间倒序排列
            documents.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            
            historyList.innerHTML = documents.map(doc => `
                <div class="history-item" data-id="${doc.id}">
                    <div class="history-item-title">${this.escapeHtml(doc.title)}</div>
                    <div class="history-item-date">${this.formatDate(doc.updatedAt)}</div>
                    <div class="history-item-actions">
                        <button class="history-item-action load" onclick="window.markdownEditor.loadHistoryDocument(${doc.id})">加载</button>
                        <button class="history-item-action delete" onclick="window.markdownEditor.deleteHistoryDocument(${doc.id})">删除</button>
                    </div>
                </div>
            `).join('')
            
        } catch (error) {
            console.error('加载历史文档失败:', error)
            historyList.innerHTML = '<div class="history-empty">加载失败，请重试</div>'
        }
    }

    // 加载历史文档
    async loadHistoryDocument(id) {
        try {
            const doc = await this.loadDocumentFromIndexedDB(id)
            if (doc) {
                this.editor.dispatch({
                    changes: {
                        from: 0,
                        to: this.editor.state.doc.length,
                        insert: doc.content
                    }
                })
                this.updatePreview()
                this.updateToc()
                
                // 隐藏历史菜单
                const historyDropdown = document.querySelector('.history-dropdown')
                if (historyDropdown) {
                    historyDropdown.classList.remove('active')
                }
                
                notify.success(`已加载文档: ${doc.title}`)
            }
        } catch (error) {
            console.error('加载文档失败:', error)
            notify.error('加载文档失败，请重试')
        }
    }

    // 删除历史文档
    async deleteHistoryDocument(id) {
        if (!confirm('确定要删除这个文档吗？')) {
            return
        }
        
        try {
            await this.deleteDocumentFromIndexedDB(id)
            await this.loadHistoryList() // 重新加载列表
            notify.success('文档已删除')
        } catch (error) {
            console.error('删除文档失败:', error)
            notify.error('删除文档失败，请重试')
        }
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }

    // 格式化日期
    formatDate(date) {
        const d = new Date(date)
        const now = new Date()
        const diff = now - d
        
        if (diff < 60000) { // 1分钟内
            return '刚刚'
        } else if (diff < 3600000) { // 1小时内
            return `${Math.floor(diff / 60000)}分钟前`
        } else if (diff < 86400000) { // 1天内
            return `${Math.floor(diff / 3600000)}小时前`
        } else if (diff < 604800000) { // 1周内
            return `${Math.floor(diff / 86400000)}天前`
        } else {
            return d.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        }
    }

    setupMarked() {
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value
                    } catch (err) {}
                }
                return hljs.highlightAuto(code).value
            },
            breaks: true,
            gfm: true
        })
    }

    setupMermaid() {
        mermaid.initialize({
            startOnLoad: false,
            theme: this.isDarkMode ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit'
        })
    }

    getDefaultContent() {
        return `# Markdown 预览编辑转换工具

欢迎使用这个功能强大的 Markdown 编辑器！

## 功能特性

- ✨ **实时预览** - 左侧编辑，右侧实时预览
- 🌙 **夜间模式** - 支持明暗主题切换
- 📋 **目录导航** - 自动生成文档目录
- 🖥️ **全屏编辑** - 专注写作模式
- 📤 **多格式导出** - 支持 HTML、PDF、PNG、JPG、WEBP
- 📱 **响应式设计** - 完美适配各种设备

## 使用方法

### 基本操作

1. 在左侧编辑器中输入 Markdown 内容
2. 右侧会实时显示渲染结果
3. 使用工具栏按钮进行各种操作

### 快捷键

- \`Ctrl/Cmd + S\` - 保存文件
- \`Ctrl/Cmd + O\` - 打开文件
- \`Ctrl/Cmd + N\` - 新建文件
- \`F11\` - 切换全屏模式
- \`Ctrl/Cmd + D\` - 切换夜间模式

### 代码高亮

支持多种编程语言的语法高亮：

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

### 表格支持

| 功能 | 状态 | 描述 |
|------|------|------|
| 编辑器 | ✅ | CodeMirror 6 |
| 预览 | ✅ | Marked + highlight.js |
| 导出 | ✅ | 多格式支持 |

### 数学公式

支持 LaTeX 数学公式（需要额外配置）：

行内公式：$E = mc^2$

块级公式：
$$ \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi} $$

### Mermaid 图表

支持 Mermaid 语法绘制各种图表：

\`\`\`mermaid
graph TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主页]
    B -->|否| D[显示登录页]
    C --> E[结束]
    D --> E
\`\`\`

\`\`\`mermaid
sequenceDiagram
    participant 用户
    participant 浏览器
    participant 服务器
    
    用户->>浏览器: 输入URL
    浏览器->>服务器: 发送请求
    服务器->>浏览器: 返回页面
    浏览器->>用户: 显示页面
\`\`\`

## 开始使用

现在就开始编辑这个文档，或者创建一个新文档吧！`
    }

    updatePreview() {
        const content = this.editor.state.doc.toString()
        const html = marked(content)
        const sanitizedHtml = DOMPurify.sanitize(html)
        
        // 为标题添加ID以支持锚点跳转
        const previewElement = document.getElementById('preview')
        previewElement.innerHTML = sanitizedHtml
        
        // 为所有标题添加ID
        const headings = previewElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
        headings.forEach((heading, index) => {
            const text = heading.textContent.trim()
            const id = this.generateValidId(text, index)
            heading.id = id
        })
        
        // 渲染数学公式
        this.renderMath(previewElement)
        
        // 渲染Mermaid图表
        this.renderMermaid(previewElement)
    }

    renderMath(element) {
        // 渲染块级数学公式 $$...$$
        const blockMathRegex = /\$\$([^$]+)\$\$/g
        element.innerHTML = element.innerHTML.replace(blockMathRegex, (match, math) => {
            try {
                return katex.renderToString(math.trim(), {
                    displayMode: true,
                    throwOnError: false
                })
            } catch (error) {
                console.error('KaTeX block math error:', error)
                return `<span class="math-error">数学公式错误: ${math}</span>`
            }
        })
        
        // 渲染行内数学公式 $...$
        const inlineMathRegex = /\$([^$]+)\$/g
        element.innerHTML = element.innerHTML.replace(inlineMathRegex, (match, math) => {
            try {
                return katex.renderToString(math.trim(), {
                    displayMode: false,
                    throwOnError: false
                })
            } catch (error) {
                console.error('KaTeX inline math error:', error)
                return `<span class="math-error">数学公式错误: ${math}</span>`
            }
        })
    }

    async renderMermaid(element) {
        // 查找所有mermaid代码块
        const mermaidBlocks = element.querySelectorAll('pre code.language-mermaid')
        
        for (let i = 0; i < mermaidBlocks.length; i++) {
            const block = mermaidBlocks[i]
            const mermaidCode = block.textContent
            
            try {
                // 创建一个唯一的ID
                const id = `mermaid-${Date.now()}-${i}`
                
                // 渲染mermaid图表
                const { svg } = await mermaid.render(id, mermaidCode)
                
                // 创建一个div来包含SVG
                const mermaidDiv = document.createElement('div')
                mermaidDiv.className = 'mermaid-diagram'
                mermaidDiv.innerHTML = svg
                
                // 替换原来的代码块
                block.parentElement.replaceWith(mermaidDiv)
            } catch (error) {
                console.error('Mermaid rendering error:', error)
                // 如果渲染失败，显示错误信息
                const errorDiv = document.createElement('div')
                errorDiv.className = 'mermaid-error'
                errorDiv.innerHTML = `<p>Mermaid图表渲染错误:</p><pre>${mermaidCode}</pre>`
                block.parentElement.replaceWith(errorDiv)
            }
        }
    }

    updateToc() {
        const content = this.editor.state.doc.toString()
        const tocContent = document.getElementById('tocContent')
        const tocSidebar = document.getElementById('tocSidebar')
        
        // 提取标题
        const headings = []
        const lines = content.split('\n')
        
        lines.forEach((line, index) => {
            const match = line.match(/^(#{1,6})\s+(.+)$/)
            if (match) {
                const level = match[1].length
                const text = match[2].trim()
                headings.push({ level, text, line: index })
            }
        })
        
        if (headings.length === 0) {
            tocContent.innerHTML = '<p class="toc-empty">暂无目录</p>'
            // 如果没有标题，隐藏目录
            this.isTocVisible = false
            tocSidebar.classList.remove('active')
            return
        }
        
        // 使用与updatePreview相同的ID生成逻辑：基于标题索引
        const tocHtml = headings.map((heading, headingIndex) => {
            const text = heading.text.trim()
            const id = this.generateValidId(text, headingIndex)
            return `<a href="#${id}" class="toc-item level-${heading.level}" data-line="${heading.line}" data-heading-index="${headingIndex}">
                ${heading.text}
            </a>`
        }).join('')
        
        tocContent.innerHTML = tocHtml
        
        // 如果有标题且目录未显示，自动显示目录
        if (!this.isTocVisible) {
            this.isTocVisible = true
            tocSidebar.classList.add('active')
        }
        
        // 使用事件委托来处理点击事件，避免重复绑定
        this.setupTocClickHandler()
    }

    toggleToc() {
        this.isTocVisible = !this.isTocVisible
        const tocSidebar = document.getElementById('tocSidebar')
        tocSidebar.classList.toggle('active', this.isTocVisible)
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen
        document.body.classList.toggle('fullscreen-mode', this.isFullscreen)
        
        // 更新按钮图标
        const btn = document.getElementById('toggleFullscreen')
        const svg = btn.querySelector('svg path')
        if (this.isFullscreen) {
            svg.setAttribute('d', 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z')
        } else {
            svg.setAttribute('d', 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z')
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode
        this.applyTheme()
        // 更新mermaid主题
        mermaid.initialize({
            startOnLoad: false,
            theme: this.isDarkMode ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit'
        })
        // 重新渲染预览内容以应用新主题到 Mermaid 图表
        this.updatePreview()
        localStorage.setItem('darkMode', this.isDarkMode)
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('darkMode')
        if (savedTheme !== null) {
            this.isDarkMode = savedTheme === 'true'
        } else {
            this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        this.applyTheme()
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light')
        
        // 更新 highlight.js 主题
        const lightTheme = document.getElementById('hljs-light')
        const darkTheme = document.getElementById('hljs-dark')
        
        if (this.isDarkMode) {
            lightTheme.disabled = true
            darkTheme.disabled = false
        } else {
            lightTheme.disabled = false
            darkTheme.disabled = true
        }
        
        // 更新编辑器主题
        this.updateEditorTheme()
    }

    updateEditorTheme() {
        const currentDoc = this.editor.state.doc
        const extensions = [
            basicSetup,
            markdown(),
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    this.updatePreview()
                    this.updateToc()
                }
            }),
            EditorView.theme({
                '&': {
                    height: '100%',
                    fontSize: '14px'
                },
                '.cm-content': {
                    padding: '16px',
                    minHeight: '100%'
                },
                '.cm-focused': {
                    outline: 'none'
                },
                '.cm-editor': {
                    height: '100%'
                },
                '.cm-scroller': {
                    fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
                }
            })
        ]
        
        if (this.isDarkMode) {
            extensions.push(oneDark)
        }
        
        this.editor.setState(EditorState.create({
            doc: currentDoc,
            extensions
        }))
        
        this.setupScrollSync()
    }

    toggleSyncScroll() {
        this.syncScroll = !this.syncScroll
        const btn = document.getElementById('syncScroll')
        btn.classList.toggle('active', this.syncScroll)
    }

    toggleWordWrap() {
        this.wordWrap = !this.wordWrap
        const btn = document.getElementById('wordWrap')
        btn.classList.toggle('active', this.wordWrap)
        // TODO: 实现自动换行功能
    }

    newFile() {
        if (confirm('确定要创建新文件吗？未保存的更改将丢失。')) {
            this.editor.dispatch({
                changes: {
                    from: 0,
                    to: this.editor.state.doc.length,
                    insert: ''
                }
            })
            this.currentFile = null
            this.updatePreview()
            this.updateToc()
        }
    }

    openFile() {
        document.getElementById('fileInput').click()
    }

    handleFileLoad(event) {
        const file = event.target.files[0]
        if (!file) return
        
        const reader = new FileReader()
        reader.onload = (e) => {
            this.editor.dispatch({
                changes: {
                    from: 0,
                    to: this.editor.state.doc.length,
                    insert: e.target.result
                }
            })
            this.currentFile = file.name
            this.updatePreview()
            this.updateToc()
        }
        reader.readAsText(file)
    }

    async saveFile() {
        const content = this.editor.state.doc.toString()
        const title = this.extractTitle(content) || '未命名文档'
        
        try {
            await this.saveToIndexedDB(title, content)
            notify.success('文档已保存到本地存储')
        } catch (error) {
            console.error('保存失败:', error)
            notify.error('保存失败，请重试')
        }
    }

    // 从内容中提取标题
    extractTitle(content) {
        const lines = content.split('\n')
        for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.startsWith('# ')) {
                return trimmed.substring(2).trim()
            }
        }
        return null
    }

    // 初始化IndexedDB
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion)
            
            request.onerror = () => {
                console.error('IndexedDB打开失败')
                reject(request.error)
            }
            
            request.onsuccess = () => {
                this.db = request.result
                resolve(this.db)
            }
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result
                
                // 创建文档存储对象
                if (!db.objectStoreNames.contains('documents')) {
                    const store = db.createObjectStore('documents', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    })
                    store.createIndex('title', 'title', { unique: false })
                    store.createIndex('createdAt', 'createdAt', { unique: false })
                    store.createIndex('updatedAt', 'updatedAt', { unique: false })
                }
            }
        })
    }

    // 保存文档到IndexedDB
    async saveToIndexedDB(title, content) {
        if (!this.db) {
            await this.initIndexedDB()
        }
        
        const transaction = this.db.transaction(['documents'], 'readwrite')
        const store = transaction.objectStore('documents')
        
        const document = {
            title: title,
            content: content,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        
        return new Promise((resolve, reject) => {
            const request = store.add(document)
            
            request.onsuccess = () => {
                resolve(request.result)
            }
            
            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    // 从IndexedDB获取所有文档
    async getDocumentsFromIndexedDB() {
        if (!this.db) {
            await this.initIndexedDB()
        }
        
        const transaction = this.db.transaction(['documents'], 'readonly')
        const store = transaction.objectStore('documents')
        
        return new Promise((resolve, reject) => {
            const request = store.getAll()
            
            request.onsuccess = () => {
                resolve(request.result)
            }
            
            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    // 从IndexedDB加载文档
    async loadDocumentFromIndexedDB(id) {
        if (!this.db) {
            await this.initIndexedDB()
        }
        
        const transaction = this.db.transaction(['documents'], 'readonly')
        const store = transaction.objectStore('documents')
        
        return new Promise((resolve, reject) => {
            const request = store.get(id)
            
            request.onsuccess = () => {
                resolve(request.result)
            }
            
            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    // 从IndexedDB删除文档
    async deleteDocumentFromIndexedDB(id) {
        if (!this.db) {
            await this.initIndexedDB()
        }
        
        const transaction = this.db.transaction(['documents'], 'readwrite')
        const store = transaction.objectStore('documents')
        
        return new Promise((resolve, reject) => {
            const request = store.delete(id)
            
            request.onsuccess = () => {
                resolve()
            }
            
            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    // 清理HTML内容，去除可能导致样式冲突的类名和属性，但保留 Mermaid 图表的样式
    cleanElementForExport(html) {
        // 创建临时div来处理HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        
        // 递归清理所有元素
        const cleanElement = (element) => {
            if (element.nodeType === Node.ELEMENT_NODE) {
                // 如果是 Mermaid 图表容器，保留其结构和样式
                if (element.classList.contains('mermaid-diagram')) {
                    // 保留 Mermaid 图表的完整结构，不进行清理
                    return
                }
                
                // 如果是 SVG 元素（Mermaid 图表的一部分），保留其样式
                if (element.tagName === 'SVG' || element.closest('.mermaid-diagram')) {
                    // 保留 SVG 及其子元素的所有属性和样式
                    return
                }
                
                // 移除所有class属性
                element.removeAttribute('class')
                // 移除style属性中可能包含现代颜色函数的部分
                element.removeAttribute('style')
                // 移除data属性
                const attributes = [...element.attributes]
                attributes.forEach(attr => {
                    if (attr.name.startsWith('data-')) {
                        element.removeAttribute(attr.name)
                    }
                })
                
                // 递归处理子元素
                Array.from(element.children).forEach(cleanElement)
            }
        }
        
        Array.from(tempDiv.children).forEach(cleanElement)
        return tempDiv.innerHTML
    }

    // 为导出准备 Mermaid 图表，确保主题一致
    async prepareElementForExport(element) {
        // 克隆元素以避免影响原始预览
        const clonedElement = element.cloneNode(true)
        
        // 重新渲染 Mermaid 图表以确保主题一致
        await this.renderMermaid(clonedElement)
        
        return clonedElement
    }

    async exportFile(format) {
        const previewElement = document.getElementById('preview')
        
        if (!previewElement) {
            notify.warning('预览内容为空，无法导出')
            return
        }

        try {
            switch (format) {
                case 'markdown':
                    const markdownContent = this.editor.state.doc.toString()
                    const blob = new Blob([markdownContent], { type: 'text/markdown' })
                    saveAs(blob, 'document.md')
                    notify.success('Markdown 文件导出成功')
                    break
                case 'html':
                    await this.exportHTML(previewElement)
                    notify.success('HTML 文件导出成功')
                    break
                case 'pdf':
                    await this.exportPDF(previewElement)
                    notify.success('PDF 文件导出成功')
                    break
                case 'png':
                case 'jpg':
                case 'webp':
                    const imageFormat = format === 'jpg' ? 'jpeg' : format
                    await this.exportImage(previewElement, imageFormat)
                    notify.success(`${format.toUpperCase()} 图片导出成功`)
                    break
                default:
                    notify.error('不支持的导出格式')
            }
        } catch (error) {
            console.error('导出失败:', error)
            notify.error(`导出失败: ${error.message}`)
        }
    }

    async exportHTML(element) {
        try {
            // 准备导出元素，确保 Mermaid 图表主题一致
            const preparedElement = await this.prepareElementForExport(element)
            
            // 获取清理后的内容，保留 Mermaid 图表样式
            const cleanContent = this.cleanElementForExport(preparedElement.innerHTML)
            
            const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${this.isDarkMode ? 'github-dark' : 'github'}.min.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: ${this.isDarkMode ? '#ffffff' : '#333'};
            background-color: ${this.isDarkMode ? '#1a1a1a' : '#ffffff'};
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        ${this.getMarkdownCSS()}
        /* Mermaid 图表样式 */
        .mermaid-diagram {
            text-align: center;
            margin: 1em 0;
        }
        .mermaid-diagram svg {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="markdown-body">
        ${cleanContent}
    </div>
</body>
</html>`
            
            const blob = new Blob([fullHtml], { type: 'text/html' })
            saveAs(blob, 'document.html')
        } catch (error) {
            console.error('HTML导出失败:', error)
            throw error
        }
    }

    async exportPDF(element) {
        try {
            // 确保元素可见且有内容
            if (!element || element.children.length === 0) {
                throw new Error('预览内容为空，无法导出PDF')
            }

            // 准备导出元素，确保 Mermaid 图表主题一致
            const preparedElement = await this.prepareElementForExport(element)

            // 根据当前主题设置背景颜色
            const backgroundColor = this.isDarkMode ? '#1a1a1a' : '#ffffff'
            const textColor = this.isDarkMode ? '#ffffff' : '#000000'

            // 创建一个完全隔离的iframe来避免样式冲突
            const iframe = document.createElement('iframe')
            iframe.style.cssText = `
                position: absolute;
                top: -9999px;
                left: -9999px;
                width: 800px;
                height: 600px;
                border: none;
            `
            document.body.appendChild(iframe)
            
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
            
            // 在iframe中创建基础HTML结构，不引入任何外部样式
            iframeDoc.open()
            iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: ${textColor};
                            background-color: ${backgroundColor};
                            padding: 20px;
                            width: 800px;
                        }
                        h1, h2, h3, h4, h5, h6 {
                            margin: 1em 0 0.5em 0;
                            color: ${textColor};
                        }
                        p {
                            margin: 0.5em 0;
                        }
                        pre {
                            background-color: ${this.isDarkMode ? '#2d2d2d' : '#f6f8fa'};
                            color: ${textColor};
                            padding: 16px;
                            border-radius: 6px;
                            overflow-x: auto;
                            margin: 1em 0;
                        }
                        code {
                            background-color: ${this.isDarkMode ? '#2d2d2d' : '#f6f8fa'};
                            color: ${textColor};
                            padding: 2px 4px;
                            border-radius: 3px;
                            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                        }
                        blockquote {
                            border-left: 4px solid ${this.isDarkMode ? '#444' : '#ddd'};
                            margin: 1em 0;
                            padding-left: 1em;
                            color: ${this.isDarkMode ? '#ccc' : '#666'};
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin: 1em 0;
                        }
                        th, td {
                            border: 1px solid ${this.isDarkMode ? '#444' : '#ddd'};
                            padding: 8px 12px;
                            text-align: left;
                        }
                        th {
                            background-color: ${this.isDarkMode ? '#2d2d2d' : '#f6f8fa'};
                            font-weight: 600;
                        }
                        ul, ol {
                            margin: 0.5em 0;
                            padding-left: 2em;
                        }
                        li {
                            margin: 0.25em 0;
                        }
                        a {
                            color: ${this.isDarkMode ? '#58a6ff' : '#0969da'};
                            text-decoration: none;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                        /* Mermaid 图表样式 */
                        .mermaid-diagram {
                            text-align: center;
                            margin: 1em 0;
                        }
                        .mermaid-diagram svg {
                            max-width: 100%;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    <div id="content"></div>
                </body>
                </html>
            `)
            iframeDoc.close()
            
            // 等待iframe加载完成
            await new Promise(resolve => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.onload = resolve
                } else {
                    setTimeout(resolve, 100)
                }
            })
            
            // 将内容复制到iframe中，保留 Mermaid 图表的样式
            const contentDiv = iframeDoc.getElementById('content')
            const cleanContent = this.cleanElementForExport(preparedElement.innerHTML)
            contentDiv.innerHTML = cleanContent
            
            const canvas = await html2canvas(contentDiv, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: backgroundColor,
                width: 800,
                height: contentDiv.scrollHeight,
                logging: false
            })
            
            // 清理iframe
            document.body.removeChild(iframe)
            
            const imgData = canvas.toDataURL('image/png')
            
            // 计算合适的PDF尺寸以容纳整个内容
            const imgWidth = 210 // A4宽度
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            
            // 创建自定义尺寸的PDF，高度足够容纳整个内容
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [210, Math.max(297, imgHeight + 20)] // 最小A4高度，或根据内容调整
            })
            
            // 将整个图片添加到单页PDF中
            pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight)
            
            pdf.save('document.pdf')
        } catch (error) {
            console.error('PDF导出失败:', error)
            throw error
        }
    }

    async exportImage(element, format) {
        try {
            // 确保元素可见且有内容
            if (!element || element.children.length === 0) {
                throw new Error('预览内容为空，无法导出图片')
            }

            // 准备导出元素，确保 Mermaid 图表主题一致
            const preparedElement = await this.prepareElementForExport(element)

            // 根据当前主题设置背景颜色
            const backgroundColor = this.isDarkMode ? '#1a1a1a' : '#ffffff'
            const textColor = this.isDarkMode ? '#ffffff' : '#000000'

            // 创建一个完全隔离的iframe来避免样式冲突
            const iframe = document.createElement('iframe')
            iframe.style.cssText = `
                position: absolute;
                top: -9999px;
                left: -9999px;
                width: 800px;
                height: 600px;
                border: none;
            `
            document.body.appendChild(iframe)
            
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
            
            // 在iframe中创建基础HTML结构，不引入任何外部样式
            iframeDoc.open()
            iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: ${textColor};
                            background-color: ${backgroundColor};
                            padding: 20px;
                            width: 800px;
                        }
                        h1, h2, h3, h4, h5, h6 {
                            margin: 1em 0 0.5em 0;
                            color: ${textColor};
                        }
                        p {
                            margin: 0.5em 0;
                        }
                        pre {
                            background-color: ${this.isDarkMode ? '#2d2d2d' : '#f6f8fa'};
                            color: ${textColor};
                            padding: 16px;
                            border-radius: 6px;
                            overflow-x: auto;
                            margin: 1em 0;
                        }
                        code {
                            background-color: ${this.isDarkMode ? '#2d2d2d' : '#f6f8fa'};
                            color: ${textColor};
                            padding: 2px 4px;
                            border-radius: 3px;
                            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                        }
                        blockquote {
                            border-left: 4px solid ${this.isDarkMode ? '#444' : '#ddd'};
                            margin: 1em 0;
                            padding-left: 1em;
                            color: ${this.isDarkMode ? '#ccc' : '#666'};
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin: 1em 0;
                        }
                        th, td {
                            border: 1px solid ${this.isDarkMode ? '#444' : '#ddd'};
                            padding: 8px 12px;
                            text-align: left;
                        }
                        th {
                            background-color: ${this.isDarkMode ? '#2d2d2d' : '#f6f8fa'};
                            font-weight: 600;
                        }
                        ul, ol {
                            margin: 0.5em 0;
                            padding-left: 2em;
                        }
                        li {
                            margin: 0.25em 0;
                        }
                        a {
                            color: ${this.isDarkMode ? '#58a6ff' : '#0969da'};
                            text-decoration: none;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                        /* Mermaid 图表样式 */
                        .mermaid-diagram {
                            text-align: center;
                            margin: 1em 0;
                        }
                        .mermaid-diagram svg {
                            max-width: 100%;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    <div id="content"></div>
                </body>
                </html>
            `)
            iframeDoc.close()
            
            // 等待iframe加载完成
            await new Promise(resolve => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.onload = resolve
                } else {
                    setTimeout(resolve, 100)
                }
            })
            
            // 将内容复制到iframe中，保留 Mermaid 图表的样式
            const contentDiv = iframeDoc.getElementById('content')
            const cleanContent = this.cleanElementForExport(preparedElement.innerHTML)
            contentDiv.innerHTML = cleanContent
            
            const canvas = await html2canvas(contentDiv, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: backgroundColor,
                width: 800,
                height: contentDiv.scrollHeight,
                logging: false
            })
            
            // 清理iframe
            document.body.removeChild(iframe)
            
            // 使用Promise包装toBlob以便正确处理异步
            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const extension = format === 'jpeg' ? 'jpg' : format
                        saveAs(blob, `document.${extension}`)
                        resolve()
                    } else {
                        reject(new Error('图片生成失败'))
                    }
                }, `image/${format}`, 0.9)
            })
        } catch (error) {
            console.error('图片导出失败:', error)
            throw error
        }
    }

    getMarkdownCSS() {
        const isDark = this.isDarkMode
        return `
        .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
            color: ${isDark ? '#ffffff' : '#24292e'};
        }
        .markdown-body h1 { 
            font-size: 2em; 
            border-bottom: 1px solid ${isDark ? '#444' : '#eaecef'}; 
            padding-bottom: 8px; 
        }
        .markdown-body h2 { 
            font-size: 1.5em; 
            border-bottom: 1px solid ${isDark ? '#444' : '#eaecef'}; 
            padding-bottom: 8px; 
        }
        .markdown-body h3 { font-size: 1.25em; }
        .markdown-body p { 
            margin-bottom: 16px; 
            color: ${isDark ? '#ffffff' : '#24292e'};
        }
        .markdown-body blockquote { 
            padding: 0 16px; 
            margin: 0 0 16px 0; 
            color: ${isDark ? '#8b949e' : '#6a737d'}; 
            border-left: 4px solid ${isDark ? '#30363d' : '#dfe2e5'}; 
            background-color: ${isDark ? '#161b22' : '#f6f8fa'};
        }
        .markdown-body code { 
            padding: 2px 4px; 
            font-size: 85%; 
            background-color: ${isDark ? '#343942' : 'rgba(27,31,35,0.05)'}; 
            color: ${isDark ? '#e6edf3' : '#24292e'};
            border-radius: 3px; 
        }
        .markdown-body pre { 
            padding: 16px; 
            overflow: auto; 
            font-size: 85%; 
            line-height: 1.45; 
            background-color: ${isDark ? '#0d1117' : '#f6f8fa'}; 
            color: ${isDark ? '#e6edf3' : '#24292e'};
            border-radius: 6px; 
            border: 1px solid ${isDark ? '#30363d' : '#d1d9e0'};
        }
        .markdown-body table { 
            border-spacing: 0; 
            border-collapse: collapse; 
            margin-bottom: 16px; 
        }
        .markdown-body table th, .markdown-body table td { 
            padding: 6px 13px; 
            border: 1px solid ${isDark ? '#30363d' : '#dfe2e5'}; 
            color: ${isDark ? '#e6edf3' : '#24292e'};
        }
        .markdown-body table th { 
            font-weight: 600; 
            background-color: ${isDark ? '#161b22' : '#f6f8fa'}; 
        }
        .markdown-body ul, .markdown-body ol {
            color: ${isDark ? '#e6edf3' : '#24292e'};
        }
        .markdown-body a {
            color: ${isDark ? '#58a6ff' : '#0969da'};
        }
        `
    }

    handleKeyboard(event) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
        const ctrlKey = isMac ? event.metaKey : event.ctrlKey
        
        if (ctrlKey && event.key === 's') {
            event.preventDefault()
            this.saveFile()
        } else if (ctrlKey && event.key === 'o') {
            event.preventDefault()
            this.openFile()
        } else if (ctrlKey && event.key === 'n') {
            event.preventDefault()
            this.newFile()
        } else if (event.key === 'F11') {
            event.preventDefault()
            this.toggleFullscreen()
        } else if (ctrlKey && event.key === 'd') {
            event.preventDefault()
            this.toggleTheme()
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 初始化编辑器
    const editor = new MarkdownEditor()
    
    // 将编辑器实例设置为全局变量，供历史菜单使用
    window.markdownEditor = editor
    
    // 编辑器初始化完成后，恢复标题文字
    const titleElement = document.querySelector('.app-title')
    if (titleElement) {
        titleElement.textContent = 'Markdown 预览编辑转换工具'
    }
})