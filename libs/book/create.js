const { resolve } = require("path");
const { filterDir } = require("../../utils/index");
const Nzh = require("nzh/cn");
const fse = require("fs-extra");
const { Logger } = require("../../utils/index");

const getNewChapter = (dir) => {
    const { dirs } = filterDir(dir, false);
    let num = 0;
    dirs.forEach(({ filename }) => {
        const result = filename.match(/^(?:C|c)hapter((?:\d*)\d$)/);
        if (result) {
            const a = +result[1];
            if (a > num) num = a;
        }
    });
    num = num + 1;
    return num;
};

module.exports = (args) => {
    const currPath = process.cwd();
    const num = getNewChapter();
    const newFile = resolve(currPath, `Chapter${num}/README.md`);
    let content = `# 第${Nzh.encodeS(num)}章`;
    if (args.length) {
        content = `${content} ${args[0]}`;
    }
    fse.outputFileSync(newFile, content);
    Logger.success(`Chapter${num}目录创建成功!`);
};