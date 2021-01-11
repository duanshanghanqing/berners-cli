#!/usr/bin/env node

// console.log('lello word');
// const utils = require('@berners-cli/utils');
// utils();

const importLocal = require('import-local');

// 使用本地文件
if (importLocal(__filename)) {
    require('import-local').info('cli', '正在使用 berners-cli 本地版本');
} else {
// 使用全局文件
    require('../lib')(process.argv.slice(2));// 传入命令行参数
}
