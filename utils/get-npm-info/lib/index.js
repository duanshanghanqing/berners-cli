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
    let res;
    try {
        res = await axios.get(npmInfoUrl);
    } catch (error) {
        // console.error('获取包信息失败');
    }
    if (res && res.status === 200) {
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

// 获取满足高于当前包版本号的版本列表
async function getSemverVersion(currentVersion, npmName, _registry) {
    // 获取全部版本列表
    let versions;
    try {
        versions = await getNpmVersions(npmName, _registry);
    } catch (error) {
        return null;
    }
    // 返回大于当前版本号的版本，在按照从大到小排序
    const newVersions = versions.filter((version) => semver.lt(currentVersion, version)).sort((a, b) => semver.gt(a, b));
    // console.log(newVersions);
    if (Array.isArray(newVersions) && newVersions.length > 0) {
        return newVersions[0];
    }
    return null;
}

// 获取 npm 地址
function getDefineRegistry() {
    return define_registry;
}

// 获取最大版本号
async function getNpmLatestVersion(npmName, _registry) {
    let versions = await getNpmVersions(npmName, _registry);
    if (Array.isArray(versions) && versions.length > 0) {
        versions = versions.sort((a, b) => semver.gt(a, b)); // 从大到小排序
        return versions[0];
    }
    return null;
}

module.exports = {
    getNpmInfo,
    getNpmVersions,
    getSemverVersion,
    getDefineRegistry,
    getNpmLatestVersion,
};
