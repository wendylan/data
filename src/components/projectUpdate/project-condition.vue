<script>
	/*
		组件调用例子 : <component :data="cache" :openpro="openpro" @getForm="saveEdit"></component>
		cache : 接收一个对象来进行组件的赋值等
		openpro : 接收一个布尔值来启动模态框 ( 当布尔值改变时会触发模态框, 无论布尔值是false或true )
		getForm : 接收一个函数, 函数返回模态框表单值
	*/
    import _ from 'lodash';
	import dealNeeding from './needing-list.vue';
	import ajaxCustom from '../ajax-custom.js';
	import addsData from "../../../res/json/provinceList.json";
	import { Table, TableColumn, Button, Input, Select, Option, Form, FormItem, RadioGroup, Switch, Dialog, Radio } from 'element-ui';
	export default{
		props : {
			openpro : {
				type : Boolean
			},
			data : {
				type : Object
			},
			role : {
				type : Number,
				default : 1
			}
		},
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
            this.getCity();
		},
		data(){
			return {
                // 所有品牌
				brands : {
					item : []
				},
                // 项目弹出框是否打开
				isOpenBox : false,
                // 结算条件弹出框是否打开
				isSelectNeeding : false,
                // 地区json数据
				addsData,
				province : '广东',
                // 市区
				cityOption : [],
                // 县区
				areaOption : [],
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
            // 保存结算方式条款信息
			getFormDatas(){
				var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
                let right = _.every(this.formDatas.receiverInfo, function(item){
                    return myreg.test(item.receiver_tel);
                });
                if(right){
                    this.isOpenBox = false;
                    this.$emit('getForm', this.formDatas);
                }else{
                    alert('请输入有效的手机号码！');
                }
			},
			// 品牌全选
			selectAllBrand(){
				this.formDatas.brands = this.brands.item;
			},
			// 清除所选
			clearAllBrand(){
				this.formDatas.brands = [];
			},
            // 取消修改
			cancelUpdate(){
				this.isOpenBox = false;
			},
            // 根据选择的省份获取市区
            getCity(){
                this.cityOption = _.find(this.addsData.province, ['name', this.province]).cityList;
            },
            // 根据选择的城市获取地区
			getArea(){
				this.formDatas.area = "";
                this.areaOption = _.find(this.cityOption, ['name', this.formDatas.city]).areaList;
			},
			// 添加联系人
			addReceive(){
				this.formDatas.receiverInfo.push(
					{
						receiver : null,
						receiver_tel : null,
						place_of_receipt : null
					}
				);
			},
			// 删除联系人
			delReceive(index){
				if(this.formDatas.receiverInfo.length > 1){
					this.formDatas.receiverInfo.splice(index, 1);
				}
			}
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
					<el-form-item label="项目地址 :" label-width="120px">
						<span>广东省</span>
						<el-select v-model="formDatas.city" @change="getArea()" size="small" placeholder="城市">
							<el-option v-for="item in cityOption " :label="item.name" :value="item.name"></el-option>
						</el-select>
						<el-select v-model="formDatas.area" size="small" placeholder="区\县" >
							<el-option v-for="item in areaOption " :label="item" :value="item"></el-option>
						</el-select>
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
									<el-button size="small" @click="delReceive(index)" :disabled="formDatas.receiverInfo.length ==1? true:false"  >删除</el-button>
								</p>
							</template>
							<el-button @click="addReceive" size="small" class="same_float" type="primary">新增收货人</el-button>
						</div>
						<template v-if="formDatas.handlerInfo">
							<div class="same_style" style="margin-top: 10px;">
								<template v-if="role==1 || role==2">
	    							<template v-for="(item, index) in formDatas.handlerInfo.buyer">
	    								<p class="same_padding">
	    									<span>经办人:</span><el-input v-model="item.handler" size="small" class="same_width"></el-input>
	    									<span>传真:</span><el-input v-model="item.handler_fax" size="small" class="inline_box"></el-input>
											<span>电话:</span><el-input v-model="item.handler_tel" size="small" class="inline_box" :maxlength="11" :minlength="11"></el-input>
											<el-button size="small" @click="formDatas.handlerInfo.buyer.length>1 ? formDatas.handlerInfo.buyer.splice(index, 1) : false" :disabled="formDatas.handlerInfo.buyer.length ==1? true:false" >删除</el-button>
	    								</p>
	    							</template>
									<el-button @click="formDatas.handlerInfo.buyer.push({ handler : null, handler_fax : null , type : 1})" size="small" class="same_float" type="primary">新增</el-button>
								</template>
							</div>
							<div class="same_style" style="margin-top: 10px;">
								<template v-if="role==2">
	    							<template v-for="(item, index) in formDatas.handlerInfo.seller">
	    								<p class="same_padding">
	    									<span>卖方经办人:</span><el-input v-model="item.handler" size="small" class="same_width"></el-input>
	    									<span>传真:</span><el-input v-model="item.handler_fax" size="small" class="inline_box"></el-input>
											<span>电话:</span><el-input v-model="item.handler_tel" size="small" class="inline_box" :maxlength="11" :minlength="11"></el-input>
											<el-button size="small" @click="formDatas.handlerInfo.seller.length>1 ? formDatas.handlerInfo.seller.splice(index, 1) : false" :disabled="formDatas.handlerInfo.seller.length ==1? true:false" >删除</el-button>
	    								</p>
	    							</template>
									<el-button @click="formDatas.handlerInfo.seller.push({ handler : null, handler_fax : null , type : 2})" size="small" class="same_float" type="primary">新增</el-button>
								</template>
							</div>
						</template>
					</el-form-item>
		    	</div>
		    	<!-- 选择结算条件组件 -->
		    	<div v-show="isSelectNeeding">
			    	<deal-needing :brands="formDatas.brands" :needing-datas="formDatas.settlement" :role="role"></deal-needing>
		    	</div>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="danger" @click="cancelUpdate">取消</el-button>
				<el-button type="success" @click="isSelectNeeding = !isSelectNeeding">{{ isSelectNeeding ? "返回" : "选择结算条件" }}</el-button>
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
