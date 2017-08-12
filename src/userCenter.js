import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import App from './user_center/index.vue';
import userCenter from './user_center/user-center.vue';
import userOrder from './user_center/user-order.vue';

Vue.use(VueRouter);  
Vue.use(VueResource);

Vue.http.interceptors.push((request, next) => {
    request.credentials = 1
	next()
})

var router = new VueRouter({
	routes :[
		{path: '/', component: App, children:[
			{path: '/userCenter', component: userCenter },
			{path: '/userOrder', component: userOrder }
		]}
	]
});

new Vue({
	el:'#app',
	router:router,
	template:"<router-view></router-view>"
});