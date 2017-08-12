<script>
	import headbar from "../components/headbar.vue";
	// import ajaxCustom from '../components/ajax-custom.js';
	export default{
		components : {
			headbar
		}
	}
</script>

<template>
	<div>
		<headbar></headbar>
		<router-view></router-view>
	</div>
</template>

<style>
	*{
		font-family:"微软雅黑";
	}
	.el-notification__title{
		font-weight: 400;
		font-size: 16px;
		color: #1f2d3d;
	}
	.el-notification__content {
	    font-size: 14px;
	    line-height: 21px;
	    margin: 10px 0 0;
	    color: #8391a5;
	    text-align: justify;
	}
	hr{
		margin:30px 0px 30px 0px;
		border: none;
		border-top:solid 1px #DEDEDE;
	}
	body{
		background-color:#f8f8f8;
	}
</style>