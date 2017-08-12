import Vue from 'vue';
import App from './source_recommend/index.vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import Loading from "element-ui";
import sourceRecommend from "./source_recommend/child-components/source-recommend.vue";
import sourceContrast from "./source_recommend/child-components/source-contrast.vue";

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(Loading);

var router = new VueRouter({
	routes: [
		{ path: '/', component: App, children : [
			{ path : '/', component : sourceRecommend },
			{ path : '/:name', component : sourceContrast },
		]}
	]
});

new Vue({
	el: '#app',
	router: router,
	template: "<router-view></router-view>"
});

