const { filterDir } = require("../../utils");
const { resolve } = require("path");
const fse = require("fs-extra");
const shell = require("shelljs");

const reg = /^(\d+)/;

const excludeFiles = {
    "readme.md": true,
    "summary.md": true,
};

const generateDir = (dirs, isDir = true, template = "", level = 0) => {
    const array = dirs.sort((a, b) => {
        const resultA = a.filename.match(reg);
        const resultB = b.filename.match(reg);
        if (resultA && resultB) {
            if (+resultA[1] < +resultB[1]) return -1;
            if (+resultA[1] > +resultB[1]) return 1;
            return 0;
        } else {
            if (a.filename < b.filename) return -1;
            if (a.filename > b.filename) return 1;
            return 0;
        }
    });

    array.forEach((dir) => {
        let emptyStr = "";

        for (let i = 0; i < level; i++) {
            emptyStr += `    `;
        }

        if (isDir) {
            const file = resolve(dir.filepath, "README.md");
            const result = fse.readFileSync(file, "utf-8");
            template = `${template}
${emptyStr}* [${result.split(" ")[1]}](${dir.basePath}/README.md)`;

            if (dir.dirs.length) {
                template = generateDir(dir.dirs, true, template, level + 1);
            }

            if (dir.files.length) {
                template = generateDir(dir.files, false, template, level + 1);
            }
        } else {
            const name = dir.filename.toLocaleLowerCase();
            if (!excludeFiles[name]) {
                template = `${template}
${emptyStr}* [${dir.filename.slice(0, -3)}](${dir.basePath})`;
            }
        }
    });

    return template;
};

const renderTemplate = () => {
    const currPath = process.cwd();
    let template = `# 目录`;

    const README = resolve(currPath, "README.md");
    const result = fse.pathExistsSync(README);
    if (result) {
        template = `${template}

* [概述](README.md)`;
    }

    const { dirs, files } = filterDir("", true, null, true);

    template = generateDir(files, false, template);
    template = generateDir(dirs, true, template);
    fse.outputFileSync(resolve(currPath, "SUMMARY.md"), template);
};

module.exports = (args) => {
    const gitExists = shell.which("git");

    if (gitExists) {
        shell.exec("git pull");
    }
    renderTemplate();
    if (gitExists) {
        shell.exec("git add .");
        shell.exec("git commit -m deploy");
        shell.exec("git push");
    }
};