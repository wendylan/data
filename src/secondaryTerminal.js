import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './secondary_terminal/index.vue';
import DemandPlan from './components/demand_plan.vue';
import resource from './secondary_terminal/resource.vue';
import store from './vuex/store';
import VueRouter from 'vue-router';

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.http.options.emulateJSON = true;

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

	]
});

new Vue({
	el: '#app',
	router: router,
	store: store,
	template: "<router-view></router-view>"
});
