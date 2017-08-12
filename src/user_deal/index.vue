<script>
	import headbar from "../components/user-headbar.vue";
	import titleBox from "../components/title-box.vue";
	import ajaxCustom from '../components/ajax-custom.js';
	import planList from "../components/demand_plan.vue"
	import createProjectBox from '../components/ProjectCreating/project-creating-box.vue'
	import { Table, TableColumn, Button, Select, Option, Dialog, Input } from 'element-ui';
	export default{
		components : {
			headbar,
			titleBox,
			planList,
			createProjectBox,
			elTable : Table,
			elDialog : Dialog,
			elInput : Input,
			elTableColumn : TableColumn,
			elButton : Button,
			elSelect : Select,
			elOption : Option
		},
		created(){
				// 全局变量 配合组件通信
				this.allWebPrice = window._defaultDatas;
				this.tableDatas = this.addAttrToTable(window._defaultDatas.webPriceDatas[window._defaultDatas.webPriceDatas.length-1].childDatas);
		},
		data(){
			return {
				allWebPrice : null,
				tableDatas : null,
				logistics : {
					type : null,
					carsList : []
				},
				openBox : false,
				isOpenDialog : false,
				isWritePlan : true
			}
		},
		methods : {
			addProject(formDatas){
				ajaxCustom.ajaxPost(this, "dingoapi/addProjectDatas", formDatas, (responese)=>{
					console.log(responese)
					alert("添加成功");
				}, (responese)=>{
					console.log(responese);
				});
			},
			addAttrToTable(tableDatas){
				for(let data of tableDatas){
					this.$set(data, "count", null);
				}
				return tableDatas;
			},
			getUserPlan(data){
				this.isWritePlan = false;
			}
		}
	}
</script>

<template>
	<div>
		<headbar :active_number="1"></headbar>
		<div class="main-warpper">
			<title-box :text="['下单管理', '需求计划单']" >
				<div>
					<span>选择项目 ： </span>
				<!-- 	<el-select size="small">
						<el-option></el-option>
					</el-select> -->
					<el-button @click="openBox = !openBox" size="small">新建</el-button>
					<!-- <span>   (选择项目后根据项目显示品牌范围今日网价与合同价)   </span> -->
				</div>
			</title-box>

			<div v-if="isWritePlan">
				<plan-list brand="广钢" @confirm="getUserPlan" @cancel="isWritePlan=false"></plan-list>
			</div>

			<div v-else>
				<create-project-box :open-box="openBox" @getFormDatas="addProject"></create-project-box>
				<el-dialog title="计划单" v-model="isOpenDialog" size="large">
					<table class="self-element-table" style="width:100%">
						<thead>
							<tr>
								<th>品牌</th>
								<th>品名</th>
								<th>规格</th>
								<th>材质</th>
								<th>仓库</th>
								<th>含税单价</th>
								<th>计划吨数</th>
								<th>总价</th>
								<th>车号</th>
								<th>备注</th>
							</tr>
						</thead>
						<tr v-for="data in tableDatas" v-show="data.count!=null">
							<td>{{ data.product }}</td>
							<td>{{ data.type }}</td>
							<td>{{ data.material }}</td>
							<td>{{ data.brands }}</td>
							<td>{{ data.web_price }}</td>
							<td>含税单价</td>
							<td><input v-model.number="data.count" style="width:100px;border:none;" /></td>
							<td>{{ parseInt(data.web_price)*parseInt(data.count) + ".00" }}</td>
							<td>车号</td>
							<td>备注</td>
						</tr>
					</table>
					<hr/>
					<div>
						<span style="font-size:16px;"><b>物流信息</b></span>
						<br/><br/>
						<div>
							<span >运输方式 : </span>
							<el-select v-model="logistics.type" size="small">
								<el-option></el-option>
							</el-select>
							<el-button size="small">新增车号</el-button>
						</div>
						<div class="cars-list">
							<div>
								<span>车号 : </span>
								<el-select size="small">
									<el-option></el-option>
								</el-select>
								<span>联系电话 : </span>
								<el-input size="small" class="set-margin" style="width:190px;"></el-input>
							</div>
							<div>
								<span>司机 : </span>
								<el-input size="small" class="set-margin" style="width:190px;"></el-input>
								<span>身 份 证  : </span>
								<el-input size="small" class="set-margin" style="width:190px;"></el-input>
							</div>
						</div>
					</div>
					<span slot="footer" class="dialog-footer">
						<el-button @click="isOpenDialog=false" >取 消</el-button>
						<el-button type="primary" @click="isOpenDialog=false" >确 定</el-button>
					</span>
				</el-dialog>

				<div>
					<div>
						<el-button class="center-btn" @click="isOpenDialog = true" type="warning" size="large">下单</el-button>
					</div>
					<el-table :data="tableDatas" >
						<el-table-column prop="product" label="品名"></el-table-column>
						<el-table-column prop="type" label="规格"></el-table-column>
						<el-table-column prop="material" label="材质"></el-table-column>
						<el-table-column prop="brands" label="钢厂/品牌"></el-table-column>
						<el-table-column prop="web_price" label="网价"></el-table-column>
						<el-table-column label="合同价"></el-table-column>
						<el-table-column label="输入数量">
							<template scope="scope">
								<input v-model.number="scope.row.count" type="number" style="width:100%;"/>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</div><!-- v-else end -->
		</div>
	</div>
</template>

<style>
	*{
		font-family:"微软雅黑";
	}
	body{
		background-color:#f8f8f8;
	}
	.main-warpper{
		width:1280px;
		margin:auto;
	}
	html body .times-select input.el-input__inner{
		height: 29px;
	}
	.center-btn{
		position: fixed;
		left:94.6%;
		top:50%;
		z-index:100;
	}
	.self-element-table thead{
		background: #eef1f6;
	}
	.self-element-table thead th{
		padding:10px;
	}
	.self-element-table td,th{
		border:solid 1px #DEDEDE;
		text-align: center;
	}

	.cars-list .el-select{
		margin-right:50px;
	}
	.cars-list>div{
		margin:15px 0px 15px 0px;
	}
	.cars-list .set-margin{
		margin-right: 55px;
	}
</style>
