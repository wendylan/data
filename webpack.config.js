var path = require('path')
var webpack = require('webpack')
require('babel-polyfill');

// 为了避免各个开发者output路径不同，请新建output_path.json文件写入自己的路径
// 切勿提交此JSON文件，建议在git中忽略
var mypath = require('./output_path.json')

module.exports = {
    entry: {
        'dataManage' : ["babel-polyfill", './src/dataManage.js'],
        'freight' : ["babel-polyfill", './src/freight.js'],
        'historyData' : ["babel-polyfill",'./src/historyData.js'],
        'sourceRecommend' : ["babel-polyfill", './src/sourceRecommend.js'],
        'agentOrder' : ["babel-polyfill", './src/agentOrder.js'],
        'register' : ["babel-polyfill", './src/register.js'],
        'steelWebPrice' : ["babel-polyfill", './src/steelWebPrice.js'],
        'steelMainPrice' : ["babel-polyfill", "./src/steelMainPrice.js"],
        'shortageSearch' : ["babel-polyfill", './src/shortageSearch.js'],
        'userDeal' : ["babel-polyfill", './src/userDeal.js'],
        'userCenter' : ["babel-polyfill", './src/userCenter.js'],
        'brandManage' : ["babel-polyfill", './src/brandManage.js'],
        'secondaryTerminal' : ["babel-polyfill", './src/secondaryTerminal.js'],
        'secondaryTerminalPurchase' : ["babel-polyfill", './src/secondaryTerminalPurchase.js'],
        'userInfo' : ["babel-polyfill", './src/userInfo.js'],
        'stResource' : ["babel-polyfill", './src/stResource.js'],
        'purchaseOrder' : ["babel-polyfill", './src/purchaseOrder.js'],
        'salesOrder' : ["babel-polyfill", './src/salesOrder.js'],
        'dealingTool' : ["babel-polyfill", './src/dealingTool.js'],
        'formTotal' : ["babel-polyfill", './src/formTotal.js'],
        'supplierOrder' : ["babel-polyfill", './src/supplierOrder.js'],
        'signCompany' : ["babel-polyfill", './src/signCompany.js'],
        'messageList' : ["babel-polyfill", './src/messageList.js'],
        'buybuybuySalesOrder' : ["babel-polyfill", './src/buybuybuySalesOrder.js'],
        'userProject' : ["babel-polyfill", './src/userProject.js'],
        'retrievePassword' : ["babel-polyfill", './src/retrieve-password.js'],
        'modifyPassword' :["babel-polyfill", './src/modifyPassword.js'],
        'vendor' : ['vue', 'element-ui', 'vuex', 'axios', 'vue-router', 'vue-resource', 'lodash', './src/components/same-headerbar.vue', './src//components/ajax-custom.js', './src//components/table.vue']
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
            //     test: /\.vue$/,
            //     enforce: 'pre',
            //     include: /src/,
            //     use: [{
            //         loader: 'eslint-loader',
            //         options: {
            //         formatter: require('eslint-friendly-formatter')
            //         }
            //     }]
            // }
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
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity
        }),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            comments: false,
            compress: {
                warnings: false,
                drop_console: true,
                collapse_vars: true,
                reduce_vars: true,
            }
        })
    ])
}
