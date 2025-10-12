// 国际化配置
const translations = {
    'zh-CN': {
        // 应用标题
        appTitle: 'Markdown 转换工具',
        
        // 工具栏
        toolbar: {
            toggleToc: '切换目录',
            fullscreen: '全屏编辑',
            newFile: '新建文件',
            openFile: '打开文件',
            saveFile: '保存文件',
            export: '导出',
            githubStar: 'GitHub Star',
            language: '选择语言',
            theme: '切换主题'
        },
        
        // 导出菜单
        export: {
            html: '导出 HTML',
            pdf: '导出 PDF',
            png: '导出 PNG',
            jpg: '导出 JPG',
            webp: '导出 WEBP',
            markdown: '导出 Markdown'
        },
        
        // 目录
        toc: {
            title: '目录',
            empty: '暂无目录'
        },
        
        // 编辑器
        editor: {
            title: 'Markdown 编辑器',
            wordWrap: '自动换行'
        },
        
        // 预览
        preview: {
            title: '预览',
            syncScroll: '同步滚动'
        },
        
        // 历史文档
        history: {
            title: '历史文档',
            empty: '暂无历史文档',
            delete: '删除'
        },
        
        // SEO 元数据
        seo: {
            title: 'Markdown 转换工具 - 在线 Markdown 编辑器和转换器',
            description: '功能强大的在线 Markdown 编辑器，支持实时预览、多格式导出（HTML、PDF、PNG、JPG、WEBP）、数学公式渲染、代码高亮、目录生成等功能。',
            keywords: 'Markdown编辑器,在线编辑器,Markdown转换,PDF导出,图片导出,数学公式,代码高亮,实时预览',
            author: 'blackmady'
        }
    },
    
    'zh-TW': {
        // 應用標題
        appTitle: 'Markdown 轉換工具',
        
        // 工具欄
        toolbar: {
            toggleToc: '切換目錄',
            fullscreen: '全屏編輯',
            newFile: '新建檔案',
            openFile: '開啟檔案',
            saveFile: '儲存檔案',
            export: '匯出',
            githubStar: 'GitHub Star',
            language: '選擇語言',
            theme: '切換主題'
        },
        
        // 导出菜单
        export: {
            html: '匯出 HTML',
            pdf: '匯出 PDF',
            png: '匯出 PNG',
            jpg: '匯出 JPG',
            webp: '匯出 WEBP',
            markdown: '匯出 Markdown'
        },
        
        // 目錄
        toc: {
            title: '目錄',
            empty: '暫無目錄'
        },
        
        // 編輯器
        editor: {
            title: 'Markdown 編輯器',
            wordWrap: '自動換行'
        },
        
        // 预览
        preview: {
            title: '預覽',
            syncScroll: '同步捲動'
        },
        
        // 历史文档
        history: {
            title: '歷史文檔',
            empty: '暫無歷史文檔',
            delete: '刪除'
        },
        
        // SEO 元數據
        seo: {
            title: 'Markdown 轉換工具 - 線上 Markdown 編輯器和轉換器',
            description: '功能強大的線上 Markdown 編輯器，支援即時預覽、多格式匯出（HTML、PDF、PNG、JPG、WEBP）、數學公式渲染、程式碼高亮、目錄生成等功能。',
            keywords: 'Markdown編輯器,線上編輯器,Markdown轉換,PDF匯出,圖片匯出,數學公式,程式碼高亮,即時預覽',
            author: 'blackmady'
        }
    },
    
    'en': {
        // App Title
        appTitle: 'Markdown Converter',
        
        // Toolbar
        toolbar: {
            toggleToc: 'Toggle TOC',
            fullscreen: 'Fullscreen',
            newFile: 'New File',
            openFile: 'Open File',
            saveFile: 'Save File',
            export: 'Export',
            githubStar: 'GitHub Star',
            language: 'Language',
            theme: 'Toggle Theme'
        },
        
        // Export Menu
        export: {
            html: 'Export HTML',
            pdf: 'Export PDF',
            png: 'Export PNG',
            jpg: 'Export JPG',
            webp: 'Export WEBP',
            markdown: 'Export Markdown'
        },
        
        // Table of Contents
        toc: {
            title: 'Table of Contents',
            empty: 'No headings found'
        },
        
        // Editor
        editor: {
            title: 'Markdown Editor',
            wordWrap: 'Word Wrap'
        },
        
        // 预览
        preview: {
            title: 'Preview',
            syncScroll: 'Sync Scroll'
        },
        
        // 历史文档
        history: {
            title: 'History',
            empty: 'No history documents',
            delete: 'Delete'
        },
        
        // SEO Metadata
        seo: {
            title: 'Markdown Converter - Online Markdown Editor and Converter',
            description: 'Powerful online Markdown editor with real-time preview, multi-format export (HTML, PDF, PNG, JPG, WEBP), math formula rendering, code highlighting, and table of contents generation.',
            keywords: 'Markdown editor,online editor,Markdown converter,PDF export,image export,math formulas,code highlighting,real-time preview',
            author: 'blackmady'
        }
    }
};

