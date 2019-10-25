/*
 * @Description: In User Settings Edit
 * @Author: xi.guo
 * @Date: 2019-08-05 14:54:15
 * @LastEditTime: 2019-08-13 14:33:20
 * @LastEditors: Please set LastEditors
 */
import k2c from 'koa2-connect'
import httpProxy from 'http-proxy-middleware'
import url from 'url'

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
}

const getIn = (obj, arr = []) => {
  return arr.reduce((accumulator, currentValue) => {
    if (typeof accumulator === 'object') {
      return accumulator[currentValue]
    }
  }, obj)
}


const proxyMiddleware = () => {
  return async (ctx, next) => {
    for(var proxyKey in proxyMap) {
      if (ctx.url.startsWith(proxyKey)) {
        ctx.respond = false
        const { body } = ctx.request
        const contentType = ctx.request.header['content-type']
        const urlObj = url.parse(global.startalkNavConfig && getIn(global.startalkNavConfig, proxyMap[proxyKey].url))
        const defaultOpt = {}

        if (proxyMap[proxyKey].pathRewrite) {
          defaultOpt.pathRewrite = {
            pathRewrite: {
              [proxyMap.proxyKey.pathRewrite]: urlObj.pathname
            }
          }
        }
  
        await k2c(httpProxy(proxyKey, Object.assign({
          target: `${urlObj.protocol}//${urlObj.host}`,
          changeOrigin: true,
          onProxyReq: (proxyReq) => {
            if (body && contentType.indexOf('application/json') > -1) {
              const bodyData = JSON.stringify(body)
  
              proxyReq.setHeader('Content-Type', 'application/json')
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
              proxyReq.write(bodyData)
            } 
            else if (body && contentType.indexOf('application/x-www-form-urlencoded') > -1) {
              const bodyData = Object.keys(body).map(key => `${key}=${body[key]}`).join('&')
  
              proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded')
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
              proxyReq.write(bodyData)
            }
          }
        }, defaultOpt)))(ctx, next)
      }
    }
  
    await next()
  }
} 

module.exports = proxyMiddleware