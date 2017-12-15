<script>
	import { Select, Option, DatePicker, Button, Tabs, TabPane, Table, TableColumn, Pagination, Dialog, Form, FormItem, Input, Steps, Step, Tag } from 'element-ui'
	import ajaxCustom from '../components/ajax-custom.js';
	import headerbar from '../components/same-headerbar.vue';
	import order from "./components/order.vue";
	import plan from "./components/plan_secondTerminal.vue";
	export default{
		components:{
			headerbar,
			order,
			plan,
			elSelect : Select,
			elOption : Option,
			elDatePicker : DatePicker,
			elButton : Button,
			elTabs : Tabs,
			elTabPane : TabPane,
			elTable : Table,
			elTableColumn : TableColumn,
			elPagination : Pagination,
			elDialog : Dialog,
			elForm : Form,
			elFormItem : FormItem,
			elInput : Input,
			elSteps : Steps,
			elStep : Step,
			elTag : Tag,
		},
		created : function(){
			ajaxCustom.ajaxGet(this, "dingoapi/getOrder", (response)=>{
				console.log(response);
				response = response.body;
				let project = response;
				let tmp = [];
				for(let i=0; i < project.length; i++){
					let menu = 1;
					for(let j = 0; j < tmp.length; j++){
						if((project[i].project) && (tmp[j].project_name == project[i].project.name)){
							menu = 0;
						}
					}
					if(menu && project[i].project ){
						tmp.push({ 'project_name' : project[i].project.name, 'project_id' :  project[i].project_id, 'project_company' : project[i].tradeBetween.buyercompany });
					}
				}
				this.userProjectInfo.item = tmp;
				let userOrder = response;
				this.orderInfo = [];
				for(let item in userOrder){
					this.orderInfo.push(userOrder[item]);
				}
				this.handleClick();
				this.getTableFilter();
			}, (response)=>{
				alert(response.body.message);
			});

		},
		data(){
			return{
				value : '',
				userProjectInfo : {
					item : [],
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
				//资金占用费的显示与否
				moneyShow : false,
				//当前的品牌信息
				nowOrder : [],
				doStatus : '',
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
				multipleSelection : [],
				currentPage4 : 1,
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
				// 是否显示弹出框的叉叉
				hideCloseBoolean : true,
				// 缓存选择项目后的table数据
				cacheOrder : [],
				// 总的出货量
				totalNum : 0,
				totalPrice : 0,
				isOpenDialog : false,
				// table过滤
				filter : {
					userName : null
				},
			}
		},
		methods: {
			// 过滤去重
			getTableFilter(){
				let collectArr = {};
				for(let datas of this.orderInfo){
					for(let item in datas){
						collectArr[item] ? collectArr[item] : collectArr[item] = [];
						let hasData = false;
						for(let arr of collectArr[item]){
							if(arr.value == datas[item]){
								hasData = true;
								break;
							}
						}
						if(!hasData){
							collectArr[item].push({ text : datas[item], value : datas[item] });
						}
					}
				}
				this.filter.userName = collectArr.user_name;
			},
			userNameFilter(value, row){
				return row.user_name === value;
			},
			// 获取已出货量和已用金额
			getSomeCount(type){
				let order = this.orderInfo;
				let count = 0;
				let countNum = 0;
				if(this.userProjectInfo.selected){
					for(let data of this.cacheOrder){
						if((data.project_id == this.userProjectInfo.selected) && (parseInt(data.status) == 5)){
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
				if(this.pageOrderInfo[index].status==0){
					this.pageOrderInfo[index].status=1;
				}
				this.buyData = this.pageOrderInfo[index];
				this.showOrder = !this.showOrder;
			},
			// 状态转换为文本
			statusToText(status){
				for(let data of this.orderStatus){
					if(data.num == status){
						return  data;
					}
				}
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
			// 根据项目来查询
			selectProject(data){
				if(data){
					this.activeName = null;
					let order = this.orderInfo;
					let arr= [];
					for(let i = 0; i < order.length; i++){
						if(order[i].project_id == data){
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
			// 重置项目按钮
			clearProject(){
				this.userProjectInfo.selected = '';
				this.cacheOrder = [];
				this.activeName = 'six';
				this.handleClick();
			},
			// 清空
			clearAll(){
				this.userProjectInfo.selected = '';
				this.foremost = '';
				this.final = '';
				this.activeName = 'six';
				this.handleClick();
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
			// 返回
			exitOrder(){
				this.showOrder = !this.showOrder;
			},
			saveOrder(data){
				// console.log(data.date_of_receipt);
				ajaxCustom.ajaxPost(this, '/dingoapi/memoryOrder', data, (responese)=>{
					console.log(responese.body.data_user_order);
					this.orderUpdate(responese.body.data_user_order);
				}, (responese)=>{
					alert(responese.body.message);
				});
				this.showOrder = !this.showOrder;
			},
			// 发送订单
			sendOrder(data){
				// console.log(data.date_of_receipt);
				ajaxCustom.ajaxPost(this, '/dingoapi/updateOrder', data, (responese)=>{
					console.log(responese.body.data_user_order);
					this.orderUpdate(responese.body.data_user_order);
				}, (responese)=>{
					alert(responese.body.message);
				});
				this.showOrder = !this.showOrder;
			},
			//代确认订单
			confirmOrder(data){
				ajaxCustom.ajaxPost(this, '/dingoapi/finishOrder', data, (responese)=>{
					let resp = responese.body.data_user_order;
					this.orderUpdate(resp);
				}, (responese)=>{
					alert(responese.body.message);
				});
				this.showOrder = !this.showOrder;
			},
			confirmReceived(data){
				console.log(data.date_of_receipt);
				ajaxCustom.ajaxPost(this, '/dingoapi/confirmReceived', data, (responese)=>{
					console.log(responese);
					let proInfo = responese.body.data_user_order;
					this.orderUpdate(proInfo);
					this.showOrder = !this.showOrder;
				}, (responese)=>{
					console.log(responese);
					alert(responese.body.message);
				});
			},
			//发送订单(收货确认函)
			sendForReceived(data){
				// console.log(data.date_of_receipt);
				ajaxCustom.ajaxPost(this, '/dingoapi/sendForReceived', data, (responese)=>{
					this.orderUpdate(responese.body.data_user_order);
				}, (responese)=>{
					alert(responese.body.message);
				});
				this.showOrder = !this.showOrder;
			},
			// 传递订单
			sendForPurchar(data){
				// console.log(data.date_of_receipt);
				ajaxCustom.ajaxPost(this, '/dingoapi/sendForPurchar', data, (responese)=>{
					console.log(responese.body.data_user_order);
					this.orderUpdate(responese.body.data_user_order);
				}, (responese)=>{
					alert(responese.body.message);
				});
				this.showOrder = !this.showOrder;
			},
			// 取消订单
			cancelOrder(data){
				ajaxCustom.ajaxPost(this, '/dingoapi/cancelOrder', data, (responese)=>{
					// console.log(responese);
					this.orderUpdate(responese.body.data_user_order);
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
			orderUpdate(data){
				this.listUpdate(data, this.orderInfo);
				this.listUpdate(data, this.pageOrderInfo);
				this.listUpdate(data, this.currentOrderInfo);
			},
			listUpdate(order, orderList){
				for (var i = orderList.length - 1; i >= 0; i--) {
					if(orderList[i].id == order.id){
						orderList.splice(i, 1, order);
					}
				}
			},
			// 到货时间
			showReceivedTime(data){
				if(!data.received_at){
					ajaxCustom.ajaxGet(this, 'dingoapi/receivedTime', { params : { id : data.id } }, (response)=>{
						console.log(response);
						this.$set(data, 'received_at', response.data.data_user_order.received_at);
					}, (response)=>{
						alert(response.body.message);
					});
				}
			},
			// 是否显示弹出框的叉叉
			hideClose(data){
				this.hideCloseBoolean = data;
			},
			showPlan(){
				this.isOpenDialog = !this.isOpenDialog;
			},
			// 分页功能
			changePage(page){
				let total = this.currentOrderInfo.length;
				this.pageOrderInfo = [];
				for(let i = (page-1)*6; i < (page*6<total ? page*6 : total);i++){
					this.pageOrderInfo.push(this.currentOrderInfo[i]);
				}
			},

		},
	}
</script>
<template>
	<div>
		<headerbar active_number="4-1-2" :identity="2" :text="['销售订单','查看订单']">
			<div>
				<div class="order_search">
					<h1 style="font-size:18px;font-weight:400;color:#999;">订单处理与查询</h1>
					<div style="clear: both;margin-top: 10px;">
						<div class="left">
							<span>选择项目:</span>
							<el-select size="small" v-model="userProjectInfo.selected" @change="selectProject">
								<el-option v-for="option in userProjectInfo.item" :label="`${option.project_name}(${option.project_company})`" :value="option.project_id"></el-option>
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
								<span style="margin-right: 20px;">{{ (totalNum | 0) }}吨</span>
								<span>已用金额:</span>
								<span>{{ (totalPrice | 0) }}元</span>
							</span>
							<span class="wrapper">
								<el-button size="small" type="primary"@click="downLoad()">导出</el-button>
						    	<el-button size="small" type="success" @click="searchOrder()">查询</el-button>
		    					<el-button size="small" type="" @click="clearAll">清空</el-button>
						    </span>
						</p>
					</div>
				</div>

				<div style="background-color: #fff;padding: 20px; margin-top: 20px;position: relative;">
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
					<span style="position: absolute; top:20px;right: 20px;">
						<el-button type="primary" @click="showPlan">新建订单</el-button>
					</span>
					<el-table :data="pageOrderInfo" border style="width: 100%;" >
					    <el-table-column prop="order_number" label="订单编号" width="180" align="center">
					    	<template scope="scope">
					    		销{{ scope.row.order_number }}
					    	</template>
					    </el-table-column>
					    <el-table-column prop="user_name" label="下单用户" :filters="filter.userName" :filter-method="userNameFilter" align="center"></el-table-column>
					    <el-table-column label="订单类型" width="80" align="center">
							<template scope="scope">
								<span v-if="!scope.row.project_id">批次销售</span>
								<span v-if="scope.row.project_id">项目销售</span>
							</template>
					    </el-table-column>
					    <el-table-column prop="project.name" label="项目名称" align="center"></el-table-column>
					    <el-table-column prop="status" label="状态" width="170" style="text-align: center;font-size: 12px;" align="center">
					      	<template scope="scope">
					        	<el-tag :type="statusToText(scope.row.status).type">{{statusToText(scope.row.status).text}}</el-tag>
					        	<el-tag type="danger" v-if="scope.row.send_for_purchar==1" >待采购确认</el-tag>
					        	<el-tag type="success" v-if="scope.row.send_for_purchar==2" >采购已确认</el-tag>
					      	</template>
					    </el-table-column>
					    <el-table-column prop="created_at" label="下单时间" width="130" align="center"></el-table-column>
					    <el-table-column label="收货时间"  width="130" align="center">
					    	<template scope="scope">
					    		{{ scope.row.received_at ? (scope.row.received_at).slice(0,10):'' }}
					    	</template>
					    </el-table-column>
					    <el-table-column label="订单操作" >
							<template scope="scope">
								<el-button  @click="showdata(scope.$index);" type="info" size="small" >查看</el-button>
						        <el-button type="danger"  @click="deldata(scope.row.id);" v-if="scope.row.status<0" size="small">删除</el-button>
						        <el-button type="danger" @click="showReceivedTime(scope.row)" v-if="(scope.row.status>3) && (scope.row.received_at==null)" size="small">到货</el-button>
						    </template>
					    </el-table-column>
					</el-table>
					<!-- 分页 -->
					<div class="block">
						<el-pagination :current-page="currentPage4" :page-size="6" layout="total, prev, pager, next, jumper" :total="currentOrderInfo.length"  @current-change='changePage'>
					    </el-pagination>
					</div>
				</div>
			</div>
		</headerbar>

		<!-- 钢材采购确认表的弹出框开始 -->
		<el-dialog v-model="showOrder" title="计划单"  size="full" style="text-align:center;" :show-close="hideCloseBoolean" :close-on-click-modal="false">
			<order
			 @exit='exitOrder'
			 @send='sendOrder'
			 @saveOrder='saveOrder'
			 @cancel='cancelOrder'
			 @hideClose="hideClose"
			 @sendForPurchar = "sendForPurchar"
			 @sendForReceived = "sendForReceived"
			 @confirm='confirmOrder'
			 @confirmReceived = "confirmReceived"
			 :data='buyData' >
			</order>
		</el-dialog>
		<!-- 钢材采购确认表的弹出框结束 -->

		<!-- 下单管理计划单弹出框 -->
		<plan style="height: 780px;" :open="isOpenDialog"></plan>
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
