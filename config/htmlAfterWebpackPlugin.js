/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-05 14:54:15
 * @LastEditTime: 2019-08-13 15:49:43
 * @LastEditors: Please set LastEditors
 */
const HtmlWebpackPlugin = require('html-webpack-plugin')
const pluginName = "htmlAfterWebpackPlugin"

const assetHelper = (assetJson = []) => {
	const css = []
	const js = []
	const assets = {
		js: (item) => `<script src="scripts/${item}"></script>`,
		css: (item) => `<link rel="stylesheet" href="styles/${item}"/>`
	}
	const cssReg = /.css$/
	const jsReg = /.js$/

	assetJson.map(item => {
		if (cssReg.test(item)) {
			css.push(assets.css(item.slice(item.lastIndexOf('/')+1)))
		}
		if (jsReg.test(item)) {
			js.push(assets.js(item.slice(item.lastIndexOf('/')+1)))
		}
	})

	return {
		js,
		css
	}
}

class htmlAfterWebpackPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap(pluginName, (compilation) => {
			HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tapAsync(
				pluginName,
				(data, cb) => {
					const { html, plugin } = data
					let _html = html
					const assets = assetHelper(JSON.parse(plugin.assetJson))

					_html = _html.replace('<!--injectcss-->', assets.css.join(''))
					_html = _html.replace('<!--injectjs-->', assets.js.join(''))

					data.html = _html
					cb(null, data)
				}
			)
		})
	}
}
module.exports = htmlAfterWebpackPlugin