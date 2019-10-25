"use strict";

var _koa = require("koa");

var _koa2 = _interopRequireDefault(_koa);

var _koaCompress = require("koa-compress");

var _koaCompress2 = _interopRequireDefault(_koaCompress);

var _koaViews = require("koa-views");

var _koaViews2 = _interopRequireDefault(_koaViews);

var _koaStatic = require("koa-static");

var _koaStatic2 = _interopRequireDefault(_koaStatic);

var _index = require("./routes/index");

var _index2 = _interopRequireDefault(_index);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

require("./dotenv");

var _log4js = require("log4js");

var _log4js2 = _interopRequireDefault(_log4js);

var _errorHandler = require("./middlewares/errorHandler.js");

var _errorHandler2 = _interopRequireDefault(_errorHandler);

var _proxyMiddleware = require("./middlewares/proxyMiddleware");

var _proxyMiddleware2 = _interopRequireDefault(_proxyMiddleware);

var _formatter = require("./utils/formatter");

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-05 14:54:15
 * @LastEditTime: 2019-08-19 10:24:27
 * @LastEditors: Please set LastEditors
 */
// development webpack-dev-middleware
let webpack, webpackConfig, devMiddleware, hotMiddleware, compiler;

if (process.env.NODE_ENV === 'development') {
  webpack = require('webpack');

  const RawModule = require('webpack/lib/RawModule');

  webpackConfig = require('../webpack.config.js');
  devMiddleware = require('./middlewares/devMiddleware');
  hotMiddleware = require('./middlewares/hotMiddleware');
  compiler = webpack(webpackConfig);
  compiler.plugin('emit', (compilation, callback) => {
    const assets = compilation.assets;
    let data;
    Object.keys(assets).forEach(key => {
      if (key.match(/\.html$/)) {
        data = assets[key].source();
        data = data.replace('<%=navConfig%>', JSON.stringify(global.startalkNavConfig));
        data = data.replace('<%=keys%>', JSON.stringify(global.startalkKeys));
        assets[key] = new RawModule(data).source();
      }
    });
    callback();
  });
}

const app = new _koa2.default();
const {
  PORT,
  IP,
  BASEURL,
  NAVIGATION
} = process.env;
global.startalkNavConfig = {};
global.startalkKeys = {};
(0, _request2.default)(`${BASEURL}/${NAVIGATION}`, (error, response, body) => {
  if (!error && response.statusCode == 200) {
    global.startalkNavConfig = JSON.parse(body);
    (0, _request2.default)(`${global.startalkNavConfig.baseaddess.javaurl}/qtapi/nck/rsa/get_public_key.do`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        global.startalkKeys = JSON.parse(body).data;
      }
    });
  }
});
app.use((0, _koaCompress2.default)({
  threshold: 2048
})); // development webpack-dev-middleware

if (process.env.NODE_ENV === 'development') {
  app.use(devMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
  }));
  app.use(hotMiddleware(compiler));
}

app.use((0, _koaViews2.default)(_path2.default.join(__dirname, './views'), {
  map: {
    html: 'ejs'
  }
}));
app.use((0, _koaStatic2.default)(_path2.default.join(__dirname, './assets'))); // 错误日志处理

_log4js2.default.configure({
  appenders: {
    cheese: {
      type: 'file',
      filename: _path2.default.join(__dirname, `logs/${(0, _formatter.getNowDate)()}.log`)
    }
  },
  categories: {
    default: {
      appenders: ['cheese'],
      level: 'error'
    }
  }
});

const logger = _log4js2.default.getLogger('cheese');

_errorHandler2.default.error(app, logger); // 代理


app.use((0, _proxyMiddleware2.default)()); //路由

app.use(_index2.default.routes());
app.listen(PORT, IP, () => {
  console.log(`请访问端口：${PORT}`);
});