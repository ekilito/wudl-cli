const fse = require("fs-extra");
const { resolve } = require("path");
const chalk = require("chalk");
const log = console.log;

const excludeDirs = {
    ".git": true,
    node_modules: true,
};

module.exports = {
    filterDir: (dir = "", isDeep = true, obj = null, isNest = false) => {
        const currPath = process.cwd();

        const filterAssets = (dir = "", isDeep = true, obj = null) => {
            const result = fse.readdirSync(resolve(currPath, dir));
            if (!obj) {
                obj = {
                    dirs: [],
                    files: [],
                };
            }

            return result.reduce((acc, curr) => {
                if (curr.startsWith(".") || excludeDirs[curr]) return acc;
                const currName = dir ? `${dir}/${curr}` : curr;
                const newPath = resolve(currPath, currName);
                const stats = fse.statSync(newPath);
                const isDir = stats.isDirectory();

                const item = {
                    basePath: currName,
                    filename: curr,
                    filepath: newPath,
                };

                if (isDir && isDeep) {
                    if (isNest) {
                        const { dirs, files } = filterAssets(currName, isDeep, null, isNest);
                        item.dirs = dirs;
                        item.files = files;
                    } else {
                        acc = filterAssets(currName, isDeep, obj, isNest);
                    }
                }

                acc[isDir ? "dirs" : "files"].push(item);
                return acc;
            }, obj);
        };
        return filterAssets(dir, isDeep, obj, isNest);
    },
    Logger: {
        success(message) {
            log(chalk.green(message));
        },
        info(message) {
            log(chalk.blue(message));
        },
        error(message) {
            log(chalk.red(message));
        },
    },
};