const path = require("path");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const Generator = require("./generator.js");
const { download } = require("./https.js");
const ora = require("ora");

async function wrapLoading(fn, message, ...args) {
    // 使用 ora 初始化，传入提示信息 message
    const spinner = ora(message);
    // 开始加载动画
    spinner.start();

    try {
        // 执行传入方法 fn
        const result = await fn(...args);
        // 状态为修改为成功
        spinner.succeed("模版下载完成");
        return result;
    } catch (error) {
        // 状态为修改为失败
        spinner.fail("获取信息失败");
    }
}

const inquirerMap = {
    isOverwrite: {
        name: "isOverwrite",
        type: "list",
        message: "当前目录已存在此目录",
        choices: [{
                name: "覆盖",
                value: true,
            },
            {
                name: "取消",
                value: false,
            },
        ],
    },
};

const removeDir = (dir) => {
    fs.remove(dir);
};

/**
 * 判断目标目录是否存在,存在则删除
 * @params targetDir 目标目录
 * @returns Promise
 */
const existTargetDir = async(targetDir, options) => {
    const isExistTargetDir = fs.existsSync(targetDir); // 是否存在目录 true or false
    const isForce = options.force; //命令中是否存在--force true or false

    if (isExistTargetDir) {
        if (isForce) {
            return removeDir(targetDir);
        } else {
            const { isOverwrite } = await inquirer.prompt([inquirerMap.isOverwrite]);
            if (isOverwrite) {
                removeDir(targetDir);
            }
        }
    }
};

const create = async(name, options) => {
    const cwd = process.cwd();
    const targetDir = path.join(cwd, name);
    // 判断目录是否存在 根据条件决定是否删除已存在目录
    await existTargetDir(targetDir, options);
    const generator = new Generator(name, targetDir);
    const url = await generator.create();
    await wrapLoading(download, "下载模版中,请务退出......", url, targetDir);
    // 删除.git 文件
    removeDir(`${targetDir}/.git`);
};

module.exports = { create };