const request = require('@berners-cli/request');

module.exports.getTemplate = (data) => request.get('/project/template');
