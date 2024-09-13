module.exports = (type, args, options) => {
    if (!type) return;
    const typeName = `${type}`.toLocaleLowerCase();
    const list = {
        init: true,
        deploy: true,
    };
    if (list[typeName]) {
        require(`./${typeName}.js`)(args, options);
    }
};