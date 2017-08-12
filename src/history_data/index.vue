<script>
	import headbar from "../components/headbar.vue";
	export default{
		components : {
			headbar
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
		<headbar :active_number="4"></headbar>
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