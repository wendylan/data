# data-project

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

## 目录结构
<pre>
.
├── README.md           
├── assets               
├── images
├── res              		
├── .babelrc          		//babel-loader配置文件
├── .editorconfig           //编辑器设置
├── .eslintignore           //eslint忽略的设置
├── .eslintrc.js            //eslint的设置
├── .gitignore              //git仓库的忽略设置
├── webpack.config.js  		// webpack配置文件
├── index.html         		// 项目入口文件
├── agentOrder.html         //次终端的项目管理入口
├── brandManage.html        //品牌详情前端页面
├── dataManage.html         //相当于后台数据管理页面
├── freight.html            //运费数据页面
├── historyData.html        //历史数据页面
├── secondaryTerminal.html  //次终端的现货价格指数页面
├── shortageSearch.html     //缺货查询页面
├── sourceRecommend.html    //图表资源推荐页面
├── steelMainPrice.html     //终端的现货价格指数页面
├── steelWebPrice.html      //终端的网价页面
├── userCenter.html         //终端的项目管理页面
├── userDeal.html           //终端的下单管理页面
├── userOrder.html          //终端的我的订单页面
├── package.json       		// 项目配置文件
├── src                		// 生产目录
│   ├── agent_order         		// 次终端项目管理文件
|       ├── index.vue
|       ├── child-components       
|           ├── project-check.vue
|           ├── relate-box.vue
|           ├── user-center.vue
|   ├── brand_manage        //品牌详情文件
|       ├── index.vue
│   ├── components     		// 常用组件
│   ├── data_manage         //后台管理文件
|   ├── dealing_tool        //下单管理
|   ├── form_total          //表单管理
|   ├── freight             //运费数据
|   ├── history_data        //历史数据
|   ├── secondary_terminal  //次终端现货价，买买买，订单管理，资源推荐
|   ├── shortage_search     //缺货查询
|   ├── source_recommend    //图表资源推荐
|   ├── steel_main_price    //终端现货价格指数
|   ├── steel_web_price     //终端网价
|   ├── supplier_order      //现货订单
|   ├── user_center         //终端的项目管理，我的订单
|   ├── user_deal           //终端的下单管理
|   ├── userInfo            //企业信息，注册，用户信息，用户收到的信息
│   ├── vuex          		// vuex状态管理器
│   ├── main.js        		// Webpack 预编译入口
│   └── router.config.js    // vue路由配置文件
</pre>

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).
