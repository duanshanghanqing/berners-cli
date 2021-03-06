'use strict';

// command.parent._optionValues 可以拿到父的 options 参数，执行 berners-cli init testProject --force  --targetPath D:\code\berners-cli\berners-cli\commands\init
// function init(name, options, command) {
//     console.log(name, options, command.parent._optionValues);
// }
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const inquirer = require('inquirer');
const Command = require('@berners-cli/command');
const Package = require('@berners-cli/package');
const { spinnerStart, sleep, spawnAsyanc } = require('@berners-cli/utils');
const log = require('@berners-cli/log');
const semver = require('semver');
const userHome = require('user-home');
const { getTemplate } = require('./action');

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

const TEMPLATE_TYPE_NORMAL = 'normal'; // 标准安装
const TEMPLATE_TYPE_CUSTOM = 'custom'; // 非标准安装

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
            // 1.准备阶段
            // 下载模板
            // 安装模板
            const projectInfo = await this.prepare();
            // console.log('projectInfo', projectInfo);
            this.projectInfo = projectInfo;
            // 2.下载模版
            await this.downloadTemplate();
            // 3.安装模版
            await this.installTemplate();
        } catch (error) {
            throw new Error(error);
        }
    }

    async prepare() {
        // 0.判断项目模版是否存在
        const template = await getTemplate();
        if (!template || (Array.isArray(template) && template.length === 0)) {
            throw new Error('项目模板不存在');
        }
        // console.log('template', template);
        this.template = template;

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
        const projectInfo = await this.getProjectInfo();
        return projectInfo;
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
                    validate: function (v) {
                        // 输入的首字符必须为英文字符
                        // 尾字符必须为英文或数字，不能为字符
                        // 字符仅允许 “-_”
                        const done = this.async();
                        setTimeout(function () {
                            if (/^[a-zA-Z0-9]+[\w]*[a-zA-Z0-9]$/.test(v)) {
                                done('请输入合法的项目名称');
                                return;
                            }
                            // 合法返回
                            done(null, true);
                        }, 0);
                        return;
                    }
                },
                {
                    type: 'input',
                    name: 'projectVersion',
                    message: '请输入项目版本号',
                    default: '',
                    validate: function (v) {
                        return !!semver.valid(v); // 对版本号校验
                    }
                },
                {
                    type: 'list',
                    name: 'projectTemplate',
                    message: '请选择项目模板',
                    default: '',
                    choices: this.createTemplateChoices(),
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
    async downloadTemplate() {
        // 1.通过项目模板API获取项目模板信息
        // 1.1 通过egg.js搭建一套后端系统
        // 1.2 通过npm 存储存储项目模板
        // 1.3 将项目模板信息存储到 mongodb 数据库中
        // 1.4 通过egg.js 获取mongodb中的数据并且通过API返回
        // console.log(this.template, this.projectInfo);
        const { projectTemplate } = this.projectInfo;
        const templateInfo = this.template.find(item => item.npmName === projectTemplate);
        this.templateInfo = templateInfo;
        // console.log(templateInfo);
        // console.log(userHome);
        const targetPath = path.resolve(userHome, '.berners-cli', 'template');
        const storeDir = path.resolve(userHome, '.berners-cli', 'template', 'node_modules');
        // console.log(targetPath, storeDir);
        const { npmName, version } = templateInfo;
        // console.log(npmName, version);
        const templateNpm = new Package({
            targetPath,
            storeDir,
            packageName: npmName,
            packageVersion: version,
        });
        if (!(await templateNpm.exists())) {
            const spinner = spinnerStart('正在下载模板...'); // 线上进度条
            await sleep();
            try {
                await templateNpm.install();
            } catch (error) {
                throw error;
            } finally {
                spinner.stop(true); // 停止进度条
                if (await templateNpm.exists()) {
                    log.success('下载模板成功');
                    this.templateNpm = templateNpm;
                }
            }  
        } else {
            const spinner = spinnerStart('正在更新模板...'); // 线上进度条
            await sleep();
            try {
                await templateNpm.update();
                
            } catch (error) {
                throw error;
            } finally {
                spinner.stop(true); // 停止进度条
                if (await templateNpm.exists()) {
                    log.success('更新模板成功');
                    this.templateNpm = templateNpm;
                }
            }
        }
    }

    createTemplateChoices() {
        return this.template.map((item) => {
            return {
                value: item.npmName,
                name: item.name,
            };
        });
    }

    async installTemplate() {
        // console.log(this.templateInfo);
        if (this.templateInfo) {
            if (!this.templateInfo.type) {
                this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
            }
            if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) { // 标准安装
                await this.installNormalTemplate();
            } else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) { // 自定义安装
                await this.installCustomTemplate();
            } else {
                throw new Error('项目模版类型');
            }
        }
    }

    // 标准安装
    async installNormalTemplate() {
        // console.log(this.templateNpm.cacheFilePath);
        const spinner = spinnerStart('正在安装模版...');
        await sleep();
        let targetPath;
        try {
            // 拷贝当前代码至当前目录
            const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template');
            console.log(templatePath);
            targetPath = path.resolve(process.cwd(), 'template'); // 当前目录
            fse.ensureDirSync(templatePath); // 确保目录存在
            fse.ensureDirSync(targetPath);
            fse.copySync(templatePath, targetPath);// 缓存目录 拷贝到 当前目录
        } catch (error) {
            throw error;
        } finally {
            spinner.stop(true);
            log.success('模版安装成功');
        }
        // 依赖安装
        const { installCommand, startCommand } = this.templateInfo;
        // console.log('this.templateInfo', this.templateInfo);
        let installRes;
        if (installCommand) {
            const installCmd = installCommand.split(' ');
            const cmd = installCmd[0]; // 截取第一个参数
            const args = installCmd.slice(1);// 截取后面的参数
            installRes = await spawnAsyanc(cmd, args, {
                stdio: 'inherit',
                cmd: targetPath,
            });
        }
        if (installRes !== 0) {
            // log.success('安装成功');
            throw new Error('安装模版失败');
        }
        // 启动命令执行
        if (startCommand) {
            const startCmd = startCommand.split(' ');
            const cmd = startCmd[0]; // 截取第一个参数
            const args = startCmd.slice(1);// 截取后面的参数
            await spawnAsyanc(cmd, args, {
                stdio: 'inherit',
                cmd: targetPath,
            });
        }
    }

    // 非标准安装
    async installCustomTemplate() {

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
