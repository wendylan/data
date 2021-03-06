import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import App from './history_data/index.vue';
import historyData from "./history_data/child-components/history-data.vue";
Vue.use(VueRouter);
Vue.use(VueResource);
Vue.http.options.emulateJSON = true;

var router = new VueRouter({
	routes: [
		{ path: '/', component: App, children : [
			{ path : '/', component : historyData },
		]}
	]
});

new Vue({
	el: '#app',
	router: router,
	template: "<router-view></router-view>"
});
