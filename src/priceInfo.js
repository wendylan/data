import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './steels_price/index.vue';
import dealApp from './steels_price/steel-deal.vue';
import VueRouter from 'vue-router';
import Loading from "element-ui";
import priceList from "./steels_price/child-components/price-list.vue";
import priceInfo from "./steels_price/child-components/price-information.vue";

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(Loading);
Vue.http.options.emulateJSON = true;

var router = new VueRouter({
	routes: [
		{
			path: '/', component: App, children : [
				{ path : '/', component : priceList },
				{ path : '/:id', component : priceInfo }
			]
		},
		{
			path : '/steel/deal', component : dealApp
		}
	]
});

new Vue({
	el: '#app',
	router: router,
	template: "<router-view></router-view>"
});
