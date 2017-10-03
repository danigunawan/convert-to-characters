var path = require('path')
var webpack = require('webpack')
var ExtractTextWebpackPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    "bootstrap-loader", "./translation/static/js/web_speech_script.js",
  ],
  output: {
    path: __dirname + "/translation/static/js",
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      // Checks for any js file not in node_modules directory and run them through babel loader and use es2015 preset
      // Converts es6 javascript to old javascript syntax since es6 javascript has low browser support
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      // css-loader = loads content of css files
      // style-loader = injects the css into the page
      // any file that ends with .css not in node_modules directory should be processed
      // loader: 'style!css' is short for 'style-loader!css-loader'
      // loader is basically saying ['style-loader', 'css-loader'] => loads from left to right
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: ExtractTextWebpackPlugin.extract({  // take all css files, combined their contents and extract them to styles.css
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.(jpe?g|png|woff|woff2|eot|ttf|svg)$/i,
        loader: 'url-loader',
        options: {
          limit: 25000
        }
      }
    ]
  },
  plugins: [
    new ExtractTextWebpackPlugin('translation-page.css'),     // extract to styles.css file
    new webpack.ProvidePlugin({       // inject es5 modules as global variables throughout the project
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new HtmlWebpackPlugin({
      favicon: 'translation/static/css/favicon.png'
    })
  ]
}
