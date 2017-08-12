<script>
	import headbar from "../components/headbar.vue";
	import { Button } from 'element-ui'
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
		<headbar :active_number="2"></headbar>
		<router-view ></router-view>
	</div>
</template>

<style scoped>
	*{
		font-family:"微软雅黑";
	}
	.main-warpper{
		width:1280px;
		margin:auto;
		padding:25px;
		color:#1F2D3D;
	}
	h1,h4{
		font-weight:400;
	}
	h4{
		color:#000;
	}
	body{
		background-color:#f8f8f8;
	}
</style>