const {
  resolve
} = require("path");
const fse = require("fs-extra");
const {
  Logger
} = require("../../utils/index");
const inquirer = require("inquirer");

const promptList = [{
    type: "input",
    message: "请输入host地址:",
    name: "host",
  },
  {
    type: "input",
    message: "请输入port地址(一般为22):",
    name: "port",
  },
  {
    type: "input",
    message: "请输入服务器用户名:",
    name: "username",
  },
  {
    type: "input",
    message: "请输入服务器密码:",
    name: "password",
  },
  {
    type: "input",
    message: "请输入本地资源目录(eg: ./dist):",
    name: "localDir",
  },
  {
    type: "input",
    message: "请输入本地资源目录(eg: /home/wei-news, wei-news为项目名):",
    name: "remoteDir",
  },
];

const generateConfig = (ftpConfig, fileName, options = null) => {
  const config = !options ? {
      host: "",
      port: 22,
      username: "",
      password: "",
      localDir: "",
      remoteDir: "",
    } :
    options;
  fse.outputJsonSync(ftpConfig, config, {
    spaces: 2
  });
  Logger.success(`${fileName}已创建!`);
};

module.exports = (args, options = {}) => {
  const currPath = process.cwd();
  const fileName = options?.file ? `${options.file}.json` : "ftp-config.json";
  const ftpConfig = resolve(currPath, fileName);
  const result = fse.pathExistsSync(ftpConfig);
  if (result) {
    Logger.error(`${fileName}已存在!`);
    return;
  }

  inquirer
    .prompt([{
      type: "confirm",
      message: "是否在命令行配置FTP信息?",
      name: "config",
    }, ])
    .then((answers) => {
      if (answers.config) {
        inquirer.prompt(promptList).then((ans) => {
          generateConfig(ftpConfig, fileName, ans);
        });
      } else {
        generateConfig(ftpConfig, fileName);
      }
    })
    .catch((err) => {});
};