'use strict';

// command.parent._optionValues 可以拿到父的 options 参数，执行 berners-cli init testProject --force  --targetPath D:\code\berners-cli\berners-cli\commands\init
// function init(name, options, command) {
//     console.log(name, options, command.parent._optionValues);
// }

const fs = require('fs');
const Command = require('@berners-cli/command');

class InitCommand extends Command {
    constructor(argv) {
        super(argv);
    }
    init() {
        let [projectName, cmd] = this._argv;
        this.projectName = projectName;
        Object.keys(cmd).forEach((key) => {
            this[key] = cmd[key];
        });
    }

    exec() {
        // throw new Error('exec必须实现');
        try {
            // 准备阶段
            // 下载模板
            // 安装模板
            this.prepare();
        } catch (error) {
            throw new Error(error);
        }
    }

    prepare() {
        // 1.判断当前目录是否为空
        if (this.isCwdEmpty()) {

        } else {
            // 询问是否创建
        }
        // 2.是否启动强制更新
        // 3.选择创建项目或组件
        // 4.获取项目的基本信息
    }

    isCwdEmpty() {
        const localPath = process.cwd();
        let fileList = fs.readdirSync(localPath);
        fileList = fileList.filter((file) => ( !file.startsWith('.') && !['node_modules'].includes(file) ));
        return fileList.length === 0;
    }
}

// module.exports.InitCommand = InitCommand;

// berners-cli init test --targetPath D:/code/berners-cli/berners-cli/commands/init
// berners-cli init test --force --targetPath /Users/gaojunfeng/Documents/code/berners-cli/commands/init
// berners-cli init testProject --force  --targetPath D:\code\berners-cli\berners-cli\commands\init
function init(argv) {
    // console.log(name, options, process.env.CLI_TARGET_PATH); // 通过环境变量拿到参数
    return new InitCommand(argv);
}

module.exports = init;

module.exports.InitCommand = InitCommand;