// 当前语言
let currentLanguage = 'zh-CN';

// 语言名称映射
const languageNames = {
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'en': 'English'
};

// 获取翻译文本
function t(key) {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return key; // 如果找不到翻译，返回原始key
        }
    }
    
    return value || key;
}

// 设置语言
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        updatePageContent();
        updateDocumentMeta();
        updateLanguageSelector();
    }
}

// 获取当前语言
function getCurrentLanguage() {
    return currentLanguage;
}

// 初始化语言
function initI18n() {
    // 从localStorage获取保存的语言设置
    const savedLang = localStorage.getItem('language');
    if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
    } else {
        // 根据浏览器语言自动选择
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('zh')) {
            if (browserLang.includes('TW') || browserLang.includes('HK') || browserLang.includes('MO')) {
                currentLanguage = 'zh-TW';
            } else {
                currentLanguage = 'zh-CN';
            }
        } else if (browserLang.startsWith('en')) {
            currentLanguage = 'en';
        }
    }
    
    updatePageContent();
    updateDocumentMeta();
    updateLanguageSelector();
}

// 更新页面内容
function updatePageContent() {
    // 设置html lang属性
    document.documentElement.lang = currentLanguage;
    
    // 更新所有带有data-i18n属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    // 更新所有带有data-i18n-title属性的元素的title
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = t(key);
    });
    
    // 更新所有带有data-i18n-placeholder属性的元素的placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
}

// 更新文档元数据
function updateDocumentMeta() {
    const seoData = t('seo');
    
    // 更新页面标题
    document.title = seoData.title;
    
    // 更新meta描述
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = seoData.description;
    }
    
    // 更新meta关键词
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
        metaKeywords.content = seoData.keywords;
    }
    
    // 更新语言标签
    const metaLanguage = document.querySelector('meta[name="language"]');
    if (metaLanguage) {
        metaLanguage.content = currentLanguage;
    }
    
    // 更新Open Graph标签
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.content = seoData.title;
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
        ogDescription.content = seoData.description;
    }
    
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
        const localeMap = {
            'zh-CN': 'zh_CN',
            'zh-TW': 'zh_TW',
            'en': 'en_US'
        };
        ogLocale.content = localeMap[currentLanguage] || 'zh_CN';
    }
    
    // 更新Twitter Card标签
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
        twitterTitle.content = seoData.title;
    }
    
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
        twitterDescription.content = seoData.description;
    }
    
    // 更新结构化数据
    const structuredData = document.querySelector('script[type="application/ld+json"]');
    if (structuredData) {
        try {
            const data = JSON.parse(structuredData.textContent);
            data.name = seoData.title;
            data.description = seoData.description;
            data.author.name = seoData.author;
            data.publisher.name = seoData.author;
            
            // 更新功能列表的多语言版本
            const featureListMap = {
                'zh-CN': [
                    "实时Markdown预览",
                    "数学公式支持",
                    "代码语法高亮",
                    "多格式导出(HTML/PDF/PNG/JPG/WEBP)",
                    "暗黑模式",
                    "目录导航",
                    "文件管理"
                ],
                'zh-TW': [
                    "即時Markdown預覽",
                    "數學公式支援",
                    "程式碼語法高亮",
                    "多格式匯出(HTML/PDF/PNG/JPG/WEBP)",
                    "暗黑模式",
                    "目錄導航",
                    "檔案管理"
                ],
                'en': [
                    "Real-time Markdown preview",
                    "Math formula support",
                    "Code syntax highlighting",
                    "Multi-format export (HTML/PDF/PNG/JPG/WEBP)",
                    "Dark mode",
                    "Table of contents navigation",
                    "File management"
                ]
            };
            
            data.featureList = featureListMap[currentLanguage] || featureListMap['zh-CN'];
            structuredData.textContent = JSON.stringify(data, null, 2);
        } catch (e) {
            console.warn('Failed to update structured data:', e);
        }
    }
}

