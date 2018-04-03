<!--
	组件元素的解析：
	brands为一个品牌数组,
	way如果为true则为次终端页面也就是可以选择价格排序,false为确认按钮则没有价格排序
-->

<script>
	import {Input, Button, Dialog, Radio, MessageBox, Message} from "element-ui";
	import ajaxCustom from './ajax-custom.js';
	import {mapGetters} from 'vuex';
	export default{
		components : {
			elInput : Input,
			elButton : Button,
			elDialog : Dialog,
			elRadio : Radio,
		},
        data(){
            return {
                brandInfo : [],
                selectInfo :[],
                showSort : false,
                sortWay : null
            }
        },
		computed: {
			...mapGetters([
				'getsocket'
			])
        },
		props : ['brands', 'way', 'project_id', "cancel", "data"],
		methods : {
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
            // 终端的自选品牌,次终端的确认
			confirm(data){
				if (data) {
					if(this.sortWay){
						this.$emit("confirm", { selectData : data, way : this.sortWay});
					}else{
						if(!this.project_id){
							alert('请选择项目！！');
							return ;
						}
						this.$emit('confirm', { selectData : data });
					}
				}else{
					this.$emit("cancel");
				}
				this.showSort = false;
			},
            // 根据传进来的品牌获取品名，材质，规格等数据
			getBrandData(){
				let brand = this.brands;
				this.selectInfo = [];
				if(brand.length){
					ajaxCustom.ajaxGet(this, "dingoapi/getBrandGroupSpec", { params : { 'brand' : brand } }, (responese)=>{
						console.log(responese);
						let brandData = responese.body.data;
						this.brandInfo = this.sortData(brandData);
						console.log(this.brandInfo);
					}, (responese)=>{
						alert(responese.body.message);
					});
				}
			},
            // 终端的发送计划单
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
						ajaxCustom.ajaxPost(this, "dingoapi/savePlanOrder", {data : this.selectInfo, project_id:this.project_id}, (responese)=>{
							console.log(responese);
							// this.send_notify();
							window.location.href='/usercenter#/userorder';
						}, (responese)=>{
							alert(responese.body.message);
						});
					});
				}else{
					ajaxCustom.ajaxPost(this, "dingoapi/savePlanOrder", {data : this.selectInfo, project_id:this.project_id}, (responese)=>{
						console.log(responese);
						// this.send_notify();
						window.location.href='/usercenter#/userorder';
					}, (responese)=>{
						alert(responese.body.message);
					});
				}
			},
            // 调整顺序材质：HRB400E，HRB400；规格：40， 36
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
			},
            // 发送计划单的时候进行通知
			send_notify() {
				var that = this;
				console.log(that);
                that.getsocket.send(this.data.info.supplier_id);
            },
		},
		watch : {
			brands(){
				this.getBrandData();
			}
		},
	}
</script>
<template>
	<div>
		<div class='main'>
			<div class="floatclear">
				<!-- <h1>需求计划单</h1> -->
				<div style="text-align: center;height: 650px;margin-left: 15px;padding-top: 15px;">
					<div class="box bigBox" v-for='(spec, spkey) in brandInfo' :key="spkey">
						<h4 class="spec_header"><b>{{spec.name}}</b></h4>
						<p>单位:吨</p>
						<div class="smallbox" v-for='(material, mkey) in spec.material' :key="mkey">
							<b>{{material.name}}</b>
							<div>
								<span v-for='(size, sikey) in material.size' :key="sikey">
									<span class='set_width'>Ф{{size.name}}</span>
									<el-input size="small" v-model='size.value' @change='record(size.value,size.name,material.name,spec.name)' type="number" min="0" class="inline_box">
									</el-input><br>
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class='foot'>
			<p>
				<el-button @click="send()" v-if="way==false" type="primary" class="same_test">发送计划单</el-button>
				<el-button @click="confirm(selectInfo)" v-if="way==false" type="success" class="same_test">自选品牌</el-button>
				<el-button @click="showSort=!showSort" v-if="way==true" type="primary" class="same_test">选择价格排序</el-button>
				<el-button @click="confirm()" v-if="!cancel" class="same_test">跳过</el-button>
			</p>
		</div>

		<el-dialog v-model="showSort"  title="选择排序标准"  size="small">
			<span>选择显示价格的排序标准：</span>
			<el-radio v-model="sortWay" :label='1'>差价最大</el-radio>
			<el-radio v-model="sortWay" :label='2' >现货价最低</el-radio>
			<el-radio v-model="sortWay" :label='3' >同仓库优先</el-radio>
			<el-radio v-model="sortWay" :label='4' >同品牌优先</el-radio>

			<div slot="footer" class="dialog-footer" style="clear:both;text-align:center;">
				<el-button type="primary" @click='confirm(selectInfo)'>确认</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<style scoped>
	.main{
		clear: both;
		margin: 0 auto;
		padding: 0 15px;
		margin-bottom: 50px;
		max-width: 1280px;
	}
	.floatclear{
		clear: both;
		margin: 15px 15px 50px 15px;
		min-height: 650px;
		background-color: #fff;
	}
	.foot {
		position: fixed;
		padding-right: 220px;
	    bottom: 0px;
	    width: 100%;
	    height: 50px;
	    line-height: 50px;
	    z-index: 2;
	    text-align: center;
	    background: aliceblue;
	}
	.foot p{
		text-align: center;
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
		padding-bottom: 15px;
		margin-top: 5px;
	}
	.box{
		text-align: center;
		float: left;
		margin-left: 5px;
		border-color: #88a;
		width: 48.5%;
	}
	.smallbox{
		display: inline-table;
		text-align: center;
		margin: 15px auto;
		padding: 10px;
		border-color: #88a;
	}
	h4{
		text-align: center;
	}
	.spec_header{
		background-color: rgba(238,241,246,1);
		padding: 10px 0;
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
