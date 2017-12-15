import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './secondary_terminal/index.vue';
import DemandPlan from './components/demand_plan.vue';
import resource from './secondary_terminal/resource.vue';
import purchase from './secondary_terminal/purchase.vue';
import salesOrder from './secondary_terminal/sales-order.vue';
import purchaseOrder from './secondary_terminal/purchase-order.vue';

import VueRouter from 'vue-router';

Vue.use(VueRouter);
Vue.use(VueResource);

Vue.http.options.emulateJSON = true;

Vue.http.interceptors.push((request, next) => {
    request.credentials = 1
	next()
})

var router = new VueRouter({
	routes: [
		{
			path: '/', component: App
		},
		{
			path: '/demand_plan', component: DemandPlan
		},
		{
			path: '/resource', component: resource
		},
		{
			path: '/purchase', component: purchase
		},
		{
			path: '/salesOrder', component: salesOrder
		},
		{
			path: '/purchaseOrder', component: purchaseOrder
		},


	]
});

new Vue({
	el: '#app',
	router: router,
	template: "<router-view></router-view>"
});
