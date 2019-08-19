/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-05 14:54:15
 * @LastEditTime: 2019-08-13 17:38:00
 * @LastEditors: Please set LastEditors
 */
import Router from 'koa-router'

const router = new Router()


router.get('/reterievepassword', async (ctx, next) => {
  await ctx.render('reterievepassword')
})

router.get('/', async (ctx, next) => {
  const navConfig = JSON.stringify(global.startalkNavConfig)
  const keys = JSON.stringify(global.startalkKeys)
  await ctx.render('index', {
    navConfig,
    keys
  })
})

export default router
