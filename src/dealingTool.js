import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './dealing_tool/index.vue';
import VueRouter from 'vue-router';
import { Loading } from "element-ui";
import store from './vuex/store';
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
	store: store,
	template: "<router-view></router-view>"
});
