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
			},
			role : {
				type : Number,
				default : 1
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
					name : null,
					city : null,
					area : null,
					addr : null,
					brands : [],
                    // 收货联系人
					receiverInfo : [{
						receiver : null,
						receiver_tel : null
					}],
                    // 买卖方经办人信息
					handlerInfo : {
						buyer : [{
							handler : null,
							handler_fax : null,
							handler_tel : null
						}],
						seller : [{
							handler : null,
							handler_fax : null,
							handler_tel : null
						}]
					},
					// 结算条件各个属性
					settlement : {
						// 结算条件
						conditionType : 1,
						days : 0,
						// 上浮或者下浮
						calculateType : "上浮",
						// 下单后或者到货后
						beginCalculateType : "下单后",
						// 网价或者现货价
						priceType : "最新网价",
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
							priceType : "最新网价",
							calculateType : "上浮",
							price : null
						}],
						// 运费
						freight : null,
						// 成本运费
						costFreight : null,
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
                // 品牌数组
				brands : {
					item : []
				},
                // 弹出框是否打开
				isOpenBox : false,
                // 是否打开结算条件的弹出框
				isSelectNeeding : false,
			}
		},
		methods:{
            // 获取所有品牌
			getAllBrands(){
				ajaxCustom.ajaxGet(this, "api/getAllBrandsWillHeader", (responese)=>{
					console.log(responese)
					this.brands.item = responese.body;
				}, (responese)=>{
					alert(responese.body.message);
				});
			},
            // 获取城市地区
			getAddress(data){
				this.formDatas.city = data.city;
				this.formDatas.area = data.area;
			},
            // 保存输入的结算方式条款的信息
			getFormDatas(){
				var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
				let receive = this.formDatas.receiverInfo;
				for(let i = 0; i< receive.length; i++){
					if(!myreg.test(receive[i].receiver_tel))
					{
						alert('请输入有效的手机号码！');
						return false;
					}
				}
				// for(let i = 0; i< this.formDatas.handlerInfo.buyer.length; i++){
				// 	if(!myreg.test(this.formDatas.handlerInfo.buyer[i].handler_fax))
				// 	{
				// 		alert('请输入有效的手机号码！');
				// 		return false;
				// 	}
				// }
				// for(let i = 0; i< this.formDatas.handlerInfo.seller.length; i++){
				// 	if(!myreg.test(this.formDatas.handlerInfo.buyer[i].handler_fax))
				// 	{
				// 		alert('请输入有效的手机号码！');
				// 		return false;
				// 	}
				// }
				this.isOpenBox = false;
				this.$emit('getFormDatas', this.formDatas);
			},
			// 品牌全选
			selectAllBrand(){
				this.formDatas.brands = this.brands.item;
			},
			// 清除所选
			clearAllBrand(){
				this.formDatas.brands = [];
			},
			// 添加联系人
			addReceive(){
				this.formDatas.receiverInfo.push(
					{
						receiver : null,
						receiver_tel : null
					}
				);
			},
			// 删除联系人
			delReceive(index){
				if(this.formDatas.receiverInfo.length > 1){
					this.formDatas.receiverInfo.splice(index, 1);
				}
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
		<el-dialog v-model="isOpenBox">
		    <el-form>
		    	<div v-show="!isSelectNeeding">
					<el-form-item label="项目名称 :" label-width="120px" >
						<el-input v-model="formDatas.name" auto-complete="off" style="width:88%;"  placeholder="请选择项目名称" size="small"></el-input>
					</el-form-item>
					<el-form-item label="项目地址 :" label-width="120px">
						<span>广东省</span>
						<addr-selecting province="广东" @getAddressData="getAddress" :grade="1"></addr-selecting>
					</el-form-item>
					<el-form-item label="" label-width="120px" >
						<el-input  auto-complete="off" style="width:88%;"  placeholder="详细地址" size="small" v-model="formDatas.addr"></el-input>
					</el-form-item>
					<el-form-item label="品牌范围 :" label-width="120px" >
						<el-select  placeholder="请选择品牌"  style="width:75%;" size="small" v-model="formDatas.brands" multiple>
							<el-option :label="name" :value="name" v-for="name in brands.item"></el-option>
						</el-select>
						<el-button @click="selectAllBrand" size="small" style="display:inline-block;">全选</el-button>
						<el-button @click="clearAllBrand" size="small" style="display:inline-block;margin-left:0;">清除所选</el-button>
					</el-form-item>
					<el-form-item label="供货信息 :" label-width="120px" >
						<div class="same_style">
							<template v-for="(item, index) in formDatas.receiverInfo" >
								<p class="same_padding">
									<span>收货人:</span><el-input v-model="item.receiver" size="small" class="same_width"></el-input>
									<span>联系电话:</span><el-input v-model="item.receiver_tel" size="small" class="inline_box" :maxlength="11" :minlength="11"></el-input>
									<el-button size="small" @click="delReceive(index)" :disabled="formDatas.receiverInfo.length ==1? true:false" >删除</el-button>
								</p>
							</template>
							<el-button @click="addReceive" size="small" type="primary" class="same_float">新增收货人</el-button>
						</div>

						<!-- 买方经办人 -->
						<div class="same_style" style="margin-top: 10px;">
							<template v-for="(item, index) in formDatas.handlerInfo.buyer" v-if="role==1 || role==2">
								<p class="same_padding">
									<span>经办人:</span><el-input v-model="item.handler" size="small" class="same_width"></el-input>
									<span>传真:</span><el-input v-model="item.handler_fax" size="small" class="inline_box"></el-input>
									<span>电话:</span><el-input v-model="item.handler_tel" size="small" class="inline_box" :maxlength="11" :minlength="11"></el-input>
									<el-button size="small" @click="formDatas.handlerInfo.buyer.length>1 ? formDatas.handlerInfo.buyer.splice(index, 1) : false" :disabled="formDatas.handlerInfo.buyer.length ==1? true:false" >删除</el-button>
								</p>
							</template>
							<el-button v-if="role==1 || role==2" @click="formDatas.handlerInfo.buyer.push({ handler : null, handler_fax : null , type : 1})" size="small" type="primary" class="same_float">新增</el-button>
						</div>
						<!-- 卖方经办人 -->
						<div class="same_style" style="margin-top: 10px;">
							<template v-for="(item, index) in formDatas.handlerInfo.seller" v-if="role==2">
								<p class="same_padding">
									<span>卖方经办人:</span><el-input v-model="item.handler" size="small" class="same_width"></el-input>
									<span>传真:</span><el-input v-model="item.handler_fax" size="small" class="inline_box"></el-input>
									<span>电话:</span><el-input v-model="item.handler_tel" size="small" class="inline_box" :maxlength="11" :minlength="11"></el-input>
									<el-button size="small" @click="formDatas.handlerInfo.seller.length>1 ? formDatas.handlerInfo.seller.splice(index, 1) : false" :disabled="formDatas.handlerInfo.seller.length ==1? true:false" >删除</el-button>
								</p>
							</template>
							<el-button v-if="role==2" @click="formDatas.handlerInfo.seller.push({ handler : null, handler_fax : null , type : 2})" size="small" type="primary" class="same_float">新增</el-button>
						</div>
					</el-form-item>
		    	</div>
		    	<!-- 选择结算条件组件 -->
		    	<div v-show="isSelectNeeding">
			    	<deal-needing :brands="formDatas.brands" :needing-datas="formDatas.settlement" :role="role"></deal-needing>
		    	</div>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="success" @click="isSelectNeeding = !isSelectNeeding">{{ isSelectNeeding ? "返回" : "选择结算条件" }}</el-button>
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
	.inline_box{
		display: inline-block;
		width: 20%;
	}
	.same_style{
		border-bottom: 1px dashed #dedede;
		padding-bottom: 10px;
	}
	.same_width{
		display: inline-block;
		width: 80px;
	}
	.same_padding{
		padding: 0;
		margin: 0;
	}
	.same_float{
		float: right;
		margin-top: -32px;
	}
</style>
