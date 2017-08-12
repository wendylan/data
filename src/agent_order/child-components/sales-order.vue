<script>
	import { Select, Option, DatePicker, Button, Tabs, TabPane, Table, TableColumn, Pagination, Dialog, Form, FormItem, Input, Steps, Step } from 'element-ui'
	import ajaxCustom from '../../components/ajax-custom.js';
	import titleBox from '../../components/title-box.vue';
	export default{
		components:{
			titleBox,
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
			ajaxCustom.ajaxGet(this, "dingoapi/getOrder", (response)=>{
				response = response.body;
				console.log(response);
				this.userProjectInfo.item = response.project;
				let userOrder = response.data_user_orders;
				this.orderInfo =JSON.parse(JSON.stringify(userOrder));

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
				//资金占用费的显示与否
				moneyShow : false,	
				//当前的品牌信息
				nowOrder : [],	
				doStatus : '',
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
				multipleSelection : [],
				currentPage4 : 4,
				dialogOrderVisible : false,
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
			}
		},
		methods: {
			showdata(index){
				this.dialogOrderVisible = true;
				// console.log(this.currentOrderInfo);
				this.buyData.rebarData = this.currentOrderInfo[index].orderDetail;
				this.buyData.status = this.currentOrderInfo[index].status;
				this.buyData.all_total = this.currentOrderInfo[index].all_total;
				console.log(this.buyData);
			},
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
				handleClick(tab) {
					if(tab.label == "全部订单") {
						this.doStatus = tab.label;
						this.currentOrderInfo = [];
						this.currentOrderInfo = this.orderInfo;
					}
					if(tab.label == "处理中") {
						this.doStatus = tab.label;
						this.currentOrderInfo = [];
						for(let data of this.orderInfo) {
							if(data.status == 2|| data.status == 1) {
								this.currentOrderInfo.push(data);
							}
						}
					}
					if(tab.label == "未处理") {
						this.doStatus = tab.label;
						this.filterCurOrder(tab.label, "未处理", 0);
					}
					if(tab.label == "已完成") {
						this.doStatus = tab.label;
						this.filterCurOrder(tab.label, "已完成", 3);
					}
					if(tab.label == "已取消") {
						this.doStatus = tab.label;
						this.currentOrderInfo = [];
						for(let data of this.orderInfo) {
							if(data.status < 0){
								this.currentOrderInfo.push(data);
							}
						}
					}
			},
			// 过滤数据
			filterCurOrder(label, text, num){
				if(label == text){
					this.currentOrderInfo = [];
					for(let data of this.orderInfo){
						if(data.status == num ){
							this.currentOrderInfo.push(data);
						}
					}
				}
			},
			// 撤销订单
			revokedata(val){
				for(let data of this.orderInfo){
					if(data.id == val){
						data.status = -1;
					}
				}
				for(var i = 0; i<this.currentOrderInfo.length; i++){
					if(this.currentOrderInfo[i].id == val){
						if(this.doStatus == "全部订单"){
							this.currentOrderInfo = this.orderInfo;
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
			foremostDateContrast(date){
				this.foremost = this.dateFormat(date);
			},
			finalDateContrast(date){
				this.final = this.dateFormat(date);
			},
			searchOrder(){
				if(this.final >= this.foremost){
					this.searchOrderInfo = [];
					for(let data of this.orderInfo){
						if(data.created_at.slice(0, 10) >= this.foremost && data.created_at.slice(0, 10) <= this.final && this.userProjectInfo.selected == data.name){
							this.searchOrderInfo.push(data);
							this.currentOrderInfo = [];
						}
					}
					this.currentOrderInfo = this.searchOrderInfo;
				}
			},
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
			delCar(index){
				let mess = this.buyData.transport.message;
				if(mess.length >1){
					mess.splice(index, 1);
				}
			},
			finishOrder(){
				this.dialogOrderVisible = false;
				console.log(this.buyData);
			},
			cancelOrder(){
				this.dialogOrderVisible = false;
				console.log(this.buyData);
			},
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
		},
		
	}
</script>
<template>
	<div class="main-warpper">
		<title-box :text="['销售订单','查看订单']"></title-box>
		<div class="order_search">
			<p class="search_top"><span></span>订单处理与查询:</p>
			<div>
				<div class="left">
					<span>选择项目:</span>
					<el-select size="small" v-model="userProjectInfo.selected" >
						<el-option v-for="option in userProjectInfo.item" :label="option.project_name" :value="option.project_name"></el-option>
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
    					<el-button type="">清空</el-button>
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
		<el-dialog :visible.sync="dialogOrderVisible" title="钢材采购确认表" style="text-align:center;" size="middle">
			<p style="text-align:left;" v-show="this.buyData.status !=0">
				<label for="">订单进度:</label>
				<span v-if="this.buyData.status!=0"><span class="bg" >1</span><b style="color:#20a0ff;">供方接单 ></b></span>
				<span v-if="this.buyData.status==-3||this.buyData.status==3||this.buyData.status==-2"><span class="bg" >2 </span><b style="color:#20a0ff;">确认订单 ></b></span>
				<span v-if="this.buyData.status==3"><span class="bg" >3 </span><b style="color:#20a0ff;">已确认 ></b></span>
				<span v-if="this.buyData.status<0"><span class="bg" >3 </span><b style="color:#20a0ff;">已取消 ></b></span>
      		</p>
			<p style="float:right;"><b>编号:</b>采20170717-1项目简称</p>
			<table>
				<thead>
					<tr>
						<th>序号</th>
						<th>品牌</th>
						<th>品名</th>
						<th>规格</th>
						<th>材质</th>
						<th>仓库</th>
						<th>含税单价<br>(元)</th>
						<th>计划吨数<br>(吨)</th>
						<th>总价<br>(元)</th>
						<th v-if="buyData.transport.way ==1">车号</th>
						<th>备注</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for=" (data,index) in buyData.rebarData">
						<td>{{ index }}</td>
						<td>{{ data.brands }}</td>
						<td>{{ data.product }}</td>
						<td>{{ data.type }}</td>
						<td>{{ data.material }}</td>
						<td>{{ data.warehouse }}</td>
						<td>{{ data.unit_price }}</td>
						<td>
							<el-input type="number" size="small" min="0" :value="data.num" v-model="data.num" style="width:50px;"></el-input>
						</td>
						<td>{{ data.total }}</td>
						<td v-if="buyData.transport.way == 1">
							<el-input type="text"></el-input>
						</td>
						<td>
							<el-input type="text" size="small" v-model="buyData.remark"></el-input>
						</td>
					</tr>
				</tbody>
			</table>
			<p style="float:right;margin-top:10px;font-weight:bold;">合计:
		    	<span>{{buyData.all_total}}</span>元
		    </p>
			<br>
			<!-- 终端需要，次终端不需要显示 -->
			<!-- <div style="text-align:left;">
				<label>
					<b>结算条件</b>
				</label>
				<p>
					<span>1、</span>
					<span>----------------------</span>
				</p>
				<p>
					<span>2、</span>
					<span>---------------------</span>
				</p>
			</div> -->
			<div style="text-align:left;">
				<label>
					<b>物流信息</b><span style="color:red;font-weight:normal;">(可在后续操作中补录)</span>
				</label>
				<p>
					<span>运输方式:</span>
					<el-select placeholder="请选择" v-model="buyData.transport.way" size="small">
						<el-option label="买方自提" :value="1"></el-option>
						<el-option label="卖方承运" :value="2"></el-option>
					</el-select>
					<el-button size="small" @click="addCar" v-if="buyData.transport.way == 1">新加车号</el-button>
					<div v-if="buyData.transport.way == 1" v-for="(item,index) in buyData.transport.message " >
						<p>
							<span>车号:</span>
							<el-input type="text" v-model="item.carNum" style="width:30%;margin-right:30px;" size="small"></el-input>

							<span>联系电话:</span>
							<el-input type="text" v-model="item.tel" style="width:30%;" size="small"></el-input>
						</p>
						<p>
							<span>司机:</span>
							<el-input type="text" v-model="item.people" style="width:30%;margin-right:30px;" size="small"></el-input>
							<span>身份证号:</span>
							<el-input type="text" v-model="item.IDCard" style="width:30%;" size="small"></el-input>
							<el-button @click="delCar(index)" size="small">删除</el-button>
						</p>
					</div>
				</p>
			</div>
			<div style="text-align:left;">
				<label>
					<b>供货信息</b>
				</label>
				<p>
					<span style="width:60px;display:inline-block;">收货人:</span>
					<el-input type="text" style="width:30%;margin-right:30px;" v-model="buyData.supply_information.receiver_name" size="small"></el-input>
					<span>联系电话:</span>
					<el-input type="text" style="width:30%;" size="small" v-model="buyData.supply_information.receiver_tel"></el-input>
				</p>
				<p>
					<span>送货地址:</span>
					<el-input type="text" style="width:67%;" size="small" v-model="buyData.supply_information.receiver_addr"></el-input>
				</p>
				<p>
					<span>供货时间:</span>
					<el-date-picker type="date" :picker-options="pickerOptions1" placeholder="请选择日期" v-model="buyData.supply_information.supply_time"></el-date-picker>
				</p>
				<p>
					<span>付款时间:</span>
					<span>见合同</span>
				</p>
			</div>
			<div style="text-align:left;">
				<label style="width:60px;">
					<b>备注:</b>
				</label>
				<el-input v-model="buyData.remark" type="text" size="small" style="display:inline-block;width:67%;"></el-input>
			</div>
			<div style="text-align:left;margin-top:20px;width:60%;">
				<div style="float:left;">
					<p><span>买方(收货单位):</span><span></span></p>
					<p><span>经办人:</span><span></span></p>
					<p><span>传真:</span><span></span></p>
					<p><span>日期:</span><span></span></p>
				</div>
				<div style="float:right; margin-left:200px;margin-bottom:50px;">
					<p><span>卖方(供货单位):</span><span></span></p>
					<p><span>经办人:</span><span></span></p>
					<p><span>传真:</span><span></span></p>
					<p><span>日期:</span><span></span></p>
				</div>
			</div>
			<div slot="footer" class="dialog-footer" style="clear:both;text-align:center;">
				<el-button type="primary" @click="saveOrder" v-if="this.buyData.status==3">保存</el-button>
				<el-button @click="dialogOrderVisible = false">返回</el-button>
				<el-button type="danger" @click="cancelOrder" v-if="this.buyData.status==1 || this.buyData.status==2">取消下单</el-button>
				<el-button type="primary" @click="finishOrder" v-if="this.buyData.status==1 || this.buyData.status==2">发送下单</el-button>
			</div>
		</el-dialog>
		<!-- 钢材采购确认表的弹出框结束 -->

		<div>
			<el-table :data="currentOrderInfo" border style="width: 100%">
			    <el-table-column prop="order_number" label="订单编号"></el-table-column>
			    <el-table-column prop="user_name" label="下单用户"></el-table-column>
			    <el-table-column label="订单类型">
					<template scope="scope">
						<span>批次销售</span>
					</template>
			    </el-table-column>
			    <el-table-column prop="name" label="项目名称"></el-table-column>
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
				<el-pagination :current-page="currentPage4" :page-sizes="[4, 8, 12, 16,20]"  :page-size="4" layout="total, sizes, prev, pager, next, jumper" :total="currentOrderInfo.length">
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

