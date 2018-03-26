<script>
	import { Select, Option, DatePicker, Button, Tabs, TabPane, Table, TableColumn, Pagination, Dialog, Form, FormItem, Input, Steps, Step } from 'element-ui';
	import ajaxCustom from '../components/ajax-custom.js';
	import headerbar from "../components/same-headerbar.vue";
	import order from "./components/order_terminal.vue";
	export default{
		components:{
			headerbar,
			order,
			elSelect:Select,
			elOption:Option,
			elDatePicker:DatePicker,
			elButton:Button,
			elTabs:Tabs,
			elTabPane:TabPane,
			elTable:Table,
			elTableColumn:TableColumn,
			elPagination:Pagination,
			elDialog:Dialog,
			elForm:Form,
			elFormItem:FormItem,
			elInput:Input,
			elSteps:Steps,
			elStep:Step,
		},
		created : function(){
			ajaxCustom.ajaxGet(this, "dingoapi/getOrderPageDefault", (response)=>{
				response = response.body;
				console.log(response);
				this.userProjectInfo.item = response.data.projectDatas;
				let userOrder = response.data.orderDatas;
				this.orderInfo = JSON.parse(JSON.stringify(userOrder));

				let userPro = this.userProjectInfo.item;
				let order = this.orderInfo;
				for(let i = 0; i < userPro.length; i++ ){
					for(let j = 0; j < order.length; j++){
						if(userPro[i].project_info_id==order[j].project_id){
							order[j].project_name = userPro[i].name;
							order[j].settlement = userPro[i].settlement;
						}
					}
				}
				this.handleClick();
			}, (response)=>{
				alert(response.body.message);
			});
		},
		data(){
			return{
				value : '',
				userProjectInfo : {
					item : null,
					selected : null
				},
				pickerOptions : {
					disabledDate(time) {
                        return time.getTime() > Date.now() ;
                    }
                },
                pickerOptions1 : {
					disabledDate(time) {
						return time.getTime() <= Date.now() ;
					}
				},
				foremost : '',
				final : '',
				activeName : 'six',
				orderStatus : [
					{num : 0, text : "未处理", type:"info"},
					{num : 1, text : "处理中", type:"primary"},
					{num : 2, text : "待确认", type:"warning"},
					{num : 3, text : "待发货", type:"primary"},
					{num : 4, text : "待收货", type:"warning"},
					{num : 5, text : "已完成", type:"success"},
					{num : -1, text : "已取消", type:"danger"},
					{num : -2, text : "已取消", type:"danger"},
					{num : -3, text : "已取消", type:"danger"}
				],
				orderInfo : [],
				searchOrderInfo : [],
				currentOrderInfo : [],	//当前的订单信息
				pageOrderInfo : [],
				currentPage : 1,
				dialogOrderVisible : false,
				showOrder : false,
				buyData : {
					rebarData : [],
					transport : {
						way : 2,
						message : [
							{
								carNum : null,
								people : null,
								tel : null,
								IDCard : null
							}
						]
					},
					supply_information : {
						receiver_name : null,
						receiver_tel : null,
						receiver_addr : null,
						supply_time : null,
					},
					remark : null,
				},
				settlement : null,
				// 缓存选择项目后的table数据
				cacheOrder : [],
				// 总的出货量
				totalNum : 0,
				totalPrice : 0,
			}
		},
		methods: {
			// 获取已出货量和已用金额
			getSomeCount(type){
				let order = this.orderInfo;
				let count = 0;
				let countNum = 0;
				if(this.userProjectInfo.selected){
					for(let data of this.cacheOrder){
						if((data.project_name == this.userProjectInfo.selected) && (parseInt(data.status) == 5)){
							for(let item of data.orderDetail){
								countNum += parseInt(item.amount | 0);
								count += (parseInt(item.amount | 0)  + parseInt(item.freight | 0 ))*parseInt(item.unit_price |0);
							}
						}
					}
				}else{
					for(let data of order){
						if(parseInt(data.status) == 5){
							for(let item of data.orderDetail){
								countNum += parseInt(item.amount | 0);
								count += (parseInt(item.amount | 0)  + parseInt(item.freight | 0 ))*parseInt(item.unit_price |0);
							}
						}
					}
				}
				if(type=="price"){
					return count;
				}else{
					return countNum;
				}
			},
			// 查看订单详情
			showdata(index){
				this.buyData = this.pageOrderInfo[index];
				console.log(this.buyData);
				this.showOrder = !this.showOrder;
			},
			// 状态文字转换
			statusToText(status){
				for(let data of this.orderStatus){
					if(data.num == status){
						return  data;
					}
				}
			},
			// 确认
			confirmOrder(data){
				ajaxCustom.ajaxPost(this, '/dingoapi/finishOrder', data, (responese)=>{
					console.log(responese);
					let resp = responese.body.data_user_order;
					resp.project_name = resp.project.name;
					this.orderUpdate(resp);
				}, (responese)=>{
					alert(responese.body.message);
				});
				this.showOrder = !this.showOrder;
			},
			// 删除订单
			deldata(val){
				ajaxCustom.ajaxPost(this, '/dingoapi/deleteOrder', {id : val}, (responese)=>{
					console.log(responese);
					this.updateState(this.orderInfo, val);
					this.updateState(this.currentOrderInfo, val);
					this.updateState(this.pageOrderInfo, val);
				}, (responese)=>{
					alert(responese.body.message);
				});
			},
			// 刪除订单的状态改变
			updateState(order, val){
				var len = order.length;
				for(var i = 0; i < len; i++){
					if(order[i].id == val){
						order.splice(i, 1);
						len--;
					}
				}
			},
			listUpdate(order, orderList){
				for (var i = orderList.length - 1; i >= 0; i--) {
					if(orderList[i].id == order.id){
						orderList.splice(i, 1, order);
					}
				}
			},
			orderUpdate(data){
				this.listUpdate(data, this.orderInfo);
				this.listUpdate(data, this.currentOrderInfo);
				this.listUpdate(data, this.pageOrderInfo);
			},
			// 导出订单
			downLoad(){
				if(this.foremost && this.final){
					let arr = [];
					arr[0] = this.dateFormat(this.foremost);
					arr[1] = this.dateFormat(this.final);
					let dataRange = arr.join(' - ');
					window.open('dingoapi/exportExcel/' + dataRange, '_blank');
				}
			},
			//返回
			exitOrder(){
				this.showOrder = !this.showOrder;
			},
			// 撤回订单
			revokedata(id){
				ajaxCustom.ajaxPost(this, '/dingoapi/cancelOrder', {'id' : id, 'status' : 1}, (responese)=>{
					console.log(responese);
					let name = null;
					let settlement = null;
					for(let i = 0; i < this.pageOrderInfo.length;i++){
						if(this.pageOrderInfo[i].id == id){
							name = this.pageOrderInfo[i].project_name;
							settlement = this.pageOrderInfo[i].settlement;
						}
					}
					let proInfo = responese.body.data_user_order;
					proInfo.project_name = name;
					proInfo.settlement = settlement;
					this.orderUpdate(proInfo);


				}, (responese)=>{
					alert(responese.body.message);
				});
			},
			// 取消订单
			cancelOrder(data){
				ajaxCustom.ajaxPost(this, '/dingoapi/cancelOrder', data, (responese)=>{
					console.log(responese);

					let name = null;
					let settlement = null;
					for(let i = 0; i < this.pageOrderInfo.length;i++){
						if(this.pageOrderInfo[i].id == data.id){
							name = this.pageOrderInfo[i].project_name;
							settlement = this.pageOrderInfo[i].settlement;
						}
					}
					let proInfo = responese.body.data_user_order;
					proInfo.project_name = name;
					proInfo.settlement = settlement;
					this.orderUpdate(proInfo);

				}, (responese)=>{
					alert(responese.body.message);
				});
				this.showOrder = !this.showOrder;
			},
			// 重发订单
			resendOrder(data){
				console.log(data);
				ajaxCustom.ajaxPost(this, '/dingoapi/resendOrder', data, (responese)=>{
					console.log(responese);

					let name = null;
					let settlement = null;
					for(let i = 0; i < this.pageOrderInfo.length;i++){
						if(this.pageOrderInfo[i].id == data.id){
							name = this.pageOrderInfo[i].project_name;
							settlement = this.pageOrderInfo[i].settlement;
						}
					}
					let proInfo = responese.body.data_user_order;
					proInfo.project_name = name;
					proInfo.settlement = settlement;
					this.orderUpdate(proInfo);
					this.showOrder = !this.showOrder;
				}, (responese)=>{
					console.log(responese);
					alert(responese.body.message);
				});
			},
			confirmReceived(data){
				console.log(data.date_of_receipt);
				ajaxCustom.ajaxPost(this, '/dingoapi/confirmReceived', data, (responese)=>{
					console.log(responese);

					let name = null;
					let settlement = null;
					for(let i = 0; i < this.pageOrderInfo.length;i++){
						if(this.pageOrderInfo[i].id == data.id){
							name = this.pageOrderInfo[i].project_name;
							settlement = this.pageOrderInfo[i].settlement;
						}
					}
					let proInfo = responese.body.data_user_order;
					proInfo.project_name = name;
					proInfo.settlement = settlement;
					this.orderUpdate(proInfo);
					this.showOrder = !this.showOrder;
				}, (responese)=>{
					console.log(responese);
					alert(responese.body.message);
				});
			},
			// 保存订单
			saveOrder(){
				this.dialogOrderVisible = false;
				console.log(this.buyData);
			},
			// tab控件
			handleClick() {
				this.userProjectInfo.selected = '';
					this.foremost = '';
					this.final = '';

					let active = this.activeName;
					// 全部订单
					if(active == 'six') {
						this.currentOrderInfo = [];
						this.currentOrderInfo = this.orderInfo;
						this.changePage(1);
					}
					// 未处理
					if(active == 'zero') {
						this.currentOrderInfo = [];
						for(let data of this.orderInfo){
							if(data.status == 0 ){
								this.currentOrderInfo.push(data);
							}
						}
						this.changePage(1);
					}
					// 处理中
					if(active == 'one') {
						this.currentOrderInfo = [];
						for(let data of this.orderInfo) {
							if(data.status == 1) {
								this.currentOrderInfo.push(data);
							}
						}
						this.changePage(1);
					}
					// 待确认
					if(active == 'two') {
						this.currentOrderInfo = [];
						for(let data of this.orderInfo){
							if(data.status == 2 ){
								this.currentOrderInfo.push(data);
							}
						}
						this.changePage(1);
					}
					// 待发货
					if(active == 'three') {
						this.currentOrderInfo = [];
						for(let data of this.orderInfo){
							if(data.status == 3 ){
								this.currentOrderInfo.push(data);
							}
						}
						this.changePage(1);
					}
					// 待收货
					if(active == 'four') {
						this.currentOrderInfo = [];
						for(let data of this.orderInfo){
							if(data.status == 4 ){
								this.currentOrderInfo.push(data);
							}
						}
						this.changePage(1);
					}
					// 已完成
					if(active == 'five') {
						this.currentOrderInfo = [];
						for(let data of this.orderInfo){
							if(data.status == 5 ){
								this.currentOrderInfo.push(data);
							}
						}
						this.changePage(1);
					}
					// 已取消
					if(active == 'seven') {
						this.currentOrderInfo = [];
						for(let data of this.orderInfo) {
							if(data.status < 0){
								this.currentOrderInfo.push(data);
							}
						}
						this.changePage(1);
					}
			},
			// 根据项目来查询
			selectProject(data){
				if(data){
					this.activeName =null;
					let order = this.orderInfo;
					let arr= [];
					for(let i = 0; i < order.length; i++){
						if(order[i].project_name == data){
							arr.push(order[i]);
						}
					}
					this.currentOrderInfo = arr;
					this.cacheOrder = JSON.parse(JSON.stringify(this.currentOrderInfo));
					this.changePage(1);
				}
				this.totalNum = this.getSomeCount('num');
				this.totalPrice = this.getSomeCount('price');
			},
			// 重置项目按钮
			clearProject(){
				this.userProjectInfo.selected = '';
				this.cacheOrder = [];
				this.activeName = 'six';
				this.handleClick();
			},
			// 清空
			clearAll(){
				this.foremost = '';
				this.final = '';
				this.activeName = 'six';
				this.handleClick();
			},
			// 时间规范
			foremostDateContrast(date){
				if(date && this.final){
					let foremost = date.getTime()/1000;
					let final = (new Date(this.final)).getTime()/1000;
					if(final <= foremost ){
						this.foremost = '';
					}
				}
			},
			finalDateContrast(date){
				if(date && this.foremost){
					let final = date.getTime()/1000;
					let foremost = (new Date(this.foremost)).getTime()/1000;
					// console.log(final);
					if(final <= foremost ){
						this.final = '';
					}
				}
			},
			// 根据时间日期来查询
			searchOrder(){
				if(this.final && this.foremost){
					this.activeName = null;
					this.currentOrderInfo = [];
					this.searchOrderInfo = [];
					let foremost = this.dateFormat(this.foremost);
					let final = this.dateFormat(this.final);
					let tmp = null;
					if(this.userProjectInfo.selected){
						tmp = this.timeRange(this.cacheOrder, foremost, final);
					}else{
						tmp = this.timeRange(this.orderInfo, foremost, final);
					}
					this.totalNum = tmp.num;
					this.totalPrice = tmp.price;
					this.searchOrderInfo = tmp.data;
					this.currentOrderInfo = this.searchOrderInfo;
					this.changePage(1);
				}
			},
			// 根据时间范围来处理已出货量，已用金额，和订单
			timeRange(arr, foremost, final){
				let countNum = 0;
				let count = 0;
				let tmp = [];
				for(let data of arr){
					if(data.created_at.slice(0, 10) >= foremost && data.created_at.slice(0, 10) <= final){
						tmp.push(data);
						if(parseInt(data.status) == 5){
							for(let item of data.orderDetail){
								countNum += parseInt(item.amount | 0);
								count += (parseInt(item.amount | 0)  + parseInt(item.freight | 0 ))*parseInt(item.unit_price |0);
							}
						}
					}
				}
				return { 'data' : tmp, 'num' : countNum, 'price' : count};
			},
			// 添加车号
			addCar(){
				this.buyData.transport.message.push(
					{
						carNum : null,
						people : null,
						tel : null,
						IDCard : null
					}
				);
			},
			// 删除车号
			delCar(index){
				let mess = this.buyData.transport.message;
				if(mess.length >1){
					mess.splice(index, 1);
				}
			},
			//日期对象格式化
			dateFormat(date){
				var year = date.getFullYear();
				var month = (date.getMonth()+1).toString();
				var day = (date.getDate()).toString();
				if(month.length == 1){
					month = '0'+ month;
				}
				if(day.length == 1){
					day = '0' + day;
				}
				var dateTime = year + "-" + month + "-" + day;
				return dateTime;
			},
			// 分页功能
			changePage(page){
				let total = this.currentOrderInfo.length;
				this.pageOrderInfo = [];
				for(let i = (page-1)*6; i < (page*6<total ? page*6 : total); i++){
					this.pageOrderInfo.push(this.currentOrderInfo[i]);
				}
			},
		},

	}
