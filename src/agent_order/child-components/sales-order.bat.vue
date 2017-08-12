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
			ajaxCustom.ajaxGet(this, "api/getUserProjectOrder", (response)=>{
				response = response.body;
				console.log(response);
				this.userProjectInfo.item = response.project;
				let userOrder = response.userOrder;
				this.orderInfo =JSON.parse(JSON.stringify(userOrder));
				let userOrderDetail = response.userOrderDetail;

				let userPro = this.userProjectInfo.item;
				let orderInfo = this.orderInfo;

				for(let userOrderDe of userOrderDetail){
					for(let order of orderInfo){
						if(userOrderDe.order_id == order.id){
							order.data = {};
							order.data.steelPrice = [];
							order.data.steelPrice.push(userOrderDe);

							order.data.connetion = {};
							order.data.connetion.receiver_name = order.receiver_name;
							order.data.connetion.receiver_tel = order.receiver_tel;

							order.data.projectInfo = {};
							order.data.transportInfo = {};
						}
					}
				}

				for(var i=0;i<userPro.length;i++){
					for(var j=0;j<orderInfo.length;j++){
						if(userPro[i].id == orderInfo[j].project_id){
							orderInfo[j].name = userPro[i].project_name;

							orderInfo[j].data.projectInfo.name = userPro[i].project_name;
							orderInfo[j].data.projectInfo.adress = userPro[i].city + userPro[i].area + userPro[i].adds;
							orderInfo[j].data.projectInfo.interest = userPro[i].interest_rate;
							orderInfo[j].data.projectInfo.web_price_down = userPro[i].web_price_down;
							orderInfo[j].data.projectInfo.days = userPro[i].days;
							orderInfo[j].data.projectInfo.brands = userPro[i].brands_limit;
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
			}
		},
		methods: {
			showdata(val){
				this.dialogOrderVisible = true;
				this.nowOrder = this.currentOrderInfo[val].data;
				this.nowOrder.status = this.currentOrderInfo[val].status;
				this.nowOrder.all_total = this.currentOrderInfo[val].all_total;
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

		<!-- 查看弹出框 -->
		<el-dialog title="需求计划单" :visible.sync="dialogOrderVisible" style="text-align:center;">
		  <el-form>
				<!-- 自定义 -->
      		<p style="text-align:left;" v-show="this.nowOrder.status !=0">
      		 <label for="">进度:</label>
      			<span v-if="this.nowOrder.status!=0"><span class="bg" >1</span><b style="color:#20a0ff;">供方接单 ></b></span>
	      		<span v-if="this.nowOrder.status==-3||this.nowOrder.status==3||this.nowOrder.status==-2"><span class="bg" >2 </span><b style="color:#20a0ff;">确认订单 ></b></span>
	      		<span v-if="this.nowOrder.status==3"><span class="bg" >3 </span><b style="color:#20a0ff;">已确认 ></b></span>
	      		<span v-if="this.nowOrder.status<0"><span class="bg" >3 </span><b style="color:#20a0ff;">已取消 ></b></span>
      		</p>

		    <el-form-item label="显示项:"  style="text-align:left;">
		    	<el-button @click="moneyShow = !moneyShow" >资金占用费</el-button>
		    </el-form-item>
		    <el-form-item>
				<el-table :data="nowOrder.steelPrice" border style="width: 100%;text-align:center;">
				    <el-table-column prop="brands" label="品牌"></el-table-column>
				    <el-table-column prop="product"label="品名"></el-table-column>
				    <el-table-column prop="type" label="规格"></el-table-column>
				    <el-table-column prop="material" label="材质"></el-table-column>
				    <el-table-column prop="repertory" label="仓库"></el-table-column>
				    <el-table-column prop="web_price" label="网价(元)"></el-table-column>
				    <el-table-column prop="unit_price" label="综合单价(元)"></el-table-column>
				    <el-table-column width="100px" label="计划吨数(吨)">
					    <template scope="scope">
					      	<el-input  auto-complete="off" type="number" min="0" v-model="scope.row.amount"></el-input>
					    </template>
				    </el-table-column>
				    <el-table-column prop="total" label="总价(元)"></el-table-column>
				    <!-- 点击资金占用费情况 -->
				    <template v-if="moneyShow ==true">
				    	<el-table-column prop="countPrice" label="资金占用费(元)"></el-table-column>
				    	<el-table-column prop="countPrice" label="综合总价(元)"></el-table-column>
				    </template>
				 </el-table>
				 <div v-if="moneyShow ==true">
				 	<p style="color:red;font-size:16px;">资金占用费仅供参考，以实际付款日核算为准。</p>
				 </div>
			    <p style="float:right;margin-top:10px;font-weight:bold;">合计:
			    	<span>{{nowOrder.all_total}}</span>元
			    </p>
				<div style="clear:both;"></div>
		    </el-form-item>
			<el-form-item label="收货信息:" style="width:100%;"  v-bind:value="nowOrder.connetion">
				<!-- 处理中,未处理和已完成的情况 -->
				<div v-if="nowOrder.connetion" v-show="this.nowOrder.status>=0">
					<p class="text_l">
						<span>收货人信息: </span>
						<span>{{nowOrder.connetion.receiver_name}}</span>
					</p>
					<p class="text_l">
						<span>联系人电话: </span>
						<span>{{nowOrder.connetion.receiver_tel}}</span>
					</p>
				</div>
				<!-- 已取消的情况 -->
				<div v-if="nowOrder.connetion" v-show="this.nowOrder.status<0">
					<p class="text_l">
						<span>收货人信息: 
							<el-input v-model="nowOrder.connetion.receiver_name" style="width:20%;"></el-input>
						</span>
					</p>
					<p class="text_l">
						<span>联系人电话: 
							<el-input v-model="nowOrder.connetion.receiver_tel" style="width:20%;"></el-input>
						</span>
					</p>
				</div>

			</el-form-item>

			<!-- 已完成的物流信息情况 -->
			<div v-if="nowOrder.transportInfo">
				<el-form-item label="物流信息:" v-bind:value="nowOrder.transportInfo">
					<p class="text_l">
						<span>车牌号: </span>
						<span>{{nowOrder.transportInfo.plateNumber}}</span>
					</p>
					<p class="text_l">
						<span>司机姓名: </span>
						<span>{{nowOrder.transportInfo.DriverName}}</span>
					</p>
					<p class="text_l">
						<span>身份证: </span>
						<span>{{nowOrder.transportInfo.IDCard}}</span>
					</p>
					<p class="text_l">
						<span>联系电话: </span>
						<span>{{nowOrder.transportInfo.telphone}}</span>
					</p>
					<p class="text_l">
						<span>供货时间: </span>
						<span>{{nowOrder.transportInfo.time}}</span>
					</p>
				</el-form-item>
			</div>
			   
			<el-form-item label="合同条款:" v-bind:value="nowOrder.projectInfo" v-if="nowOrder.projectInfo ">
				<p class="text_l">
					<span>项目名称: </span>
					<span>{{nowOrder.projectInfo.name}}</span>
				</p>
				<p class="text_l">
					<span>项目地址: </span>
					<span>广东省 {{nowOrder.projectInfo.adress}}</span>
				</p>
				<p class="text_l">
					<span>结算条件: </span>
					<span>月息{{(nowOrder.projectInfo.interest || 0)*100}}%,网价下浮{{nowOrder.projectInfo.web_price_down}},下单后{{nowOrder.projectInfo.days}}天结算100%</span>
				</p>
				<p class="text_l">
					<span>品牌范围: </span>
					<span>{{nowOrder.projectInfo.brands}}</span>
				</p>
			</el-form-item> 

		  </el-form>
		  <div slot="footer" class="dialog-footer" style="text-align:center">
		    	<el-button @click="dialogOrderVisible = false">返回</el-button>
		    	<el-button type="primary" v-if="this.nowOrder.status<0" @click="dialogOrderVisible = false">重发订单</el-button>
		    	<el-button type="primary" v-if="this.nowOrder.status==0" @click="dialogOrderVisible = false">撤销订单</el-button>
		  </div>
		</el-dialog>
		<!-- end 查看弹出框 -->

		<div>
			<el-table :data="currentOrderInfo" border style="width: 100%">
			    <el-table-column prop="order_number" label="订单编号"></el-table-column>
			    <el-table-column prop="order_number" label="下单用户"></el-table-column>
			    <el-table-column prop="order_number" label="订单类型"></el-table-column>
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
						<!-- <el-button  @click="showdata(scope.row.id);" type="text" size="small" >查看</el-button> -->
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
</style>

