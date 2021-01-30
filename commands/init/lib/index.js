'use strict';

// command.parent._optionValues 可以拿到父的 options 参数，执行 berners-cli init testProject --force  --targetPath /xxx
// function init(name, options, command) {
//     console.log(name, options, command.parent._optionValues);
// }


const Command = require('@berners-cli/command');

class InitCommand extends Command {
    constructor(argv) {
        super(argv);
    }
}

// module.exports.InitCommand = InitCommand;

// berners-cli init test --targetPath D:/code/berners-cli/berners-cli/commands/init
// berners-cli init test --force --targetPath /Users/gaojunfeng/Documents/code/berners-cli/commands/init
function init(argv) {
    // console.log(name, options, process.env.CLI_TARGET_PATH); // 通过环境变量拿到参数
    return new InitCommand(argv);
}

module.exports = init;

module.exports.InitCommand = InitCommand;
