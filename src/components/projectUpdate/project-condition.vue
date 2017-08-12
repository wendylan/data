<script>
	/*
		组件调用例子 : <component :data="cache" :openpro="openpro" @getForm="saveEdit"></component>
		cache : 接收一个对象来进行框架的赋值等
		openpro : 接收一个布尔值来启动模态框 ( 当布尔值改变时会触发模态框, 无论布尔值是false或true )
		getForm : 接收一个函数, 函数返回模态框表单值
	*/
	import dealNeeding from './needing-list.vue'
	import ajaxCustom from '../ajax-custom.js';
	import addsData from "../../../res/json/provinceList.json";
	import { Table, TableColumn, Button, Input, Select, Option, Form, FormItem, RadioGroup, Switch, Dialog, Radio } from 'element-ui';
	export default{
		props : ['openpro','data'],
		components : {
			dealNeeding,
			elTable : Table,
			elTableColumn : TableColumn,
			elButton : Button,
			elInput : Input,
			elSelect : Select,
			elOption : Option,
			elDialog : Dialog,
			elForm : Form,
			elRadioGroup : RadioGroup,
			elSwitch : Switch,
			elFormItem : FormItem,
			elRadio : Radio
		},
		created(){
			this.getAllBrands();
		},
		data(){
			return {
				// formDatas : {
				// 	// 项目名称
				// 	projectName : null,
				// 	city : null,
				// 	area : null,
				// 	address : null,
				// 	brand : [],
				// 	// 结算条件各个属性
				// 	condition : {
				// 		// 结算条件
				// 		conditionType : 1,
				// 		days : 0,
				// 		calculateType : "上浮",
				// 		beginCalculateType : "下单后",
				// 		// 网价或者现货价
				// 		priceType : null,
				// 		price : null,
				// 		// 按照规格来算
				// 		cate_spec : [
				// 			{"name" : "高线", calculateType : "上浮", payPrice : null},
				// 			{"name" : "盘螺", calculateType : "上浮", payPrice : null},
				// 			{"name" : "螺纹钢", calculateType : "上浮", payPrice : null}
				// 		],
				// 		// 按照品牌来算的各个品牌的计算方式
				// 		childData : [{
				// 			onemoreBrand : '',
				// 			priceType : '',
				// 			calculateType : '',
				// 			payPrice : null
				// 		}],
				// 		// 运费
				// 		freight : null,
				// 		// 过磅费
				// 		ponderation_price : null,
				// 		// 吊机费
				// 		crane_price : null,
				// 		// 资金费率
				// 		funds_price_rate : null, 
				// 		// 其他方式结算
				// 		elsePayWay : null
				// 	}
				// },
				brands : {
					item : []
				},
				isOpenBox : false,
				isSelectNeeding : false,
				radioTab : null,
				addsData,
				province : '广东',
				cityOption : [],
				areaOption : []
			}
		},
		methods:{
			getAllBrands(){
				ajaxCustom.ajaxGet(this, "api/getAllBrandsWillHeader", (responese)=>{
					console.log(responese)
					let resData = responese.body;
					this.brands.item= resData;
				}, (responese)=>{
					console.log(responese);
				});
			},
			getCondition(data){
				this.formDatas.condition = data;
			},
			getFormDatas(){
				this.isOpenBox = false;
				this.$emit('getForm', this.formDatas);
			},
			getArea(){
				this.formDatas.area = "";
				for (var i = 0; i < this.cityOption.length; i++) {
					if (this.cityOption[i].name == this.formDatas.city) {
						this.areaOption=this.cityOption[i].areaList;
					}
				}
			},
		},
		watch : {
			openpro(){
				this.isOpenBox = true;
			}
		},
		computed : {
			formDatas(){
				return this.data;
			}
		},
		mounted(){
			for (var i = 0; i < this.addsData.province.length; i++) {
				if (this.addsData.province[i].name==this.province) {
					this.cityOption=this.addsData.province[i].cityList;
				} 
			}
		}
	}
</script>

<template>
	<div class="">
		<el-dialog v-model="isOpenBox" >
		    <el-form>
		    	<div v-show="!isSelectNeeding">
					<el-form-item label="项目名称 :" label-width="120px" >
						<el-input v-model="formDatas.name" auto-complete="off" style="width:88%;"  placeholder="请选择项目名称" size="small"></el-input>
					</el-form-item>
					<el-form-item label="活动区域 :" label-width="120px">
						<span>广东省</span>
						<!-- <addr-selecting province="广东" @getAddressData="getAddress" :grade="1"></addr-selecting> -->
					
						<el-select v-model="formDatas.city" @change="getArea()" size="small" placeholder="城市">
							<el-option v-for="item in cityOption " :label="item.name" :value="item.name"></el-option>
						</el-select>
						<el-select v-model="formDatas.area" size="small" placeholder="区\县" >
							<el-option v-for="item in areaOption " :label="item" :value="item"></el-option>
						</el-select>

					</el-select>
					</el-form-item>
					<el-form-item label="" label-width="120px" >
						<el-input  auto-complete="off" style="width:88%;"  placeholder="详细地址" size="small" v-model="formDatas.addr"></el-input>
					</el-form-item>
					<el-form-item label="品牌范围 :" label-width="120px" >
						<el-select  placeholder="请选择品牌"  style="width:88%;" size="small" v-model="formDatas.brands" multiple>
							<el-option :label="name" :value="name" v-for="name in brands.item"></el-option>
						</el-select>
					</el-form-item>
		    	</div>
		    	<!-- 选择结算条件组件 -->
		    	<div v-show="isSelectNeeding">
			    	<deal-needing :brands="formDatas.brands" :needing-datas="formDatas.settlement"></deal-needing>
		    	</div>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="default" @click="isSelectNeeding = !isSelectNeeding">{{ isSelectNeeding ? "返回" : "选择结算条件" }}</el-button>
				<el-button type="primary" @click="getFormDatas" v-show="isSelectNeeding">保存</el-button>

			</div>
		</el-dialog>
	</div>
</template>

<style scoped>
	h1,h4{
		font-weight:400;
	}
	h4{
		color:#8492A6;
	}

</style>
