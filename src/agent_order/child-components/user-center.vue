<script>
    import _ from 'lodash';
	import {Tabs, TabPane, Table, TableColumn, Button, Pagination, Input, Select, Option, Switch, Message} from 'element-ui';
	import ajaxCustom from '../../components/ajax-custom.js';
	import projectToText from '../../components/project_to_text.js';
	import provinceList from "../../../res/json/provinceList.json";
	import projectCreat from '../../components/ProjectCreating/project-creating-box.vue';
	import headerbar from '../../components/same-headerbar.vue';
	import relateBox from './relate-box.vue';
	import projectCheck from './project-check.vue';
	import showPro from '../../components/projectUpdate/project-condition.vue';
	export default{
        components : {
            headerbar,
            relateBox,
            projectCheck,
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
		created(){
			this.initJsonData(provinceList);
			this.getProject();
		},
		data(){
			return {
				// 城市
				provinceList : '',
				// 项目
				projects : [],
				// 当前页
				currentPage : 1,
				// 修改项目的数据传值
				relateData : {},
				// 结算方式
				projectPayItems : [
					{ num : "1", text : "统一包干结算" },
					{ num : "2", text : "分品牌包干结算" },
					{ num : "3", text : "分品名包干结算" },
					{ num : "4", text : "统一分拆结算" },
					{ num : "5", text : "分品牌分拆结算" },
					{ num : "6", text : "综合费率结算" },
					{ num : "7", text : "其他" },
				],
                // 搜索的关键词
				keyword : '',
				// 珠三角地区
				riverArea : ['广州市', '深圳市', '佛山市', '中山市', '惠州市', '东莞市', '珠海市', '江门市', '肇庆市'],
				// 粤东地区
				easternGuang : ['潮州市', '河源市', '汕头市', '汕尾市', '梅州市', '揭阳市'],
				// 粤西地区
				westernGuang : ['阳江市', '湛江市', '茂名市', '云浮市'],
				// 粤北地区
				northGuang : ['韶关市', '清远市'],
				// 当前项目信息
				currentProject : [],
                // 是否显示新建项目弹出框
				openBox : false,
                // 是否显示关联公司的弹出框
				isShowRelate : false,
                // 是否显示审核弹出框（只有状态为审核中才会显示）
				isShowCheck : false,
                // 是否打开项目修改弹出框
				openpro : false,
				// 项目关联id
				proReateId : null,
				// 项目审核和关联公司的传值
				companys : [],
				// 是否显示分页
				showPage : true,
			}
		},
		methods:{
			// 获取广东省所有市区
			initJsonData(jsonData){
                this.provinceList =  _.find(jsonData.province, ['name', '广东']).cityList;
			},
			// 获取项目数据
			getProject(){
				ajaxCustom.ajaxGet(this, 'dingoapi/getUserProjectDatas', (response)=>{
					response = response.body.data;
					this.projects = response.projects;
					this.companys = response.companys;
					this.currentProject = this.projects.reverse();
					this.changePage(1);
				}, (response)=>{
					console.log('请求数据失败');
					alert(response.body.message);
				});
			},
			// 新建项目
			addProject(formDatas){
				ajaxCustom.ajaxPost(this, "dingoapi/addProjectDatas", formDatas, (responese)=>{
					console.log(responese)
					alert("添加成功");
					this.projects = responese.body.data.reverse();
					this.changePage(1);
				}, (responese)=>{
					alert(responese.body.message);
				});
			},
			// 编辑项目
			updateProject(index){
				this.relateData = JSON.parse(JSON.stringify(this.currentProject[index]));
				this.openpro = !this.openpro;
			},
			// 删除项目
			delProject(index, id){
				let proId = id;
				let _this = this;
				ajaxCustom.ajaxGet(this, 'dingoapi/delProjectDatas', { params : { id : proId }}, (response)=>{
					console.log(response);
					if(response.body.status_code == 200){
						alert(response.body.message);
						_this.projects.splice(index, 1);
						_this.currentProject.splice(index, 1);
					}else{
						alert(response.body.message);
					}
				}, (response)=>{
					alert(response.body.message);
				});
			},
			// 保存项目
			saveEdit(data){
				ajaxCustom.ajaxPost(this, 'dingoapi/editProjectDatas', data, (response)=>{
					console.log(response.body);
					alert(response.body.message);
					if(response.body.status_code == 200){
                        let index = _.findIndex(this.projects, ['project_info_id', data.project_info_id]);
                        this.projects.splice(index, 1, data);
                        let currentIndex = _.findIndex(this.currentProject, ['project_info_id', data.project_info_id]);
                        this.currentProject.splice(index, 1, data);
					}
				}, (response)=>{
					alert(response.body.message);
				});
			},
			// 结算方式转换
			payToText(pay_items){
                let text = _.find(this.projectPayItems, function(item){
                    return item.num == pay_items;
                });
                return text?text.text:'';
			},
			// 搜索功能
			handleIconClick() {
				this.showPage = false;
                let _this = this;
                this.currentProject = _.filter(this.projects, function(item){
                    return (
                        item.name.includes(_this.keyword) ||
						item.city.includes(_this.keyword) ||
						item.area.includes(_this.keyword)
                    );
                });
			},
			// 分地区搜索
			searchPro(value) {
				this.showPage = false;
                this.currentProject = _.filter(this.projects, function(item){
                    return item.city.includes(value);
                });
			},
			// 分页
			changePage(page){
				let total = this.projects.length;
				this.currentProject = [];
				for(let i = (page-1)*6; i < (page*6 < total ? page*6 : total); i++ ){
					this.currentProject.push(this.projects[i]);
				}
			},
			// 查看所有地区
			showAll(){
				this.showPage = true;
				this.currentProject = this.projects;
				this.changePage(1);
			},
			// 查看关联按钮
			showRelate(id){
				this.proReateId = id;
				this.isShowRelate = !this.isShowRelate;
			},
			// 查看项目审核
			ShowCheck(id){
				this.isShowCheck = !this.isShowCheck;
				this.proReateId = id;
			},
			// 审核通过
			succesCheck(data){
                let proIndex = _.findIndex(this.projects, ['project_info_id', data.project_info_id]);
                this.projects.splice(proIndex, 1, data);
                this.projects[proIndex].settlement.conditionType = 8;

				this.isShowCheck = false;
			},
			// 结算方式转换为文本
			projectTotextDeail(data){
				return projectToText.todo(data, false);
			},
			// 取消关联
			cancelRelate(data){
				ajaxCustom.ajaxGet(this, 'dingoapi/cancelProjectContact', { params : { projectId : data.proId, targetId :  data.companyid }}, (response)=>{
					console.log(response);
					Message.success(response.body.message);
				}, (response)=>{
					alert(response.body.message);
				});
			},
			// 确认关联
			confirmRelate(data){
				ajaxCustom.ajaxGet(this, 'dingoapi/changesProjectContact', { params : { projectId : data.proId, targetId : data.companyid }}, (response)=>{
					console.log(response);
					Message.success(response.body.message);
				}, (response)=>{
					alert(response.body.message);
				});
			},
		},
	}

</script>
<template>
	<div>
		<headerbar active_number="secondUsercenter" :text="['项目管理','查看所有项目']">
			<div>
				<el-tabs type="border-card">
					<el-tab-pane label="全部地区">
						<div class="cityBox">
							<ul v-for="(city, index) of provinceList" :key="index">
								<li><el-button @click="searchPro(city.name);" size="small">{{city.name}}</el-button></li>
							</ul>
						</div>
					</el-tab-pane>
					<el-tab-pane label="珠三角地区">
						<div class="cityBox">
							<ul v-for="(item, index) of riverArea" :key="index">
								<li><el-button @click="searchPro(item);" size="small">{{item}}</el-button></li>
							</ul>
						</div>
					</el-tab-pane>
					<el-tab-pane label="粤东地区">
						<div class="cityBox">
							<ul v-for="(item, index) of easternGuang" :key="index">
								<li><el-button @click="searchPro(item);" size="small">{{item}}</el-button></li>
							</ul>
						</div>
					</el-tab-pane>
					<el-tab-pane label="粤西地区">
						<div class="cityBox">
							<ul v-for="(item, index) of westernGuang" :key="index">
								<li><el-button @click="searchPro(item);" size="small">{{item}}</el-button></li>
							</ul>
						</div>
					</el-tab-pane>
					<el-tab-pane label="粤北地区">
						<div class="cityBox">
							<ul v-for="(item, index) of northGuang" :key="index">
								<li><el-button @click="searchPro(item);" size="small">{{item}}</el-button></li>
							</ul>
						</div>
					</el-tab-pane>
				</el-tabs>

				<div class="middle_test">
					<div>
						<h4 style="float:left;height: 60px;line-height: 60px;font-size: 18px;">全部项目</h4>
						<el-button @click="openBox=!openBox" style="margin-left:50px; width:150px;padding-bottom: 10px;" class="leftBox">新建项目</el-button>
						<el-input class="leftBox" style="float:right;padding-bottom: 10px;" placeholder="支持项目名称所在地址搜索" v-model="keyword" icon="search" @change="handleIconClick"></el-input>
					</div>
					<table width="100%" cellspacing="0" cellpadding="0">
						<thead>
							<tr>
								<th>所属单位</th>
								<th>项目名称</th>
								<th style="width:200px;">项目地址</th>
								<th style="width:200px;">品牌范围</th>
								<th>结算方式</th>
								<th>结算条件</th>
								<th>状态</th>
								<th>操作</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(data, index) in currentProject" :key="index">
								<td>{{ data.company }}</td>
								<td>{{ data.name }}</td>
								<td style="width:200px;">{{ data.province + data.city + data.area + data.addr }}</td>
								<td style="width:200px;">
									<template>
										<span v-for="(brand, index) in data.brands" :key="index">{{ brand }} , </span>
									</template>
								</td>
								<td>{{ payToText(data.settlement.conditionType) }}
									<span v-if="data.settlement.conditionType==8">双方协商</span>
								</td>
								<td v-html="projectTotextDeail(data)"></td>
								<td>
									<span v-if="data.settlement.conditionType!=7">已通过</span>
									<span v-else>未审核<br>
										<el-button @click="ShowCheck(data.project_id)" size="mini" type="primary" >审核</el-button>
									</span>
								</td>
								<td>
									<el-button @click="updateProject(index);" size="mini">
										<i class="el-icon-edit"></i>
									</el-button>
									<el-button @click="delProject(index, data.project_info_id);" size="mini">
										<i class="el-icon-delete"></i>
									</el-button>
									<el-button @click="showRelate(data.project_id)" size="mini">
										<i class="el-icon-share"></i>
									</el-button>
								</td>
							</tr>

						</tbody>
					</table>

					<!-- 分页 -->
					<div class="block" v-if="showPage">
						<el-pagination :current-page="currentPage" :page-size="6" layout="total, prev, pager, next, jumper" :total="projects.length" @current-change="changePage">
					    </el-pagination>
					</div>
					<el-button v-show="showPage == false" class="text_align" type="primary" @click="showAll">查看所有地区</el-button>
				</div>
			</div>
		</headerbar>

		<!-- 项目新建弹出框 -->
		<project-creat :open-box="openBox" @getFormDatas="addProject" :role="2"></project-creat>
		<!-- 项目修改弹出框 -->
		<show-pro :data="relateData" :openpro="openpro" @getForm="saveEdit" :role="2"></show-pro>
		<!-- 项目审核弹出框 -->
		<project-check :opencheck="isShowCheck" :projectId="proReateId" @finishCheck="succesCheck" :companys="companys" :projects="projects" @confirmRelate="confirmRelate" @cancelRelate="cancelRelate"></project-check>
		<!-- 关联弹出框 -->
		<relate-box :openbox="isShowRelate" :proReateId="proReateId" :companys="companys" :projects="projects" @confirmRelate="confirmRelate" @cancelRelate="cancelRelate"></relate-box>
	</div>
</template>
<style scoped>
	a{
		text-decoration: none;
	}
	.middle_test{
		background-color: #fff;
		min-height: 500px;
		margin: 20px 0;
		padding: 0 20px;
	}
	.leftBox{
		display:inline-block;
		float:left;
		width:20%;
		margin-top:15px;
	}
	.block{
		padding: 20px 0;
		margin: 20px 0;
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
	.text_align{
		text-align: center;
		margin: 20px auto;
		display: block;
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
