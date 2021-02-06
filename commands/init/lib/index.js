'use strict';

// command.parent._optionValues 可以拿到父的 options 参数，执行 berners-cli init testProject --force  --targetPath D:\code\berners-cli\berners-cli\commands\init
// function init(name, options, command) {
//     console.log(name, options, command.parent._optionValues);
// }

const fs = require('fs');
const fse = require('fs-extra');
const inquirer = require('inquirer');
const Command = require('@berners-cli/command');
const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';
const semver = require('semver');
const { getTemplate } = require('./action');

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

    async exec() {
        // throw new Error('exec必须实现');
        try {
            // 准备阶段
            // 下载模板
            // 安装模板
            const projectInfo = await this.prepare();
            console.log('projectInfo', projectInfo);
        } catch (error) {
            throw new Error(error);
        }
    }

    async prepare() {
        // 0.判断项目模版是否存在


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
        }
        
        // 3.选择创建项目或组件
        // 4.获取项目的基本信息
        return this.getProjectInfo();
    }

    async getProjectInfo() {
        let projectInfo = Object.create(null);
        const { type } = await inquirer.prompt({
            type: 'list',
            name: 'type',
            message: '请选择初始化类型',
            default: TYPE_PROJECT,
            choices: [
                {
                    name: '项目',
                    value: TYPE_PROJECT
                },
                {
                    name: '组件',
                    value: TYPE_COMPONENT
                }
            ],
        });
        if (type === TYPE_PROJECT) {
            // 获取项目基本信息
            const _projectInfo = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'projectName',
                    message: '请输入项目名称',
                    default: '',
                    // 对项目名称约束
                    validate: function(v) {
                        // 输入的首字符必须为英文字符
                        // 尾字符必须为英文或数字，不能为字符
                        // 字符仅允许 “-_”
                        const done = this.async();
                        setTimeout(function() {
                            if (/^[a-zA-Z0-9]+[\w]*[a-zA-Z0-9]$/.test(v)) {
                                done('请输入合法的版本号');
                                return;
                            }
                            // 合法返回
                            done(null, true);
                        }, 0);
                        return ;
                    }
                },
                {
                    type: 'input',
                    name: 'projectVersion',
                    message: '请输入项目版本号',
                    default: '',
                    validate: function(v) {
                        return !!semver.valid(v); // 对版本号校验
                    }
                }
            ]);
            projectInfo = {
                type,
                ..._projectInfo
            }
        } else if (type === TYPE_COMPONENT) {

        }
        return projectInfo;
    }

    isDirEmpty(localPath) {
        let fileList = fs.readdirSync(localPath);
        fileList = fileList.filter((file) => (!file.startsWith('.') && !['node_modules'].includes(file)));
        return fileList.length === 0;
    }

    // 下载模板
    downloadTemplate() {
        // 1.通过项目模板API获取项目模板信息
        // 1.1 通过egg.js搭建一套后端系统
        // 1.2 通过npm 存储存储项目模板
        // 1.3 将项目模板信息存储到 mongodb 数据库中
        // 1.4 通过egg.js 获取mongodb中的数据并且通过API返回
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
