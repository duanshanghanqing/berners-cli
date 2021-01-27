'use strict';

// command.parent._optionValues 可以拿到父的 options 参数，执行 berners-cli init testProject --force  --targetPath /xxx
// function init(name, options, command) {
//     console.log(name, options, command.parent._optionValues);
// }


const Command = require('@berners-cli/command');
console.log(Command);
class InitCommand  { // extends Command
    constructor() {
        console.log('1.1');
    }
}

// module.exports.InitCommand = InitCommand;

// berners-cli init test --targetPath D:/code/berners-cli/berners-cli/commands/init
function init(name, options) {
    // console.log(name, options, process.env.CLI_TARGET_PATH); // 通过环境变量拿到参数
    return new InitCommand();
}

module.exports = init;
