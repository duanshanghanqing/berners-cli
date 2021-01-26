'use strict';

const path = require('path');
const pkgDir = require('pkg-dir').sync;
const npminstall = require('npminstall');
const pathExists = require('path-exists').sync;
const fse = require('fs-extra'); // 比原生的 fs 模块更好用
const formatPath = require('@berners-cli/format-path');
const { getDefineRegistry, getNpmLatestVersion } = require('@berners-cli/get-npm-info');

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
        // 生成package的缓存目录前缀
        this.cacheFilePathPrefix = this.packageName.replace('/', '_');
    }

    // 缓存目录不存在时，创建缓存目录 
    // 把 latest 版本号，转换成最大版本号
    async prepare() {
        // 传入的是 'latest'
        if (this.packageVersion === 'latest') {
            const packageVersion = await getNpmLatestVersion(this.packageName); // 可能这个包在服务器上不存在
            if (packageVersion) {
                this.packageVersion = packageVersion;
            }
        }

        // 缓存目录不存在时，创建缓存目录 
        if (this.storeDir && !pathExists(this.storeDir)) {
            fse.mkdirpSync(this.storeDir); // 创建缓存目录
        }
    }

    // 缓存文件属性
    get cacheFilePath() {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
    }

    // 检查当前package是否存在
    async exists() {
        // 判断缓存目录是否存在
        if (this.storeDir) { // 缓存模式
            // await this.prepare();
            return false;
        } else { // 非缓存模式
            return pathExists(this.targetPath);
        }
    }

    // 安装包
    async install() {
        // 转换最大版本号
        await this.prepare();
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
    async update() {
        await this.prepare();

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
        return null;
    }
}

module.exports = Package;
