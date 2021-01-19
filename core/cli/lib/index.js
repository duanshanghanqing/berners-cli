'use strict';

module.exports = core;

// 5.检查入参优先执行
// checkInputArgs();

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
const { Command } = require('commander');
const pkg = require('../package.json');
const log = require('@berners-cli/log');
const init = require('@berners-cli/init');
const { LOWEST_NOOE_VERSION, DEFAULT_CLI_HOME } = require('./const');

// 实例化脚手架对象
const program = new Command();

function core() {
    try {
        checkPkgVersion();
        checkNodeVersion();
        checkRoot();
        checkUserHome();
        checkEnv();
        checkGlobalUpdata();
        registerCommand();
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
    // 2.调用npm API，获取最新版本号，存在最新版本号就更新。
    // 内部获取全部版本号，根据和当前版本号比较，获取大于当前版本号的版本列表，取出最新
    const { getSemverVersion } = require('@berners-cli/get-npm-info');
    // getNpmInfo(npmName);
    // console.log('currentVersion', currentVersion);
    // 获取当前包最大的版本号
    const lastVersion = await getSemverVersion(currentVersion, npmName);
    if (lastVersion) {
        log.warn('更新提醒', colors.yellow(`请手动更新 ${npmName}, 当前的版本是 ${currentVersion}，最新版本：${lastVersion}，执行 npm install -g ${npmName}`));
    }
}

// 8 命令注册
function registerCommand() {
    program
        .name(Object.keys(pkg.bin)[0])// Usage: imooc-test-berners <command> [options] 实现nanme
        .usage('<command> [options]') // Usage: imooc-test-berners <command> [options] 实现后面两个参数
        .version(pkg.version)
        .option('-d, --debug', '是否开启调试模式', false)
        .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '')
        ;

    // 注册 berners-cli init 命令
    program
        .command('init [projectName]')
        .option('-f, --force', '是否强制初始化项目')
        
        .action(init)
        ;
    
    // 实现debug
    program.on('option:debug', () => {
        const options = program.opts();
        if (options.debug) {
            process.env.LOG_LEVEL = 'verbose'; // 修改日志级别
        } else {
            process.env.LOG_LEVEL = 'info'; 
        }
        log.level = process.env.LOG_LEVEL; // 设置日志级别
        // log.verbose('test');
    });

    // 实现不存在的命令提醒
    program.on('command:*', (obj) => { // imooc-test-berners aaa
        // console.log(obj); // [ 'aaa' ] 不可用用的命令
        if (Array.isArray(obj) && obj.length > 0) {
            console.log(colors.red( `未知的命令：${obj.join(',')}`));
            const availableCommands = program.commands.map(cmd => cmd.name());
            if (availableCommands.length > 0) {
                console.log(colors.red( `可用的命令：${vaailableCommands.join(',')}`));
            }
        }
    });
    
    if (process.argv.length < 3) {
        program.outputHelp();
    }

    // 这句话要写在结尾， 解析参数
    program.parse(process.argv);
}
