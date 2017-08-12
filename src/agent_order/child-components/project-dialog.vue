<script>
	import { Button, Input, Select, Option, Dialog, Form, FormItem, Tabs, TabPane} from 'element-ui';
	import provinceList from "../../../res/json/provinceList.json";
	import ajaxCustom from '../../components/ajax-custom.js';
	export default{
		components:{
			elButton : Button,	
			elInput : Input,
			elSelect : Select,
			elOption : Option,
			elDialog : Dialog,
			elForm : Form,
			elFormItem : FormItem,
			elTabs : Tabs,
			elTabPane : TabPane,
		},
		data(){
			return{
				allBrand : {
					item : [],
					selected : []
				},
				isCreateProjectBox : false,
				formSeting : {
					formLabelWidth : "120px",
					provinceList : null,
					city : null,
					area : null,
					addrList : null,
					
				},
				normalItemDisplay : 1,
				someItemDisplay : 0, 
				brandsItemDisplay : 0,
				priceItemDisplay : 0,
				moreBrandDisplay : 0,
				options : [
					{
						value	: '下单后',
						label : '下单后'
					}, 
					{
						value : '到货后',
						label : '到货后'
					}
				],
				weboptions : [
					{
						value : '上浮',
						label : '上浮'
					},
					{
						value : '下浮',
						label : '下浮'
					}
				],
				oneBrand : '',
				moreBrand : [],
				value : '',
				brands : [
					{
						onemoreBrand : '',
						webvalue : '',
						price : null
					}
				],
				tabs : "条款一",
			}
		},
		created(){
			this.getAllBrands();

			for(let province of provinceList.province){
				if(province.name === "广东"){
					this.formSeting.addrList = province.cityList;
				}
			}
		},
		methods : {
			getAllBrands(){
				// ajaxCustom.ajaxGet(this,"api/getAllbrands", (responese)=>{
				ajaxCustom.ajaxGet(this, "api/getAllBrandsWillHeader", (responese)=>{
					console.log(responese)
					let resData = responese.body;
					this.allBrand.item = resData;
				}, (responese)=>{
					console.log("error");
					console.log(responese);
				});
			},
			handleClick(tab) {
				if(this.tabs != tab.label){
					this.brands = [];
					this.brands.push({
						onemoreBrand : '',
						webvalue : '',
						price : null
					});
				}
				this.tabs = tab.label;
				if(tab.label == "其他"){
					this.normalItemDisplay = 0;
				}else{
					this.normalItemDisplay = 1;
				}
				if((tab.label == "条款三") || (tab.label == "条款四") || (tab.label == "条款五")){
					this.someItemDisplay = 1;
				}else{
					this.someItemDisplay = 0;
				}
				if(tab.label == "条款二" || tab.label == "条款四"){
					this.brandsItemDisplay = 1;
				}else{
					this.brandsItemDisplay = 0;
				}
				if(tab.label == "条款五"){
					this.priceItemDisplay = 1;
				}else{
					this.priceItemDisplay = 0;
				}
			},
			addBrand(){
				this.brands.push({
					onemoreBrand : '',
					webvalue : '',
					price : null
				});
			},
			delBrand(index){
				this.brands.splice(index, 1);
			}
		},

	}
