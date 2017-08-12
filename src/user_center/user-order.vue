<script>
	import { Select, Option, DatePicker, Button, Tabs, TabPane, Table, TableColumn, Pagination, Dialog, Form, FormItem, Input, Steps, Step } from 'element-ui'
	import ajaxCustom from '../components/ajax-custom.js';
	import titleBox from '../components/title-box.vue';
	import order from "../secondary_terminal/components/order.vue";
	export default{
		components:{
			titleBox,
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
				// console.log(this.userProjectInfo);
				let userOrder = response.data.orderDatas;
				this.orderInfo = JSON.parse(JSON.stringify(userOrder));

				// 测试数据开始
				this.userProjectInfo.item[0].user_id = 1;
				// 已完成
				this.orderInfo[1] = JSON.parse(JSON.stringify(this.orderInfo[0]));
				this.orderInfo[1].id = 20170809;
				this.orderInfo[1].status = 3;
				console.log(this.orderInfo);
				// 未处理
				this.orderInfo[2] = JSON.parse(JSON.stringify(this.orderInfo[0]));
				this.orderInfo[2].id = 20170810;
				this.orderInfo[2].status = 0;
				// 已取消
				this.orderInfo[3] = JSON.parse(JSON.stringify(this.orderInfo[0]));
				this.orderInfo[3].id = 20170811;
				this.orderInfo[3].status = -1;
				// 测试数据结束
				console.log(this.orderInfo);

				let userPro = this.userProjectInfo.item;
				let order = this.orderInfo;
				for(let i = 0; i < userPro.length; i++ ){
					for(let j = 0; j < order.length; j++){
						if(userPro[i].user_id == order[j].user_id){
							order[j].project_name = userPro[i].name;
							order[j].settlement = userPro[i].settlement;
						}
					}
				}

				var tab = {};
				tab.label = "全部订单";
				this.handleClick(tab);
				
			}, (response)=>{
				console.log(response);
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
				activeName : 'first',
				orderStatus : [
					{num : 0, text : "未处理"},
					{num : 1, text : "处理中"},
					{num : 2, text : "处理中"},
					{num : 3, text : "已完成"},
					{num : -1, text : "已取消"},
					{num : -2, text : "已取消"},
					{num : -3, text : "已取消"}
				],
				orderInfo : [],
				searchOrderInfo : [],
				currentOrderInfo : [],	//当前的订单信息
				currentPage : 4,
				dialogOrderVisible : false,
				showOrder : false,
				buyData : {},
			}
		},
		methods: {
			showdata(index){
				this.dialogOrderVisible = true;
				this.buyData.rebarData = this.currentOrderInfo[index].orderDetail;
				this.buyData.status = this.currentOrderInfo[index].status;
				this.buyData.all_total = this.currentOrderInfo[index].all_total;
				this.buyData.settlement = this.currentOrderInfo[index].settlement;
				console.log(this.buyData);
				this.showOrder = !this.showOrder;
			},
			// 状态文字转换
			statusToText(status){
				for(let data of this.orderStatus){
					if(data.num == status){
						return  data.text;
					}
				}
			},
			// 删除订单
			deldata(val){
				var len = this.orderInfo.length;
				for(var i = 0;i<len;i++){
					if(this.orderInfo[i].id == val){
						this.orderInfo.splice(i, 1);
						len--;
					}
				}
				var Olen = this.currentOrderInfo.length;
				for(var j = 0; j<Olen; j++){
					if(this.currentOrderInfo[j].id == val){
						this.currentOrderInfo.splice(j, 1);
						Olen--;
					}
				}
			},
			// tab控件
			handleClick() {
				this.userProjectInfo.selected = '';
				this.foremost = '';
				this.final = '';

				let active = this.activeName;
				if(active == "first") {
					this.currentOrderInfo = [];
					this.currentOrderInfo = this.orderInfo;
				}
				if(active == "second") {
					this.currentOrderInfo = [];
					for(let data of this.orderInfo) {
						if(data.status == 2 || data.status == 1) {
							this.currentOrderInfo.push(data);
						}
					}
				}
				if(active == "third") {
					this.currentOrderInfo = [];
					for(let data of this.orderInfo){
						if(data.status == 0 ){
							this.currentOrderInfo.push(data);
						}
					}
				}
				if(active == "fourth") {
					this.currentOrderInfo = [];
					for(let data of this.orderInfo){
						if(data.status == 3 ){
							this.currentOrderInfo.push(data);
						}
					}
				}
				if(active == "firth") {
					this.currentOrderInfo = [];
					for(let data of this.orderInfo) {
						if(data.status < 0){
							this.currentOrderInfo.push(data);
						}
					}
				}
			},
			// 撤销订单
			revokedata(id){

				for(let data of this.orderInfo){
					if(data.id == id){
						data.status = -1;
					}
				}
				for(var i = 0; i< this.currentOrderInfo.length; i++){
					if(this.currentOrderInfo[i].id == id){
						if(this.activeName == "first"){
							this.currentOrderInfo = JSON.parse(JSON.stringify(this.orderInfo));
						}else{
							this.currentOrderInfo.splice(i, 1);
						}
					}
				}
			},
			// 导出订单
			downLoad(){
				console.log('导出订单');
			},
			//返回
			exitOrder(data){
				this.showOrder = !this.showOrder;
			},
			// 清空
			clearAll(){
				this.userProjectInfo.selected = '';
				this.foremost = '';
				this.final = '';
				this.currentOrderInfo = this.orderInfo;
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
					this.searchOrderInfo = [];
					let foremost = this.dateFormat(this.foremost);
					let final = this.dateFormat(this.final);

					for(let data of this.orderInfo){
						if(data.created_at.slice(0, 10) >= foremost && data.created_at.slice(0, 10) <= final && this.userProjectInfo.selected == data.project_name){
							this.searchOrderInfo.push(data);
							this.currentOrderInfo = [];
						}
					}
					this.currentOrderInfo = this.searchOrderInfo;
				}
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
			// 发送订单
			finishOrder(){
				this.dialogOrderVisible = false;
				console.log(this.buyData);
			},
			// 取消订单
			cancelOrder(){
				this.dialogOrderVisible = false;
				console.log(this.buyData);
			},
			sendOrder(data){
				this.showOrder = !this.showOrder;
				console.log(this.buyData);
			},
			// 保存订单
			saveOrder(){
				this.dialogOrderVisible = false;
				console.log(this.buyData);
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
				let total = this.orderInfo.length;
				this.currentOrderInfo = [];
				for(let i = (page-1)*10; i < (page*10<total ? page*10 : total); i++){
					this.currentOrderInfo.push(this.orderInfo[i]);
				}
			},
		},
		
	}
