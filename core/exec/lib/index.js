'use strict';

const path = require('path');
const Package = require('@berners-cli/package');
const log = require('@berners-cli/log');

const SETTINGS = {
    // init: '@berners-cli/init', // 命令对应包名
    init: '@ingeek/point',
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
    // console.log('packageName', packageName);
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
        // console.log('targetPath 不存在 ->', targetPath);
        // console.log('storeDir ->', storeDir);

        // 检查当前package是否存在
        if (await pgk.exists()) {
            // 存在，就升级
            await pgk.update();
        } else {
            // 安装 包
            await pgk.install();
        }
    }
    const rootFile = pgk.getRootFilePath();
    // console.log('rootFile', rootFile);
    if (rootFile) {
        // 实现动态加载模块
        // 问题：在当前进程中调用
        try {
            require(rootFile).call(null, Array.from(arguments));
        } catch (error) {
            log.error(error.message);
        }

        // 改造成在node子进程中调用
        
    }
}

module.exports = exec;