// 更新语言选择器
function updateLanguageSelector() {
    const currentLanguageElement = document.getElementById('currentLanguage');
    if (currentLanguageElement) {
        currentLanguageElement.textContent = languageNames[currentLanguage] || currentLanguage;
    }
    
    // 更新语言菜单中的选中状态
    document.querySelectorAll('.language-menu button').forEach(button => {
        const lang = button.getAttribute('data-lang');
        if (lang === currentLanguage) {
            button.style.backgroundColor = 'var(--bg-secondary)';
            button.style.fontWeight = '600';
        } else {
            button.style.backgroundColor = 'transparent';
            button.style.fontWeight = 'normal';
        }
    });
}

// 导出函数供全局使用
window.t = t;
window.setLanguage = setLanguage;
window.getCurrentLanguage = getCurrentLanguage;
window.initI18n = initI18n;

// 国际化配置文件
const i18n = {
    // 当前语言
    currentLang: 'zh-CN',
    
    // 支持的语言列表
    supportedLangs: {
        'zh-CN': '简体中文',
        'zh-TW': '繁體中文',
        'en': 'English'
    },
    
    // 翻译资源
    translations: {
        'zh-CN': {
            // 页面标题和描述
            pageTitle: 'Markdown转换工具 - 在线Markdown编辑器与导出工具 | MD2IMG',
            pageDescription: '免费在线Markdown编辑器，支持实时预览、数学公式、代码高亮，可导出为HTML、PDF、PNG、JPG、WEBP格式。功能强大的Markdown转换工具，支持暗黑模式和目录导航。',
            pageKeywords: 'Markdown编辑器,Markdown转换,在线编辑器,PDF导出,图片导出,数学公式,代码高亮,实时预览,暗黑模式,免费工具',
            
            // 工具栏
            toolbar: {
                newFile: '新建文件',
                openFile: '打开文件',
                saveFile: '保存文件',
                export: '导出',
                exportHtml: '导出为 HTML',
                exportPdf: '导出为 PDF',
                exportPng: '导出为 PNG',
                exportJpg: '导出为 JPG',
                exportWebp: '导出为 WEBP',
                toggleTheme: '切换主题',
                language: '语言'
            },
            
            // 编辑器
            editor: {
                placeholder: '在此输入 Markdown 内容...',
                wordCount: '字数统计',
                lineCount: '行数',
                cursorPosition: '光标位置'
            },
            
            // 预览区域
            preview: {
                title: '预览',
                loading: '加载中...',
                empty: '暂无内容'
            },
            
            // 目录
            toc: {
                title: '目录',
                empty: '暂无目录'
            },
            
            // 文件操作
            file: {
                newFileTitle: '新建文件',
                openFileTitle: '打开文件',
                saveFileTitle: '保存文件',
                fileName: '文件名',
                fileContent: '文件内容',
                confirm: '确认',
                cancel: '取消',
                save: '保存',
                open: '打开',
                delete: '删除',
                rename: '重命名'
            },
            
            // 消息提示
            messages: {
                fileSaved: '文件已保存',
                fileOpened: '文件已打开',
                fileDeleted: '文件已删除',
                fileRenamed: '文件已重命名',
                exportSuccess: '导出成功',
                exportError: '导出失败',
                copySuccess: '复制成功',
                copyError: '复制失败',
                invalidFileName: '文件名不能为空',
                fileExists: '文件已存在'
            },
            
            // 按钮文本
            buttons: {
                ok: '确定',
                cancel: '取消',
                save: '保存',
                delete: '删除',
                edit: '编辑',
                copy: '复制',
                download: '下载'
            }
        },
        
        'zh-TW': {
            // 頁面標題和描述
            pageTitle: 'Markdown轉換工具 - 線上Markdown編輯器與匯出工具 | MD2IMG',
            pageDescription: '免費線上Markdown編輯器，支援即時預覽、數學公式、程式碼高亮，可匯出為HTML、PDF、PNG、JPG、WEBP格式。功能強大的Markdown轉換工具，支援暗黑模式和目錄導航。',
            pageKeywords: 'Markdown編輯器,Markdown轉換,線上編輯器,PDF匯出,圖片匯出,數學公式,程式碼高亮,即時預覽,暗黑模式,免費工具',
            
            // 工具列
            toolbar: {
                newFile: '新建檔案',
                openFile: '開啟檔案',
                saveFile: '儲存檔案',
                export: '匯出',
                exportHtml: '匯出為 HTML',
                exportPdf: '匯出為 PDF',
                exportPng: '匯出為 PNG',
                exportJpg: '匯出為 JPG',
                exportWebp: '匯出為 WEBP',
                toggleTheme: '切換主題',
                language: '語言'
            },
            
            // 編輯器
            editor: {
                placeholder: '在此輸入 Markdown 內容...',
                wordCount: '字數統計',
                lineCount: '行數',
                cursorPosition: '游標位置'
            },
            
            // 預覽區域
            preview: {
                title: '預覽',
                loading: '載入中...',
                empty: '暫無內容'
            },
            
            // 目錄
            toc: {
                title: '目錄',
                empty: '暫無目錄'
            },
            
            // 檔案操作
            file: {
                newFileTitle: '新建檔案',
                openFileTitle: '開啟檔案',
                saveFileTitle: '儲存檔案',
                fileName: '檔案名稱',
                fileContent: '檔案內容',
                confirm: '確認',
                cancel: '取消',
                save: '儲存',
                open: '開啟',
                delete: '刪除',
                rename: '重新命名'
            },
            
            // 訊息提示
            messages: {
                fileSaved: '檔案已儲存',
                fileOpened: '檔案已開啟',
                fileDeleted: '檔案已刪除',
                fileRenamed: '檔案已重新命名',
                exportSuccess: '匯出成功',
                exportError: '匯出失敗',
                copySuccess: '複製成功',
                copyError: '複製失敗',
                invalidFileName: '檔案名稱不能為空',
                fileExists: '檔案已存在'
            },
            
            // 按鈕文字
            buttons: {
                ok: '確定',
                cancel: '取消',
                save: '儲存',
                delete: '刪除',
                edit: '編輯',
                copy: '複製',
                download: '下載'
            }
        },
        
        'en': {
            // Page title and description
            pageTitle: 'Markdown Converter - Online Markdown Editor & Export Tool | MD2IMG',
            pageDescription: 'Free online Markdown editor with real-time preview, math formulas, code highlighting. Export to HTML, PDF, PNG, JPG, WEBP formats. Powerful Markdown conversion tool with dark mode and table of contents navigation.',
            pageKeywords: 'Markdown editor,Markdown converter,online editor,PDF export,image export,math formulas,code highlighting,real-time preview,dark mode,free tool',
            
            // Toolbar
            toolbar: {
                newFile: 'New File',
                openFile: 'Open File',
                saveFile: 'Save File',
                export: 'Export',
                exportHtml: 'Export as HTML',
                exportPdf: 'Export as PDF',
                exportPng: 'Export as PNG',
                exportJpg: 'Export as JPG',
                exportWebp: 'Export as WEBP',
                toggleTheme: 'Toggle Theme',
                language: 'Language'
            },
            
            // Editor
            editor: {
                placeholder: 'Enter Markdown content here...',
                wordCount: 'Word Count',
                lineCount: 'Line Count',
                cursorPosition: 'Cursor Position'
            },
            
            // Preview area
            preview: {
                title: 'Preview',
                loading: 'Loading...',
                empty: 'No content'
            },
            
            // Table of contents
            toc: {
                title: 'Table of Contents',
                empty: 'No headings'
            },
            
            // File operations
            file: {
                newFileTitle: 'New File',
                openFileTitle: 'Open File',
                saveFileTitle: 'Save File',
                fileName: 'File Name',
                fileContent: 'File Content',
                confirm: 'Confirm',
                cancel: 'Cancel',
                save: 'Save',
                open: 'Open',
                delete: 'Delete',
                rename: 'Rename'
            },
            
            // Messages
            messages: {
                fileSaved: 'File saved',
                fileOpened: 'File opened',
                fileDeleted: 'File deleted',
                fileRenamed: 'File renamed',
                exportSuccess: 'Export successful',
                exportError: 'Export failed',
                copySuccess: 'Copied successfully',
                copyError: 'Copy failed',
                invalidFileName: 'File name cannot be empty',
                fileExists: 'File already exists'
            },
            
            // Button text
            buttons: {
                ok: 'OK',
                cancel: 'Cancel',
                save: 'Save',
                delete: 'Delete',
                edit: 'Edit',
                copy: 'Copy',
                download: 'Download'
            }
        }
    }
};

// 导出i18n对象
window.i18n = i18n;