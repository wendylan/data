import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './freight/index.vue';
import VueRouter from 'vue-router';
Vue.use(VueResource);

Vue.use(VueRouter);

var router = new VueRouter({
	routes: [
		{ path: '/', component: App}
	]
});

new Vue({
	el: '#app',
	router: router,
	template: "<router-view></router-view>"
});

