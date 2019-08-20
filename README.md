<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-05 14:54:16
 * @LastEditTime: 2019-08-19 11:05:32
 * @LastEditors: Please set LastEditors
 -->
 ## Startalk Web
### 简介
- Startalk Web是IM网页版聊天工具
- Startalk Web依赖[后端服务](https://github.com/qunarcorp/ejabberd-open)，否则无法正常使用该聊天工具。
- 涉及技术：node、koa、react、websocket、webpack等。
- 主要功能：单聊、群聊、好友、组织架构、个人名片等，消息支持：文本、表情、图片、文件等。
- 如果Startalk Web对您有所帮助或启发的话，还望给个star鼓励，我们团队会尽全力提供优化和支持，力求做出最优秀的企业级IM。
- 此外，为有效、流畅体验Startalk Web，还请仔细阅读安装说明，如若遇到问题，欢迎进群咨询[QQ群：852987381]。
### 安装
#### 环境要求
  - node@ >= 8.6.0，pm2 @>= 2.0.0
  - node pm2安装：
  

#### 项目启动开发
  - git clone https://github.com/qunarcorp/startalk_web.git 克隆代码到本地
  - npm install 安装项目依赖
  - 修改 .env 文件为 NODE_ENV=development
  - profiles/development/startalk.env 配置后台地址，
    如： BASEURL=http://127.0.0.1:8080
  - 执行 npm run build , 新开 tab 页执行 npm run dev 启动项目

### 项目打包上线
  - 修改 .env 文件为 NODE_ENV=production
  - profiles/production/startalk.env 配置线上环境后台地址，
    如： BASEURL=http://127.0.0.1:8080
  - npm run build
  - npm run client

### 初始化账号密码： admin/testpassword


### 书写规范
  - 驼峰命名
  - 中英文之间空格
  - 不写分号

### 注意事项
  #### 1.模块化引用,减少包的体积
  - 比如lodash
  - import omit from 'lodash/omit' //best
  - import { omit } from 'lodash'  //bad