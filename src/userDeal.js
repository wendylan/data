import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './user_deal/index.vue';
import VueRouter from 'vue-router';
import { Loading } from "element-ui";

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(Loading);
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
