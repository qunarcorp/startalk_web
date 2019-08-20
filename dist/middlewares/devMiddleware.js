"use strict";

var _webpackDevMiddleware = require("webpack-dev-middleware");

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 改造成koa中间件
const devMiddleware = (compiler, opts) => {
  const middleware = (0, _webpackDevMiddleware2.default)(compiler, opts);
  return async (ctx, next) => {
    await middleware(ctx.req, {
      end: content => {
        ctx.body = content;
      },
      setHeader: (name, value) => {
        ctx.set(name, value);
      }
    }, next);
  };
};

module.exports = devMiddleware;