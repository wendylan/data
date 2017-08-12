import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import App from './steel_main_price/index.vue';

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
