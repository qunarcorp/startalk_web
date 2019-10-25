<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-05 14:54:16
 * @LastEditTime: 2019-08-19 11:05:32
 * @LastEditors: Please set LastEditors
 -->
 ## Startalk Web
### 简介
- Startalk Web是IM网页版聊天工具。
- Startalk Web依赖[后端服务](https://github.com/qunarcorp/ejabberd-open)，否则无法正常使用该工具。
- 涉及技术：node、koa、react、websocket、webpack等。
- 主要功能：单聊、群聊、好友、组织架构、个人名片等，消息支持：文本、表情、图片、文件等。
- 如果Startalk Web对您有所帮助或启发的话，还望给个star鼓励，我们团队会尽全力提供优化和支持，力求做出最优秀的企业级IM。
- 此外，为有效、流畅体验Startalk Web，还请仔细阅读安装说明，如若遇到问题，欢迎进群咨询[QQ群：852987381]。
### 安装
#### 环境要求
  - node@ >= 8.6.0
  - pm2 @>= 2.0.0
#### 服务器环境安装(root用户)
- 登录服务器后，进入下载目录，安装node：
```
    cd /startalk/download
    wget https://npm.taobao.org/mirrors/node/v8.6.0/node-v8.6.0-linux-x64.tar.xz
    tar -xvf  node-v8.6.0-linux-x64.tar.xz
    cd  node-v8.6.0-linux-x64/bin
```
- 执行以下命令，若显示 v8.6.0 ，则表明安装成功
```
    ./node -v
```
- 配置软连接，便于全局使用 node npm命令
```
    ln -s /startalk/download/node-v8.6.0-linux-x64/bin/node /usr/local/bin/node
    ln -s /startalk/download/node-v8.6.0-linux-x64/bin/npm /usr/local/bin/npm
```
- 分别执行以下命令，若返回版本号，则表示配置成功
```
    node -v
    npm -v
```
- 安装pm2，并配置软连接，便于全局使用 pm2命令
```
    npm install -g pm2
    ln -s /startalk/download/node-v8.6.0-linux-x64/bin/pm2 /usr/local/bin/pm2
```
- 执行以下命令，若返回版本号，则表示配置成功
```
    pm2 -v
```
#### 下载代码到服务器
- 在 /startalk/download 目录下下载源码,然后将项目 /dist 目录下文件copy到 /startalk/startalk_web 目录下。
```
    cd /startalk/download
    git clone https://github.com/qunarcorp/startalk_web.git
    cp -rf startalk_web/dist /startalk/startalk_web
```
#### 修改配置
- 进入项目目录，配置 startalk.env 文件，将 BASEURL=http://IP:8080 的IP改成服务器IP,NAVIGATION=/ 改为后台导航
- 其他配置：端口、公共路径可根据实际情况选择性配置
- 建议采用淘宝镜像: npm config set registry https://registry.npm.taobao.org
```
    cd /startalk/startalk_web
    npm install -production
    vim profiles/production/startalk.env
```
- 编辑完成后，保存退出vim编辑
```
    按下 esc键
    输入 :wq
    回车
```
#### 项目启动与预览
- 使用pm2启动项目
```
    pm2 start /startalk/startalk_web/app.js --watch
```
- 执行以下命令，查看是否启动成功，若该项目对应的status为online，则表明启动成功
```
    pm2 list
```
- 注意：本次部署是以后台服务和前端服务部署在同一台机器上为背景，如需部署多台机器，则需通过nginx配置转发，以解决接口的跨域问题。
- 项目预览：
    - 项目启动成功后，在电脑浏览器中输入 [本机IP:8080/web],回车键访问，输入测试账号登录，（测试账号admin，密码testpassword）
    - 至此，您便可享用web版及时通信聊天工具。

### 注意
#### 注意事项
- 前端服务默认端口为5000，默认公共路径为根路径（startalk.env 文件配置）
- 如果需要修改端口或者公共路径，需要同步修改ng转发配置，确保后端接口正常调用
- .env 文件默认为生产环境 NODE_ENV=production
- 如若需要修改源代码，则需要重新打包生成dist目录
  - 先fork项目到自己的GitHub
  - 参考本项目下的developement.md文件，进行本地开发调试
  - 本地启动成功后便可将最新的dist文件上传至服务器启动
- 接口位于entry.js
  - 获取直属领导，员工编号和查询用户电话功能已写好,接口需使用者实现
#### 其他辅助命令（部署成功后不需要执行）
- sudo netstat -anlp| grep 5000  查看5000 端口的进程
- sudo kill -9 [进程code] 结束进程
- df -h  查看不同分区的大小
- rm -rf *** 删除文件夹
- pm2 start [启动文件]
- pm2 log 查看pm2日志
- pm2 list 查看pm2启动项目清单及状态
- pm2 delete [id] 删除pm2进程
- pm2 show [id] 查看项目启动详情