<script>
	export default{
		props : {
			title : {
				type : String
			},
			index : {
				type : String
			},
			sortable : {
				type : Boolean,
				default : false
			},
			filter : {
				type : Boolean,
				default : false
			}
		},
		created(){
			this.$parent.$data.tableLine.push({
				title : this.title,
				key : this.index,
				sortable : this.sortable
			});
		},
		data(){
			return {}
		},
		methods : {

		}
	}
</script>

<template>
	<div class="hide"></div>
</template>

<style scoped>
	*{
		font-family:"微软雅黑";
		padding: 0;
		margin: 0;
	}
	.hide{
		display: none;
	}
</style>