</script>
<template>
	<div class="dialog_contain">
		<el-button @click="isCreateProjectBox = true">新建项目</el-button>
		<!-- 弹出框 -->
		<el-dialog v-model="isCreateProjectBox" >
		    <el-form>
			    <el-form-item label="项目名称:" :label-width="formSeting.formLabelWidth" >
			    	<el-input  auto-complete="off" style="width:88%;"  placeholder="请选择项目名称"></el-input>
			    </el-form-item>
			    <el-form-item label="活动区域:" :label-width="formSeting.formLabelWidth">
			    	<b>广东省</b><span></span>
					<el-select  v-model="formSeting.city" placeholder="请选择城市">
						<el-option v-for="item in formSeting.addrList" :label="item.name" :value="item.name"></el-option>
					</el-select>
					<el-select v-model="formSeting.area" placeholder="请选择区/县">
						<template v-for="city in formSeting.addrList">
							<template v-if="formSeting.city == city.name">
								<el-option v-for="area in city.areaList" :label="area" :value="area"></el-option>
							</template>
						</template>
					</el-select>
			    </el-form-item>
			    <el-form-item label="" :label-width="formSeting.formLabelWidth" >
			    	<el-input  auto-complete="off" style="width:88%;"  placeholder="详细地址"></el-input>
			    </el-form-item>
			    <el-form-item label="品牌范围:" :label-width="formSeting.formLabelWidth" >
			    	<el-select  v-model="allBrand.selected" multiple placeholder="请选择品牌" style="width:88%;" >
				        <el-option  v-for="item in allBrand.item" :label="item" :value="item"></el-option>
			       </el-select>
			    </el-form-item>

			    <el-form-item label="结算条件:" :label-width="formSeting.formLabelWidth" >
					<el-tabs  :active-name="tabs" type="card" @tab-click="handleClick" style="width:88%;">
						<el-tab-pane name="条款一" label="条款一"><b>统一包干结算:</b>
						</el-tab-pane>
					    <el-tab-pane name="条款二" label="条款二"><b>分品牌包干结算:</b>
					    </el-tab-pane>
					    <el-tab-pane name="条款三" label="条款三"><b>统一分拆结算:</b>
					    </el-tab-pane>
					    <el-tab-pane name="条款四" label="条款四"><b>分品牌分拆结算:</b>
					    </el-tab-pane>
					    <el-tab-pane name="条款五" label="条款五"><b>综合费率结算:</b>
					    </el-tab-pane>
					    <el-tab-pane name="其他" label="其他"><b>其他结算方式:</b>
							<el-input  type="textarea" auto-complete="off"  placeholder="请输入结算描述"  autosize></el-input>
					    </el-tab-pane>
					</el-tabs>
					
					<div>
						<template v-if="normalItemDisplay">
							<el-select v-model="value" style="width:100px;" >
							    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
							</el-select>
							<el-input type="number" style="width:80px;"></el-input>日
						</template>
						
						<template  v-for="(te,index) in brands">
							<br>
							<el-select v-model="te.onemoreBrand" placeholder="品牌" style="width:120px;"v-if="brandsItemDisplay">
						        <el-option  v-for="item in allBrand.selected" :label="item" :value="item"></el-option>
					       	</el-select>
					       	<template v-if="normalItemDisplay">
					       		<span>	网价 </span>
								<el-select v-model="te.webvalue" style="width:100px;margin-top:10px;">
								    <el-option v-for="item in weboptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
								</el-select>
								<el-input v-model="te.price" type="number" style="width:80px;"></el-input>
								<span>元/吨</span>
								<el-button @click="delBrand(index)" size="small" v-if="brandsItemDisplay">删除</el-button>
					       	</template>
						</template>
						<template v-if="brandsItemDisplay">
							<br>
							<el-button @click="addBrand()" size="small">新增一行</el-button>
						</template>
						<br>
						<template v-if="priceItemDisplay">
							<label style="width:90px;">资金费率:</label><el-input type="number" style="width:80px;margin-top:10px;" min="0" ></el-input>
							<span>%</span>
							<br>
						</template>
						<template v-if="someItemDisplay==1">
							<label style="width:90px;">运费:</label>
							<el-input type="number" style="width:80px;margin-top:10px;" min="0" ></el-input>
							<span>元/吨</span>
							<br>
							<label style="width:90px;">过磅费:</label>
							<el-input type="number" style="width:80px;margin-top:10px;" min="0" ></el-input>
							<span>元/吨</span>
							<br>
						</template>
					</div>
			    </el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="isCreateProjectBox = false">取 消</el-button>
				<el-button type="primary" @click="isCreateProjectBox = false">新增</el-button>
			</div>
		</el-dialog>
		<!-- 弹出框结束 -->
	</div>
	
</template>
<style>
	.dialog_contain{
		width: 80%;
		margin: 0 auto;
	}
</style>