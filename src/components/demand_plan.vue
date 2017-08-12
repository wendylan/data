<script>
	import {Input, Button} from "element-ui";
	import ajaxCustom from './ajax-custom.js';
	export default{
		components : {
			elInput : Input,
			elButton : Button
		},
		props : ['brand'],
		methods : {
			record(value, size, material, spec, brand){
				var selectInfo = this.selectInfo;
				if (value) {
					for (var i = selectInfo.length - 1; i >= 0; i--) {
						if(
							selectInfo[i].brand==brand&&
							selectInfo[i].spec==spec&&
							selectInfo[i].material==material&&
							selectInfo[i].size==size
						){
							selectInfo[i].value=value;
							return;
						}
					}
					selectInfo.push({'brand' : brand, 'spec' : spec, 'material' : material, 'size' : size, 'value' : value});
				}else{
					for (let i = selectInfo.length - 1; i >= 0; i--) {
						if(
							selectInfo[i].brand==brand&&
							selectInfo[i].spec==spec&&
							selectInfo[i].material==material&&
							selectInfo[i].size==size
						){
							selectInfo.splice(i, 1);
							break;
						}
					}
				}
			},
			confirm(data){
				if (data) {
					this.$emit("confirm", data);
				}else{
					this.$emit("cancel");
				}
			}
		},
		created(){
			var brand = this.brand;
			ajaxCustom.ajaxGet(this, "dingoapi/getBrandSpec", { params : { 'brand' : brand } }, (responese)=>{
				console.log(responese);
				this.brandInfo=responese.body.data;
			}, (responese)=>{
				alert(responese.body.message);
			});
		},
		data(){
			return {
				brandInfo : [],
				selectInfo :[]
			}
		},
	}
</script>
<template>
	<div class='main'>
		<h1>需求计划单</h1>
		<div class="floatclear">
			<div class="box bigBox" v-for='spec in brandInfo'>
				<h4 class="spec_header"><b>{{spec.name}}</b></h4>
				<div class="box" v-for='material in spec.material'>
					<b>{{material.name}}</b>
					<div >
						<span v-for='size in material.size'>
							<span class='set_width'>{{size.name}}</span>
							<el-input size="small" v-model='size.value' @change='record(size.value,size.name,material.name,spec.name,brand)' type="number" style="margin-top:10px;">
							</el-input>吨<br>
						</span>
					</div>
				</div>
			</div>
		</div>
		<div class='floatclear' style="margin-left:-25px;">
			<el-button @click="confirm(selectInfo)">确定</el-button>
			<el-button @click="confirm()">跳过</el-button>
		</div>
	</div>
</template>
<style scoped>
	.main{
		text-align: center;
		margin: 0 auto;
		width: 1280px;
	}
	.floatclear{
		clear: both;
		width: 100%;
		margin: 0 auto;
		margin-top: 20px;
		text-align: center;
	}
	.el-input{
		width: 150px;
	}
	.el-select{
		width: 150px;
	}
	.bigBox{
		background-color: rgba(238,241,246,1);
	}
	.box{
		float: left;
		margin: 10px;
		padding: 10px;
		border-color: #88a;
		width: 46.5%;
	}
	h4{
		text-align: center;
	}
	.spec_header{
		background-color: rgba(238,241,246,1);
		padding: 10px 0;
	}
	.set_width{
		width: 20px;
		display: inline-block;
	}
</style>
