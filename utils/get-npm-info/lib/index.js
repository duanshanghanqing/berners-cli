'use strict';

const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');

async function getNpmInfo(npmName, _registry) {
    // http://registry.npmjs.org/@imooc-cli/core
    if (!npmName) {
        return null;
    }
    const registry = _registry || 'http://registry.npmjs.org';
    const npmInfoUrl = urlJoin(registry, npmName);
    // console.log(npmInfoUrl);
    const res = await axios.get(npmInfoUrl);
    console.log(res.data.versions);
}

module.exports = {
    getNpmInfo
};
