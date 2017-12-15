import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './agent_order/index.vue';
import VueRouter from 'vue-router';
import usercenter from "./agent_order/child-components/user-center.vue";
import projectCheck from "./agent_order/child-components/project-check.vue";
import relateBox from "./agent_order/child-components/relate-box.vue";

Vue.use(VueRouter);
Vue.use(VueResource);

Vue.http.interceptors.push((request, next) => {
    request.credentials = 1
	next()
})

var router = new VueRouter({
	routes:[
		{path: '/', component: App, children:[
			{path: '/usercenter', component: usercenter },
			{path: '/projectCheck', component: projectCheck },
			{path: '/relateBox', component: relateBox }
		]}
	]
});

new Vue({
	el:'#app',
	router:router,
	template:"<router-view></router-view>"
});