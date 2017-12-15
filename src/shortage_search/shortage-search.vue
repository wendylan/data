<script>
	import ajaxCustom from '../components/ajax-custom.js';
	import headerbar from '../components/same-headerbar.vue';
	import multiple from "../components/multiple.vue";
	import { Select, Option, Button, Table, TableColumn, Pagination} from 'element-ui';
	export default{
		created(){
			this.userProject.item = window._defaultDatas.projects;
			// this.getAllProjects();
			this.getInitTableData(window._defaultDatas.productAmount);
			this.getFiltersData(this.tableData);
		},
		components : {
			headerbar,
			multiple,
			elSelect : Select,
			elOption : Option,
			elButton : Button,
			elTable : Table,
			elTableColumn : TableColumn,
			elPagination :Pagination,
		},
		data(){
			return{
				userProject : {
					item : [
						{  value : 1, name : "越秀公园"},
						{  value : 2, name : "流花湖公园"},
						{  value : 3, name : "南越王博物馆"},
						{  value : 4, name : "测试项目"},
						{  value : 5, name : "不是项目"},
					],
					selected : null
				},
				filters : {
					product : [
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
					size : [],
					brand : []
				},
				filterArr : {
					brands : [],
					product : [],
					size : []
                },
				currentPage : 1,
				tableData : [],
				// tableData : [
				// 	{
				// 		brand : '广钢',
				// 		display : true,
				// 		children : [
				// 			{
				// 				product : '高线',
				// 				size : ['6', '10'],
				// 				display : true
				// 			},
				// 			{
				// 				product : '盘螺',
				// 				size : ['10'],
				// 				display : true
				// 			},
				// 			{
				// 				product : '螺纹钢',
				// 				size : ['16', '20', '25'],
				// 				display : true
				// 			}
				// 		]
				// 	},
				// 	{
				// 		brand : '粤钢',
				// 		display : true,
				// 		children : [
				// 			{
				// 				product : '高线',
				// 				size : ['6', '8'],
				// 				display : true
				// 			},
				// 			{
				// 				product : '盘螺',
				// 				size : ['6', '8', '10'],
				// 				display : true
				// 			},
				// 			{
				// 				product : '螺纹钢',
				// 				size : ['16', '18'],
				// 				display : true
				// 			}
				// 		]
				// 	},
				// 	{
				// 		brand : '湘钢',
				// 		display : true,
				// 		children : [
				// 			{
				// 				product : '高线',
				// 				size : ['8', '10'],
				// 				display : true
				// 			},
				// 			{
				// 				product : '盘螺',
				// 				size : ['10'],
				// 				display : true
				// 			},
				// 			{
				// 				product : '螺纹钢',
				// 				size : ['16', '20'],
				// 				display : true
				// 			}
				// 		]
				// 	},
				// 	{
				// 		brand : '韶钢',
				// 		display : true,
				// 		children : [
				// 			{
				// 				product : '高线',
				// 				size : ['6', '8', '6.5'],
				// 				display : true
				// 			},
				// 			{
				// 				product : '盘螺',
				// 				size : ['6', '10'],
				// 				display : true
				// 			},
				// 			{
				// 				product : '螺纹钢',
				// 				size : ['16', '20', '25'],
				// 				display : true
				// 			}
				// 		]
				// 	},
				// ],
			}
		},
		methods: {
			/*table过滤器信息获取*/
			getFiltersData(data){
				let filters = this.filters;
				for (var i = 0; i < data.length; i++) {
						// this.getFilter(filters.size, data[i].size);
						this.getFilter(filters.brand, data[i].brand);
				}
			},
			getFilter(filter, data){
				for (var i = 0; i < filter.length; i++) {
					if(filter[i].text == data){
						return ;
					}
				}
				filter.push({'text':data, 'value':data});
			},
			getInitTableData(arr){
				let temp = {};
				temp.brand = undefined;
				for(let i=0; i< arr.length;i++){
					this.getBrandData(temp, arr[i]);
				}
				console.log(temp.brand);
				this.tableData = temp.brand;
			},
			getBrandData(brand, data){
				if(brand.brand == undefined){
					brand.brand = [{ brand : data.brand, display : true, children : [{ product : data.cate_spec, display : true, size : [data.size] }] }];
				}else{
					for(let j = 0; j< brand.brand.length; j++){
						if(data.brand == brand.brand[j].brand){
							this.getChildrenData(brand.brand[j], data);
							return;
						}
					}
					brand.brand.push({ brand : data.brand, display : true, children : [{ product : data.cate_spec, display : true, size : [ data.size ] }] });
				}
			},
			getChildrenData(brand, data){
				for(let i = 0; i < brand.children.length; i++ ){
					if(brand.children[i].product == data.cate_spec){
						this.getSizeData(brand.children[i], data.size);
						return;
					}
				}
				brand.children.push({ product : data.cate_spec, display : true, size : [ data.size ] });
			},
			getSizeData(children, size){
				// children.size.push(size);
				for(let i = 0; i < children.size.length; i++){
					if(children.size[i] == size){
						return;
					}
				}
				children.size.push(size);
			},
			// 获取项目
			// getAllProjects(){
			// 	ajaxCustom.ajaxGet(this, "dingoapi/getOrderPageDefault", (response)=>{
			// 		console.log(response);
			// 		let project = response.body.data.projectDatas;
			// 		this.userProject.item = project;
			// 	}, (response)=>{
			// 		alert(response.body.message);
			// 	});
			// },
			// 变更项目
			changeProject(selectPro){
				// let pro = this.userProject.item;
				// for(let i = 0; i < pro.length; i++ ){
				// 	if(pro[i].name == selectPro){
				// 		this.getFreight(pro[i].city, pro[i].area);
				// 	}
				// }
			},
			// 品牌筛选
			sortTable(data){
				this.filterArr.brands = data;
				// 清空选项时 重置表格
				if( !this.filterArr.brands.length){
					for(let _data of this.tableData){
						_data.display = true;
					}
				}else{
					for(let _data of this.tableData){
						_data.display = false;
					}
					for(let lineData of this.tableData ){
						for(let tmp of this.filterArr.brands){
							if(lineData.brand == tmp){
								lineData.display = true;
							}
						}
					}
				}
			},
			// 品名筛选
			filterPro(data){
				this.filterArr.product = data;
				// 清空选项时 重置表格
				if( !this.filterArr.product.length){
					for(let _data of this.tableData){
						_data.display = true;
						for(let data of _data.children){
							data.display = true;
						}
					}
				}else{
					for(let _data of this.tableData){
						_data.display = false;
						for(let data of _data.children){
							data.display = false;
						}
					}
					for(let lineData of this.tableData ){
						lineData.display = true;
						for(let data of lineData.children){
							for(let tmp of this.filterArr.product){
								if(data.product == tmp){
									data.display = true;
								}
							}
						}
					}
				}
			},
			// 重置
			clearPro(){
				this.userProject.selected = '';
			},
			// 分页
			// changePage(page){
			// 	console.log(page);
			// },
		},
	}
</script>
<template>
	<div>
		<headerbar :identity="1" :text="['缺货查询',' 查询当天现货缺货规格']">
			<div>
				<span>选择项目 ： </span>
				<el-select size="small" placeholder="请选择" v-model="userProject.selected" @change="changeProject">
					<el-option v-for="pro in userProject.item" :label="pro.name" :value="pro.name"></el-option>
				</el-select>
				<el-button size="small" @click="clearPro">重置</el-button>				
				<table>
					<thead>
						<tr>
							<th rowspan="2">
								<multiple name="品牌" :options="filters.brand" v-on:selectedArr="sortTable"></multiple>
							</th>
							<th colspan="2">当前缺货资源</th>
						</tr>
						<tr>
							<th>
								<multiple name="品名" :options="filters.product" v-on:selectedArr="filterPro"></multiple>
							</th>
							<th>规格/材质</th>
						</tr>
					</thead>
					<tbody>
						<template v-for="item in tableData">
							<template v-if="item.display">
								<tr>
									<td :rowspan="item.children.length +1">{{ item.brand }} </td>
								</tr>
								<tr v-for="data in item.children">
									<template v-if="data.display">
										<td>{{ data.product }}</td>
										<td>
											<span v-for="_size in data.size">{{ _size }}, </span>
										</td>
									</template>
								</tr>
								
							</template>
						</template>

					</tbody>
				</table>	

				<!-- 分页 -->
				<!-- <div class="block">
					<el-pagination :current-page="currentPage" :page-size="6" layout="total, prev, pager, next, jumper" :total="tableData.length" @current-change='changePage'>
				    </el-pagination>
				</div> -->
			</div>
		</headerbar>
	</div>
</template>
<style scoped>
	body{
		background-color: #f8f8f8;
	}
	.block{
		margin: 0 auto;
		margin-top: 20px;
		text-align: center;
	}
	table{
		margin-bottom: 30px;
		margin-top: 20px;
		width: 100%;
	    table-layout: fixed;
	    border-collapse:collapse;
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