'use strict';

// command.parent._optionValues 可以拿到父的 options 参数，执行 berners-cli init testProject --force  --targetPath D:\code\berners-cli\berners-cli\commands\init
// function init(name, options, command) {
//     console.log(name, options, command.parent._optionValues);
// }

const fs = require('fs');
const fse = require('fs-extra');
const inquirer = require('inquirer');
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

    async prepare() {
        const localPath = process.cwd();
        // 1.判断当前目录是否为空
        let ifContinue = false;
        if (!this.isDirEmpty(localPath)) {
            // 访问是否继续创建
            if (!this.force) {
                ifContinue = (await inquirer.prompt({
                    type: 'confirm',
                    name: 'ifContinue',
                    default: false,
                    message: '当前文件不为空，是否继续创建项目',
                })).ifContinue;
            }
            if (!ifContinue) {
                // process.exit(1);
                return; // 中断执行
            }
            if (ifContinue || this.force) { // 命令行强清空
                // 清空前给用户做二次确认
                const { confirmDelete } = await inquirer.prompt({
                    type: 'confirm',
                    name: 'confirmDelete',
                    default: false,
                    message: '是否确认清空当前目录下的文件?',
                });
                console.log(confirmDelete);
                // 清空当前目录
                // 2.是否启动强制更新
                // fse.emptyDirSync(localPath);// 清空文件夹
            }
        } else {
            // 询问是否创建
        }
        
        // 3.选择创建项目或组件
        // 4.获取项目的基本信息
    }

    isDirEmpty(localPath) {
        let fileList = fs.readdirSync(localPath);
        fileList = fileList.filter((file) => (!file.startsWith('.') && !['node_modules'].includes(file)));
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
