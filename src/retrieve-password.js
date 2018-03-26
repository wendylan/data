import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import store from './vuex/store';
import App from './userInfo/retrieve-password.vue';

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.http.options.emulateJSON = true;

var router = new VueRouter({
	routes :[
		{path: '/', component: App},
	]
});

new Vue({
	el:'#app',
	router:router,
	store:store,
	template:"<router-view></router-view>"
});
