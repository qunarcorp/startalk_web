const errorHandler = {
	error(app, logger){
		app.use(async (ctx, next) => {
			try {
				await next()
			} catch (error) {
				logger.error(error)
				ctx.status = error.status || 500
				ctx.body = "error page"
			}
    })
		app.use(async (ctx, next) => {
			await next()
			if(404 != ctx.status) return
			ctx.status = 404
			ctx.response.redirect('/')
		})
	}
}
//
export default errorHandler