</script>
<template>
	<div>
		<headerbar active_number="terminalUserorder" :text="['我的订单','查看订单']">
			<div>
				<div class="order_search">
					<h1 style="font-size:18px;font-weight:400;color:#999;">订单处理与查询</h1>
					<div style="clear: both;margin-top: 10px;">
						<div class="left">
							<span>选择项目:</span>
							<el-select size="small" v-model="userProjectInfo.selected" @change="selectProject">
								<el-option v-for="option in userProjectInfo.item" :label="option.name" :value="option.name"></el-option>
							</el-select>
							<el-button @click="clearProject" size="small">全部订单</el-button>
						</div>
						<div class="right">
							<span>下单日期:</span>
						     <el-date-picker v-model="foremost" type="date" placeholder="选择日期" :picker-options="pickerOptions" @change="foremostDateContrast(foremost)" size="small">
						     </el-date-picker>
						    <span>--</span>
							 <el-date-picker v-model="final" type="date" placeholder="选择日期" :picker-options="pickerOptions" @change="finalDateContrast(final)" size="small">
							 </el-date-picker>
						</div>
						<div style="clear:both;"></div>
						<p style="margin-top: 10px;">
							<span class="left">
								<span>已出货量:</span>
								<span style="margin-right: 20px;">{{ totalNum || 0 }}吨</span>
								<span>已用金额:</span>
								<span>{{ totalPrice || 0 }}元</span>
							</span>
							<span class="wrapper">
								<el-button size="small" type="primary"@click="downLoad()">导出</el-button>
						    	<el-button size="small" type="success" @click="searchOrder()">查询</el-button>
		    					<el-button size="small" type="" @click="clearAll()">清空</el-button>
						    </span>
						</p>
					</div>
				</div>

				<div style="background-color: #fff;padding: 20px; margin-top: 20px;">
					<el-tabs v-model="activeName" @tab-click="handleClick" type="card">
					    <el-tab-pane label="全部订单" name="six"></el-tab-pane>
						    <el-tab-pane label="未处理" name="zero" :status="0"></el-tab-pane>
						    <el-tab-pane label="处理中" name="one" ></el-tab-pane>

						    <el-tab-pane label="待确认" name="two"></el-tab-pane>
						    <el-tab-pane label="待发货" name="three"></el-tab-pane>
						    <el-tab-pane label="待收货" name="four"></el-tab-pane>

						    <el-tab-pane label="已完成" name="five"></el-tab-pane>
						    <el-tab-pane label="已取消" name="seven"></el-tab-pane>
					</el-tabs>
					<el-table :data="pageOrderInfo" border style="width: 100%;font-size: 12px;text-align: center;">
					    <el-table-column prop="order_number" label="订单编号" width="200" header-align="center">
					    	<template scope="scope">
					    		销{{ scope.row.order_number }}
					    	</template>
					    </el-table-column>
					    <el-table-column label="订单类型" header-align="center">
							<template scope="scope">
								<span v-if="scope.row.price_type == 2">批次销售</span>
								<span v-if="scope.row.price_type == 1">项目销售</span>
							</template>
					    </el-table-column>
					    <el-table-column prop="project_name" label="项目名称" header-align="center"></el-table-column>
					    <el-table-column prop="status" label="状态" width="100" header-align="center">
					      	<template scope="scope">
					        	<el-button size="mini" :type="statusToText(scope.row.status).type" style="cursor: text;">{{statusToText(scope.row.status).text}}</el-button>
					      	</template>
					    </el-table-column>
					    <el-table-column prop="created_at" label="下单时间" width="150" header-align="center"></el-table-column>
					    <el-table-column label="收货时间" width="150" header-align="center">
					    	<template scope="scope">
					    		{{ scope.row.received_at ? (scope.row.received_at).slice(0,10):'' }}
						    </template>
					    </el-table-column>
					    <el-table-column label="订单操作" header-align="center">
							<template scope="scope">
								<el-button  @click="showdata(scope.$index);" type="info" size="small" >查看</el-button>
						        <el-button type="danger" size="small" @click="deldata(scope.row.id);" v-if="scope.row.status<0" >删除</el-button>
						        <el-button type="danger" size="small" @click="revokedata(scope.row.id);" v-show="scope.row.status ==0">撤回</el-button>
						    </template>
					    </el-table-column>
					</el-table>
					<!-- 分页 -->
					<div class="block">
						<el-pagination :current-page="currentPage" :page-size="6" layout="total, prev, pager, next, jumper" :total="currentOrderInfo.length" @current-change="changePage">
					    </el-pagination>
					</div>
				</div>
			</div>
		</headerbar>

		<!-- 钢材采购确认表的弹出框开始 -->
		<el-dialog v-model="showOrder" title="计划单"  size="full" style="text-align:center; ">
			<order
				@exit='exitOrder'
				@confirm='confirmOrder'
				@cancel='cancelOrder'
				@resend='resendOrder'
				@confirmReceived = "confirmReceived"
				:data='buyData'>
			</order>
		</el-dialog>
		<!-- 钢材采购确认表的弹出框结束 -->

	</div>
</template>
<style scoped>
	h1,h4{
		font-weight:400;
	}
	h4{
		color:#8492A6;
	}
	.order_search{
		background-color: #fff;
		clear: both;
		padding: 20px;
		height: 150px;
	}
	.left{
		float: left;
	}
	.right{
		float: right;
	}
	.wrapper{
		margin-top: 10px;
		float: right;
	}
	.block{
		margin-top: 50px;
		text-align: center;
	}
	.bg{
		padding: 1px 5px;
		background:#20a0ff;
		border-radius: 50%;
		color:#fff;
		text-align: center;
	}
	.text_l{
		text-align: left;
	}
</style>
