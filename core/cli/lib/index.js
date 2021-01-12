'use strict';

// 0.检查入参
function checkInputArgs() {
    const argv = require('minimist')(process.argv.slice(2));
    if (argv.debug) {
        process.env.LOG_LEVEL = 'verbose'; // 设置log级别
    } else {
        process.env.LOG_LEVEL = 'info'; // 设置成默认
    }
}

checkInputArgs();

module.exports = core;

// require 支持 
// .js(module.exports/export) -> 
// .json(JSON.parse)
// .node(process.dlopen) 
// 其他文件 当成成js文件执行
const semver = require('semver');
const colors = require('colors/safe');
const pathExists = require('path-exists');
const userHome = require('user-home');
const pkg = require('../package.json');
const log = require('@berners-cli/log');
const { LOWEST_NOOE_VERSION } = require('./const');

function core() {
    try {
        checkPkgVersion();
        checkNodeVersion();
        checkRoot();
        checkUserHome();
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
// pathExists.sync(path)
function checkUserHome() {
    console.log(userHome); // C:\Users\IG_G005
    if (!userHome || !pathExists.sync(userHome)) { // 路径不存在
        throw new Error(colors.red(`当前登录用户主目录不存在`));
    }
}