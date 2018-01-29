import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import order from './supplier_order/index.vue';
import store from './vuex/store';
Vue.use(VueRouter);
Vue.use(VueResource);
Vue.http.options.emulateJSON = true;

var router = new VueRouter({
	routes :[
		{path: '/', component: order}
	]
});

new Vue({
	el:'#app',
	router:router,
	store:store,
	template:"<router-view></router-view>"
});
