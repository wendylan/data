<script>
	import {Dialog, Radio, Button, Select, Option, Input, Pagination} from 'element-ui';
	export default {
		props : ['openbox'],
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
				relate_way : "2",
				isShowRelate : false,
				account_relate : [
					{ name : "yyy777@gyl.com", relate_status : 0 },
					{ name : "yyy666@gyl.com", relate_status : 1 },
					{ name : "yyy555@gyl.com", relate_status : 1 },
					{ name : "yyy444@gyl.com", relate_status : 1 },
					{ name : "yyy333@gyl.com", relate_status : 1 }
				],
				project : [
					{ name : "流花湖公园"},
					{ name : "越秀公园"},
					{ name : "珠江新城"},
				],
				company : [
					{ name : "广东省建工集团有限公司", relate_status : 0 },
					{ name : "广州市建筑集团有限公司", relate_status : 1 },
					{ name : "广州市金辉建筑有限公司", relate_status : 1 },
					{ name : "广州市天力建筑有限公司", relate_status : 1 },
					{ name : "广州市梁亮建筑有限公司", relate_status : 1 }
				],
				nowProject : null,
				keyword : null,
				currentPage : 1,
				currentPage1 : 1,
			}
		},
		methods : {
			cancleRelate(index){
				console.log(index);
			},
			confirmRelate(index){
				console.log(index);
			},
			handleIconClick(keyword){
				console.log(keyword);
			},
			changePage(page){
				console.log(page);
			},
			changeRePage(page){
				console.log(page);
			},
		},
		watch : {
			openbox(){
				this.isShowRelate = true;
			}
		},
	}
</script>
<template>
	<div>
		<el-dialog v-model="isShowRelate" >
			<el-radio class="radio" v-model="relate_way" label="1">关联公司</el-radio>
			<el-radio class="radio" v-model="relate_way" label="2">关联帐户</el-radio>
			<!-- 关联公司 -->
			<div v-if="relate_way == 1">
				<label>选择项目:</label>
				<el-select v-model="nowProject" size="small">
					<el-option v-for="pro in project" :label="pro.name" :value="pro.name"></el-option>
				</el-select>
				<el-input class="leftBox" style="float:right" placeholder="搜索" v-model="keyword" icon="search" @change="handleIconClick" size="small"></el-input>
				<table style="margin-top:10px;">
					<thead>
						<tr>
							<th>企业名称</th>
							<th>操作</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item, index) in company" >
							<td>{{item.name}}</td>
							<td>
								<el-button v-if="item.relate_status == 0" type="danger" @click="cancleRelate(index)" size="small">解除关联</el-button>
								<el-button v-else type="info" @click="confirmRelate(index)" size="small">确认关联</el-button>
							</td>
						</tr>
					</tbody>
				</table>
				<!-- 分页 -->
				<div class="block">
					<el-pagination :current-page="currentPage" :page-size="5" layout="total, prev, pager, next, jumper" :total="company.length" @current-change="changePage">
				    </el-pagination>
				</div>
			</div>
			<!-- 关联账户 -->
			<div v-if="relate_way == 2">
				<table>
					<thead>
						<tr>
							<th>账户</th>
							<th>操作</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item, index) in account_relate" >
							<td>{{item.name}}</td>
							<td>
								<el-button v-if="item.relate_status == 0" type="danger" @click="cancleRelate(index)" size="small">解除关联</el-button>
								<el-button v-else type="info" @click="confirmRelate(index)" size="small">确认关联</el-button>
							</td>
						</tr>
					</tbody>
				</table>
				<!-- 分页 -->
				<div class="block">
					<el-pagination :current-page="currentPage1" :page-size="5" layout="total, prev, pager, next, jumper" :total="account_relate.length" @current-change="changeRePage">
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