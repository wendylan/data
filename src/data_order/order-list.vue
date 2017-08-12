<script>
	import { Select, Option, DatePicker, Button, Tabs, TabPane, Table, TableColumn, Pagination, Dialog, Form,FormItem,Input } from 'element-ui'
	import ajaxCustom from '../components/ajax-custom.js';
	export default{
		components:{
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
		},
		created : function(){
			ajaxCustom.ajaxGet(this,"api/getSteelMarketList",(response)=>{
				console.log(response);
				response = response.body;
				if(response.status === "success"){
					this.userProjectInfo.item = response.data.userProjectInfo;
				}else{
					alert('暂无数据，请再次查询');
				}
				
			},(response)=>{
				alert(responese.body.message);
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
				pickerOptions1: {
		          shortcuts: [{
		            text: '今天',
		            onClick(picker) {
		              picker.$emit('pick', new Date());
		            }
		          }, {
		            text: '昨天',
		            onClick(picker) {
		              const date = new Date();
		              date.setTime(date.getTime() - 3600 * 1000 * 24);
		              picker.$emit('pick', date);
		            }
		          }, {
		            text: '一周前',
		            onClick(picker) {
		              const date = new Date();
		              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
		              picker.$emit('pick', date);
		            }
		          }]
		        },
		        value2 :'',
		        activeName: 'first',
		        orderInfo:[{
			        	id:'0213541314',
				        name: '越秀公园',
				        status: '处理中',
				        date: '2016-05-03 13:20',
				        // todo: '查看'
			        },{
			        	id:'0213541314',
				        name: '流花湖公园',
				        status: '已取消',
				        date: '2016-05-03 13:20',
				        // todo: '查看,删除'
			        },{
			        	id:'0213541314',
				        name: '南越王博物馆',
				        status: '未处理',
				        date: '2016-05-03 13:20',
				        // todo: '查看,撤回'
			        },{
			        	id:'0213541314',
				        name: '广医',
				        status: '已完成',
				        date: '2016-05-03 13:20',
				        // todo: '查看'
			        }
		        ],
		         multipleSelection: [],
		         currentPage4: 4,

		         dialogOrderVisible: false,
		        form: {
		          name: '',
		          region: '',
		          date1: '',
		          date2: '',
		          delivery: false,
		          type: [],
		          resource: '',
		          desc: ''
		        },
		        formLabelWidth: '120px',

		        tableData: [{
		        		brand : "广钢",
						name : "盘螺",
						standard : "Φ6",
						material : "HRB400",
						repertory : "鱼珠仓",
						webPrice : "3200",
						unitPrice : "3500",
						num : "100",
						countPrice : "71800",
						
					},
					{
						brand : "广钢",
						name : "高线",
						standard : "Φ8",
						material : "HRB400",
						repertory : "金博仓",
						webPrice : "3900",
						unitPrice : "3600",
						num : "20",
						countPrice : "71800",
					},
					{
						brand : "广钢",
						name : "螺纹钢",
						standard : "Φ9",
						material : "HRB300",
						repertory : "金博仓",
						webPrice : "3800",
						unitPrice : "3700",
						num : "30",
						countPrice : "369000",
					}],
					userInfo:[{
						userName: "66钢铁",
						tel:"166666666",
					}],
					contract:[{
						name:"越秀公园",
						adress:"广东省广州市越秀区解放北路1号",
						condition:"月息1.5%，网价下浮10元，下单后45天结算100%",
						brands:'广钢、韶钢、桂鑫',
					}],

			}
		},
		methods: {
			 handleSelectionChange(val) {
		        this.multipleSelection = val;
		      },
		},

	}
</script>
<template>
	<div class="main-warpper">
		<h1>我的订单</h1>
		<h4>查看订单</h4>
		<hr/>
		<!-- 查看弹出框 -->
		<el-dialog title="需求计划单" :visible.sync="dialogOrderVisible" style="text-align:center;">
		  <el-form :model="form">
		    <el-form-item label="进度:" >
		      <!-- <el-input v-model="form.name" auto-complete="off"></el-input> -->
		      <p style="text-align:left;">
			      <span class="bg">1</span>
			      <span style="color:#20a0ff;">供方接单 ></span>
		      </p>
		    </el-form-item>
		    <el-form-item label="显示项:"  style="text-align:left;">
		      <el-button @click="" >资金占用费</el-button>
		    </el-form-item>
		    <el-form-item>
				<el-table
				    :data="tableData"
				    border
				    style="width: 100%;text-align:center;">
				    <el-table-column
				      prop="brand"
				      label="品牌">
				    </el-table-column>
				    <el-table-column
				      prop="name"
				      label="品名">
				    </el-table-column>
				    <el-table-column
				      prop="standard"
				      label="规格">
				    </el-table-column>
				    <el-table-column
				      prop="material"
				      label="材质">
				    </el-table-column>
				    <el-table-column
				      prop="repertory"
				      label="仓库">
				    </el-table-column>
				    <el-table-column
				      prop="webPrice"
				      label="网价(元)">
				    </el-table-column>
				    <el-table-column
				      prop="unitPrice"
				      label="综合单价(元)">
				    </el-table-column>
				    <el-table-column
				      
				      label="计划吨数(吨)">
				      <template scope="scope">
				      	<el-input  auto-complete="off" type="number" min="0" v-model="scope.row.num"></el-input>
				      </template>
				      
				    </el-table-column>
				    <el-table-column
				      prop="countPrice"
				      label="总价(元)">
				    </el-table-column>
				 </el-table>
			    <p style="float:right;margin-top:10px;font-weight:bold;">合计:<span>440800</span>元</p>
				<p style="clear:both;"></p>
		    </el-form-item>
			<el-form-item label="收货信息:" v-model="userInfo">
				<p class="text_l"><label for="">收货人信息:</label><span>{{userInfo.userName}}</span></p>
				<p class="text_l"><label for="">联系人电话:</label><span>{{userInfo.tel}}</span></p>
			</el-form-item>    
			<el-form-item label="合同条款:">
				<p class="text_l"><label for="">项目名称:</label><span>{{contract}}</span></p>
				<p class="text_l"><label for="">项目地址:</label><span>{{contract}}</span></p>
			</el-form-item> 

		  </el-form>
		  <div slot="footer" class="dialog-footer" style="text-align:center">
		    <!-- <el-button @click="dialogOrderVisible = false">返回</el-button> -->
		    <el-button type="primary"  @click="dialogOrderVisible = false">返回</el-button>
		  </div>
		</el-dialog>

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
					<el-date-picker
				      v-model="value2"
				      type="date"
				      placeholder="选择日期"
				      :picker-options="pickerOptions1">
				    </el-date-picker>
				    <span>--</span>
				    <el-date-picker
				      v-model="value2"
				      type="date"
				      placeholder="选择日期"
				      :picker-options="pickerOptions1">
				    </el-date-picker>
				</div>
				<div style="clear:both;"></div>
				<p><span class="wrapper">
				    	<el-button type="primary">查询</el-button>
    					<el-button type="">清空</el-button>
				    </span>
				</p>
			</div>
			<div></div>
		</div>
		<br/>

		<div>
			<el-tabs v-model="activeName" @tab-click="" >
			    <el-tab-pane label="近一周订单" name="first">
					<el-table
					    ref="multipleTable"
					    :data="orderInfo"
					    border
					    tooltip-effect="dark"
					    style="width: 100%"
					    @selection-change="handleSelectionChange">
					    <el-table-column
					      type="selection"
					      width="55">
					    </el-table-column>
					    <el-table-column
					      prop="id"
					      label="订单编号">
					    </el-table-column>
					    <el-table-column
					      prop="name"
					      label="项目名称">
					    </el-table-column>
					    <el-table-column
					      prop="status"
					      label="状态">
					    </el-table-column>
					    <el-table-column
					      prop="date"
					      label="下单时间">
					    </el-table-column>
					    <el-table-column
					      label="订单操作">
					      <template scope="scope">
					        <el-button @click="dialogOrderVisible = true" type="text" size="small">查看</el-button>
					        <el-button type="text" size="small">编辑</el-button>
					      </template>
					    </el-table-column>
					</el-table>

					<!-- 分页 -->
					<div class="block">
						<el-pagination
					      :current-page="currentPage4"
					      :page-sizes="[10, 20, 30, 40,50]"
					      :page-size="10"
					      layout="total, sizes, prev, pager, next, jumper"
					      :total="400">
					    </el-pagination>
					</div>
					 
			    </el-tab-pane>
			    <el-tab-pane label="全部订单" name="second">全部订单</el-tab-pane>
			    <el-tab-pane label="处理中" name="third">处理中</el-tab-pane>
			    <el-tab-pane label="未处理" name="fourth">未处理</el-tab-pane>
			    <el-tab-pane label="已完成" name="firth">已完成</el-tab-pane>
			    <el-tab-pane label="已取消" name="sixth">已取消</el-tab-pane>
			</el-tabs>
			
		</div>
	</div>
</template>
<style scoped>
@import url("//unpkg.com/element-ui@1.3.7/lib/theme-default/index.css");

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
		display: inline-block;
		width: 28px;
		height: 28px;
		background:#20a0ff; 
		border-radius: 50%;
		color:#fff;
		text-align: center;
		vertical-align: middle;
	}
	.text_l{
		text-align: left;
	}
</style>