<script>
	import titleBox from '../../components/title-box.vue';
	import ajaxCustom from '../../components/ajax-custom.js';
	import projectCreate from '../../components/ProjectCreating/project-creating-box.vue';
	import addressUi from '../../components/adds-input.vue';
	import { Select, Option, Button, Radio, Table, TableColumn, DatePicker, Input, Dialog} from 'element-ui';
	export default{
		components : {
			ajaxCustom,
			titleBox,
			addressUi,
			projectCreate,
			elSelect : Select,
			elOption : Option,
			elButton : Button,
			elRadio : Radio,
			elTable : Table,
			elTableColumn : TableColumn,
			elDatePicker : DatePicker,
			elInput : Input,
			elDialog : Dialog,
		},
		created(){
			this.getAllBrands();
			this.getAllProjects();
			this.getAllData('2017-06-06');
		},
		data(){
			return{
				isCreateProject : false,
				showPlan : false,
				priceWay : '1',
				selectCity : null,
				// 品牌
				allBrands : {
					item : [],
					selected : null
				},
				// 项目
				userProject : {
					item : [],
					selected : null
				},
				// 报价选择控件
				report : {
					date : '',
					pickerOptions:{
						disabledDate(time) {
	                        return time.getTime() > Date.now() ;
	                    }
					},
					times : "",
					timesOptions : []
				},
				tableDatas : [],
				filterDatas : {
					cate_spec : [
						{
							text : "螺纹钢",
							value : "螺纹钢"
						},
						{
							text : "盘螺",
							value : "盘螺"
						},
						{
							text : "高线",
							value : "高线"
						}
					],
				},
			}
		},
		methods : {
			getAllBrands(){
				ajaxCustom.ajaxGet(this,"api/getAllBrandsWillHeader",(response)=>{
					console.log(response);
					this.allBrands.item = response.body;
				},(response)=>{
					console.log(response);
				});
			},
			getAllProjects(){
				ajaxCustom.ajaxGet(this,"api/getProjectOrder",(response)=>{
					let project = response.body.project;
					for(let pro of project){
						this.userProject.item.push(pro.project_name);
					}
				},(response)=>{
					console.log(response);
				});
			},
			getAllData(date){
				ajaxCustom.ajaxGet(this,"dingoapi/getSoptPriceByDate",{ params : { date : date} },(response)=>{
					console.log(response);
					this.tableDatas = response.body;
				},(response)=>{
					console.log(response);
				});
			},
			getAddress(data){
				this.selectCity = data.city;
				console.log(this.selectCity);
			},
			getPriceByDate(date){
				console.log(date);
			},
			showTableDatas(){
				console.log('showTableDatas');
			},
		},
	}
