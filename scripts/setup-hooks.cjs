#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Git hooks 安装脚本
 * 将 .githooks 目录中的 hooks 复制到 .git/hooks/ 目录
 */

function setupGitHooks() {
    const gitHooksDir = path.join(__dirname, '..', '.git', 'hooks');
    const customHooksDir = path.join(__dirname, '..', '.githooks');
    
    try {
        // 检查是否在 Git 仓库中
        if (!fs.existsSync(path.join(__dirname, '..', '.git'))) {
            console.log('警告: 当前目录不是 Git 仓库，跳过 hooks 安装');
            return;
        }
        
        // 检查自定义 hooks 目录是否存在
        if (!fs.existsSync(customHooksDir)) {
            console.log('警告: .githooks 目录不存在，跳过 hooks 安装');
            return;
        }
        
        // 确保 .git/hooks 目录存在
        if (!fs.existsSync(gitHooksDir)) {
            fs.mkdirSync(gitHooksDir, { recursive: true });
        }
        
        // 读取自定义 hooks 目录中的所有文件
        const hookFiles = fs.readdirSync(customHooksDir);
        
        hookFiles.forEach(hookFile => {
            const sourcePath = path.join(customHooksDir, hookFile);
            const targetPath = path.join(gitHooksDir, hookFile);
            
            // 复制 hook 文件
            fs.copyFileSync(sourcePath, targetPath);
            
            // 设置执行权限
            fs.chmodSync(targetPath, 0o755);
            
            console.log(`已安装 Git hook: ${hookFile}`);
        });
        
        console.log('Git hooks 安装完成！');
        console.log('现在每次提交代码时，版本号会自动增加');
        
    } catch (error) {
        console.error('Git hooks 安装失败:', error.message);
        process.exit(1);
    }
}

// 执行安装
setupGitHooks();