import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './secondary_terminal/buybuybuyOrder/user-order.vue';
import store from './vuex/store';
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
	store: store,
	template: "<router-view></router-view>"
});
