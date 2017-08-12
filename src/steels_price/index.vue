<script>
	import headbar from "../components/headbar.vue";
	import priceList from "./child-components/price-list.vue";
	import priceInfo from "./child-components/price-information.vue";
	import { Button } from 'element-ui'
	export default{
		components : {
			headbar,
			priceList,
			priceInfo,
			elButton : Button
		},
		created(){
				// 全局变量 配合组件通信
				window.$vueData = {};
		},
		data(){
			return {
				msg : "Here is a test !"
			}
		}
	}
</script>

<template>
	<div>
		<headbar :active_number="1"></headbar>
		<router-view></router-view>
	</div>
</template>

<style>
	*{
		font-family:"微软雅黑";
	}
	hr{
		margin:30px 0px 50px 0px;
		border: none;
		border-top:solid 1px #DEDEDE;
	}
	body{
		background-color:#f8f8f8;
	}
</style>
