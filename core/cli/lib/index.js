'use strict';

module.exports = core;

// 优先执行
checkInputArgs();

// require 支持 
// .js(module.exports/export) -> 
// .json(JSON.parse)
// .node(process.dlopen) 
// 其他文件 当成成js文件执行
const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const pathExists = require('path-exists').sync;
const userHome = require('user-home');
const pkg = require('../package.json');
const log = require('@berners-cli/log');
const { LOWEST_NOOE_VERSION, DEFAULT_CLI_HOME } = require('./const');

function core() {
    try {
        checkPkgVersion();
        checkNodeVersion();
        checkRoot();
        checkUserHome();
        checkEnv();
        checkGlobalUpdata();
    } catch (error) {
        log.error(error.message);
    }
}

// 1.检查版本号
function checkPkgVersion() {
    log.info(`cli ${pkg.version}`);
    log.verbose('debugger');
}

// 2.检查node版本号
function checkNodeVersion() {
    // 第一步获取node版本号
    // console.log(process.version);

    // 第二步比较最低版本号
    // 当前版本号小于定义版本号，就抛出异常
    if (!semver.gt(process.version, LOWEST_NOOE_VERSION)) {
        throw new Error(colors.red(`berners-cli 需要安装 v${LOWEST_NOOE_VERSION} 以上版本的 Node.js`));
    }
}

// 3.检查是否是 root 账户
function checkRoot() {
    const rootCheck = require('root-check');
    rootCheck(); // 用sudo root用户执行命令会自动降级
}

// 4.检查用户主目录
// pathExists(path)
function checkUserHome() {
    // console.log(userHome); // C:\Users\IG_G005
    if (!userHome || !pathExists(userHome)) { // 路径不存在
        throw new Error(colors.red(`当前登录用户主目录不存在`));
    }
}

// 5.检查入参
function checkInputArgs() {
    const argv = require('minimist')(process.argv.slice(2));
    if (argv.debug) {
        process.env.LOG_LEVEL = 'verbose'; // 设置log级别
    } else {
        process.env.LOG_LEVEL = 'info'; // 设置成默认
    }
}

// 6.获取环境变量，设置环境变量
function checkEnv() {
    // 读取.env环境中设置的变量
    const dotenvPath = path.relative(userHome, '.env'); // 更多环境变量，配置在这个文件中
    // 设置环境变量，之后就可以通过 process.env 获取
    if (pathExists(dotenvPath)) { // 是否存在
        require('dotenv').config({
            path: dotenvPath,
        });
    }
    // 设置默认环境变量
    createDefaultConfig();
    // 读取
    // console.log(process.env);
}

// 创建环境变量
function createDefaultConfig() {
    const cliConfig = {
        home: userHome,
    }
    // 这个环境变量存在
    if (process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
    } else {
    // 不存在，就设置这个环境变量
        cliConfig['cliHome'] = path.join(userHome, DEFAULT_CLI_HOME);
    }

    // 把最终生成的，赋值给环境变量
    process.env.CLI_HOME_PATH = cliConfig['cliHome'];
}

// 7 检查脚手架是否要更新
async function checkGlobalUpdata() {
    // 1.当前版本号和模块名
    const currentVersion = pkg.version;
    const npmName = pkg.name;
    // 2.调用npm API，获取所有的版本号
    const { getSemverVersion } = require('@berners-cli/get-npm-info');
    // getNpmInfo(npmName);
    console.log('currentVersion', currentVersion);
    const versions = await getSemverVersion(currentVersion, 'url-join');
    console.log(versions);
    // 3.提取所有版本号，比对那些版本号是大于当前版本号
    // 4.获取最新的版本号，提示更新到该版本


}
