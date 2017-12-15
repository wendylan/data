import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import Index from './form_total/index.vue';
import purchaseForm from './form_total/child-components/purchaseForm.vue';
import countForm from './form_total/child-components/countForm.vue';
import brandSellForm from './form_total/child-components/brandSellForm.vue';
import suppilerSellForm from './form_total/child-components/suppilerSellForm.vue';
import projectSellForm from './form_total/child-components/projectSellForm.vue';

Vue.use(VueRouter);
Vue.use(VueResource);

var router = new VueRouter({
	routes:[
		{ path: '/', component: Index, children : [
			{ path : '/purchaseForm', component : purchaseForm },
			{ path : '/countForm', component : countForm },
			{ path : '/brandSellForm', component : brandSellForm },
			{ path : '/suppilerSellForm', component : suppilerSellForm },
			{ path : '/projectSellForm', component : projectSellForm }
		]},
	]
});

new Vue({
	el:'#app',
	router:router,
	template:"<router-view></router-view>"
});
