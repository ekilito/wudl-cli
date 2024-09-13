const inquirer = require("inquirer");
const ora = require("ora");
const {
  getRepoList
} = require("./https.js");
const prompts = require("prompts");

async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    return result;
  } catch (error) {
    // 状态为修改为失败
    spinner.fail("获取信息失败");
  }
}

class Generator {
  constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
  }

  // 获取用户选择的模板
  // 1）从远程拉取模板数据
  // 2）用户选择自己新下载的模板名称
  // 3）return 用户选择的名称

  async getRepo() {
    // 1）从远程拉取模板数据
    // const repoList = await wrapLoading(getRepoList, "加载模版中...");
    // if (!repoList) return;
    // 过滤
    // const repos = repoList.reduce((acc, cur) => {
    //   // 兼容过滤id写法
    //   if (cur.id) {
    //     acc.push(cur.name);
    //   }
    //   return acc;
    // }, []);

    const repos = [{
        title: "插件模版",
        value: "https://github.com/ekilito/admin-vben.git",
      },

      {
        title: "基础框架",
        value: "https://github.com/ekilito/admin-vben.git",
      },
    ];

    // 2）用户选择自己新下载的模板名称
    const {
      repo
    } = await prompts({
      name: "repo",
      type: "list",
      choices: repos,
      message: "请选择模版",
    });

    //获取模版git地址
    const url = repoList.find((item) => {
      return item.name === repo;
    })["http_url_to_repo"];

    return {
      name: repo,
      url
    };
  }

  // 核心创建逻辑
  async create() {
    const repo = await this.getRepo();
    return repo.url;
  }
}

// 动画加载效果

module.exports = Generator;