import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import Index from './data_manage/index.vue';
import dataList from "./data_manage/child-components/data-list.vue";
import checkMarketdata from "./data_manage/child-components/check-market-data.vue";
import createWebdata from "./data_manage/child-components/create-web-data.vue";
import priceRangeData from "./data_manage/child-components/price-change-data.vue";
import createBrandsData from "./data_manage/child-components/create-brands-data.vue";
import checkFreightData from "./data_manage/child-components/check-freight-data.vue";
import createFreightData from "./data_manage/child-components/create-freight-data.vue";
import checkWebData from "./data_manage/child-components/check-web-data.vue";
import marketRuleData from "./data_manage/child-components/market-rule-data.vue";
import dataSearch from "./data_manage/child-components/report-record.vue";
import marketPriceData from "./data_manage/child-components/market-price-data.vue";

import priceSourceData from "./data_manage/child-components/price_source_data.vue";
import brandManageData from "./data_manage/child-components/brand_manage_data.vue";
import carInfoData from "./data_manage/child-components/car_info_data.vue";
// import store from './vuex/store';
Vue.use(VueRouter);
Vue.use(VueResource);
Vue.http.options.emulateJSON = true;
Vue.http.interceptors.push((request, next) => {
        // 请求发送前的处理逻辑
    next((response) => {
        // 请求发送后的处理逻辑
		if(response.status == 403){
			response.body.message = "没有权限";
			window.location.href = '/dataManage';
		}else{
			return response
		}
    })
})

var router = new VueRouter({
	routes : [
		{ path : '/', component : Index, children : [
			{ path : '/', component : dataList },
			{ path : '/check_market_data/:id', component : checkMarketdata },
			{ path : '/create_web_data', component : createWebdata },
			{ path : '/priceRangeData', component : priceRangeData },
			{ path : '/create_brands_data', component : createBrandsData },
			{ path : '/freightData', component : checkFreightData },
			{ path : '/create_freight_data', component : createFreightData },
			{ path : '/check_web_data/:time', component : checkWebData },
			{ path : '/market_rule_data', component : marketRuleData },
			{ path : '/data_search', component : dataSearch },

			{ path : '/price_source_data', component : priceSourceData },
			{ path : '/brand_manage_data', component : brandManageData },
			{ path : '/car_info_data', component : carInfoData },
            { path : '/market_price_data/:id', component : marketPriceData }
		]}
	]
});

new Vue({
	el: '#app',
	router: router,
	// store: store,
	template: "<router-view></router-view>"
});
