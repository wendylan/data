var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: {
    // 'priceInfo' : './src/priceInfo.js',
    //'dataManage' : './src/dataManage.js',
    // 'freight' : './src/freight.js',
    // 'historyData' : './src/historyData.js',
    // 'sourceRecommend' : './src/sourceRecommend.js',
    'agentOrder' : './src/agentOrder.js',
    'steelWebPrice' : './src/steelWebPrice.js',
    //'steelMainPrice' : './src/steelMainPrice.js',
    'userDeal' : './src/userDeal.js',
    'userCenter' : './src/userCenter.js',
    //'brandManage' : './src/brandManage.js',
    'secondaryTerminal' : './src/secondaryTerminal.js',
    'secondaryTerminalPurchase' : './src/secondaryTerminalPurchase.js',
    'stResource' : './src/stResource.js',
    'userOrder' : './src/userOrder.js',
    'salesOrder' : './src/salesOrder.js',
    'shortageSearch' : './src/shortageSearch.js'
  },
  output: {
    path: path.resolve(__dirname, '../gangerp/public/data/dist'),
    publicPath: './dist/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this nessessary.
            'scss': 'vue-style-loader!css-loader!sass-loader',
            'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: ['babel-loader', 'eslint-loader']
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
