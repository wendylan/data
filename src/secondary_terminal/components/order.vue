<script>
import ajaxCustom from '../../components/ajax-custom.js';
import orderSales from './order_purchase.vue';
import { Input, Table, TableColumn, Button, Dialog, Select, Option, DatePicker, Autocomplete, Form, FormItem, Steps, Step } from 'element-ui';
export default{
	components : {
		orderSales,
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
		this.roles = this.toJson(role);
		this.connectData;
		this.orderData;
		for(let order of this.orderList){
			order.allAmount = order.amount;
		}
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
			historyCarInfo : null,
			carNums : [],
			car_info_change : 0,
			roles : [],
			id : null,
			orderList : [],
			orderStatus : 0,
			purcharStatus : null,
			showOrder : true,
			transportFunction : 0,
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
			// 收货人
			receiver : null,
			// 收货人电话
			receiver_tel : null,
			// 供货的时间范围
			date_of_receipt : null,
			// 送货地址
			place_of_receipt : null,
			// 备注
			remarks : null,
			// 项目信息
			project : null,
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
			},
			isSelectNeeding : false,
			tradeBetween :[],
			setIndex : 0,
		}
	},
	computed : {
		orderData(){
			console.log(this.data.logisticsInfo);
			if(this.data.logisticsInfo){
				this.logistics_info = JSON.parse(JSON.stringify(this.data.logisticsInfo));
			}else{
				this.logistics_info = [];
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
			this.purcharStatus = this.data.send_for_purchar;
			this.receiver = this.data.receiver;
			this.receiver_tel = this.data.receiver_tel;
			this.date_of_receipt = this.data.date_of_receipt;
			this.place_of_receipt = this.data.place_of_receipt;
			this.remarks = this.data.remarks;
			this.orderList = this.orderRightSequence(this.data.orderDetail);
			if(this.data.bussinessInfo.length){
				this.bussinessInfo = this.data.bussinessInfo[0];
			}
			this.orderStatus = this.data.status;
			this.transportFunction = parseInt(this.data.transport_function);
			this.id = this.data.id;
			this.settle = this.data.settlement;
			this.project = this.data.project;
			this.tradeBetween = this.data.tradeBetween;
		},
		totalNum(){
			let order = this.orderList;
			let num = 0;
			for(let i = 0; i < order.length;i++){
				num += parseInt(order[i].amount);
			}
			return num;
		},
		totalPrice(){
			let order = this.orderList;
			let sum = 0;
			for(let i = 0;i < order.length; i++){
				sum += parseFloat(
					( ( order[i].received_amount ? order[i].received_amount : order[i].amount) * ((order[i].unit_price | 0) + (order[i].freight | 0)) )
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
		},
	},
	watch : {
		data(){
			this.getOrderHistoryData({id:this.data.id, project_id:this.data.project_id});
			this.connectData;
			this.orderData;
		},
	},
	methods : {
        // 获取所有品牌
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
		getOrderHistoryData(data){
			ajaxCustom.ajaxGet(this, "dingoapi/getOrderHistoryInfo", {params:data}, (responese)=>{
				let resp = responese.body.receiverInfo;
				if(!this.receiver&&resp){
					this.receiver = resp.receiver;
					this.receiver_tel = resp.receiver_tel;
					this.place_of_receipt = resp.place_of_receipt;
				}
				this.historyCarInfo = responese.body.driverInfo;
				this.carNums = [];
				let historyCar = this.historyCarInfo;
				for(let i = 0; i< historyCar.length; i++ ){
					this.carNums.push({"value" : historyCar[i].plate_number});
				}
				this.getBuessinessInfo();
			}, (responese)=>{
				console.log(responese);
			});
		},
		getBuessinessInfo(){
			let handlers = JSON.parse(this.project.handlers);
			if(this.bussinessInfo.seller_name==""||!this.bussinessInfo.seller_name){
				if(handlers.seller){
					if(handlers.seller.length!=0){
						this.bussinessInfo.seller_name=handlers.seller[0].handler;
					}
				}
			}
			if(this.bussinessInfo.seller_fax==""||!this.bussinessInfo.seller_fax){
				if(handlers.seller){
					if(handlers.seller.length!=0){
						this.bussinessInfo.seller_fax=handlers.seller[0].handler_fax;
					}
				}
			}
		},
		toJson(data){
			data = data.replace(/&quot;/g, '"');
			data = JSON.parse(data);
			return data;
		},
		hasRole(role){
			// console.log(this.data);
			for (var i = 0; i < this.roles.length; i++) {
				if(this.roles[i].name==role){
					return true;
				}
			}
			return false;
		},
		changeDate(date){
			console.log(this.daterange);
			this.date_of_receipt = date;
		},
		exit(){
			this.$emit('exit', this.showOrder);
		},
		saveOrder(){
			this.sendData('saveOrder');
		},
		cancelOrder(){
			this.$emit('cancel', { id : this.id, status : 2 });
		},
		checkCarIsChange(){
			let data = this.data.logisticsInfo;
			let datanew = this.logistics_info;
			if(!data||!datanew){
				return ;
			}
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
		sendOrder(){
			this.sendData('send');
		},
		sendForPurchar(){
			this.sendData('sendForPurchar');
		},
		sendForReceived(){
			this.sendData('sendForReceived');
		},
		confirm(){
			this.sendData('confirm');
		},
		confirmReceive(){
			this.sendData('confirmReceived');
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
		// 拆单
		seperateBill(index){
			this.orderList.splice(index, 0, JSON.parse(JSON.stringify(this.orderList[index])));
			this.orderList[index+1].id = '';
			this.orderList[index+1].amount = 1;
			// this.orderList[index+1].total = this.orderList[index+1].unit_price;
			this.orderList[index+1].menu = '1';
		},
		// 拆单后的每行数据之和保持与原来的下单数量相等
		computedAmount(index){
			console.log(this.orderList[index]);
			if(!this.orderList[index].menu){
				return;
			}
			let mainIndex = -1;
			for( let i = index; i >= 0; i-- ){
				if(this.orderList[i].menu != "1"){
					mainIndex = i;
					break;
				}
			}
			let sum = 0;
			for ( let i = mainIndex+1; this.orderList[i].menu =='1'; i++ ) {
				sum += parseInt(this.orderList[i].amount)|0;
			}
			sum += parseInt(this.orderList[mainIndex].amount);
			this.orderList[mainIndex].amount = this.orderList[mainIndex].amount - (sum - this.orderList[mainIndex].allAmount);
		},
		// 每行的背景颜色
		rowClass(order){
			if( order.menu ){
				return 'selectTr';
			}else{
				return 'noSelectTr';
			}
		},
		// 删除
		delOne(index){
			this.orderList.splice(index, 1);
		},
		newOrder(order){
			let olddata = this.orderListHandle(order.length, this.orderList.length);
			let data = [];
			for (var i = 0; i < this.orderList.length; i++) {
				this.$set(olddata[i], 'brand', order[i].brand);
				this.$set(olddata[i], 'cate_spec', order[i].cate_spec);
				this.$set(olddata[i], 'size', order[i].size);
				this.$set(olddata[i], 'material', order[i].material);
				this.$set(olddata[i], 'amount', order[i].amount);
				this.$set(olddata[i], 'unit_price', order[i].countPrice);

				if(order[i].warehouse=="钢厂直送"){
					this.$set(olddata[i], 'plate_num', '钢厂直送');
				}
				data.push(olddata[i]);
			}
			this.orderList = [];
			this.orderList=JSON.parse(JSON.stringify(data));
			this.isSelectNeeding = false;

		},
		orderListHandle(newCount, oldCount){
			if(newCount>oldCount){
				for(let i=0 ; i<(newCount-oldCount) ; i++){
					this.orderList.push(this.getOrderListItem());
				}
			}else if(newCount<oldCount){
				for (var i = 0; i<(oldCount-newCount); i++) {
					this.orderList.pop();
				}
			}
			return this.orderList;
		},
		getOrderListItem(){
			let item = JSON.parse(JSON.stringify(this.orderList[0]));
			item.id = null;
			item.plate_num = null;
			item.remark = null;
			item.unit_price = null;
			return item;
		},
		// 返回控件
		openBox(data){
			this.isSelectNeeding = data;
			this.$emit('hideClose', true);
		},
		showOrderDetail(){
			this.setIndex += 1;
			this.isSelectNeeding = !this.isSelectNeeding
			this.$emit('hideClose', false);
		},
		// 价格逗号
		makePriceStr(price){
			var newStr = "";
			var count = 0;
			let str = price.toString();
			if(str.indexOf(".")==-1){
				for(let i = str.length-1; i>=0; i--){
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
		}
	},
	mounted(){
		this.getOrderHistoryData({id:this.data.id, project_id:this.data.project_id});
        this.getAllProduct();

	},
}
</script>
<template>
	<div style="width: 80%;margin: 0 auto;">
		<!-- 当用户还没确认订单的时候进行编辑 -->
		<div v-if="orderStatus<3">
			<div v-show="!isSelectNeeding">
				<p style="text-align:left;" v-show="orderStatus !=0">
					<label style="margin-right: 20px;font-size: 16px;">订单进度:</label>
					<el-steps :space="100" finish-status="success" style="display: inline-block;vertical-align: middle;" align-center>
						<el-step v-if="orderStatus==0" title="待供方接单" status="finish"></el-step>
						<el-step v-if="orderStatus>0||orderStatus<-1" title="供方接单" status="finish"></el-step>
						<el-step v-if="orderStatus<-1||orderStatus>1" title="待确认订单" status="finish"></el-step>
						<el-step v-if="orderStatus>2" title="待发货" status="finish"></el-step>
						<el-step v-if="orderStatus>3" title="已发货" status="finish"></el-step>
						<el-step v-if="orderStatus>4" title="已收货" status="finish"></el-step>
						<el-step  v-if="orderStatus==-1 || orderStatus==-2|| orderStatus==-3 " title="已取消" status="error"></el-step>
					</el-steps>
		  		</p>
		  		<div style="float: right;"><span>编号：</span>{{'销'+data.order_number}}</div>
				<table>
			        <thead>
			            <tr>
			                <th style="width: 50px;">序号</th>
			                <th>品牌</th>
			                <th>品名</th>
			                <th style="width: 60px;">规格</th>
			                <th>材质</th>
			                <th>含税单价(元/吨)</th>
			                <th>运费(元/吨)</th>
			                <th>下单数量(吨)</th>
			                <th v-if="orderStatus>2">到货数量(吨)</th>
			                <th>总价(元)</th>
			                <th v-if="transportFunction==1||orderStatus">车号</th>
			                <th>备注</th>
			                <th v-if="orderStatus<2">操作</th>
			            </tr>
			        </thead>
			        <tbody>
			            <tr v-for="(order, index) in orderList" :class="rowClass(order)">
			                <td style="width: 50px;">{{ index + 1 }}</td>
			                <td>
			                    <el-autocomplete class="inline-input" v-model="order.brand" :fetch-suggestions="querySearch" placeholder="请输入品牌" size="small"></el-autocomplete>
			                </td>
			                <td>{{ order.cate_spec }}</td>
			                <td style="width: 60px;">Φ{{ order.size }}</td>
			                <td>{{ order.material }}</td>
			                <td>
			                	<el-input v-model="order.unit_price" type="number" size="small" min="0"></el-input>
			                </td>
			                <td>
								<el-input size="small" type='number' v-model="order.freight" min="0"></el-input>
							</td>
			                <td>
			                	<el-input v-model="order.amount" type="number" size="small" min="0" style="width:60px;" @change="computedAmount(index)"></el-input>
			                </td>
			                <td v-if='orderStatus>2'>
			                	<el-input v-model="order.received_amount" type="number" size="small" min="0" style="width:80px;" title="请输入一个确切的数"></el-input>
			                </td>
			                <td>{{ makePriceStr( ( ( order.received_amount ? order.received_amount : order.amount) * ((order.unit_price | 0) + (order.freight | 0)) ) ) }}</td>
			                <td v-if="transportFunction==1||orderStatus">
			                	<el-select v-model='order.plate_num' type="text" size="small">
			                		<el-option  :value='item.plate_number' v-for='item in logistics_info'></el-option>
			                	</el-select>
			                </td>
			                <td>
			                	<el-input v-model='order.remark' type="text" size="small" style="width:90px;"></el-input>
			                </td>
			                <td v-if="orderStatus<2">
			                	<el-button @click="delOne(index)" size="mini" type="danger" v-if="order.menu" >删除</el-button>
			                	<el-button @click="seperateBill(index)" size="mini" type="info" v-else>拆单</el-button>
			                </td>
			            </tr>
			        </tbody>
			            <tr>
			            	<td colspan="3">总计</td>
			            	<td colspan="4"></td>
			            	<td>{{ totalNum }}</td>
			            	<td v-if="orderStatus>2">
			            		{{ totalReceived }}
			            	</td>
			            	<td>{{ totalPrice }}</td>
			            	<td v-if="transportFunction==1||orderStatus"></td>
			            	<td></td>
			            	<td v-if="orderStatus<2"><el-button @click="showOrderDetail" type="success" size="small" v-if="!isSelectNeeding">配置订单</el-button></td>
			            </tr>
			    </table>

				<div style="text-align:left;margin-top:20px;">
					<label v-if="data.received_at">收货时间:
						<span>{{ data.received_at.slice(0, 10) }}</span>
					</label>
					<br>
					<label>
						<b>物流信息</b><span style="color:red;font-weight:normal;">(可在后续操作中补录)</span>
					</label>
					<br>
					<span>运输方式:</span>
					<el-select placeholder="请选择" v-model='transportFunction'  size="small">
						<el-option label="买方自提" :value="1"></el-option>
						<el-option label="卖方承运" :value="0"></el-option>
					</el-select>
					<el-button size="small" @click="addCar" >新加车号</el-button>
					<div  style="margin-top:10px;">

						<template v-for='(item, index) in logistics_info'>
							<el-form :rules="rules" ref="ruleForm" :model="logistics_info[index]" :inline="true" style="margin-bottom:-20px;">
								<el-form-item label="车号:">
									<el-autocomplete class="inline-input" v-model="item.plate_number" :fetch-suggestions="querySearchCar" placeholder="请输入车号" size="small" @select="handleSelect(item)" v-if="orderStatus"></el-autocomplete>
									<el-input type="text" v-model="item.plate_number" size="small" class="same_width" v-else></el-input>
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
							<span class="span_class">送货地址:</span>
							<el-input type="text" v-model="place_of_receipt" size="small" class="same_margin"></el-input>
						</p>
						<p>
							<span class="span_class">供货时间:</span>
							<el-date-picker v-model="daterange" type="daterange" :picker-options="pickerOptions" placeholder="请选择日期范围" @change='changeDate' style="width:400px;" size="small"></el-date-picker>
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

			<div v-show="isSelectNeeding">
				<order-sales :data="project" @confirmOrder="newOrder" :old="orderList" :open="isSelectNeeding" @getOpen="openBox" :id="id" :index="setIndex"></order-sales>
			</div>

		</div>
		<!-- 客户已确认的订单除了车号外都不可编辑 -->
		<div v-else>
			<div>
				<p style="text-align:left;" v-show="orderStatus !=0">
					<label style="margin-right: 20px;font-size: 16px;">订单进度:</label>
					<el-steps :space="100" finish-status="success" style="display: inline-block;vertical-align: middle;" align-center>
						<el-step v-if="orderStatus==0" title="待供方接单" status="finish"></el-step>
						<el-step v-if="orderStatus>0||orderStatus<-1" title="供方接单" status="finish"></el-step>
						<el-step v-if="orderStatus<-1||orderStatus>1" title="待确认订单" status="finish"></el-step>
						<el-step v-if="orderStatus>2" title="待发货" status="finish"></el-step>
						<el-step v-if="orderStatus>3" title="已发货" status="finish"></el-step>
						<el-step v-if="orderStatus>4" title="已收货" status="finish"></el-step>
						<el-step  v-if="orderStatus==-1 || orderStatus==-2|| orderStatus==-3 " title="已取消" status="error"></el-step>
					</el-steps>
		  		</p>
		  		<div style="float: right;"><span>编号：</span>{{'销'+data.order_number}}</div>
				<table>
			        <thead>
			            <tr>
			                <th style="width: 50px;">序号</th>
			                <th>品牌</th>
			                <th>品名</th>
			                <th style="width: 60px;">规格</th>
			                <th>材质</th>
			                <th>含税单价(元/吨)</th>
			                <th>运费(元/吨)</th>
			                <th>下单数量(吨)</th>
			                <th v-if="orderStatus>2">到货数量(吨)</th>
			                <th>总价(元)</th>
			                <th v-if="transportFunction==1||orderStatus">车号</th>
			                <th>备注</th>
			            </tr>
			        </thead>
			        <tbody>
			            <tr v-for="(order, index) in orderList" :class="rowClass(order)">
			                <td style="width: 50px;">{{ index + 1 }}</td>
			                <td>{{ order.brand }}</td>
			                <td>{{ order.cate_spec }}</td>
			                <td style="width: 60px;">Φ{{ order.size }}</td>
			                <td>{{ order.material }}</td>
			                <td>{{ order.unit_price }}</td>
			                <td>{{ order.freight }}</td>
			                <td>{{ order.amount }}</td>
			                <td v-if='orderStatus>2'>
								<el-input v-model="order.received_amount" type="number" size="small" min="0" style="width:80px;" title="请输入一个确切的数"></el-input>
			                </td>
			                <td>{{ makePriceStr( ( ( order.received_amount ? order.received_amount : order.amount) * ((order.unit_price | 0) + (order.freight | 0)) ) ) }}</td>
			                <td v-if="transportFunction==1||orderStatus">{{ order.plate_num }}</td>
			                <td>
								<el-input v-model='order.remark' type="text" size="small" style="width:95px;"></el-input>
			                </td>
			            </tr>
			        </tbody>
			            <tr>
			            	<td colspan="3">总计</td>
			            	<td colspan="4"></td>
			            	<td>{{ totalNum }}</td>
			            	<td v-if="orderStatus>2">
			            		{{ totalReceived }}
			            	</td>
			            	<td>{{ totalPrice }}</td>
			            	<td v-if="transportFunction==1||orderStatus"></td>
			            	<td></td>
			            </tr>
			    </table>

				<div style="text-align:left;margin-top: 20px; font-size: 14px;">
					<label style="margin-bottom: 15px;" v-if="data.received_at">收货时间:
						<span>{{ data.received_at.slice(0, 10) }}</span>
					</label>
					<br>
					<label>
						<b class="same_font">物流信息</b><span style="color:red;font-weight:normal;">(可在后续操作中补录)</span>
					</label>
					<br>
					<span class="same_font">运输方式:</span>
					<el-select placeholder="请选择" v-model='transportFunction'  size="small">
						<el-option label="买方自提" :value="1"></el-option>
						<el-option label="卖方承运" :value="0"></el-option>
					</el-select>
					<el-button size="small" @click="addCar" >新加车号</el-button>
					<div  style="margin-top:10px;">

						<template v-for='(item, index) in logistics_info'>
							<el-form :rules="rules" ref="ruleForm" :model="logistics_info[index]" :inline="true" style="margin-bottom:-20px;">
								<el-form-item label="车号:">
									<el-autocomplete class="inline-input" v-model="item.plate_number" :fetch-suggestions="querySearchCar" placeholder="请输入车号" size="small" @select="handleSelect(item)" v-if="orderStatus"></el-autocomplete>
									<el-input type="text" v-model="item.plate_number" size="small" class="same_width" v-else></el-input>
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
					<div>
						<label>
							<b class="same_font">供货信息</b>
						</label>
						<p>
							<span class="span_class same_font">收货人:</span>{{ receiver }}
						</p>
						<p>
							<span class="span_class same_font">联系电话:</span>{{ receiver_tel }}
						</p>
						<p>
							<span class="span_class same_font">送货地址:</span>{{ place_of_receipt }}
						</p>
						<p>
							<span class="span_class same_font">供货时间:</span>{{ date_of_receipt }}
						</p>
						<label class="span_class">
							<b class="same_font">备  注：</b>
						</label>
						<el-input v-model="remarks" type="text" size="small" style="display:inline-block;width:67%;"></el-input>
						<div style="text-align:left;margin-top:20px;width:100%;">
							<div style="float:left;">
								<p>
									<span  class="same_font">买方(收货单位):</span>
									<span>{{tradeBetween.buyercompany}}</span>
								</p>
								<p>
									<span class="span_class same_font">经办人:</span>
									<span>{{ bussinessInfo.buyer_name }}</span>
								</p>
								<p>
									<span class="span_class same_font">传真:</span>
									<span>{{ bussinessInfo.buyer_fax }}</span>
								</p>
								<p>
									<span class="span_class same_font">日期:</span>
									<span>{{bussinessInfo.date_create}}</span>
								</p>
							</div>
							<div style="float:left; margin-left:150px;margin-bottom:50px;">
								<p>
									<span class="same_font">卖方(供货单位):</span>
									<span>{{tradeBetween.sellcompany}}</span>
								</p>
								<p>
									<span class="span_class same_font">经办人:</span>
									<span>{{ bussinessInfo.seller_name }}</span>
								</p>
								<p>
									<span class="span_class same_font">传真:</span>
									<span>{{ bussinessInfo.seller_fax }}</span>
								</p>
								<p>
									<span class="span_class same_font">日期:</span>
									<span>{{bussinessInfo.date_handle}}</span>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div slot="footer" class="dialog-footer" v-if="!isSelectNeeding">
			<el-button @click='exit'>返回</el-button>
			<el-button type="primary" @click="saveOrder">保存</el-button>
			<el-button type="danger" @click="cancelOrder" v-if='orderStatus==1'>取消订单</el-button>
			<el-button type="success" @click='sendForPurchar()' v-if="(orderStatus>0 && orderStatus<3) && purcharStatus!=2">发给采购</el-button>
			<el-button type="danger"  @click='confirm' v-if='orderStatus==2'>代确认</el-button>
			<el-button type="danger"  @click='confirmReceive' v-if='orderStatus==4'>代收货</el-button>
			<el-button type="primary" @click="sendOrder" v-if='orderStatus==1 '>发给客户</el-button>
			<el-button type="primary" @click="sendForReceived" v-if='orderStatus==3'>发送</el-button>
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
	.dialog-footer{
		margin-top: 20px;
		margin-bottom: 30px;
		clear:both;
		text-align:center;
	}
	.selectTr{
		background-color: #f0f0f6;
	}
	.noSelectTr{
		background-color: #fff;
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
	.car_same{
		margin-left: 20px;
		font-weight: bold;
	}
	.same_font{
		font-size: 14px;
	}
</style>
