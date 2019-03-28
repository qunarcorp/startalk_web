# Startalk_web

## 常用命令

1. 启动开发模式
  ```
  npm start
  ```
- 若实现本地调试，需要先本地启动sdk项目
- 再将本项目local.env 改变路径  QTALK_SDK_URL= http://127.0.0.1:5001/qtalk_web_sdk@local.js

2. 在浏览器中预览网站 `http://localhost:5002/index`
  
3. 其他命令
  ```sh
  # 编译工程
  npm run build:prod
  ```

## 目录结构

```
.
├── /assets/                            # 静态资源，如图片、字体
├── /config/                            # webpack配置文件
│   ├── /packing.js                     # 和构建工具相关的配置
│   ├── /webpack.build.babel.js         # webpack编译环境配置文件
│   └── /webpack.serve:dist.js          # webpack预览编译后结果的配置文件
├── /mock/                              # 模拟数据
│   ├── /api/                           # API接口类型模拟数据
│   └── /pages/                         # 页面初始化类型模拟数据
├── /prd/                               # 项目编译输出目录
├── /src/                               # 项目源码目录
│   ├── /entries/                       # webpack打包入口js
│   ├── /profiles/                      # 类似maven的profiles，设置不同环境下的配置
│   └── /templates/                     # 后端模版，如jade、smarty
├── .babelrc                            # babel配置
├── .editorconfig                       # 代码编辑器配置
├── .eslintrc                           # eslint配置
├── package.json                         
└── README.md                   
```


### 图片 本地assets文件夹
- 默认用户头像：/assets/footer/a3faf4373242d1.png
- imgError默认图片：/assets/footer/ff1a003aa731b0d4e2dd3d39687c8a54.png 
- logo图片：/assets/footer/4cf2f7c2e63f4a02.png

- 用户头像 ：接口返回的链接（get_vcard_info）##

- 其他图片：/assets/index/****.png    /assets/chat/****.png

- emails:邮箱后缀 ##


