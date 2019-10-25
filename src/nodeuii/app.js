/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-05 14:54:15
 * @LastEditTime: 2019-08-19 10:24:27
 * @LastEditors: Please set LastEditors
 */
import Koa from 'koa'
import compress from 'koa-compress'
import views from 'koa-views' 
import serve from 'koa-static'
import router from './routes/index'
import path from 'path'
import './dotenv'
import log4js from 'log4js'
import errorHandler from './middlewares/errorHandler.js'
import proxyMiddleware from './middlewares/proxyMiddleware'
import { getNowDate, insertStr } from './utils/formatter'
import request from 'request'

// development webpack-dev-middleware
let webpack, webpackConfig, devMiddleware, hotMiddleware, compiler
if (process.env.NODE_ENV === 'development') {
   webpack = require('webpack')
   const RawModule = require('webpack/lib/RawModule')
   webpackConfig = require('../webpack.config.js')
   devMiddleware = require('./middlewares/devMiddleware')
   hotMiddleware = require('./middlewares/hotMiddleware')

   compiler = webpack(webpackConfig)

   compiler.plugin('emit', (compilation, callback) => {
    const assets = compilation.assets
    let data

    Object.keys(assets).forEach(key => {
      if (key.match(/\.html$/)) {
        data = assets[key].source()
        data = data.replace('<%=navConfig%>', JSON.stringify(global.startalkNavConfig))
        data = data.replace('<%=keys%>', JSON.stringify(global.startalkKeys))
        assets[key] = (new RawModule(data)).source()
      }
    })
    callback()
  })
}

const app = new Koa()
const { PORT, IP, BASEURL, NAVIGATION } = process.env
global.startalkNavConfig = {}
global.startalkKeys = {}

request(`${BASEURL}/${NAVIGATION}`, (error, response, body) => {
  if (!error && response.statusCode == 200) {
    global.startalkNavConfig = JSON.parse(body)

    request(`${global.startalkNavConfig.baseaddess.javaurl}/qtapi/nck/rsa/get_public_key.do`, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      global.startalkKeys = JSON.parse(body).data
    }
  })
  }
})

app.use(compress({
  threshold: 2048
}))

// development webpack-dev-middleware
if (process.env.NODE_ENV === 'development') {
  app.use(devMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
  }))
  app.use(hotMiddleware(compiler))
}

app.use(views(path.join(__dirname , './views'), {
  map: {html: 'ejs' }
}))
app.use(serve(path.join(__dirname , './assets')))

// 错误日志处理
log4js.configure({
  appenders: { cheese: { type: 'file', filename: path.join(__dirname, `logs/${getNowDate()}.log`) } },
  categories: { default: { appenders: ['cheese'], level: 'error' } }
})
const logger = log4js.getLogger('cheese')
 
errorHandler.error(app, logger)

// 代理
app.use(proxyMiddleware())

//路由
app.use(router.routes())

app.listen(PORT, IP, () => {
  console.log(`请访问端口：${PORT}`)
})