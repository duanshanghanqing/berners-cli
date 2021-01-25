'use strict';

const path = require('path');
const Package = require('@berners-cli/package');

const SETTINGS = {
    init: '@berners-cli/init', // 命令对应包名
}

const CACHE_DIR = 'dependencies'; // 依赖缓存目录

// 实现package包的动态执行
function exec(projectName, option, parentoOtion) {
    // console.log(parentoOtion.name());// 命令名称
    // console.log(projectName); // 命令的值
    // console.log(option);// 当前命令
    // console.log(parentoOtion.parent._optionValues);


    const packageName = SETTINGS[parentoOtion.name()];
    const packageVersion = 'latest';
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    let storeDir = ''; // 缓存模块目录
    
    let pak;
    if (!targetPath) {
        targetPath = path.resolve(homePath, CACHE_DIR); // 生成缓存路径
        storeDir = path.resolve(targetPath, 'node_modules'); // 缓存模块目录
        // console.log(targetPath, storeDir); // berners-cli init test    C:\Users\IG_G005\.berners-cli\dependencies C:\Users\IG_G005\.berners-cli\dependencies\node_modules

        pak = new Package({
            targetPath,
            homePath,
            packageName,
            packageVersion,
            storeDir,
        });
    
        // 存在时
        if (pak.exists()) {
            // 更新 package
        } else {
            // 安装 package
        }
    } else {
        pak = new Package({
            targetPath,
            homePath,
            packageName,
            packageVersion,
            // storeDir,
        });
    }
    const rootFile = pak.getRootFilePath();
    // console.log('rootFile', rootFile);

    // 执行起来 berners-cli init test --targetPath D:/code/berners-cli/berners-cli/commands/init  查看
    // 实现动态加载模块
    require(rootFile).apply(null, arguments);
}

module.exports = exec;
