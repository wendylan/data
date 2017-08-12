<script>
	import headbar from "../components/user-headbar.vue";
	import titleBox from "../components/title-box.vue";
	import ajaxCustom from '../components/ajax-custom.js';
	import { Button, Table, TableColumn, Select, Option, DatePicker } from 'element-ui'
	export default{
		components : {
			headbar,
			titleBox,
			elButton : Button,
			elTable : Table,
			elTableColumn : TableColumn,
			elSelect : Select,
			elDatePicker : DatePicker,
			elOption : Option
		},
		created(){
				// 显示当天最后一次报价
				this.tableDatas = window._defultDatas[window._defultDatas.length-1].childDatas;
				// 获取当天最后一次报价时间
				this.report.date = new Date(parseInt(window._defultDatas[window._defultDatas.length-1].date) * 1000).toLocaleString().replace(/\//g, "-").split(" ")[0];
				// 获取当天报价次数下拉options
				this.report.timesOptions = window._defultDatas;
				// 默认选中当天最后一次报价
				this.report.times = this.numChangeText(window._defultDatas.length - 1);
				// table过滤必要条件
				this.getFiltersData(this.tableDatas);
		},
		data(){
			return {
				allWebPriceDatas : null,
				tableDatas : null,
				// table过滤器
				tableFilters : {
					productsFilters:[],
					typeFilters:[],
					materialFilters:[],
					brandsFilters:[]
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
				isLoading : false
			}
		},
		methods:{
			// table过滤器信息获取
			getFiltersData(data){
				for (var i = 0; i < data.length; i++) {
					this.getFilter(this.tableFilters.productsFilters, data[i].product);
					this.getFilter(this.tableFilters.typeFilters, data[i].type);
					this.getFilter(this.tableFilters.materialFilters, data[i].material);
					this.getFilter(this.tableFilters.brandsFilters, data[i].brands);
				}
			},
			getFilter(filter, data){
				for (var i = 0; i < filter.length; i++) {
					if(filter[i].text==data){
						return ;
					}
				}
				filter.push({'text':data, 'value':data});
			},
			productFilter(value, row){
				return row.product===value;

			},
			typeFilter(value, row){
				return row.type===value;
			},
			materialFilter(value, row){
				return row.material===value;
			},
			brandsFilter(value, row){
				return row.brands===value;
			},
			// 请求指定日期内的网价数据
			getWebPriceByDate(date){
				this.isLoading = true;
				ajaxCustom.ajaxGet(this, "dingoapi/getPriceTimesByDate", { params : { date : date } }, (response)=>{
					console.log(response);
					this.allWebPriceDatas = response.body.data;
					this.tableDatas = this.allWebPriceDatas[this.allWebPriceDatas.length-1].childDatas;
					this.report.timesOptions = this.allWebPriceDatas;
					this.report.times = this.numChangeText(this.allWebPriceDatas.length - 1);
					this.isLoading = false;
				}, (response)=>{
					this.tableDatas = [];
					this.isLoading = false;
					alert(response.body.message);
				});
			},
			// 显示匹配的报价次数
			showTableDatas(id){
				for(let data of this.allWebPriceDatas){
					if(data.id === id){
						this.tableDatas = data.childDatas;
					}
				}
			},
			numChangeText(num){
				if(num == 0){ return "首次"; }
				else if(num == 1){ return "二次" }
				else if(num == 2){ return "三次" }
				else if(num == 3){ return "四次" }
			},
		}
	}
</script>

<template>
	<div>
		<headbar :active_number="2"></headbar>

		<div class="main-box">
			<title-box :text="['网价', '查看网价数据']" ></title-box>
			<div class="report-search">
				<el-date-picker v-model="report.date" type="date" placeholder="选择日期" :picker-options="report.pickerOptions" @change="getWebPriceByDate" size="small"></el-date-picker>
			    <el-select placeholder="报价次序" v-model="report.times" @change="showTableDatas" size="small">
					<el-option v-for="(item, index) in report.timesOptions" :value="item.id" :label="numChangeText(index)"></el-option>
				</el-select>
			</div>
			<el-table :data="tableDatas" style="width:100%;" v-loading="isLoading">
				<el-table-column label="品名" prop="material" :filters="tableFilters.productsFilters" :filter-method="productFilter"></el-table-column>
				<el-table-column label="规格" prop="type" :filters="tableFilters.typeFilters" :filter-method="typeFilter"></el-table-column>
				<el-table-column label="材质" prop="material" :filters="tableFilters.materialFilters" :filter-method="materialFilter"></el-table-column>
				<el-table-column label="钢厂/产地" prop="brands" :filters="tableFilters.brandsFilters" :filter-method="brandsFilter"></el-table-column>
				<el-table-column label="价格(元/吨)" prop="web_price" sortable></el-table-column>
				<el-table-column label="比较上次浮动" prop="price_change"></el-table-column>
			</el-table>
		</div>
	</div>
</template>

<style>
	*{
		font-family:"微软雅黑";
	}
	hr{
		border: none;
		border-top:solid 1px #DEDEDE;
	}
	body{
		background-color:#f8f8f8;
	}
	.main-box{
		width:1280px;
		margin:auto;
	}
	.report-search{
		margin-bottom: 20px;
	}
	.el-table-filter__content{
		min-width: 100px;
    	height: 150px;
   		overflow: auto;
	}
</style>
