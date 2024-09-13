# 自动发布代码到服务器

&emsp;&emsp;传统开发中，代码打包完之后，需要借助 XSHELL/XFTP 连接服务器，然后备份文件，替换旧目录。前后动辄十分钟就浪费了。借助此工具，自动连接服务器、自动部署、自动备份最近 10 个版本。惊不惊喜？意不意外？生产力就是这样解放出来的！！！

### 初始化配置

1. 进入目录，以 wei-news 项目为例：

```sh
cd wei-news
```

2. 执行 wudl ftp 命令

```sh
wudl ftp init
```

3. 进入提示模式

```sh
? 是否在命令行配置FTP信息?
```

&emsp;&emsp;如果输入 n，会生成默认 ftp-config.json 配置。然后自行修改 ftp-config 文件。

```json
{
  "host": "",
  "port": 22,
  "username": "",
  "password": "",
  "localDir": "",
  "remoteDir": ""
}
```

&emsp;&emsp;如果直接回车或输入 Y，将按提示生成配置文件

```sh
? 是否在命令行配置FTP信息? Yes
? 请输入host地址: 192.168.1.24
? 请输入port地址(一般为22): 22
? 请输入服务器用户名: root
? 请输入服务器密码: 123456
? 请输入本地资源目录(eg: ./dist): ./dist
? 请输入本地资源目录(eg: /home/wei-news, wei-news为项目名): /data/weichai-news
```

&emsp;&emsp;★ 可以自定义生成 json 的名称:

```sh
# 默认生成ftp-config.json
wudl ftp init

# 生成自定义名称配置文件ftp-test-config.json
wudl ftp init -f ft-test-config
```

### 部署

```sh
# 默认读取ftp-config.json
wudl ftp deploy

# 默认读取自定义名称配置文件ftp-test-config.json
wudl ftp deploy -f ftp-test-config
```

&emsp;&emsp;So easy!!!

