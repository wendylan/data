<script>
import ajaxCustom from '../../components/ajax-custom.js';
import projectToText from '../../components/project_to_text.js';
import { Input, Table, TableColumn, Button, Dialog, Select, Option, DatePicker, Autocomplete, Form, FormItem, Steps, Step } from 'element-ui';
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
		elFormItem : FormItem,
		elSteps : Steps,
		elStep : Step,
	},
	props : ['data'],
	created(){
		console.log(this.data.project_id);
		this.getContractPrice(this.data.project_id)
		this.connectData;
		this.orderData;
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
			contractPriceRule: [],
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
			car_info_change : 0,
			id : null,
			orderList : [],
			orderStatus : undefined,
			showOrder : true,
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
			bussinessInfo : [],
			receiver : null,
			receiver_tel : null,
			date_of_receipt : null,
			place_of_receipt : null,
			remarks : null,
			brands: [],
			daterange : [],

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
		orderData(){
			if(this.data.logisticsInfo){
				this.logistics_info = JSON.parse(JSON.stringify(this.data.logisticsInfo));
			}
			if(this.data.transport_function){
				this.transportFunction = parseInt(this.data.transport_function);
			}
			if(this.data.date_of_receipt){
				let daterange = this.data.date_of_receipt
				this.daterange.splice(0, 1, new Date(daterange.substr(0, 10)));
				this.daterange.splice(1, 1, new Date(daterange.substr(13, 10)));
			}else{
				this.daterange = [];
			}
		},
		connectData(){
			this.receiver = this.data.receiver;
			this.receiver_tel = this.data.receiver_tel;
			this.date_of_receipt = this.data.date_of_receipt;
			this.place_of_receipt = this.data.place_of_receipt;
			this.remarks = this.data.remarks;
			this.orderList =  this.orderRightSequence(this.data.orderDetail);
			this.orderStatus = this.data.status;
			this.id = this.data.id;
			this.settle = this.data.settlement;
			this.tradeBetween = this.data.tradeBetween;
			if(this.data.bussinessInfo.length){
				this.bussinessInfo = this.data.bussinessInfo[0];
			}
			if(this.settle){
				this.Info = projectToText.todo(this.data, true);
			}else{
				this.Info = '没有选择项目';
			}
		},
		totalNum(){
			let order = this.orderList;
			let num = 0;
			for(let i = 0; i < order.length;i++){
				let amount = order[i].amount;
				if(amount == ''){
					amount = 0;
				}
				num += parseInt(amount);
			}
			return this.makePriceStr(num);
		},
		totalPrice(){
			let order = this.orderList;
			let sum = 0;
			for(let i = 0;i < order.length; i++){
				sum += parseFloat(
					((order[i].received_amount?order[i].received_amount:order[i].amount)*((order[i].unit_price|0)+(order[i].freight|0))).toFixed(2)
				);
			}
			return this.makePriceStr(sum);
		},
		totalReceived(){
			let order = this.orderList;
			let num = 0;
			for(let i = 0; i < order.length;i++){
				num += parseFloat(order[i].received_amount);
			}
			return this.makePriceStr(num);
		}
	},
	watch : {
		data(){
			this.connectData;
			this.orderData;
			this.getOrderHistoryData({id:this.data.id, project_id:this.data.project_id});
		},
	},
	methods : {
		// 获取合同价条款
		getContractPrice(id){
			if(parseInt(id)){
				ajaxCustom.ajaxGet(this, "dingoapi/getSettlementInfo", {params : { id : id }}, (responese)=>{
					console.log(responese)
					this.contractPriceRule = responese.body.data;
					this.createDynamicTable(this.contractPriceRule, this.orderList);
				}, (responese)=>{
					alert(responese.body.message);
				});

			}
		},

		// 创建动态table列
		createDynamicTable(ruleDatas, tableDatas){
			console.log(ruleDatas);
			// console.log(this.ruleDatas);
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
					if(data.includes("网价")){
						column.push("webPrice");
					}
					if(data.includes("现货价")){
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
		// 获取品牌信息
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
		// 对已经菜单的已拆单数据进行整合
		orderRightSequence(arr){
			let isMenuArr = []
			let notMenuArr = []
			for(let i = 0; i < arr.length; i++){
				if(arr[i].menu){
					isMenuArr.push(arr[i]);
				}else{
					notMenuArr.push(arr[i]);
				}
			}

			for(let j = 0; j < isMenuArr.length; j++){
				for(let i = 0; i < notMenuArr.length; i++){
					if(
						notMenuArr[i].cate_spec == isMenuArr[j].cate_spec &&
						notMenuArr[i].size == isMenuArr[j].size &&
						notMenuArr[i].brand == isMenuArr[j].brand &&
						notMenuArr[i].material == isMenuArr[j].material
					){
						notMenuArr.splice(i+1, 0, isMenuArr[j]);
						break;
					}
				}
			}
			return notMenuArr;
		},
		// 价格逗号
		makePriceStr(price){
			price = this.priceIsNaNJudge(price);
			var newStr = "";
			var count = 0;
			let str = price.toString();
			if(str.indexOf(".")==-1){
				for(let i=str.length-1; i>=0; i--){
					if(count % 3 == 0 && count != 0){
						newStr = str.charAt(i) + "," + newStr;
					}else{
						newStr = str.charAt(i) + newStr;
					}
					count++;
				}
				str = newStr + ".00"; //自动补小数点后两位
			}else{
				for(let i = str.indexOf(".")-1; i>=0; i--){
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
		priceIsNaNJudge(price){
			if(isNaN(price)){
				price = 0;
			}
			return price;
		},
		getOrderHistoryData(data){
			ajaxCustom.ajaxGet(this, "dingoapi/getOrderHistoryInfo", {params:data}, (responese)=>{
				let resp = responese.body.receiverInfo;
				if(!this.receiver&&resp){
					this.receiver = resp.receiver;
					this.receiver_tel = resp.receiver_tel;
					this.place_of_receipt = resp.place_of_receipt;
				}
			}, (responese)=>{
				console.log(responese);
			});
		},
		changeDate(date){
			this.date_of_receipt = date;
			// console.log(date);
		},
		exit(){
			this.$emit('exit', this.showOrder);
		},
		order (){
			this.$refs['ruleForm'][0].validate((valid) => {
				if (valid) {
					// alert('submit');
					this.$emit('order', {
						detailOrder : this.orderList,
						logistics_info : this.logistics_info,
						transport_function : this.transportFunction
					});
				} else {
					console.log('error submit!!');
					return false;
				}
			});
		},
		// 取消订单
		cancelOrder(){
			this.$emit('cancel', { id : this.id, status : 1 });
		},
		// 确认订单
		confirm(){
			this.sendData('confirm');
		},
		// 重发订单
		resendOrder(){
			this.sendData('resend');
		},
		sendData(eventName){
			this.checkCarIsChange();
			if(this.validateCarInfo()){
				this.$emit(eventName, {
					id : this.id,
					status : this.orderStatus,
					detailOrder : this.orderList,
					logistics_info : this.logistics_info,
					receiver : this.receiver,
					receiver_tel : this.receiver_tel,
					date_of_receipt : this.date_of_receipt,
					place_of_receipt : this.place_of_receipt,
					remarks : this.remarks,
					transport_function : this.transportFunction,
					bussinessInfo : this.bussinessInfo,
					car_info_change : this.car_info_change
				});
			}
		},
		// 确认收货
		confirmReceive(){
			this.sendData('confirmReceived');
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
			this.orderList.splice(index, 1);
		},
	},
	mounted(){
		console.log(this.orderList);
		this.getCarInfo();
		this.getAllProduct();
	},
}
</script>
<template>
	<div style="width: 80%;margin: 0 auto;">
		<!-- 状态小于3的时候为可编辑状态 -->
		<div v-if="orderStatus<3">
			<p style="text-align:left;" v-show="orderStatus !=0">
				<label style="margin-right: 20px;font-size: 16px;">订单进度:</label>
				<el-steps :space="100" finish-status="success" style="display: inline-block;vertical-align: middle;" align-center>
					<el-step v-if="orderStatus==0" title="待供方接单" status="finish"></el-step>
					<el-step v-if="orderStatus>0||orderStatus<-1" title="供方接单" status="finish"></el-step>
					<el-step v-if="orderStatus<-1||orderStatus>1" title="待确认订单" status="finish"></el-step>
					<el-step v-if="orderStatus>2" title="待发货" status="finish"></el-step>
					<el-step v-if="orderStatus>3" title="已发货" status="finish"></el-step>
					<el-step v-if="orderStatus>4" title="已收货" status="finish"></el-step>
					<el-step v-if="orderStatus==-1 || orderStatus==-2|| orderStatus==-3 " title="已取消" status="error"></el-step>
				</el-steps>
	  		</p>
	  		<div style="float: right;"><span>编号：</span>{{'采'+data.order_number}}</div>
			<table>
		        <thead>
		            <tr>
		                <th style="width: 60px;">序号</th>
		                <th>品牌</th>
		                <th>品名</th>
		                <th>规格</th>
		                <th>材质</th>
		                <template v-for="data in dynamicColumn"> 
		                	<th>{{ data.ch }}</th>
		                </template>
		                <th>含税单价(元/吨)</th>
		                <th v-if="orderStatus>1">运费(元/吨)</th>
		                <th>下单数量(吨)</th>
		                <th v-if="orderStatus>3">签收数量(吨)</th>
		                <th>总价(元)</th>
		                <th v-if="transportFunction==1">仓库</th>
		                <th v-if="transportFunction==1||orderStatus">车号</th>
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
		                <template v-for="data in dynamicColumn">
		                	<td>{{ order[data.en] }}</td>
		                </template>
		                <td>
		                	<el-input v-model="order.unit_price" type="number" size="small" min="0"></el-input>
		                </td>
		                <td v-if="orderStatus>1">{{ order.freight || 0 }}</td>
		                <td>
		                	<el-input v-model="order.amount" type="number" size="small" min="0" style="width:60px;"></el-input>
		                </td>
		                <td v-if="orderStatus>3">{{ order.received_amount }}</td>
		                <td>{{ makePriceStr((order.received_amount?order.received_amount:order.amount)*((order.unit_price|0)+(order.freight|0))) }}</td>
		                <td v-if="transportFunction==1">{{ order.warehouse }}</td>
		                <td v-if="transportFunction==1||orderStatus">
		                	<el-select v-model='order.plate_num' type="text" size="small">
		                		<el-option  :value='item.plate_number' v-for='item in logistics_info'></el-option>
		                	</el-select>
		                </td>
		                <td>
		                	<el-input v-model='order.remark' type="text" size="small" style="width:80px;"></el-input>
		                </td>
		            </tr>
		            <tr>
		            	<td colspan="3">总计</td>
		            	<td :colspan="3 + dynamicColumn.length"></td>
		            	<td  v-if="orderStatus>1"></td>
		            	<td>{{ totalNum }}</td>
		            	<td v-if="orderStatus>3">
		            		{{totalReceived}}
		            	</td>
		            	<td>{{ totalPrice }}</td>
		            	<td v-if="transportFunction==1"></td>
		            	<td v-if="transportFunction==1||orderStatus"></td>
		            	<td></td>
		            </tr>
		        </tbody>
		    </table>
		    <div style="text-align:left;margin-top:20px;">
				<div>
					<label v-if="data.received_at">到货时间:
						<span >{{ data.received_at.slice(0, 10) }}</span>
					</label>
					<div v-if="settle" style="margin-bottom:10px;">
						<label>
							<b>结算条件</b>
						</label>
						<p>{{ Info }} </p>
					</div>

					<label>
						<b>物流信息</b><span style="color:red;font-weight:normal;" v-if="orderStatus!=5">(可在后续操作中补录)</span>
					</label>
					<br>
					<span>运输方式:</span>
					{{transportFunction?'买方自提':'卖方承运'}}
					<el-button size="small" @click="addCar" >新加车号</el-button>
					<div style="margin-top:20px;">
						<template v-for='(item, index) in logistics_info'>
							<el-form :rules="rules" ref="ruleForm" :model="logistics_info[index]" :inline="true" style="margin-bottom:0;">
								<el-form-item label="车号:">
									<el-autocomplete class="inline-input same_width" v-model="item.plate_number" :fetch-suggestions="querySearchCar" placeholder="请输入车号" size="small" @select="handleSelect(item)" ></el-autocomplete>
								</el-form-item>
								<el-form-item label="联系电话:" prop="driver_tel">
									<el-input type="text" v-model='item.driver_tel' size="small" :maxlength="11" class="same_width"></el-input>
								</el-form-item>
								<el-form-item label="司机:">
									<el-input type="text" v-model='item.driver'size="small" style="width: 100px;"></el-input>
								</el-form-item>
								<el-form-item label="身份证号:" prop="driver_idcard_num">
									<el-input type="text" v-model='item.driver_idcard_num' size="small" :maxlength="18" class="same_width"></el-input>
									<el-button size="small" @click="delCar(index)" :disabled="logistics_info.length==1?true:false">删除</el-button>
								</el-form-item>
							</el-form>
						</template>
					</div>
					<div>
						<label>
							<b>供货信息</b>
						</label>
						<p>
							<span class="span_class">收货人:</span>
							<el-input type="text"  v-model="receiver" size="small" class="same_margin"></el-input>
							<span>联系电话:</span>
							<el-input type="text" v-model="receiver_tel" size="small" class="same_margin" :maxlength="11" :minlength="11"></el-input>
						</p>
						<p>
							<span>送货地址:</span>
							<el-input type="text" v-model="place_of_receipt" size="small" class="same_margin"></el-input>
						</p>
						<p>
							<span>供货时间:</span>
							<el-date-picker v-model="daterange" type="daterange" :picker-options="pickerOptions" placeholder="请选择日期范围" @change='changeDate' style="width:280px;" size="small"></el-date-picker>
						</p>
						<p>
							<span>付款时间:</span>
							<span>见合同</span>
						</p>
						<label class="span_class">
							<b>备  注：</b>
						</label>
						<el-input v-model="remarks" type="text" size="small" style="display:inline-block;width:67%;"></el-input>
						<div style="text-align:left;margin-top:20px;width:100%;">
							<div style="float:left;">
								<p>
									<span >买方(收货单位):</span>
									<span>{{tradeBetween.buyercompany}}</span>
								</p>
								<p>
									<span class="span_class">经办人:</span>
									<el-input  v-model="bussinessInfo.buyer_name" type="text" size="small" class="same_width"></el-input>
								</p>
								<p>
									<span class="span_class">传真:</span>
									<el-input v-model="bussinessInfo.buyer_fax" type="text" size="small" class="same_width"></el-input>
								</p>
								<p>
									<span class="span_class">日期:</span>
									<span>{{bussinessInfo.date_create}}</span>
								</p>
							</div>
							<div style="float:left; margin-left:150px;margin-bottom:50px;">
								<p>
									<span>卖方(供货单位):</span>
									<span>{{tradeBetween.sellcompany}}</span>
								</p>
								<p>
									<span class="span_class">经办人:</span>
									<el-input v-model="bussinessInfo.seller_name" type="text" size="small" class="same_width"></el-input>
								</p>
								<p>
									<span class="span_class">传真:</span>
									<el-input v-model="bussinessInfo.seller_fax" type="text" size="small" class="same_width"></el-input>
								</p>
								<p>
									<span class="span_class">日期:</span>
									<span>{{bussinessInfo.date_handle}}</span>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- 状态大于3的时候为不可编辑状态 -->
		<div v-else>
			<p style="text-align:left;" v-show="orderStatus !=0">
				<label style="margin-right: 20px;font-size: 16px;">订单进度:</label>
				<el-steps :space="100" finish-status="success" style="display: inline-block;vertical-align: middle;" align-center>
					<el-step v-if="orderStatus==0" title="待供方接单" status="finish"></el-step>
					<el-step v-if="orderStatus>0||orderStatus<-1" title="供方接单" status="finish"></el-step>
					<el-step v-if="orderStatus<-1||orderStatus>1" title="待确认订单" status="finish"></el-step>
					<el-step v-if="orderStatus>2" title="待发货" status="finish"></el-step>
					<el-step v-if="orderStatus>3" title="已发货" status="finish"></el-step>
					<el-step v-if="orderStatus>4" title="已收货" status="finish"></el-step>
					<el-step v-if="orderStatus==-1 || orderStatus==-2|| orderStatus==-3 " title="已取消" status="error"></el-step>
				</el-steps>
	  		</p>
	  		<div style="float: right;"><span>编号：</span>{{'采'+data.order_number}}</div>
			<table>
		        <thead>
		            <tr>
		                <th style="width: 60px;">序号</th>
		                <th>品牌</th>
		                <th>品名</th>
		                <th>规格</th>
		                <th>材质</th>
		                <th>含税单价(元/吨)</th>
		                <th v-if="orderStatus>1">运费(元/吨)</th>
		                <th>下单数量(吨)</th>
		                <th v-if="orderStatus>3">签收数量(吨)</th>
		                <th>总价(元)</th>
		                <th v-if="transportFunction==1">仓库</th>
		                <th v-if="transportFunction==1||orderStatus">车号</th>
		                <th>备注</th>
		            </tr>
		        </thead>
		        <tbody>
		            <tr v-for="(order, index) in orderList">
		                <td style="width: 60px;">{{ index + 1 }}</td>
		                <td>{{ order.brand }}</td>
		                <td>{{ order.cate_spec }}</td>
		                <td>Φ{{ order.size }}</td>
		                <td>{{ order.material }}</td>
		                <td>{{ order.unit_price }}</td>
		                <td v-if="orderStatus>1">{{ order.freight || 0 }}</td>
		                <td>{{ order.amount }}</td>
		                <td v-if="orderStatus>3">{{ order.received_amount }}</td>
		                <td>{{ makePriceStr((order.received_amount?order.received_amount:order.amount)*((order.unit_price|0)+(order.freight|0))) }}</td>
		                <td v-if="transportFunction==1">{{ order.warehouse }}</td>
		                <td v-if="transportFunction==1||orderStatus">{{ order.plate_num }}</td>
		                <td>{{ order.remark }}</td>
		            </tr>
		            <tr>
		            	<td colspan="3">总计</td>
		            	<td colspan="3"></td>
		            	<td  v-if="orderStatus>1"></td>
		            	<td>{{ totalNum }}</td>
		            	<td v-if="orderStatus>3">
		            		{{totalReceived}}
		            	</td>
		            	<td>{{ totalPrice }}</td>
		            	<td v-if="transportFunction==1"></td>
		            	<td v-if="transportFunction==1||orderStatus"></td>
		            	<td></td>
		            </tr>
		        </tbody>
		    </table>
			<div style="text-align:left;margin-top:20px;">
				<div>
					<label v-if="data.received_at">到货时间:
						<span>{{ data.received_at.slice(0, 10) }}</span>
					</label>
					<div v-if="settle" style="margin-bottom:10px;">
						<label>
							<b>结算条件</b>
						</label>
						<p>{{ Info }} </p>
					</div>

					<label>
						<b>物流信息</b><span style="color:red;font-weight:normal;" v-if="orderStatus!=5">(可在后续操作中补录)</span>
					</label>
					<br>
					<span>运输方式:</span>
					{{transportFunction?'买方自提':'卖方承运'}}
					<el-button size="small" @click="addCar" v-if="orderStatus > 3" >新加车号</el-button>
					<div style="margin-top:20px;">
						<template v-for='item in logistics_info'>
							<p>
								<span>车号:</span>
								<span>{{ item.plate_number }}</span>
								<span>联系电话:</span>
								<span>{{ item.driver_tel }}</span>
								<span>司机:</span>
								<span>{{ item.driver }}</span>
								<span>身份证号:</span>
								<span>{{ item.driver_idcard_num }}</span>
							</p>
						</template>
					</div>
					<div>
						<label>
							<b>供货信息</b>
						</label>
						<p>
							<span class="span_class">收货人:</span>{{ receiver }}
							<span>联系电话:</span>{{ receiver_tel }}
						</p>
						<p>
							<span>送货地址:</span>{{ place_of_receipt }}
						</p>
						<p>
							<span>供货时间:</span>{{ date_of_receipt }}
						</p>
						<p>
							<span>付款时间:</span>
							<span>见合同</span>
						</p>
						<label class="span_class">
							<b>备  注：</b>
						</label>{{ remarks }}
						<div style="text-align:left;margin-top:20px;width:100%;">
							<div style="float:left;">
								<p>
									<span >买方(收货单位):</span>
									<span>{{ tradeBetween.buyercompany }}</span>
								</p>
								<p>
									<span class="span_class">经办人:</span>
									<span>{{ bussinessInfo.buyer_name }}</span>
								</p>
								<p>
									<span class="span_class">传真:</span>
									<span>{{ bussinessInfo.buyer_fax }}</span>
								</p>
								<p>
									<span class="span_class">日期:</span>
									<span>{{bussinessInfo.date_create}}</span>
								</p>
							</div>
							<div style="float:left; margin-left:150px;margin-bottom:50px;">
								<p>
									<span>卖方(供货单位):</span>
									<span>{{tradeBetween.sellcompany}}</span>
								</p>
								<p>
									<span class="span_class">经办人:</span>
									<span>{{ bussinessInfo.seller_name }}</span>
								</p>
								<p>
									<span class="span_class">传真:</span>
									<span>{{ bussinessInfo.seller_fax }}</span>
								</p>
								<p>
									<span class="span_class">日期:</span>
									<span>{{bussinessInfo.date_handle}}</span>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div slot="footer" class="dialog-footer" style="clear:both;text-align:center;">
			<el-button @click='exit'>返回</el-button>
			<el-button type="danger" @click="cancelOrder" v-if='orderStatus==1||orderStatus==0'>取消订单</el-button>
			<el-button type="primary" @click="confirm" v-if='orderStatus==2'>确认订单</el-button>
			<el-button type="success" @click="confirmReceive" v-if='orderStatus==4'>确认收货</el-button>
			<el-button type="primary" @click="resendOrder" v-if='orderStatus < 0'>重发订单</el-button>
		</div>
	</div>
</template>
<style scoped>
	.el-input{
		width: 70px;
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
</style>
