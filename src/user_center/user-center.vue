<script>
	import {Tabs, TabPane, Table, TableColumn, Button, Pagination, Input, Select, Option, Switch} from 'element-ui';
	import ajaxCustom from '../components/ajax-custom.js';
	import provinceList from "../../res/json/provinceList.json";
	import projectCreat from '../components/ProjectCreating/project-creating-box.vue';
	import titleBox from '../components/title-box.vue';
	import showPro from '../components/projectUpdate/project-condition.vue';
	export default{
		created : function(){
			this.initJsonData(provinceList);

			ajaxCustom.ajaxGet(this, 'dingoapi/getOrderPageDefault', (response)=>{
				response = response.body.data;
				// console.log(response);
				this.projects = response.projectDatas;
				console.log(this.projects);

				// 测试数据开始
				this.projects[0].status = 0;
				this.projects[1] = JSON.parse(JSON.stringify(this.projects[0]));
				this.projects[1].id = 2;
				this.projects[1].freight = 3750;
				this.projects[1].ponderation_price = 3822;
				this.projects[1].status = 1;

				this.projects.push(JSON.parse(JSON.stringify(this.projects[1])));
				this.projects[2].id = 3;
				this.projects[2].settlement.conditionType = 3;
				this.projects[2].project_name = '珠江新城';
				this.projects[2].city = '韶关市';
				// 测试数据结束

				let project = this.projects;
				this.currentProject = project;
			}, (response)=>{
				console.log('请求数据失败');
				console.log(response.body);
			});

			ajaxCustom.ajaxGet(this, 'api/getAllBrandsWillHeader', (response)=>{
				response = response.body;
				console.log(response);
				this.brands = response;
			}, (response)=>{
				console.log(response);
			});
			
		},
		components : {
			titleBox,
			projectCreat,
			showPro,
			elTabs : Tabs,
			elTabPane : TabPane,
			elTable : Table,
			elTableColumn : TableColumn,
			elButton : Button,
			elPagination : Pagination,
			elInput : Input,
			elSelect : Select,
			elOption : Option,
			elSwitch : Switch,
		},
		data(){
			return {
				provinceList : '',
				projects : [],
				isEdit : -1,
				brands : '',
				currentPage : 1,
				cache : '',
				projectStatus : [
					{num : "1", text : "已通过"},
					{num : "2", text : "已通过"},
					{num : "3", text : "已通过"},
					{num : "4", text : "已通过"},
					{num : "5", text : "已通过"},
					{num : "6", text : "已通过"},
					{num : "7", text : "待审核"},
					{num : "8", text : "已通过"}
				],
				projectPayItems : [
					{num : "1", text : "统一包干结算"},
					{num : "2", text : "分品牌包干结算"},
					{num : "3", text : "分品名包干结算"},
					{num : "4", text : "统一分拆结算"},
					{num : "5", text : "分品牌分拆结算"},
					{num : "6", text : "综合费率结算"},
					{num : "7", text : "其他"},
				],
				keyword : '',
				// 珠三角地区
				riverArea : ['广州市', '深圳市', '佛山市', '中山市', '惠州市', '东莞市', '珠海市', '江门市', '肇庆市'],
				// 粤东地区
				easternGuang : ['潮州市', '河源市', '汕头市', '汕尾市', '梅州市', '揭阳市'],
				// 粤西地区
				westernGuang : ['阳江市', '湛江市', '茂名市', '云浮市'],
				// 粤北地区
				northGaung : ['韶关市', '清远市'],
				// 当前项目信息
				currentProject : [],
				openBox : false,
				openpro : false,
			}
		},
		methods:{
			initJsonData:function(jsonData){
				for(let data of jsonData.province){
					if(data.name == "广东"){
						this.provinceList = data.cityList;
					}
				}
			},
			// 编辑项目
			updateProject(index){
				// this.isEdit = index;
				this.cache = this.projects[index];
				this.openpro = !this.openpro;
			},
			// 删除项目
			delProject(index){
				this.projects.splice(index, 1);
			},
			// 保存项目
			saveEdit(data){
				this.isEdit = -1;
				console.log(data);
				// this.projects[index] = this.cache;
				// this.projects[index].status = 7;

				for(let i = 0; i < this.projects.length;i++){
					if(this.projects[i].id == data.id){
						this.projects[i] == data;
						this.projects[i].status = 7;
					}
				}

			},
			// 状态方式转换
			statusToText(status){
				for(let data of this.projectStatus){
					if(data.num == status){
						return data.text;
					}
				}
			},
			// 结算方式转换
			payToText(pay_items){
				for(let data of this.projectPayItems){
					if(data.num == pay_items){
						return data.text;
					}
				}
			},
			// 搜索功能
			handleIconClick() {
				this.currentProject = [];
				for(let data of this.projects){
					if(data.name.includes(this.keyword) || data.city.includes(this.keyword)){
						this.currentProject.push(data);
					}
				}
			},
			// 分地区搜索
			searchPro(value) {
				this.currentProject = [];
				for(let data of this.projects){
					if(data.city.includes(value)){
						this.currentProject.push(data);
					}
				}
			},
			// 新建项目
			addProject(data){
				console.log(data);
			},
			// 分页
			changePage(page){
				let total = this.projects.length;
				this.currentProject = [];
				for(let i = (page-1)*10; i < (page*10 < total ? page*10 : total); i++ ){
					this.currentProject.push(this.projects[i]);
				}
			},
		},
	}

