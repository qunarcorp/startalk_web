"use strict";

var _koa2Connect = require("koa2-connect");

var _koa2Connect2 = _interopRequireDefault(_koa2Connect);

var _httpProxyMiddleware = require("http-proxy-middleware");

var _httpProxyMiddleware2 = _interopRequireDefault(_httpProxyMiddleware);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-05 14:54:15
 * @LastEditTime: 2019-08-13 14:33:20
 * @LastEditors: Please set LastEditors
 */
const proxyMap = {
  '/package': {
    url: ['baseaddess', 'javaurl']
  },
  '/py/search': {
    url: ['ability', 'searchurl']
  },
  '/newapi': {
    url: ['baseaddess', 'httpurl']
  },
  '/api': {
    url: ['baseaddess', 'httpurl']
  },
  '/file': {
    url: ['baseaddess', 'fileurl']
  }
};

const getIn = (obj, arr = []) => {
  return arr.reduce((accumulator, currentValue) => {
    if (typeof accumulator === 'object') {
      return accumulator[currentValue];
    }
  }, obj);
};

const proxyMiddleware = () => {
  return async (ctx, next) => {
    for (var proxyKey in proxyMap) {
      if (ctx.url.startsWith(proxyKey)) {
        ctx.respond = false;
        const {
          body
        } = ctx.request;
        const contentType = ctx.request.header['content-type'];

        const urlObj = _url2.default.parse(global.startalkNavConfig && getIn(global.startalkNavConfig, proxyMap[proxyKey].url));

        const defaultOpt = {};

        if (proxyMap[proxyKey].pathRewrite) {
          defaultOpt.pathRewrite = {
            pathRewrite: {
              [proxyMap.proxyKey.pathRewrite]: urlObj.pathname
            }
          };
        }

        await (0, _koa2Connect2.default)((0, _httpProxyMiddleware2.default)(proxyKey, Object.assign({
          target: `${urlObj.protocol}//${urlObj.host}`,
          changeOrigin: true,
          onProxyReq: proxyReq => {
            if (body && contentType.indexOf('application/json') > -1) {
              const bodyData = JSON.stringify(body);
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
              proxyReq.write(bodyData);
            } else if (body && contentType.indexOf('application/x-www-form-urlencoded') > -1) {
              const bodyData = Object.keys(body).map(key => `${key}=${body[key]}`).join('&');
              proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
              proxyReq.write(bodyData);
            }
          }
        }, defaultOpt)))(ctx, next);
      }
    }

    await next();
  };
};

module.exports = proxyMiddleware;