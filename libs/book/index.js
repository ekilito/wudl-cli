module.exports = (type, args) => {
    if (!type) return;
    const typeName = `${type}`.toLocaleLowerCase();
    const list = {
        create: true,
        push: true,
    };
    if (list[typeName]) {
        require(`./${typeName}.js`)(args);
    }
};