const Client = require("ssh2-sftp-client");
const client = new Client();
const fse = require("fs-extra");
const path = require("path");
const {
  Logger
} = require("../../utils/index");

async function connect(host, port, username, password) {
  await client.connect({
    host,
    port,
    username,
    password,
  });
}
async function moveFilesToNewDirectory(remoteDir, destDir) {
  // Ensure destination directory exists
  try {
    await client.mkdir(destDir, true); // The second argument true makes it recursive
  } catch (err) {
    if (err.code !== 4) {
      // 4 means the directory already exists
      throw err;
    }
  }

  const fileList = await client.list(remoteDir);

  for (const file of fileList) {
    const sourceFilePath = `${remoteDir}/${file.name}`;
    const destFilePath = `${destDir}/${file.name}`;

    if (file.type === "-") {
      // type '-' means it's a file
      await client.rename(sourceFilePath, destFilePath);
    } else if (file.type === "d") {
      // type 'd' means it's a directory
      // Recursively move files in sub-directory
      await moveFilesToNewDirectory(sourceFilePath, destFilePath);

      await client.rmdir(sourceFilePath); // Remove the directory after moving its contents
    }
  }
}

async function rename(remoteDir) {
  const prefix = new Date().toISOString().slice(2, 19).replace(/[-:T]/g, "");
  await client.rename(`${remoteDir}/*`, `${remoteDir}-${prefix}/*`);
  Logger.success(`新备份目录：${remoteDir}-${prefix}`);
  await client.rename(`${remoteDir}-new/*`, `${remoteDir}/*`);
}

async function uploadDir(localDir, remoteDir, uploadFilter) {
  if ((await client.exists(remoteDir)) !== "d") {
    await client.uploadDir(localDir, remoteDir, uploadFilter);
    Logger.success(`${remoteDir}上传成功!`);
  } else {
    const prefix = new Date().toISOString().slice(2, 19).replace(/[-:T]/g, "");
    const destDir = `${remoteDir}-${prefix}`;
    await client.mkdir(`${remoteDir}-${prefix}`);

    await moveFilesToNewDirectory(remoteDir, destDir);
    Logger.success(`新备份目录：${destDir}`);
    await client.chmod(remoteDir, 777);

    await client.uploadDir(localDir, remoteDir, uploadFilter);
    Logger.success(`${remoteDir}上传成功!`);
  }
}

async function clear(remoteDir, maxLen = 10) {
  const dir = path.dirname(remoteDir);
  const basename = path.basename(remoteDir);
  if ((await client.exists(dir)) === "d") {
    const dirs = await client.list(dir);
    if (dirs.length < maxLen) return;
    const dirList = dirs.reduce((acc, curr) => {
      const {
        type,
        name
      } = curr;
      if (type === "d" && name.startsWith(`${basename}-`)) {
        acc.push(`${dir}/${name}`);
      }
      return acc;
    }, []);

    if (dirList.length < maxLen) return;
    await removeDir(dirList.sort().reverse().slice(maxLen));
  }
}

async function removeDir(dirList) {
  for await (const dir of dirList) {
    await client.rmdir(dir, true);
    Logger.info(`删除旧备份目录${dir}`);
  }
}

async function deploy(options) {
  const connectOptions = ["host", "port", "username", "password"].filter((key) => !options[key]);
  if (connectOptions.length) return Logger.error(`Linux SSH账户${connectOptions.join(",")}参数不能为空`);

  const pathOptions = ["localDir", "remoteDir"].filter((key) => !options.hasOwnProperty(key));
  if (pathOptions.length) return Logger.error(`地址${pathOptions.join(",")}参数不能为空`);

  const {
    host,
    port,
    username,
    password,
    localDir,
    remoteDir,
    limit
  } = options;
  try {
    await connect(host, port, username, password);
    Logger.info("Linux SSH连接成功!");
    await uploadDir(localDir, remoteDir);
    await clear(remoteDir, limit);
  } catch (error) {
    Logger.error(error);
  } finally {
    client.end();
    Logger.info("Linux SSH连接结束!");
  }
}

module.exports = async (args, options = {}) => {
  const currPath = process.cwd();
  const fileName = options?.file ? `${options.file}.json` : "ftp-config.json";
  const ftpConfig = path.resolve(currPath, fileName);
  const result = fse.pathExistsSync(ftpConfig);
  if (!result) {
    Logger.error(`${fileName}不存在!请使用wudl ftp init创建`);
    return;
  }

  const config = fse.readJsonSync(ftpConfig);
  deploy(config);
};