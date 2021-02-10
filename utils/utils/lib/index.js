'use strict';

function spinnerStart(msg = 'processing..', spinnerString = '|/-\\') {
    var Spinner = require('cli-spinner').Spinner;
    var spinner = new Spinner(msg + ' %s');
    spinner.setSpinnerString(spinnerString); // 会把 / 替换为 %s
    spinner.start();
    return spinner;
}

function sleep(t = 1000) {
    return new Promise(resolve => setTimeout(resolve, t));
}

function spawn(cmd, code, option) {
    const cp = require('child_process');
    let child;
    if (process.platform === 'win32') {
        // child = cp.spawn('cmd', ['/c', cmd, '-e', code], option);
        child = cp.spawn('cmd', ['/c', cmd, ...code], option);
    } else {
        child = cp.spawn(cmd, code, option);
    }
    return child;
}

function spawnAsyanc(cmd, code, option) {
    return new Promise((resolve, reject) => {
        const p = spawn(cmd, code, option);
        p.on('error', e => {
            reject(e);
        });
        p.on('exit', c => {
            resolve(c);
        });
    });
}

module.exports = {
    spinnerStart,
    sleep,
    spawn,
    spawnAsyanc,
};
