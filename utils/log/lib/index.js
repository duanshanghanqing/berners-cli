'use strict';

const log = require('npmlog');

// log.level = 'verbose'; // 调低日志级别
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'; // 判断 debugger 模式
// log.heading = ''; // berners-cli 修改前缀
log.addLevel('success', 2000, { fg: 'green', bold: true }); // 自定义级别

module.exports = log;
