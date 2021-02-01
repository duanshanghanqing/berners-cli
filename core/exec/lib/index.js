'use strict';

const path = require('path');
const cp = require('child_process');
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
            // require(rootFile).call(null, Array.from(arguments));
            // 通过 node 子进程调用
            // cp.fork(); // 这个方法不提供回调，需要通过子父进程通信解决
            // const code = 'console.log(1);';// node -e "console.log(1);"
            let args = Array.from(arguments);
            const cmd = args[args.length - 1];
            const o = Object.create(null);
            Object.keys(cmd).forEach((key) => {
                if (
                    cmd.hasOwnProperty(key) && // 自身属性
                    !key.startsWith('_') && // 不是 _ 开始
                    key !== 'parent'
                ) {
                    o[key] = cmd[key];
                }
            });
            // console.log(o);
            args[args.length - 1] = o;
            const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;
            // cp.spawn('cmd', ['/c', 'node', '-e', code]) // window
            // const child = cp.spawn('node', ['-e', code], {
            //     cwd: process.cwd(),
            //     stdio: 'inherit'
            // });
            let child;
            const option = {
                cwd: process.cwd(),
                stdio: 'inherit'
            };
            if (process.platform === 'win32') {
                child = cp.spawn('cmd', ['/c', 'node', '-e', code], option);
            } else {
                child = cp.spawn('node', ['-e', code], option);
            }
            child.on('error', (e) => {
                log.error(e.message);
                process.exit(1); // 发生错误，中断执行
            });
            child.on('exit', (e) => {
                log.verbose('命令执行成功：' + e.message);
                process.exit(e);
            });
        } catch (error) {
            log.error(error.message);
        }

        // 改造成在node子进程中调用

    }
}

module.exports = exec;
