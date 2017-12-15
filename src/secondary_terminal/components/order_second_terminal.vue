<script>
import ajaxCustom from '../../components/ajax-custom.js';
import { Input, Table, TableColumn, Button, Dialog, Select, Option, DatePicker, Autocomplete, Form, FormItem, MessageBox} from 'element-ui';
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
	props : ['data', 'change', 'receivedInfo'],
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
			historyCarInfo : null,
			carNums : [],
			id : null,
			orderList : [],
			orderStatus : undefined,
			transportFunction : 1,
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
					text : '',
					value : ''
				},
				{
					text : '',
					value : ''
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
	computed : {
		initData(){
			this.orderList = JSON.parse(JSON.stringify(this.data.orderDetail));
			for (var i = 0; i < this.orderList.length; i++) {
				this.orderList[i].plate_num = "";
			}
			this.orderList.push();
		},
		totalNum(){
			let order = this.orderList;
			let num = 0;
			for(let i = 0; i < order.length;i++){
				num += parseInt(order[i].amount);
			}
			return this.makePriceStr(num);
		},
		totalPrice(){
			let order = this.orderList;
			let sum = 0;
			for(let i = 0;i < order.length; i++){
				sum += parseInt(this.transportFunction?((order[i].warehouse=="钢厂直送")?order[i].total:order[i].price):order[i].total)*parseInt(order[i].amount);
			}
			return this.makePriceStr(sum);
		},
	},
	watch : {
		change(){
			this.initData;
		},
	},
	methods : {
		getAllProduct(){
			ajaxCustom.ajaxGet(this, "dingoapi/getAllProduct", (responese)=>{
				console.log(responese)
				let resData = responese.body;
				let arr = [];
				for(let brand of resData.brand){
					arr.push({ "value" : brand.brand});
				}
				this.brands = arr;
			}, (responese)=>{
				alert(responese.body.message);
			});
		},
		// 价格逗号
		makePriceStr(price){
			if(!price){
				return "待议";
			}
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
		changeDate(date){
			this.date_of_receipt = date;
			// console.log(date);
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
						receiver : this.receiver,
						receiver_tel : this.receiver_tel,
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
					receiver : this.receiver,
					receiver_tel : this.receiver_tel,
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
		getCarInfo(){
			ajaxCustom.ajaxGet(this, 'dingoapi/getCarInfo', (response)=>{
				console.log(response);
				this.historyCarInfo = response.body.data;
				this.carNums = [];
				let historyCar = this.historyCarInfo;
				if(historyCar.length){
					for(let i = 0; i< historyCar.length; i++ ){
						this.carNums.push({"value" : historyCar[i].plate_number});
					}
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
			// console.log(index);
			this.orderList.splice(index, 1);
		},
		transChange(value){
			if(!value){
				if(!this.receivedInfo.city&&!this.receivedInfo.city){
					alert("请先录入到货区域，或选择项目");
					this.$emit("close");
				}
			}
		},
		addCarIn(){
			this.orderList.push();
		},
		test(){
			console.log(this.orderList);
		}
	},
	mounted(){
		this.initData;
		this.getCarInfo();
		this.getAllProduct();

	},
}
</script>
<template>
	<div>
  		<!-- <div style="float: right;"><span>编号：</span>{{'采'+data.order_number}}</div> -->
		<table>
	        <thead>
	            <tr>
	                <th style="width: 60px;">序号</th>
	                <th>品牌</th>
	                <th>品名</th>
	                <th>规格</th>
	                <th>材质</th>
	                <th>仓库</th>
	                <th>含税单价(元/吨)</th>
	                <th>运费(元/吨)</th>
	                <th>计划吨数(吨)</th>
	                <th>总价(元)</th>
	                <th v-show="transportFunction==1">车号</th>
	                <th>备注</th>
	            </tr>
	        </thead>
	        <tbody>
	            <tr v-for="(order, index) in orderList">
	                <td style="width: 60px;">{{ index + 1 }}</td>
	                <td>
	                    <el-autocomplete class="inline-input" v-model="order.brand" :fetch-suggestions="querySearch" placeholder="请输入品牌" size="small"></el-autocomplete>
	                </td>
	                <td>{{ order.cate_spec }}</td>
	                <td>Φ{{ order.size }}</td>
	                <td>{{ order.material }}</td>
	                <td>{{ order.warehouse }}</td>
	                <td>
 	                	<el-input v-model="order.price" type="number" size="small" min="0" style="width:70px;"></el-input>
	                </td>
	                <td>
	                	{{ transportFunction?((order.warehouse=="钢厂直送")?(order.freight=="-"?"待议":order.freight):0):(order.freight=="-"?"待议":order.freight) }}
	                </td>
	                <td>
	                	<el-input v-model="order.amount" type="number" size="small" min="0" style="width:60px;"></el-input>
	                </td>
	                <td>{{ makePriceStr( parseInt(transportFunction?((order.warehouse=="钢厂直送")?order.total:order.price):order.total)*parseInt(order.amount)) }}</td>
	                <td v-show="transportFunction==1">
	                	<el-select v-model='order.plate_num'  size="small" @visible-change="addCarIn()">
	                		<el-option  :value='item.plate_number' v-for='item in logistics_info'></el-option>
	                	</el-select>
	                </td>
	                <td>
	                	<el-input v-model='order.remark' type="text" size="small" style="width:95px;"></el-input>
	                </td>
	            </tr>
	            <tr>
	            	<td colspan="4">总计</td>
	            	<td colspan="4"></td>
	            	<td>{{ totalNum }}</td>
	            	<td>{{ totalPrice }}</td>
	            	<td v-if="transportFunction==1"></td>
	            	<td></td>
	            </tr>
	        </tbody>
	    </table>

		<div style="text-align:left;margin-top:20px;">
			<div>
				<label>
					<b>物流信息</b><span style="color:red;font-weight:normal;">(可在后续操作中补录)</span>
				</label>
				<br>
				<span>运输方式:</span>
				<el-select placeholder="请选择" v-model='transportFunction'  size="small" @change="transChange(transportFunction)">
					<el-option label="买方自提" :value="1"></el-option>
					<el-option label="卖方承运" :value="0"></el-option>
				</el-select>
				<el-button size="small" @click="addCar" v-if="transportFunction==1">新加车号</el-button>
				<div style="margin-top:20px;" v-if="transportFunction==1">
					<template v-for='(item, index) in logistics_info'>
						<el-form :rules="rules" ref="ruleForm" :model="logistics_info[index]" :inline="true" style="margin-bottom:0;">
							<el-form-item label="车号:">
								<el-autocomplete class="inline-input same_width" v-model="item.plate_number" :fetch-suggestions="querySearchCar" placeholder="请输入车号" size="small" @select="handleSelect(item)"></el-autocomplete>
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
				<div style="text-align:left;margin-top:20px;" v-if="transportFunction==0">
					<label>
						<b>供货信息:</b>
					</label>
					<div >
						<p>
							<span class="span_class">收货人:</span>
							<el-input type="text"  v-model="receiver" size="small" class="same_margin"></el-input>
							<span>联系电话:</span>
							<el-input type="text" v-model="receiver_tel" size="small" class="same_margin" :maxlength="11" :minlength="11"></el-input>
						</p>
						<p>
							<span class="span_class">送货地址:</span>{{receivedInfo.city+receivedInfo.area}}
							<el-input type="text" v-model="place_of_receipt" size="small" class="same_margin"></el-input>
						</p>
						<p>
							<span class="span_class">供货时间:</span>
							<el-date-picker v-model="daterange" type="daterange" :picker-options="pickerOptions" placeholder="请选择日期范围" @change='changeDate' style="width:400px;" size="small"></el-date-picker>
						</p>
						<p>
							<span>付款时间:</span>
							<span>见合同</span>
						</p>
						<label style="width:60px;">
							<b>备  注：</b>
						</label>
						<el-input v-model="remarks" type="text" size="small" style="display:inline-block;width:67%;"></el-input>
					</div>
				</div>
				<div slot="footer" class="dialog-footer" style="clear:both;text-align:center;">
					<el-button @click="exit">返回</el-button>
					<el-button @click="order" type="primary">确认下单</el-button>
					<!-- <button @click="test">test</button> -->
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
</style>
