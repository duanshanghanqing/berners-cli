'use strict';

const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');

const define_registry = 'https://registry.npm.taobao.org' || 'http://registry.npmjs.org';

// 获取包信息
async function getNpmInfo(npmName, _registry) {
    // http://registry.npmjs.org/@imooc-cli/core
    if (!npmName) {
        return null;
    }
    const registry = _registry || define_registry;
    const npmInfoUrl = urlJoin(registry, npmName);
    // console.log(npmInfoUrl);
    const res = await axios.get(npmInfoUrl);
    if (res.status === 200) {
        return res.data;
    }
    return null;
}

// 获取包版本的列表
async function getNpmVersions(npmName, _registry) {
    const data = await getNpmInfo(npmName, _registry);
    if (data && data.versions && typeof data.versions === 'object') {
        return Object.keys(data.versions);
    }
    return [];
}

async function getSemverVersion(currentVersion, npmName, _registry) {
    // 获取全部版本列表
    const versions = await getNpmVersions(npmName, _registry);
    console.log('versions', versions);
    // 过滤大于当前的版本号
    return versions.filter((version) => semver.satisfies(version, `^${currentVersion}`));
}

module.exports = {
    getNpmInfo,
    getNpmVersions,
    getSemverVersion,
};
