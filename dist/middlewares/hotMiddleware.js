"use strict";

var _webpackHotMiddleware = require("webpack-hot-middleware");

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

var _stream = require("stream");

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 改造成koa中间件
const PassThrough = _stream2.default.PassThrough;

const hotMiddleware = (compiler, opts) => {
  const middleware = (0, _webpackHotMiddleware2.default)(compiler, opts);
  return async (ctx, next) => {
    let stream = new PassThrough();
    ctx.body = stream;
    await middleware(ctx.req, {
      write: stream.write.bind(stream),
      writeHead: (status, headers) => {
        ctx.status = status;
        ctx.set(headers);
      }
    }, next);
  };
};

module.exports = hotMiddleware;