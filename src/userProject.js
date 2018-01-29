import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import App from './user_center/user-center.vue';

import store from './vuex/store';

Vue.use(VueRouter);
Vue.use(VueResource);

var router = new VueRouter({
	routes :[
		{path: '/', component: App}
	]
});

new Vue({
	el:'#app',
	router:router,
	store:store,
	template:"<router-view></router-view>"
});
