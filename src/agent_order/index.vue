<script>
	import headbar from "../components/agent-header.vue";
	import orderList from "./child-components/order-list.vue";
	export default {
		components:{
			headbar,
			orderList,
		},
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
		margin:10px 0px 20px 0px;
		border: none;
		border-top:solid 1px #DEDEDE;
	}
	body{
		background-color:#f8f8f8;
	}
</style>