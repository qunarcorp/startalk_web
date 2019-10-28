### 本地开发环境要求
  - node@ >= 8.6.0  npm git等工具

### 项目启动开发
  - git clone https://github.com/qunarcorp/startalk_web.git 克隆代码到本地
  - npm install 安装项目依赖
  - 修改 .env 文件为 NODE_ENV=development
  - 进入目录文件 profiles/development/startalk.env， 配置后台地址
    如： BASEURL=http://127.0.0.1:8080
        NAVIGATION=startalk_nav
  - 执行 npm run build 
  - 新开 tab 页执行 npm run dev 启动项目

### 项目打包上线
  - 修改 .env 文件为 NODE_ENV=production
  - 进入目录文件 profiles/production/startalk.env 配置线上环境后台地址
    如： BASEURL=http://127.0.0.1:8080
        NAVIGATION=startalk_nav
  - npm run build
  - npm run client
  - 将生产的dist目录上传至服务器
  - 服务器启动： pm2 start app.js --watch

### 书写规范
  - 驼峰命名
  - 中英文之间空格
  - 不写分号

### 注意事项
  #### 1.模块化引用,减少包的体积
  - 比如lodash
  - import omit from 'lodash/omit' //best
  - import { omit } from 'lodash'  //bad