#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 版本号自动增加脚本
 * 支持 patch, minor, major 三种增加方式
 */

function bumpVersion(type = 'patch') {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    
    try {
        // 读取 package.json
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const currentVersion = packageJson.version;
        
        // 解析当前版本号
        const versionParts = currentVersion.split('.').map(Number);
        let [major, minor, patch] = versionParts;
        
        // 根据类型增加版本号
        switch (type) {
            case 'major':
                major += 1;
                minor = 0;
                patch = 0;
                break;
            case 'minor':
                minor += 1;
                patch = 0;
                break;
            case 'patch':
            default:
                patch += 1;
                break;
        }
        
        const newVersion = `${major}.${minor}.${patch}`;
        
        // 更新 package.json
        packageJson.version = newVersion;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        
        console.log(`版本号已从 ${currentVersion} 更新到 ${newVersion}`);
        
        // 更新HTML中显示的版本号
        try {
            const { execSync } = require('child_process');
            execSync('node scripts/update-version-display.cjs', { stdio: 'inherit' });
        } catch (error) {
            console.warn('警告: 更新HTML版本号显示失败:', error.message);
        }
        
        return newVersion;
    } catch (error) {
        console.error('版本号更新失败:', error.message);
        process.exit(1);
    }
}

// 从命令行参数获取版本类型
const versionType = process.argv[2] || 'patch';

// 验证版本类型
if (!['patch', 'minor', 'major'].includes(versionType)) {
    console.error('错误: 版本类型必须是 patch, minor 或 major');
    process.exit(1);
}

// 执行版本号增加
bumpVersion(versionType);