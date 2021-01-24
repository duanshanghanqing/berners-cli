'use strict';

const Package = require('@berners-cli/package');

const SETTINGS = {
    init: '@berners-cli/init', // 命令对应包名
}

// 实现package包的动态执行
function exec(projectName, option, parentoOtion) {
    // console.log(parentoOtion.name());// 命令名称
    // console.log(projectName); // 命令的值
    // console.log(option);// 当前命令
    // console.log(parentoOtion.parent._optionValues);


    const packageName = SETTINGS[parentoOtion.name()];
    const packageVersion = 'latest';
    const targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;

    const pak = new Package({
        targetPath,
        homePath,
        packageName,
        packageVersion,
    });
    pak.getRootFilePath();

    // console.log('exec', process.env.CLI_TARGET_PATH);
    // console.log('exec', process.env.CLI_HOME_PATH);
}

module.exports = exec;
