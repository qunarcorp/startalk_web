const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
  watch:true,
  watchOptions:{
    ignored: /node_modules/
  },
  mode: 'development',
  stats: {
    children: false,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: './styles/[name].css'
    })
  ]
}