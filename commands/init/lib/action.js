const request = request('@berners-cli/request');

module.exports.getTemplate = async(data) => {
    const res = await request.get('/project/template');
    console.log(res);
}
