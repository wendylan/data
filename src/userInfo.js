import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import App from './userInfo/company-info.vue';
import userInfo from './userInfo/userInfo.vue';

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.http.options.emulateJSON = true;

var router = new VueRouter({
	routes :[
		{path: '/', component: App},
		{path: '/userInfo', component: userInfo}
	]
});

new Vue({
	el:'#app',
	router:router,
	template:"<router-view></router-view>"
});
