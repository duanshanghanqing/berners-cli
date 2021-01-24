'use strict';

const path = require('path');
const pkgDir = require('pkg-dir').sync;
const npminstall = require('npminstall');
const formatPath = require('@berners-cli/format-path');

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

    }

    // 安装包
    install() {
        npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            
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

        const dir = pkgDir(this.targetPath);
        // console.log(dir);
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
        return null;
    }
}

module.exports = Package;
