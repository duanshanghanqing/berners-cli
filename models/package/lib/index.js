'use strict';

const path = require('path');
const pkgDir = require('pkg-dir').sync;
const npminstall = require('npminstall');
const formatPath = require('@berners-cli/format-path');
const { getDefineRegistry } = require('@berners-cli/get-npm-info');

class Package {
    constructor(options) {
        if (!options) {
            return;
        }
        if (Object.prototype.toString.call(options) !== '[object Object]') {
            return;
        }

        // package 的路径
        this.targetPath = options.targetPath;
        // 缓存 package 的存储路径
        this.storeDir = options.storeDir;
        // package 的name
        this.packageName = options.packageName;
        // package 的version
        this.packageVersion = options.packageVersion;
    }


    // 检查包是否存在
    exists() {
        return false;
    }

    // 安装包
    install() {
        npminstall({
            root: this.targetPath, // 模块路径
            storeDir: this.storeDir, // 缓存 package 的存储路径
            registry: getDefineRegistry(), // 源
            pkgs: [
                {
                    name: this.packageName,
                    version: this.packageVersion,
                }
            ]
        });
    }

    // 更新包
    update() {

    }

    // 获取入口文件
    getRootFilePath() {
        // 1.读取package.json所在目录， pkg-dir
        // 2.读取package.json - require() 
        // 3.寻找main/lib - path
        // 4.路径兼容（macOS/windows）
        // console.log('this.targetPath', this.targetPath);
        if (!this.targetPath) {
            console.error('targetPath 不存在');
            return;
        }
        
        const dir = pkgDir(this.targetPath); // 找到模块路径
        if (dir) {
            // 2.读取package.json - require() 
            const pagFile = require(path.resolve(dir, 'package.json'));
            // console.log(pagFile);
            // 3.寻找main/lib - path
            if (pagFile && pagFile.main) {
                // 4.路径兼容（macOS/windows）
                // console.log(path.resolve(dir, pagFile.main));
                return formatPath(path.resolve(dir, pagFile.main));
            }
        }
        console.error('找不到模块');
        return null;
    }
}

module.exports = Package;
