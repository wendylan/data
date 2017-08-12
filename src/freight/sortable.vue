<script>
	import { Button } from "element-ui";
	export default{
		components:{
			elButton:Button,
		},
		props:['data','col','activeCol'],
		data(){
			return{
				isAscActive:false,
				isDescActive:false
			}
		},
		methods:{
			asc(){
				this.isAscActive=true;
				this.isDescActive=false;
				this.ascsort(this.data);
				this.$emit("asc",{col:this.col,data:this.data});
			},
			desc(){
				this.isDescActive=true;
				this.isAscActive=false;
				this.descsort(this.data);
				this.$emit("desc",{col:this.col,data:this.data});
			},
			ascsort(data){
				// alert('asc');
				for (let i = 0; i < data.length; i++) {
					for (let j = i+1; j < data.length; j++) {
						if(parseInt(data[i][this.col])>parseInt(data[j][this.col])){
							let content=null;
							content=data[j];
							data[j]=data[i];
							data[i]=content;
						}
					}
				}
			},
			descsort(data){
				// alert('desc');
				for (let i = 0; i < data.length; i++) {
					for (let j = i+1; j < data.length; j++) {
						if(parseInt(data[i][this.col])<parseInt(data[j][this.col])){
							let content=null;
							content=data[j];
							data[j]=data[i];
							data[i]=content;
						}
					}
				}
			}
		},
		watch:{
			activeCol(newv,oldv){
				// alert(newv);
				if(newv!=this.col){
					this.isAscActive=false;
					this.isDescActive=false;
				}
			}
		}
	}
</script>
<template>
	<div class="sort-icon">
		<el-button type="text" @click="asc">
			<div v-bind:class="{active:isAscActive}">
				<i class="el-icon-caret-top"></i>
			</div>
		</el-button>
		<el-button type="text" @click="desc">
			<div v-bind:class="{active:isDescActive}">
				<i class="el-icon-caret-bottom"></i>
			</div>
		</el-button>
	</div>
</template>
<style scoped>
	.sort-icon{
		margin-top: 2.5px;
		float: left;
		line-height: 0.5;
		width: 12.06px;
		height: 24.05px;
	}
	.el-button--text{
		line-height: 0.5;
		color:#c0ccda;
		padding:0px 0px;
		font-size: 5px;
		margin-left: 0.01px;
	}
	.el-icon-caret-top{
		line-height: 0.5;
	}
	.el-icon-caret-buttom{
		line-height: 0.5;
	}
	.active{
		line-height: 0.5;
		color:#99a9bf;
		margin-left: 0.01px;
	}
</style>