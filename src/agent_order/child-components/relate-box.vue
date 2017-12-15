<script>
	import {Dialog, Radio, Button, Select, Option, Input, Pagination} from 'element-ui';
	export default {
		props : ['openbox', 'proReateId', 'projects', 'companys'],
		components : {
			elDialog : Dialog,
			elRadio : Radio,
			elButton : Button,
			elSelect : Select,
			elOption : Option,
			elInput : Input,
			elPagination : Pagination,
		},
		data(){
			return {
				// 是否显示关联弹出框
				isShowRelate : false,
				// 现在的项目名称
				nowProject : null,
				// 查询关键词
				keyword : null,
				// 当前页
				currentPage : 1,
				// 当前绑定的公司
				nowCompany : null,
				proId : null,
				// 公司table的邦定值
				pageCompany : [],
				showSearch : true 
			}
		},
		computed : {
			// 传过来的项目id
			propData(){
				if(this.proReateId){
					this.proId = this.proReateId;
				}
			}
		},
		methods : {
			// 取消关联
			cancleRelate(companyid, proId){
				this.$emit('cancelRelate', { companyid : companyid, proId : proId });
				let pro = this.projects;
				for(let i = 0; i < pro.length;i++){
					if(pro[i].project_id == proId){
						for(let j = 0; j< this.companys.length; j++){
							if(this.companys[j].user_id == companyid){
								pro[i].company = '';
								this.nowCompany = '';
							}
						}
					}
				}
				this.isShowRelate = false;
			}, 
			// 确认关联
			confirmRelate(companyid, proId){
				this.$emit('confirmRelate', { companyid : companyid, proId : proId });
				let pro = this.projects;
				for(let i = 0; i < pro.length;i++){
					if(pro[i].project_id == proId){
						for(let j = 0; j< this.companys.length; j++){
							if(this.companys[j].user_id == companyid){
								pro[i].company = this.companys[j].name;
								this.nowCompany = this.companys[j].name;
							}
						}
					}
				}
				this.isShowRelate = false;
			},
			// 公司查询
			handleIconSearch(keyword){
				this.showSearch = false;
				this.pageCompany = [];
				for(let data of this.companys){
					if(data.name.includes(keyword)){
						this.pageCompany.push(data);
					}
				}
			},
			// 分页功能
			changePage(page){
				let total = this.companys.length;
				// console.log(total);
				this.pageCompany = [];
				for(let i = (page-1)*5; i < (page*5 < total ? page*5 : total); i++ ){
					this.pageCompany.push(this.companys[i]);
				}
			},
			// 查看所有公司
			showAllCompany(){
				this.keyword = '';
				this.showSearch = true;
				this.changePage(1);
			},
			// 获取当前的关联公司和项目
			getNowPro(){
				let pro = this.projects;
				for(let i= 0;i< pro.length;i++){
					if(pro[i].project_id == this.proId){
						this.nowProject = pro[i].project_id;
						this.nowCompany = pro[i].company;
					}
				}
			},
			// 改变项目
			changeProject(value){
				if(value >= 0){
					this.proId = value;
				}
			},
		},
		watch : {
			proReateId(){
				this.propData;
			},
			openbox(){
				this.isShowRelate = true;
				this.getNowPro();
			},
			companys(){
				this.changePage(1);
			},
			proId(){
				this.getNowPro();
			}
		},
	}
</script>
<template>
	<div>
		<el-dialog v-model="isShowRelate" >
			<p style="text-align:center;font-size:16px;"><label>关联公司</label></p>
			<!-- 关联公司 -->
			<div>
				<label>选择项目:</label>
				<el-select v-model="nowProject" size="small" @change="changeProject">
					<el-option v-for="pro in projects" :label="pro.name" :value="pro.project_id"></el-option>
				</el-select>
				<el-input class="leftBox" style="float:right" placeholder="搜索" v-model="keyword" icon="search" @change="handleIconSearch" size="small"></el-input>
				<table style="margin-top:10px;">
					<thead>
						<tr>
							<th>企业名称</th>
							<th>操作</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in pageCompany" >
							<td>{{item.name}}</td>
							<td>
								<el-button v-if="item.name == nowCompany" type="danger" @click="cancleRelate(item.user_id, proId)" size="small">解除关联</el-button>
								<!-- <el-button v-else type="info" @click="confirmRelate(item.user_id)" size="small">确认关联</el-button> -->
								<el-button v-else type="info" @click="confirmRelate(item.user_id, proId)" size="small">确认关联</el-button>
							</td>
						</tr>
					</tbody>
				</table>
				<p style="text-align:center;margin-top:20px;" v-if="showSearch==false"><el-button @click="showAllCompany" >查看所有公司</el-button></p>
				<div class="block" v-if="showSearch==true">
					<el-pagination :current-page="currentPage" :page-size="5" layout="total, prev, pager, next, jumper" :total="companys.length" @current-change="changePage">
				    </el-pagination>
				</div>
			</div>
		
		</el-dialog>
	</div>
</template>
<style scoped>
	.el-radio{
		display: inline-block;
	}
	table{
		width: 100%;
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
	.leftBox{
		display:inline-block;
		float:left;
		width:35%;
	}
	.block{
		text-align: center;
		margin-top: 20px;
	}
</style>