</script>
<template>
	<div>
		<project-create v-if="isCreateProject==true"></project-create>
		<div class="main-warpper">
			<title-box :text="['买买买','钢材现货购买']"></title-box>
			<div>
				<div>
					<span><b>选择品牌:</b></span>
					<el-select size="small" placeholder="请选择" v-model="allBrands.selected">
						<el-option v-for="brand in allBrands.item" :label="brand" :value="brand"></el-option>
					</el-select>
					<span class="margin-left"><b>选择项目:</b></span>
					<el-select size="small" placeholder="请选择" v-model="userProject.selected">
						<el-option v-for="pro in userProject.item" :label="pro" :value="pro"></el-option>
					</el-select>
					<el-button size="small" @click="isCreateProject=true">新建</el-button>
					<span class="margin-left"><b>送达地址:</b></span>
					<address-ui province="广东" grade="0" @change="getAddress"></address-ui>
					<span style="color:red">(请选择品牌、选择/新建项目或选择送达地址获取包到价)</span>
				</div>
				<div style="margin-top:20px;font-size:16px;">
					<span><b>显示项:</b></span>
					<el-radio v-model="priceWay" label="1">现货价</el-radio>
					<el-radio v-model="priceWay" label="2">包到价</el-radio>
					<div style="float:right;">
						<el-date-picker v-model="report.date" type="date" placeholder="选择日期" :picker-options="report.pickerOptions" @change="getPriceByDate" size="small"></el-date-picker>
					    <el-select placeholder="报价次序" v-model="report.times" @change="showTableDatas" size="small">
							<el-option v-for="(item, index) in report.timesOptions" :value="item.id" :label="numChangeText(index)"></el-option>
						</el-select>
					</div>
				</div>
				<el-table :data="tableDatas" v-if="priceWay ==1" border style="margin-top:20px;">
					<el-table-column prop="cate_spec" label="品名"
					:filters="allFilters.productsFilters" :filter-method="productFilter">
					</el-table-column>
					<el-table-column prop="brand" label="钢厂/品牌"
					:filters="allFilters.productsFilters" :filter-method="productFilter">
					</el-table-column>
					<el-table-column prop="size" label="规格"
					:filters="allFilters.productsFilters" :filter-method="productFilter">
					</el-table-column>
					<el-table-column prop="material" label="材质"
					:filters="allFilters.productsFilters" :filter-method="productFilter">
					</el-table-column>
					<el-table-column prop="price" label="网价"></el-table-column>
					<el-table-column prop="nowPrice" label="现货价"></el-table-column>
					<el-table-column prop="diffPrice" label="差价"></el-table-column>
					<el-table-column prop="warehouse" label="仓库"
					:filters="allFilters.productsFilters" :filter-method="productFilter">
					</el-table-column>
					<el-table-column prop="inventory" label="库存"></el-table-column>
					<el-table-column>
						<template scope="scope">
							<p>输入数量</p>
							<el-button size="mini" type="primary" @click="showPlan=true">生成订单</el-button>
						</template>
					</el-table-column>
				</el-table>

				<table v-if="priceWay==2">
					<thead>
						<tr>
							<th rowspan="2">品名</th>
							<th rowspan="2">钢厂/品牌</th>
							<th rowspan="2">规格</th>
							<th rowspan="2">材质</th>
							<th rowspan="2">网价</th>
							<th colspan="3">现货包到价</th>
							<th rowspan="2">差价</th>
							<th rowspan="2">仓库</th>
							<th rowspan="2">库存</th>
							<th rowspan="2">
								<template>
									<p>输入数量</p>
									<el-button size="mini" type="primary" @click="showPlan=true">生成订单</el-button>
								</template>
							</th>
						</tr>
						<tr>
							<th>单价</th>
							<th>运费</th>
							<th>总价</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for=" data in tableDatas">
							<td>{{data.cate_spec}}</td>
							<td>{{data.brand}}</td>
							<td>{{data.size}}</td>
							<td>{{data.material}}</td>
							<td>{{data.price}}</td>
							<template v-if="priceWay==2">
								<td>{{data.price}}</td>
								<td>{{data.price}}</td>
								<td>{{data.price}}</td>
							</template>
							<td>{{data.price}}</td>
							<td>{{data.warehouse}}</td>
							<td>{{data.inventory}}</td>
							<td><el-input type="number" min='0'></el-input></td>
						</tr>
					</tbody>
				</table>
			</div>
			<el-dialog v-model="showPlan" title="计划单" style="text-align:center;">
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
							<th>车号</th>
							<th>备注</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for=" (data,index) in tableDatas">
							<td>{{index}}</td>
							<td>{{data.brand}}</td>
							<td>{{data.cate_spec}}</td>
							<td>{{data.size}}</td>
							<td>{{data.material}}</td>
							<td>{{data.warehouse}}</td>
							<td>{{data.price}}</td>
							<td>{{data.num}}</td>
							<td>{{data.allPrice}}</td>
							<td>{{data.wagon_num}}</td>
							<td><el-input type="text"></el-input></td>
						</tr>
					</tbody>
				</table>

				<div slot="footer" class="dialog-footer">
					<el-button @click="showPlan = false">取 消</el-button>
					<el-button type="primary" @click="showPlan = false">新增</el-button>
				</div>
			</el-dialog>
		</div>
	</div>
</template>
<style scoped>
	.main-warpper{
		width: 80%;
		margin: 0 auto;
	}
	.margin-left{
		margin-left: 20px;
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