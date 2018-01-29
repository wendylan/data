var path = require('path')
var webpack = require('webpack')

// 为了避免各个开发者output路径不同，请新建output_path.json文件写入自己的路径
// 切勿提交此JSON文件，建议在git中忽略
var mypath = require('./output_path.json')

module.exports = {
  entry: {
    'dataManage' : './src/dataManage.js',
    'freight' : './src/freight.js',
    'historyData' : './src/historyData.js',
    'sourceRecommend' : './src/sourceRecommend.js',
    'agentOrder' : './src/agentOrder.js',
    'register' : './src/register.js',
    'steelWebPrice' : './src/steelWebPrice.js',
    'steelMainPrice' : './src/steelMainPrice.js',
    'shortageSearch' : './src/shortageSearch.js',
    'userDeal' : './src/userDeal.js',
    'userCenter' : './src/userCenter.js',
    'brandManage' : './src/brandManage.js',
    'secondaryTerminal' : './src/secondaryTerminal.js',
    'secondaryTerminalPurchase' : './src/secondaryTerminalPurchase.js',
    'userInfo' : './src/userInfo.js',
    'stResource' : './src/stResource.js',
    'purchaseOrder' : './src/purchaseOrder.js',
    'salesOrder' : './src/salesOrder.js',
    'dealingTool' : './src/dealingTool.js',
    'formTotal' : './src/formTotal.js',
    'supplierOrder' : './src/supplierOrder.js',
    'signCompany' : './src/signCompany.js',
    'messageList' : './src/messageList.js',
    'buybuybuySalesOrder' : './src/buybuybuySalesOrder.js',
    'userProject' : './src/userProject.js'
  },
  output: {
    path: path.resolve(__dirname, mypath),
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
    },
    // {
    //   test: /\.vue$/,
    //   enforce: 'pre',
    //   include: /src/,
    //       use: [{
    //           loader: 'eslint-loader',
    //           options: {
    //               formatter: require('eslint-friendly-formatter')
    //           }
    //   }]
    //   }
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
