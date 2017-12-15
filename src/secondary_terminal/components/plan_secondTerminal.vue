<script>
	import ajaxCustom from '../../components/ajax-custom.js';
	import projectChanger from '../../components/project_to_text.js';
	import createProjectBox from '../../components/ProjectCreating/project-creating-box.vue';
	import {Input, Button, Dialog, Radio, MessageBox, Message, Select, Option} from "element-ui";
	export default{
		props : {
			open : {
				default : false,
				type : Boolean
			}
		},
		components : {
			createProjectBox,
			elInput : Input,
			elButton : Button,
			elDialog : Dialog,
			elRadio : Radio,
			elSelect : Select,
			elOption : Option,
		},
		data(){
			return {
				// 项目
				project : {
					list : [],
					selected : null,
					info : { name : "", brands : "" }
				},
				brandInfo : [],
				selectInfo :[],
				openBox : false,
				brands : [],
				project_id : null,
				open_plan : false,
			}
		},
		created(){
			this.getAllBrands();
			this.getAllPorject();
		},
		methods : {
			// 获取所有项目
			getAllPorject(){
				ajaxCustom.ajaxGet(this, "dingoapi/getUserProject", (response)=>{
					console.log(response);
					response = response.body;
					this.project.list = response.reverse();
				}, (response)=>{
					alert(response.body.message);
				});
			},
			// 获取所有品牌
			getAllBrands(){
				ajaxCustom.ajaxGet(this, 'dingoapi/getAllProduct', (a)=>{
					for(let item of a.data.brand){
						this.brands.push(item.brand);
					}
				}, (a)=>{
					console.log(a.data.message);
				});
			},
			// 添加项目
			addProject(formDatas){
				ajaxCustom.ajaxPost(this, "dingoapi/addProjectDatas", formDatas, (response)=>{
					console.log(response)
					this.project.list = response.body.data.reverse();
					this.project.selected = this.project.list[0].project_info_id;
					alert("添加成功");
				}, (response)=>{
					alert(response.body.message);
				});
			},
			// 改变项目，改变结算条件等
			changeProject(id){
				if(id){
					for(let pro of this.project.list){
						if(pro.project_info_id == id){
							this.brands = pro.brands;
							this.project.info.brands = pro.brands;
							this.project.info.name = pro.name;
							this.project.info.province = pro.province;
							this.project.info.city = pro.city;
							this.project.info.area = pro.area;
							this.project.info.addr = pro.addr;
							this.project.info.settlementText =  projectChanger.todo(pro, true);
							this.project_id = id;
						}
					}
				}
			},
			// 有输入的进行整合
			record(value, size, material, spec){
				var selectInfo = this.selectInfo;
				if (value) {
					for (var i = selectInfo.length - 1; i >= 0; i--) {
						if(
							selectInfo[i].spec==spec&&
							selectInfo[i].material==material&&
							selectInfo[i].size==size
						){
							selectInfo[i].value=value;
							return;
						}
					}
					selectInfo.push({'spec' : spec, 'material' : material, 'size' : size, 'value' : value});
				}else{
					for (let i = selectInfo.length - 1; i >= 0; i--) {
						if(
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
			// 获取计划单的数据
			getBrandData(){
				let brand = this.brands;
				if(brand.length){
					ajaxCustom.ajaxGet(this, "dingoapi/getBrandGroupSpec", { params : { 'brand' : brand } }, (responese)=>{
						console.log(responese);
						let brandData = responese.body.data;
						this.brandInfo = this.sortData(brandData);
					}, (responese)=>{
						alert(responese.body.message);
					});
				}
			},
			// 发送计划单
			send(){
				let count = 0;
				for(let i = 0; i < this.selectInfo.length; i++){
					count += parseInt(this.selectInfo[i].value);
				}
				if(count <= 0){
					Message.info("请输入数量");
					return;
				}
				if(count < 30){
					MessageBox.confirm('当前吨数较少，无法确定订单可配车', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					}).then(() => {
						ajaxCustom.ajaxPost(this, "dingoapi/serviceSaveOrder", {data : this.selectInfo, project_id:this.project_id}, (responese)=>{
							console.log(responese);
							window.location.reload();
							// alert(responese.body.message);
						}, (responese)=>{
							alert(responese.body.message);
						});
					});
				}else{
					ajaxCustom.ajaxPost(this, "dingoapi/serviceSaveOrder", {data : this.selectInfo, project_id:this.project_id}, (responese)=>{
						console.log(responese);
						window.location.reload();
					}, (responese)=>{
						alert(responese.body.message);
					});
				}
				this.open_plan = false;
			},
			// 排序一下把400E放前面
			sortData(arr){
				for(let i = 0; i < arr.length; i++){
					arr[i].material.sort(function(a, b){
						let tmpA = a.name.replace("HRB400", 1);
						let tmpB = b.name.replace("HRB400E", 2);
						return tmpB - tmpA;
					});
					for(let size of arr[i].material){
						size.size.sort(function(a, b){
							let tmpS1 = a.name.replace("36", 36);
							let tmpS2 = b.name.replace("40", 40);
							return tmpS1 -tmpS2;
						});
					}
				}
				return arr;
			}
		},
		watch : {
			brands(){
				this.getBrandData();
			},
			open(){
				this.open_plan = true;
			}
		},
	}
</script>
<template>
	<div>
		<el-dialog v-model="open_plan" size="large" title="下单" style="text-align: center;">
			<div class='main_la'>
				<div style="background-color: #fff;padding: 10px 0;padding-left: 25px;clear: both;text-align: left;">
					<div v-show="!project.selected">
						<span>选择项目 ： </span>
						<el-select v-model="project.selected" size="small" @change="changeProject">
							<el-option v-for="item of project.list" :value="item.project_info_id" :label="item.name"></el-option>
						</el-select>
						<el-button @click="openBox = !openBox" size="small" style="padding: 8px;">新建</el-button>
					</div>
					<div class="project-info" v-show="project.selected">
						<p>
							<span class="set-weight">项目名称：</span>{{ project.info.name }} <i class="el-icon-edit" @click="project.selected=null"></i>
							<span class="set-weight" style="margin-left: 20px;">项目地址：</span>{{ project.info.province + project.info.city + project.info.area + project.info.addr }}
						</p>
						<p><span class="set-weight">结算条件：</span>{{ project.info.settlementText }}</p>
						<p><span class="set-weight">品牌范围：</span> <span v-for="item of project.info.brands">{{ item }}  </span></p>
					</div>
				</div>

				<div class="floatclear">
					<!-- <h1>需求计划单</h1> -->
					<div class="box bigBox" v-for='spec in brandInfo'>
						<h4 class="spec_header"><b>{{spec.name}}</b></h4>
						<p>单位:吨</p>
						<div class="smallbox" v-for='material in spec.material'>
							<b>{{material.name}}</b>
							<div>
								<span v-for='size in material.size'>
									<span class='set_width'>Ф{{size.name}}</span>
									<el-input size="small" v-model='size.value' @change='record(size.value,size.name,material.name,spec.name)' type="number" min="0" class="inline_box">
									</el-input><br>
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class='foot'>
				<p>
					<el-button @click="send()" type="primary" class="same_test">发送计划单</el-button>
				</p>
			</div>
		</el-dialog>

		<create-project-box :open-box="openBox" @getFormDatas="addProject" style="z-index: 4444;"></create-project-box>
	</div>
</template>
<style scoped>
	.main_la{
		margin: 0 auto;
		padding: 15px;
		margin-bottom: 50px;
		max-width: 1280px;
		z-index: 2;
	}
	.floatclear{
		clear: both;
		padding-left: 15px;
		min-height: 600px;
		background-color: #fff;
		padding-top: 5px;
	}
	.foot {
		position: fixed;
	    bottom: 0px;
	    left: 0px;
	    width: 100%;
	    height: 50px;
	    line-height: 50px;
	    z-index: 2;
	    padding: 8px 0;
	    text-align: center;
	    background: aliceblue;
	}
	.foot p{
		text-align: center;
		height: 50px;
	    line-height: 50px;
	}
	.el-input{
		width: 80px;
	}
	.el-select{
		width: 150px;
	}
	.bigBox{
		background-color: rgba(238,241,246,1);
	}
	div.bigBox:nth-of-type(3){
		margin-top: 10px;
		padding-bottom: 25px;
	}
	.box{
		text-align: center;
		float: left;
		margin: 0 5px 5px 5px;
		border-color: #88a;
		width: 48.4%;
	}
	.smallbox{
		display: inline-table;
		text-align: center;
		margin: 8px auto;
		padding: 10px;
		border-color: #88a;
	}
	h4{
		text-align: center;
	}
	.spec_header{
		background-color: rgba(238,241,246,1);
		padding: 5px 0;
	}
	.set_width{
		width: 30px;
		display: inline-block;
	}
	.inline_box{
		width: 80px;
		margin-top: 10px;
	}
	.same_test{
		width: 100px;
		padding: 10px 8px;
	}
	.project-info span.set-weight{
		font-weight: bold;
		color: #666;
	}
	.project-info i{
		font-size: 16px;
    	color: #BBB;
		cursor:pointer;
	}
	@media screen and (min-width: 768px){
		.smallbox{
			margin: 2px;
		}
		.inline_box{
			width: 60px;
		}
	}
	@media screen and (min-width: 992px){
		.smallbox{
			margin: 5px;
		}
		.inline_box{
			width: 60px;
		}
	}
</style>
