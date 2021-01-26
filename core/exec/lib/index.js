'use strict';

const path = require('path');
const Package = require('@berners-cli/package');

const SETTINGS = {
    init: '@berners-cli/init', // 命令对应包名
}

const CACHE_DIR = 'dependencies'; // 依赖缓存目录

// 实现package包的动态执行
async function exec(projectName, option, parentoOtion) {
    // console.log(parentoOtion.name());// 命令名称
    // console.log(projectName); // 命令的值
    // console.log(option);// 当前命令
    // console.log(parentoOtion.parent._optionValues);


    const packageName = SETTINGS[parentoOtion.name()];
    const packageVersion = 'latest';
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    let storeDir = ''; // 缓存模块目录
    
    let pgk;
    if (targetPath) { // 执行起来 berners-cli init test --force --targetPath D:/code/berners-cli/berners-cli/commands/init  查看
        

        pgk = new Package({
            targetPath,
            homePath,
            packageName,
            packageVersion,
            // storeDir,
        });
    } else { // 执行起来 berners-cli init test --force  查看
        targetPath = path.resolve(homePath, CACHE_DIR); // 生成缓存路径
        storeDir = path.resolve(targetPath, 'node_modules'); // 存放缓存模块的目录

        pgk = new Package({
            targetPath,
            homePath,
            packageName,
            packageVersion,
            storeDir,
        });
    
        if (await pgk.exists()) {
            // await pgk.update();
        } else {
        }

        // console.log('targetPath 不存在 ->', targetPath);
    }
    const rootFile = pgk.getRootFilePath();
    // console.log('rootFile', rootFile);
    if (rootFile) {
        // 实现动态加载模块
        require(rootFile).apply(null, arguments);
    }
}

module.exports = exec;
