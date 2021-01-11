'use strict';

module.exports = core;

// require 支持 
// .js(module.exports/export) -> 
// .json(JSON.parse)
// .node(process.dlopen) 
// 其他文件 当成成js文件执行
const pkg = require('../package.json');
const log = require('@berners-cli/log');
function core() {
    checkPkgVersion();
}

// 1.检查版本号
function checkPkgVersion() {
    console.log(pkg.version);
    log();
}
