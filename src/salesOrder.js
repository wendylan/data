import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './secondary_terminal/sales-order.vue';

import VueRouter from 'vue-router';

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.http.options.emulateJSON = true;

var router = new VueRouter({
	routes: [
		{
			path: '/', component: App
		}
	]
});

new Vue({
	el: '#app',
	router: router,
	template: "<router-view></router-view>"
});
