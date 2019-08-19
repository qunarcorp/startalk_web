const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

// 生产环境打包文件加 hash
module.exports = {
  mode: "production",
  output: {
    filename: 'scripts/[name].[hash:8].js'
  },
  plugins: [
    new CleanWebpackPlugin({
      root: __dirname + 'dist/assets'
    }),
    new MiniCssExtractPlugin({
      filename: './styles/[name].[hash:8].css'
    }),
    // 分析文件打包
    new BundleAnalyzerPlugin()
  ]
}