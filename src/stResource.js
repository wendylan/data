import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import App from './secondary_terminal/resource.vue';
import brandManage from './brand_manage/index.vue';

Vue.use(VueRouter);
Vue.use(VueResource);

var router = new VueRouter({
	routes:[
		{ path: '/', component: App, children : []},
		{ path : '/brandManage', component : brandManage }
	]
});

new Vue({
	el:'#app',
	router:router,
	template:"<router-view></router-view>"
});