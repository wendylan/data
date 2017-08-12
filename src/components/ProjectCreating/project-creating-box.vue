<script>
	/*
		组件调用例子 : <component :open-box="openBox" @getFormDatas="addProject"></component>
		open-box : 接收一个布尔值来启动模态框 ( 当布尔值改变时会触发模态框, 无论布尔值是false或true )
		getFormDatas : 接收一个函数, 函数返回模态框表单值
	*/
	import dealNeeding from './child-components/needing-list.vue'
	import addrSelecting from '../adds-input.vue'
	import ajaxCustom from '../ajax-custom.js';
	import { Table, TableColumn, Button, Input, Select, Option, Form, FormItem, RadioGroup, Switch, Dialog, Radio } from 'element-ui';
	export default{
		props : {
			openBox : {
				type : Boolean
			}
		},
		components : {
			dealNeeding,
			addrSelecting,
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
				formDatas : {
					// 项目名称
					projectName : null,
					city : null,
					area : null,
					address : null,
					brand : [],
					// 结算条件各个属性
					condition : {
						// 结算条件
						conditionType : 1,
						days : 0,
						// 上浮或者下浮
						calculateType : "上浮",
						// 下单后或者到货后
						beginCalculateType : "下单后",
						// 网价或者现货价
						priceType : "网价",
						price : null,
						// 按照规格来算
						cate_spec : [
							{"name" : "高线", calculateType : "上浮", price : null},
							{"name" : "盘螺", calculateType : "上浮", price : null},
							{"name" : "螺纹钢", calculateType : "上浮", price : null}
						],
						// 按照品牌来算的各个品牌的计算方式
						childData : [{
							onemoreBrand : '',
							priceType : "网价",
							calculateType : "上浮",
							price : null
						}],
						// 运费
						freight : null,
						// 过磅费
						ponderation_price : null,
						// 吊机费
						crane_price : null,
						// 资金费率
						funds_price_rate : null, 
						// 其他方式结算
						elsePayWay : null
					}
				},
				brands : {
					item : []
				},
				isOpenBox : false,
				isSelectNeeding : false,
				radioTab : null,
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
			getAddress(data){
				this.formDatas.city = data.city;
				this.formDatas.area = data.area;
			},
			getCondition(data){
				this.formDatas.condition = data;
			},
			getFormDatas(){
				this.isOpenBox = false;
				this.$emit('getFormDatas', this.formDatas);
			},
		},
		watch : {
			openBox(){
				this.isOpenBox = true;
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
						<el-input v-model="formDatas.projectName" auto-complete="off" style="width:88%;"  placeholder="请选择项目名称" size="small"></el-input>
					</el-form-item>
					<el-form-item label="活动区域 :" label-width="120px">
						<span>广东省</span>
						<addr-selecting province="广东" @getAddressData="getAddress" :grade="1"></addr-selecting>
					</el-select>
					</el-form-item>
					<el-form-item label="" label-width="120px" >
						<el-input  auto-complete="off" style="width:88%;"  placeholder="详细地址" size="small" v-model="formDatas.address"></el-input>
					</el-form-item>
					<el-form-item label="品牌范围 :" label-width="120px" >
						<el-select  placeholder="请选择品牌"  style="width:88%;" size="small" v-model="formDatas.brand" multiple>
							<el-option :label="name" :value="name" v-for="name in brands.item"></el-option>
						</el-select>
					</el-form-item>
		    	</div>
		    	<!-- 选择结算条件组件 -->
		    	<div v-show="isSelectNeeding">
			    	<deal-needing :brands="formDatas.brand" :needing-datas="formDatas.condition"></deal-needing>
		    	</div>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="default" @click="isSelectNeeding = !isSelectNeeding">{{ isSelectNeeding ? "返回" : "选择结算条件" }}</el-button>
				<el-button type="primary" @click="getFormDatas" v-show="isSelectNeeding">新增</el-button>

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
