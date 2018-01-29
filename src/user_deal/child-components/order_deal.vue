<script>
import ajaxCustom from '../../components/ajax-custom.js';
import { Input, Table, TableColumn, Button, Dialog, Select, Option, DatePicker, Autocomplete, Form, FormItem, MessageBox} from 'element-ui';
import _ from "lodash";
export default{
	components : {
		elDatePicker : DatePicker,
		elInput : Input,
		elTableColumn : TableColumn,
		elTable : Table,
		elButton : Button,
		elDialog : Dialog,
		elSelect : Select,
		elOption : Option,
		elAutocomplete : Autocomplete,
		elForm : Form,
		elFormItem : FormItem
	},
	props : {
        // 项目品牌的结算条件
        countRules : {
            default : []
        },
		data : {},
		project : {},
		projectInfo : {
			default : null
		}
	},
	created(){
		this.initData();
		this.createDynamicTable(this.countRules, this.orderList);
		this.projectDatas = JSON.parse(JSON.stringify(this.projectInfo));
		this.projectDatas.allAddr = this.projectDatas.city + this.projectDatas.area + this.projectDatas.addr;
		if(this.projectDatas.handlerInfo){
			this.order_bussiness_info = {
				buyer_name : this.projectDatas.handlerInfo.buyer ? this.projectDatas.handlerInfo.buyer[0].handler : null,
				buyer_fax : this.projectDatas.handlerInfo.buyer ? this.projectDatas.handlerInfo.buyer[0].handler_fax : null,
				buyer_company : this.projectDatas.company,
				seller_name : this.projectDatas.handlerInfo.seller ? this.projectDatas.handlerInfo.seller[0].handler : null,
				seller_fax : this.projectDatas.handlerInfo.seller ? this.projectDatas.handlerInfo.seller[0].handler_fax : null,
				seller_company : this.projectDatas.myCompany
			};
		}else{
			this.order_bussiness_info = {
				buyer_name : null,
				buyer_fax : null,
				buyer_company : this.projectDatas.company,
				seller_name : null,
				seller_fax : null,
				seller_company : this.projectDatas.myCompany
			};
		}

	},
	mounted(){
		this.getCarInfo();
		this.getAllProduct();
		this.getOrderHistoryInfo({project_id:this.project});
	},
	data(){
		var checkTel = (rule, value, callback) =>{
			let myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
			if (value === '') {
				callback(new Error('请输入手机号码'));
			}
			else if (!myreg.test(value)){
				callback(new Error('请输入正确的手机号码'));
			}
			else {
				if (this.ruleForm.driver_tel !== '') {
					this.$refs.ruleForm.validateField('driver_tel');
				}
				callback();
			}
		};

		var checkID = (rule, value, callback) =>{
			let reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
			if (value === '') {
				callback(new Error('请输入身份证号码'));
			}
			else if (!reg.test(value)){
				callback(new Error('请输入正确的身份证号码'));
			}
			else {
				if (this.ruleForm.driver_idcard_num !== '') {
					this.$refs.ruleForm.validateField('driver_idcard_num');
				}
				callback();
			}
		};

		return {
			order_bussiness_info : {
				buyer_name : null,
				buyer_fax : null,
				buyer_company : null,
				seller_name : null,
				seller_fax : null,
				seller_company : null
			},
			projectDatas : [],
			dynamicColumn : [],
			ruleChinese : [
				{ en : "marketPrice", ch : "现货价" },
				{ en : "brand", ch : "品牌" },
				{ en : "freight", ch : "运费" },
				{ en : "funds_rate", ch : "资金费率" },
				{ en : "ponderation", ch : "过磅费" },
				{ en : "crane", ch : "吊车费" },
				{ en : "webPrice", ch : "网价" }
			],
			historyCarInfo : null,
			carNums : [],
			id : null,
			orderList : [],
			orderStatus : undefined,
			transportFunction : 0,
			settle : null,
			Info : null,
			pickerOptions : {
				disabledDate(time) {
					return time.getTime() <= Date.now() ;
				}
			},
			logistics_info : [
				{
					plate_number : null,
					driver : null,
					driver_tel : null,
					driver_idcard_num : null
				}
			],
			receiverInfo : [
				{
					text : '粤A3000',
					value : '粤A3000'
				},
				{
					text : '粤B2000',
					value : '粤B2000'
				}
			],
			receiver : null,
			receiver_tel : null,
			date_of_receipt : null,
			place_of_receipt : null,
			remarks : null,
			brands: [],
			daterange : [],
			openBolean : false,
			rules : {
				driver_tel : [
					{ validator : checkTel, trigger: 'blur'}
				],
				driver_idcard_num : [
					{ validator : checkID, trigger: 'blur'}
				]
			},
			ruleForm : {
				driver_tel : '',
				driver_idcard_num : ''
			}
		}
	},
	methods : {
		// 创建动态table列
		createDynamicTable(ruleDatas, tableDatas){
			this.dynamicColumn = [];
			const columnQueue = [];
			// 计算动态列column
			let column = [];
			let references = [];
			for(let data of ruleDatas){
				for(let key in data){
					if(data[key]){
						column.push(key);
					}
					if(key == "reference"){
						references.push(data[key]);
					}
				}
			}

			// 去重过滤得到需要动态渲染的column
			column = _.without(_.uniq(column), "brand", "count_number", "specification", "reference");

			// 计算 reference 到 column
			if(references.length){
				references = _.uniq(references);
				for(let data of references){
					if(data.indexOf("网价") >= 0){
						column.push("webPrice");
					}
					if(data.indexOf("现货价") >= 0){
						column.push("marketPrice");
					}
				}
				column = _.uniq(column);
			}

			// 添加动态列到dynamicColumn
			for(let data of this.ruleChinese){
				for(let key of column){
					if(data.en == key){
						this.dynamicColumn.push(data);
					}
				}
			}

			// 整合table数据与rule数据
			column = _.without(column, "webPrice", "marketPrice");
			for(let data of tableDatas){
				for(let rule of ruleDatas){
					if(data.brand == rule.brand && data.cate_spec == rule.specification){
						// 添加额外属性
						for(let key of column){
							this.$set(data, key, rule[key]);
						}
					}
				}
			}

		},

		// 获取所有的品牌信息
		getAllProduct(){
			ajaxCustom.ajaxGet(this, "dingoapi/getAllProduct", (responese)=>{
				console.log(responese)
				let resData = responese.body;
                this.brands = _.map(resData.brand, function(n) {
                    return { "value" : n.brand };
                });
			}, (responese)=>{
				alert(responese.body.message);
			});
		},
		// 价格逗号
		makePriceStr(price){
			var newStr = "";
			var count = 0;
			let str = price.toString();
			if(str.indexOf(".")==-1){
				for(let i = str.length-1; i >= 0; i--){
					if(count % 3 == 0 && count != 0){
						newStr = str.charAt(i) + "," + newStr;
					}else{
						newStr = str.charAt(i) + newStr;
					}
					count++;
				}
				str = newStr + ".00"; //自动补小数点后两位
			}else{
				for(let i = str.indexOf(".")-1; i >= 0; i--){
					if(count % 3 == 0 && count != 0){
						newStr = str.charAt(i) + "," + newStr;
					}else{
						newStr = str.charAt(i) + newStr; //逐个字符相接起来
					}
					count++;
				}
				str = newStr + (str + "00").substr((str + "00").indexOf("."), 3);
			}
			return str;
		},
        // 获取以前订单里面有过的收货人和物流信息
        getOrderHistoryInfo(data){
			ajaxCustom.ajaxGet(this, "dingoapi/getOrderHistoryInfo", {params:data},
				(responese)=>{
					console.log(responese);
					let resp = responese.body.receiverInfo;
					if(!this.receiver&&resp){
						this.receiver = resp.receiver;
						this.receiver_tel = resp.receiver_tel;
						this.place_of_receipt = resp.place_of_receipt;
					}
				}, (responese)=>{
					console.log(responese);
				}
			);
		},
		changeDate(date){
			this.date_of_receipt = date;
		},
		exit(){
			this.$emit('exit');
		},
		order (){
			if(this.totalNum < 30){
				MessageBox.confirm('当前吨数较少，无法确定订单可配车', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.$emit('order', {
						car_info_change : 1,
						detailOrder : this.orderList,
						logistics_info : this.logistics_info,
						transport_function : this.transportFunction,
						receiver : this.projectDatas.receiverInfo[0].receiver,
						receiver_tel : this.projectDatas.receiverInfo[0].receiver_tel,
						date_of_receipt : this.date_of_receipt,
						place_of_receipt : this.place_of_receipt,
						remarks : this.remarks,
						order_bussiness_info : this.order_bussiness_info
					});
				});
			}else{
				this.$emit('order', {
					car_info_change : 1,
					detailOrder : this.orderList,
					logistics_info : this.logistics_info,
					transport_function : this.transportFunction,
					receiver : this.projectDatas.receiverInfo[0].receiver,
					receiver_tel : this.projectDatas.receiverInfo[0].receiver_tel,
					date_of_receipt : this.date_of_receipt,
					place_of_receipt : this.place_of_receipt,
					remarks : this.remarks,
					order_bussiness_info : this.order_bussiness_info
				});
			}
		},
		checkCarIsChange(){
			let data = this.data.logisticsInfo;
			let datanew = this.logistics_info;
			if(data.length != datanew.length){
				this.car_info_change = 1;
				return ;
			}else{
				for (var i = 0; i < data.length; i++) {
					if(
						data[i].driver != datanew[i].driver ||
						data[i].plate_number != datanew[i].plate_number ||
						data[i].driver_tel != datanew[i].driver_tel ||
						data[i].driver_idcard_num != datanew[i].driver_idcard_num
					){
						this.car_info_change = 1;
						return ;
					}
				}
			}
		},
		validateCarInfo(){
			let validateCI = this.$refs['ruleForm'];
			if(validateCI){
				for (var i = 0; i < validateCI.length; i++) {
					var result = true;
					validateCI[i].validate((valid) => { result = valid;});
					if(!result){
						return false;
					}
				}
			}
			return true;
		},
		// 获取车辆信息
		getCarInfo(){
			ajaxCustom.ajaxGet(this, 'dingoapi/getCarInfo', (response)=>{
				console.log(response);
				this.historyCarInfo = response.body.data;
				this.carNums = [];
				if(this.historyCarInfo.length){
                    this.carNums = _.map(this.historyCarInfo, function(n) {
                        return { "value" : n.plate_number };
                    });
				}
			}, (response)=>{
				alert(response.body.message);
			});
		},
		querySearchCar(queryString, cb){
			var carNums = this.carNums;
			var results = queryString ? carNums.filter(this.createFilterCar(queryString)) : carNums;
			// 调用 callback 返回建议列表的数据
			cb(results);
		},
		createFilterCar(queryString) {
			return (plate_number) => {
				return (plate_number.value.indexOf(queryString.toLowerCase()) === 0);
			};
		},
		handleSelect(item){
			let historyCar = this.historyCarInfo;
			for(let i = 0; i < historyCar.length; i++){
				if(item.plate_number == historyCar[i].plate_number){
					item.driver_tel = historyCar[i].driver_tel;
					item.driver = historyCar[i].driver;
					item.driver_idcard_num = historyCar[i].driver_idcard_num;
					break;
				}
			}
		},
		// 添加车号
		addCar(){
			this.logistics_info.push({
				plate_number : null,
				driver : null,
				driver_tel : null,
				driver_idcard_num : null
			});
		},
		// 删除车号
		delCar(index){
			let mess = this.logistics_info;
			if(mess.length >1){
				mess.splice(index, 1);
			}
		},
		querySearch(queryString, cb) {
			var brands = this.brands;
			var results = queryString ? brands.filter(this.createFilter(queryString)) : brands;
			// 调用 callback 返回建议列表的数据
			cb(results);
		},
		createFilter(queryString) {
			return (brand) => {
				return (brand.value.indexOf(queryString.toLowerCase()) === 0);
			};
		},
		// 删除
		delOne(index){
			this.orderList.splice(index, 1);
		},
		// 展开
		showAll(){
			this.openBolean = true;
		},
		// 收起
		hidddenAll(){
			this.openBolean = false;
		},
		initData(){
			this.orderList = JSON.parse(JSON.stringify(this.data));
		}
	},
	computed : {
        // 总的数量
		totalNum(){
			let order = this.orderList;
			let num = 0;
			for(let i = 0; i < order.length;i++){
				num += parseInt(order[i].amount);
			}
            // 加上逗号
			return this.makePriceStr(num);
		},
        // 总的价格
		totalPrice(){
			let order = this.orderList;
			let sum = 0;
			for(let i = 0;i < order.length; i++){
				sum += order[i].price * order[i].amount;
			}
            // 加上逗号
			return this.makePriceStr(sum);
		},
	},
	watch : {
		data(){
			this.initData();
			console.log(this.data);
		},
		project(){
			this.getOrderHistoryInfo({project_id:this.project});
		}
	}
}
</script>
<template>
	<div>
  		<!-- <div style="float: right;"><span>编号：</span>{{'采'+data.order_number}}</div> -->
		<table>
	        <thead>
	            <tr>
	                <th class="small_width">序号</th>
	                <th>品牌</th>
	                <th>品名</th>
	                <th class="small_width">规格</th>
	                <th>材质</th>
	                <template v-for="data in dynamicColumn">
	                	<th>{{ data.ch }}</th>
	                </template>
	                <th>含税总价(元/吨)</th>
	                <th>计划吨数(吨)</th>
	                <th>总价(元)</th>
	                <th v-show="transportFunction==1">车号</th>
	                <th>备注</th>
	            </tr>
	        </thead>
	        <tbody>
	            <tr v-for="(order, index) in orderList">
	                <td class="small_width">{{ index + 1 }}</td>
	                <td>
	                    <el-autocomplete class="inline-input" v-model="order.brand" :fetch-suggestions="querySearch" placeholder="请输入品牌" size="small"></el-autocomplete>
	                </td>
	                <td>{{ order.cate_spec }}</td>
	                <td class="small_width">Φ{{ order.size }}</td>
	                <td>{{ order.material }}</td>
	                <template v-for="data in dynamicColumn">
	                	<td>{{ order[data.en] }}</td>
	                </template>
	                <td>
 	                	<el-input v-model="order.price" type="number" size="small" min="0" style="width:70px;"></el-input>
	                </td>
	                <td>
	                	<el-input v-model="order.amount" type="number" size="small" min="0" style="width:60px;"></el-input>
	                </td>
	                <td>{{ makePriceStr(parseInt(order.price)*parseInt(order.amount)) }}</td>
	                <td v-if="transportFunction==1">
	                	<el-select v-model='order.plate_num' type="text" size="small">
	                		<el-option  :value='item.plate_number' v-for='item in logistics_info'></el-option>
	                	</el-select>
	                </td>
	                <td>
	                	<el-input v-model='order.remark' type="text" size="small" style="width:95px;"></el-input>
	                </td>
	            </tr>
	            <tr>
	            	<td colspan="3">总计</td>
	            	<td :colspan="3 + dynamicColumn.length"></td>
	            	<td>{{ totalNum }}</td>
	            	<td>{{ totalPrice }}</td>
	            	<td v-if="transportFunction==1"></td>
	            	<td></td>
	            </tr>
	        </tbody>
	    </table>


		<div style="text-align:left;margin-top:20px;">
			<div>
				<div v-if="settle" style="margin-bottom:30px;">
					<label>
						<b>结算条件</b>
					</label>
					<p>{{ Info }} </p>
				</div>

				<label>
					<b>物流信息</b><span style="color:red;font-weight:normal;">(可在后续操作中补录)</span>
				</label>
				<br>
				<span>运输方式:</span>
				<el-select v-if="transportFunction" v-model='transportFunction' placeholder="请选择" size="small">
					<el-option label="买方自提" :value="1"></el-option>
					<el-option label="卖方承运" :value="0"></el-option>
				</el-select>
				<el-button size="small" @click="addCar" v-if="transportFunction==1">新加车号</el-button>
				<div style="margin-top:20px;" v-if="transportFunction==1">
					<template v-for='(item, index) in logistics_info'>
						<el-form :rules="rules" ref="ruleForm" :model="logistics_info[index]" :inline="true" style="margin-bottom:0;">
							<el-form-item label="车号:">
								<el-autocomplete class="inline-input same_width" v-model="item.plate_number" :fetch-suggestions="querySearchCar" placeholder="请输入车号" size="small" @select="handleSelect(item)" ></el-autocomplete>
							</el-form-item>
							<el-form-item label="联系电话:" prop="driver_tel">
								<el-input type="text" v-model='item.driver_tel' size="small" :maxlength="11" class="same_width"></el-input>
							</el-form-item>
							<el-form-item label="司机:">
								<el-input type="text" v-model='item.driver'size="small" class="same_width"></el-input>
							</el-form-item>
							<el-form-item label="身份证号:" prop="driver_idcard_num">
								<el-input type="text" v-model='item.driver_idcard_num' size="small" :maxlength="18" class="same_width"></el-input>
								<el-button size="small" @click="delCar(index)" :disabled="logistics_info.length==1?true:false">删除</el-button>
							</el-form-item>
						</el-form>
					</template>
				</div>
				<div style="text-align:left;margin-top:20px;">
					<label>
						<b>供货信息:</b>
						<el-button @click="showAll" size="small" v-if="openBolean==false">展开</el-button>
						<el-button @click="hidddenAll" size="small" v-if="openBolean==true">收起</el-button>
					</label>
					<div v-if="openBolean">
						<p>
							<span class="span_class">收货人:</span>
							<el-input v-model="projectDatas.receiverInfo[0].receiver" size="small"  class="same_margin"></el-input>
							<span>联系电话:</span>
							<el-input type="text" v-model="projectDatas.receiverInfo[0].receiver_tel" size="small" class="same_margin" :maxlength="11" :minlength="11"></el-input>
						</p>
						<p>
							<span>送货地址:</span>
							<el-input type="text" v-model="projectDatas.allAddr" size="small" class="same_margin"></el-input>
						</p>
						<p>
							<span>供货时间:</span>
							<el-date-picker v-model="daterange" type="daterange" :picker-options="pickerOptions" placeholder="请选择日期范围" @change='changeDate' style="width:280px;" size="small"></el-date-picker>
						</p>
						<p>
							<span>付款时间:</span>
							<span>见合同</span>
						</p>
						<label style="width:60px;">
							<b>备  注：</b>
						</label>
						<el-input v-model="remarks" type="text" size="small" style="display:inline-block;width:67%;"></el-input>
						<div style="text-align:left;margin-top:20px;width:100%;">
							<div style="float:left;">
								<p>
									<span>卖方(供货单位):</span>
									<span>{{order_bussiness_info.seller_company}}</span>
								</p>
								<p>
									<span class="span_class">经办人:</span>
									<el-input v-model="order_bussiness_info.seller_name" type="text" size="small" class="same_width"></el-input>
								</p>
								<p>
									<span class="span_class">传真:</span>
									<el-input v-model="order_bussiness_info.seller_fax" type="text" size="small" class="same_width"></el-input>
								</p>
							</div>
							<div style="float:left; margin-left:150px;margin-bottom:50px;">
								<p>
									<span>买方(收货单位):</span>
									<span>{{order_bussiness_info.buyer_company}}</span>
								</p>
								<p>
									<span class="span_class">经办人:</span>
									<el-input  v-model="order_bussiness_info.buyer_name" type="text" size="small" class="same_width"></el-input>
								</p>
								<p>
									<span class="span_class">传真:</span>
									<el-input v-model="order_bussiness_info.buyer_fax" type="text" size="small" class="same_width"></el-input>
								</p>
							</div>
						</div>
					</div>
				</div>
				<div slot="footer" class="dialog-footer" style="clear:both;text-align:center;">
					<el-button @click="exit">返回</el-button>
					<el-button @click="order" type="primary">确认下单</el-button>
				</div>
			</div>
		</div>
	</div>
</template>
<style >
	body{
		background-color: #f8f8f8;
	}
	table{
        margin-top: 20px;
        width: 100%;
        table-layout: fixed;
        border-collapse:collapse;
        border:1px solid black;
        border:1px solid #e0e6ed;
        text-align:center;
        font-size:14px;
    }
    thead{
        background-color:#eef1f6;
    }
    thead th{
        text-align: center;
        padding:10px 0px;
        border:1px solid #dfe6ec;
    }
    table td{
        padding:10px;
        border:none;
        border-bottom:1px solid #e0e6ed;
        border-right:1px solid #e0e6ed;
    }
    table tbody tr:hover{
        background-color: #eff2f7;
    }
    .bg{
		padding: 1px 5px;
		background:#20a0ff;
		border-radius: 50%;
		color:#fff;
		text-align: center;
	}
	.inline-input{
		width: 80px;
		text-align: center;
	}
	.span_class{
		width: 60px;
		display: inline-block;
	}
	.same_width{
		width: 200px;
	}
	.same_margin{
		width:30%;
		margin-right:30px;
	}
    .small_width{
        width: 60px;
    }
</style>