</script>
<template>
	<div class="main-warpper">
		<title-box :text="['项目管理','查看所有项目']"></title-box>
		<div>
			<el-tabs type="border-card">
				<el-tab-pane label="全部地区">
					<div class="cityBox">
						<ul v-for="city of provinceList">
							<li><el-button @click="searchPro(city.name);" size="small">{{city.name}}</el-button></li>
						</ul>
					</div>
				</el-tab-pane>
				<el-tab-pane label="珠三角地区">
					<div class="cityBox">
						<ul v-for="item of riverArea">
							<li><el-button @click="searchPro(item);" size="small">{{item}}</el-button></li>
						</ul>
					</div>
				</el-tab-pane>
				<el-tab-pane label="粤东地区">
					<div class="cityBox">
						<ul v-for="item of easternGuang">
							<li><el-button @click="searchPro(item);" size="small">{{item}}</el-button></li>
						</ul>
					</div>
				</el-tab-pane>
				<el-tab-pane label="粤西地区">
					<div class="cityBox">
						<ul v-for="item of westernGuang">
							<li><el-button @click="searchPro(item);" size="small">{{item}}</el-button></li>
						</ul>
					</div>
				</el-tab-pane>
				<el-tab-pane label="粤北地区">
					<div class="cityBox">
						<ul v-for="item of northGaung">
							<li><el-button @click="searchPro(item);" size="small">{{item}}</el-button></li>
						</ul>
					</div>
				</el-tab-pane>
			</el-tabs>
		</div>
		
		<div>
			<h3 style="display:inline-block;float:left;">全部项目</h3>
			<el-button @click="openBox=!openBox" style="margin-left:50px; width:150px;" class="leftBox">新建项目</el-button>
			<project-creat :open-box="openBox" @getFormDatas="addProject"></project-creat>
			<el-input class="leftBox" style="float:right" placeholder="搜索" v-model="keyword" icon="search" @change="handleIconClick"></el-input>
		</div>
		<table width="100%" cellspacing="0" cellpadding="0">
			<thead>
				<tr>
					<th>项目名称</th>
					<th>项目地址</th>
					<th>品牌范围</th>
					<th>结算方式</th>
					<th>结算条件</th>
					<th>状态</th>
					<th>操作</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(data,index) in currentProject">
					<template  v-if="isEdit!=index">
						<td>{{ data.name }}</td>
						<td>{{ data.province + data.city + data.area + data.addr }}</td>
						<td>
							<template>
								<span v-for="brand in data.brands">{{ brand }} , </span>
							</template>
						</td>
						<td>{{ payToText(data.settlement.conditionType) }}</td>
						<td>
							<!-- 统一包干结算 -->
							<template v-if="data.settlement.conditionType==1">
								<p>{{ data.settlement.beginCalculateType + data.settlement.days }}日</p>
								<p>{{ data.settlement.priceType + data.settlement.calculateType + data.settlement.price }}元/吨</p>
							</template>
							<!-- 分品牌包干结算 -->
							<template v-if="data.settlement.conditionType==2">
								<p>{{ data.settlement.beginCalculateType + data.settlement.days }}日</p>
								<p v-for="child in data.settlement.childData">
									<span>{{ child.onemoreBrand + child.priceType +  child.calculateType + child.price}}元/吨</span>
								</p>
							</template>
							<!-- 分品名包干结算 -->
							<template v-if="data.settlement.conditionType==3">
								<p>{{ data.settlement.beginCalculateType + data.settlement.days }}日</p>
								<p v-for="cate in data.settlement.cate_spec">
									<span>{{ cate.name + cate.calculateType + cate.price }}元/吨</span>
								</p>
							</template>
							<!-- 统一分拆结算 -->
							<template v-if="data.settlement.conditionType==4">
								<p>{{ data.settlement.beginCalculateType + data.settlement.days }}日</p>
								<p>{{ data.settlement.priceType + data.settlement.calculateType + data.settlement.price }}元/吨</p>
								<p>运费{{ data.settlement.freight }} 元/吨</p>
								<p>过磅费{{ data.settlement.ponderation_price }} 元/吨</p>
							</template>
							<!-- 分品牌分拆结算 -->
							<template v-if="data.settlement.conditionType==5">
								<p>{{ data.settlement.beginCalculateType + data.settlement.days }}日</p>
								<p v-for="child in data.settlement.childData">
									<span>{{ child.onemoreBrand + child.priceType +  child.calculateType + child.price}}元/吨</span>
								</p>
								<p>运费{{ data.settlement.freight }} 元/吨</p>
								<p>过磅费{{ data.settlement.ponderation_price }} 元/吨</p>
							</template>
							<!-- 综合费率结算 -->
							<template v-if="data.settlement.conditionType==6">
								<p>{{ data.settlement.beginCalculateType + data.settlement.days }}日</p>
								<p>运费{{ data.settlement.freight }} 元/吨</p>
								<p>过磅费{{ data.settlement.ponderation_price }} 元/吨</p>
								<p>吊机费{{ data.settlement.crane_price }} 元/吨</p>
								<p>资金费率{{ data.settlement.funds_price_rate }} 元/吨</p>
							</template>
							<!-- 其他方式结算 -->
							<template v-if="data.settlement.conditionType==7">
								<p>{{ data.settlement.elsePayWay }}</p>
							</template>

						</td>
						<td>{{statusToText(data.status)}}</td>
						<td>
							<el-button @click="updateProject(index);" >
								<i class="el-icon-edit"></i>
							</el-button>
							<el-button @click="delProject(index,data.id);" >
								<i class="el-icon-delete"></i>
							</el-button>
						</td>
					</template>
					
					
				</tr>
				
			</tbody>
		</table>
		<show-pro :data="cache" :openpro="openpro" @getForm="saveEdit"></show-pro>
		<!-- 分页 -->
		<div class="block">
			<el-pagination :current-page="currentPage" :page-size="10" layout="total, prev, pager, next, jumper" :total="projects.length" @current-change="changePage">
		    </el-pagination>
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
	a{
		text-decoration: none;
	}
	.leftBox{
		display:inline-block;
		float:left;
		width:20%;
		margin-top:10px;
	}
	.block{
		margin-top: 50px;
		text-align: center;
	}
	.cityBox ul{
		margin-left: -30px;
	}
	.cityBox ul li{
		display: inline-block;
		padding:5px 15px;
		float: left;
	}
	.el-select{
		width : 85px;
	}

	table{
		border :solid 1px #DEDEDE;
		font-size:14px;
	}
	table thead{
		background-color:#e0e6ed;
	}
	table tbody tr:hover{
		background-color:#e0e6ed;
	}
	table tr td{
		padding:5px;
		text-align:center;
		border-top :solid 1px #DEDEDE;
	}
	table tr th{
		padding:8px;
		text-align:center;
		border-bottom :solid 1px #DEDEDE;
	}
</style>