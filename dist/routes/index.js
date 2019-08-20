"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _koaRouter = require("koa-router");

var _koaRouter2 = _interopRequireDefault(_koaRouter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-05 14:54:15
 * @LastEditTime: 2019-08-13 17:38:00
 * @LastEditors: Please set LastEditors
 */
const router = new _koaRouter2.default();
router.get('/reterievepassword', async (ctx, next) => {
  await ctx.render('reterievepassword');
});
router.get('/', async (ctx, next) => {
  const navConfig = JSON.stringify(global.startalkNavConfig);
  const keys = JSON.stringify(global.startalkKeys);
  await ctx.render('index', {
    navConfig,
    keys
  });
});
exports.default = router;