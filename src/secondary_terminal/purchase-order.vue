<script>
	import { Select, Option, DatePicker, Button, Tabs, TabPane, Table, TableColumn, Pagination, Dialog, Form, FormItem, Input, Steps, Step, Tag } from 'element-ui';
	import ajaxCustom from '../components/ajax-custom.js';
	import headerbar from '../components/same-headerbar.vue';
	import order from "./components/order_of_purchase.vue";
	import _ from "lodash";
	export default{
		components:{
			headerbar,
			order,
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
			ajaxCustom.ajaxGet(this, "dingoapi/getPurcharOrder", (response)=>{
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
						tmp.push({ 'project_name' : project[i].project.name, 'project_id' : project[i].project_id, 'project_company' : project[i].tradeBetween.buyercompany });
					}
				}
				this.userProjectInfo.item = tmp;
				let userOrder = response;
				this.orderInfo = [];
				for(let item in userOrder){
					this.orderInfo.push(userOrder[item]);
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
				foremost : '',
				final : '',
				activeName : 'three',
				orderStatus : [
					{num : 0, text : "未处理"},
					{num : 1, text : "处理中"},
					{num : 2, text : "已处理"},
					{num : 3, text : "已完成"},
					{num : -1, text : "已取消"},
					{num : -2, text : "已撤回"},
					{num : -3, text : "已取消"}
				],
                // 总的订单信息
				orderInfo : [],
                // 搜索后的订单信息
				searchOrderInfo : [],
                //当前的不分页面的订单信息
				currentOrderInfo : [],
                // 当前页面的订单信息
				pageOrderInfo : [],
                // 默认的当前页面
				currentPage : 1,
                // 是否打开订单弹出框
				showOrder : false,
                // 传入订单弹出框的信息
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
                // 总的价格
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
				this.buyData = this.pageOrderInfo[index];
				this.showOrder = !this.showOrder;
			},
			statusToText(status){
                return _.find(this.orderStatus, { 'num': status});
			},
			// tab控件
			handleClick() {
				this.userProjectInfo.selected = '';
				this.foremost = '';
				this.final = '';
                this.currentOrderInfo = [];

                const statusArr = [
					{ active : "one", status : 1 },
					{ active : "two", status : 2 },
					{ active : "three", status : 3 }
				]

				let selected = _.find(statusArr, { "active" : this.activeName });
				if(selected.active !== "three"){
					let orders = _.filter(this.orderInfo, { "send_for_purchar" : selected.status });
					if(orders.length){
						this.currentOrderInfo = _.concat(this.currentOrderInfo, orders);
					}
				}
				if(selected.active == 'three'){
					this.currentOrderInfo = this.orderInfo;
				}
				this.changePage(1);
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
					this.activeName = '';
					this.currentOrderInfo = _.filter(this.orderInfo, { "project_id" : data });
					this.cacheOrder = _.cloneDeep(this.currentOrderInfo);
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
            // 时间规范
			finalDateContrast(date){
				if(date && this.foremost){
					let final = date.getTime()/1000;
					let foremost = (new Date(this.foremost)).getTime()/1000;
					if(final <= foremost ){
						this.final = '';
					}
				}
			},
			// 根据时间日期来查询
			searchOrder(){
				if(this.final && this.foremost){
					this.activeName = '';
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
				this.activeName = 'three';
				this.handleClick();
			},
			// 清空
			clearAll(){
				this.foremost = '';
				this.final = '';
				this.activeName = 'three';
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
			confirmOrder(data){
				ajaxCustom.ajaxPost(this, '/dingoapi/finishOrder', data, (responese)=>{
					console.log(responese);
					this.orderUpdate(responese.body.data_user_order);
				}, (responese)=>{
					alert(responese.body.message);
				});
				this.showOrder = !this.showOrder;
			},
			// 取消订单
			cancelOrder(data){
				ajaxCustom.ajaxPost(this, '/dingoapi/cancelOrder', data, (responese)=>{
					console.log(responese);
					this.orderUpdate(responese.body.data_user_order);
				}, (responese)=>{
					alert(responese.body.message);
				});
				this.showOrder = !this.showOrder;
			},

			// 保存订单
			saveOrder(data){
				console.log(data);
				ajaxCustom.ajaxPost(this, '/dingoapi/orderPurcharSave', data, (responese)=>{
					console.log(responese);
					this.orderUpdate(responese.body.data_user_order);
				}, (responese)=>{
					alert(responese.body.message);
				});
				this.showOrder = !this.showOrder;
			},
			//返回
			exitOrder(){
				this.showOrder = !this.showOrder;
			},
			sendOrder(data){
				console.log(data);
				ajaxCustom.ajaxPost(this, '/dingoapi/orderPurcharSendService', data, (responese)=>{
					console.log(responese);
					this.orderUpdate(responese.body.data_user_order);
				}, (responese)=>{
					alert(responese.body.message);
				});
				this.showOrder = !this.showOrder;
			},
			orderUpdate(data){
				this.listUpdate(data, this.orderInfo);
				this.listUpdate(data, this.pageOrderInfo);
				this.listUpdate(data, this.currentOrderInfo);
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
			listUpdate(order, orderList){
				for (var i = orderList.length - 1; i >= 0; i--) {
					if(orderList[i].id == order.id){
						orderList.splice(i, 1, order);
					}
				}
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
			// 是否显示弹出框的叉叉
			hideClose(data){
				this.hideCloseBoolean = data;
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
		<headerbar active_number="purchaseOrder" :text="['采购订单', '提供每日最新钢材现货价']">
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
								<span style="margin-right: 20px;">{{ totalNum || 0 }}吨</span>
								<span>已用金额:</span>
								<span>{{ totalPrice || 0}}元</span>
							</span>
							<span class="wrapper">
								<el-button size="small" type="primary" @click="downLoad()">导出</el-button>
						    	<el-button size="small" type="success" @click="searchOrder()">查询</el-button>
		    					<el-button size="small" @click="clearAll">清空</el-button>
						    </span>
						</p>
					</div>
				</div>
				<div style="background-color: #fff;padding: 20px; margin-top: 20px;">
					<el-tabs v-model="activeName" @tab-click="handleClick" type="card">
					    <el-tab-pane label="全部订单" name="three"></el-tab-pane>
					    <el-tab-pane label="待处理" name="one" ></el-tab-pane>
					    <el-tab-pane label="已处理" name="two"></el-tab-pane>
					</el-tabs>

					<el-table :data="pageOrderInfo" border style="font-size: 14px;">
					    <el-table-column prop="order_number" label="订单编号" width="180" align="center">
					    	<template scope="scope">
					    		采{{ scope.row.order_number }}
					    	</template>
					    </el-table-column>
					    <el-table-column label="订单类型" align="center">
							<template scope="scope">
							<span v-if="!scope.row.project_id">批次销售</span>
							<span v-if="scope.row.project_id">项目销售</span>
							</template>
					    </el-table-column>
					    <el-table-column prop="project.name" label="项目名称" align="center"></el-table-column>
					    <el-table-column prop="status" label="状态" align="center">
					      	<template scope="scope">
					        	<el-tag type="success" v-if="scope.row.send_for_purchar==2">已处理</el-tag>
					        	<el-tag type="warning" v-if="scope.row.send_for_purchar==1">待处理</el-tag>
					      	</template>
					    </el-table-column>
					    <el-table-column prop="created_at" label="下单时间" width="150" align="center"></el-table-column>
					    <el-table-column prop="received_at" label="收货时间" width="150" align="center"></el-table-column>
					    <el-table-column label="订单操作" align="center">
							<template scope="scope">
								<el-button  @click="showdata(scope.$index);" type="info" size="small">查看</el-button>
						        <el-button type="danger"  @click="deldata(scope.row.id);" v-if="scope.row.status < 0" size="small">删除</el-button>
						    </template>
					    </el-table-column>
					</el-table>
					<!-- 分页 -->
					<div class="block">
						<el-pagination :current-page="currentPage" :page-size="6" layout="total, prev, pager, next, jumper" :total="currentOrderInfo.length" @current-change='changePage'>
					    </el-pagination>
					</div>
				</div>
			</div>
		</headerbar>

		<!-- 钢材采购确认表的弹出框开始 -->
		<el-dialog v-model="showOrder" title="计划单"  size="full" style="text-align:center;" :show-close="hideCloseBoolean" :close-on-click-modal="false">
			<order
			@save='saveOrder'
			@exit='exitOrder'
			@send='sendOrder'
			@hideClose="hideClose"
			:data='buyData' ></order>
		</el-dialog>
		<!-- 钢材采购确认表的弹出框结束 -->
	</div>
</template>
<style scoped>
	body{
		font-size: 14px;
	}
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
