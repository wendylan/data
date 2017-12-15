import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import App from './userInfo/sign-company.vue';

Vue.use(VueRouter);
Vue.use(VueResource);

var router = new VueRouter({
	routes: [
		{
			path: '/', component: App
		},

	]
});

new Vue({
	el: '#app',
	router: router,
	template: "<router-view></router-view>"
});
