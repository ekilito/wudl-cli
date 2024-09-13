// 获取远程模版信息
const {
  exec
} = require("child_process");
const axios = require("axios");

axios.interceptors.response.use((res) => {
  return res.data;
});

/**
 * 获取模板列表
 * @returns Promise
 */
async function getRepoList() {
  return axios({
    url: "https://github.com/ekilito/admin-vben.git",
    headers: {
      // "PRIVATE-TOKEN": "ZzHjMKP53pDE81_UV4mn",
    },
  });
}

/**
 * 通过git下载代码文件
 * @params url git地址
 * @params targetPath 目标路径
 * @returns Promise
 */
const download = (url, targetPath) => {
  return new Promise((resolve, reject) => {
    const command = `git clone ${url} ${targetPath}`;
    const process = exec(command);

    process.on("error", () => {
      reject(new Error(""));
    });
    process.on("close", () => {
      const dir = `${targetPath}/.git`;
      console.log(dir);
      resolve(true);
    });
  });
};
module.exports = {
  getRepoList,
  download,
};