</script>
<template>
	<div class="main-warpper">
		<title-box :text="['我的订单','查看订单']"></title-box>
		<div class="order_search">
			<p class="search_top"><span></span>订单处理与查询:</p>
			<div>
				<div class="left">
					<span>选择项目:</span>
					<el-select size="small" v-model="userProjectInfo.selected" >
						<el-option v-for="option in userProjectInfo.item" :label="option.name" :value="option.name"></el-option>
					</el-select>
				</div>
				<div class="right">
					<span>下单日期:</span>
				     <el-date-picker v-model="foremost" type="date" placeholder="选择日期" :picker-options="pickerOptions" @change="foremostDateContrast(foremost)">
				     </el-date-picker>
				    <span>--</span>
					 <el-date-picker v-model="final" type="date" placeholder="选择日期" :picker-options="pickerOptions" @change="finalDateContrast(final)">
					 </el-date-picker>
				</div>
				<div style="clear:both;"></div>
				<p>
					<span class="wrapper">
						<el-button type="primary"@click="downLoad()">导出</el-button>
				    	<el-button type="success" @click="searchOrder()">查询</el-button>
    					<el-button type="" @click="clearAll()">清空</el-button>
				    </span>
				</p>
			</div>
		</div>
		<br/>
		<el-tabs v-model="activeName" @tab-click="handleClick" >
		    <el-tab-pane label="全部订单" name="first"></el-tab-pane>
		    <el-tab-pane label="处理中" name="second" ></el-tab-pane> 
		    <el-tab-pane label="未处理" name="third" :status="0"></el-tab-pane>
		    <el-tab-pane label="已完成" name="fourth"></el-tab-pane>
		    <el-tab-pane label="已取消" name="firth"></el-tab-pane>
		</el-tabs>

		<!-- 钢材采购确认表的弹出框开始 -->
		<el-dialog v-model="showOrder" title="计划单"  size="large">
			<order
			 @exit='exitOrder'
			 @send='sendOrder'
			 @cancel='cancelOrder'
			 :data='buyData' >
			</order>
		</el-dialog>
		<!-- 钢材采购确认表的弹出框结束 -->

		<div>
			<el-table :data="currentOrderInfo" border style="width: 100%">
			    <el-table-column prop="order_number" label="订单编号"></el-table-column>
			    <el-table-column label="订单类型">
					<template scope="scope">
						<span>批次销售</span>
					</template>
			    </el-table-column>
			    <el-table-column prop="project_name" label="项目名称"></el-table-column>
			    <el-table-column prop="status" label="状态">
			      	<template scope="scope">
			        	<el-button size="small" type="success" v-if="scope.row.status==3">{{statusToText(scope.row.status)}}</el-button>
			        	<el-button size="small" type="danger" v-if="scope.row.status<0">{{statusToText(scope.row.status)}}</el-button>
			        	<el-button size="small" type="info" v-if="scope.row.status==0">{{statusToText(scope.row.status)}}</el-button>
			        	<el-button size="small" type="warning" v-if="scope.row.status==1||scope.row.status==2">{{statusToText(scope.row.status)}}</el-button>
			      	</template>
			    </el-table-column>
			    <el-table-column prop="created_at" label="下单时间"></el-table-column>
			    <el-table-column label="订单操作">
					<template scope="scope">
						<el-button  @click="showdata(scope.$index);" type="text" size="small" >查看</el-button>
				        <el-button type="text" size="small" @click="deldata(scope.row.id);" v-if="scope.row.status<0" >删除</el-button>
				        <el-button type="text" size="small" @click="revokedata(scope.row.id);" v-show="scope.row.status ==0">撤回</el-button>
				    </template>
			    </el-table-column>
			</el-table>
			<!-- 分页 -->
			<div class="block">
				<el-pagination :current-page="currentPage" :page-size="10" layout="total, prev, pager, next, jumper" :total="currentOrderInfo.length" @current-change="changePage">
			    </el-pagination>
			</div>
		</div>
	</div>
</template>
<style scoped>
	.main-warpper{
		width:1280px;
		margin:auto;
		padding:25px;
		color:#1F2D3D;
	}
	h1,h4{
		font-weight:400;
	}
	h4{
		color:#8492A6;
	}
	.search_top{
		font-size: 18px;
		color: red;
	}
	.search_top span{
		width: 0;
		height: 20px;
		display: inline-block;
		border: 5px solid red;
		border-radius: 4px;
		vertical-align: middle;
		margin-right: 5px;
	}
	.order_search>div{
		margin-left: 50px;
		margin-right: 50px;
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
</style>

