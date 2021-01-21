'use strict';

module.exports = init;

// command.parent._optionValues 可以拿到父的 options 参数，执行 berners-cli init testProject --force  --targetPath /xxx
// function init(name, options, command) {
//     console.log(name, options, command.parent._optionValues);
// }

function init(name, options) {
    console.log(name, options, process.env.CLI_TARGET_PATH); // 通过环境变量拿到参数
}
