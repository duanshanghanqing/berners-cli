'use strict';

const semver = require('semver');
const colors = require('colors');
const log = require('@berners-cli/log');
const LOWEST_NOOE_VERSION = '10.0.0';

class Command {
    constructor(argv) {
        // console.log(argv);
        if (!argv) {
            throw new Error('参数不能为空！');
        }
        if (!Array.isArray(argv)) {
            throw new Error('参数必须为数组！');
        }
        if (argv.length < 1) {
            throw new Error('参数列表为空！');
        }

        this._argv = argv;
        
        let runner = new Promise((resolve, erject) => {
            let chain = Promise.resolve();
            // chain.then() => Promise对象
            chain = chain.then(() => this.checkNodeVersion());
            // chain = chain.then(() => this.initArgs()); // 其实使用高板本的command就不用了，课程老师的比当前项目低
            chain = chain.then(() => this.init());
            chain = chain.then(() => this.exec());
            // 监听异常
            chain.catch((err) => {
                log.error(err.message);
            });
        });
    }

    checkNodeVersion() {
        // 第一步获取node版本号
        // console.log(process.version);
    
        // 第二步比较最低版本号
        // 当前版本号小于定义版本号，就抛出异常
        if (!semver.gt(process.version, LOWEST_NOOE_VERSION)) {
            throw new Error(colors.red(`berners-cli 需要安装 v${LOWEST_NOOE_VERSION} 以上版本的 Node.js`));
        }
    }

    init() {
        throw new Error('init必须实现');
    }

    exec() {
        throw new Error('exec必须实现');
    }
}

module.exports = Command;
