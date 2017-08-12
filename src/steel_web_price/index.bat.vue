<script>
	import headbar from "../components/user-headbar.vue";
	import titleBox from "../components/title-box.vue";
	import ajaxCustom from '../components/ajax-custom.js'; 
	import { Button, Table, TableColumn, Select,Option } from 'element-ui'
	export default{
		components : {
			headbar,
			titleBox, 
			datePicker,
			elButton : Button,
			elTable : Table,
			elTableColumn : TableColumn,
			elSelect : Select,
			elOption : Option
		},
		created(){ 
				// 获取全局变量
				this.tableDatas = window._defultDatas;
				this.showData = this.tableDatas.childDatas;
				let time = new Date(this.tableDatas.date*1000);
				this.selectDate = this.dateFormat(time);
				this.reportTimes = this.numChangeText(this.tableDatas.reportTimes - 1);
		},
		data(){
			return {
				loading:false,
				tableDatas : null,
				showData : [],
				dateDatas : null,
				allFilters : {
					productsFilters:[],
					typeFilters:[],
					materialFilters:[],
					brandsFilters:[]
				},
				selectDate : '',
				pickerOptions:{
					disabledDate(time) {
                        return time.getTime() > Date.now() ;
                    }
				},
				reportTimes : "",
				reportTimesOption : [],
			}
		},
		methods:{
			/*table过滤器信息获取*/
			getFiltersData(data){
				let filters = this.allFilters;
				for (var i = 0; i < data.length; i++) {
						this.getFilter(filters.productsFilters,data[i].product);
						this.getFilter(filters.typeFilters,data[i].type);
						this.getFilter(filters.materialFilters,data[i].material);
						this.getFilter(filters.brandsFilters,data[i].brands);
				}
			},
			getFilter(filter,data){
				for (var i = 0; i < filter.length; i++) {
					if(filter[i].text == data){
						return ;
					}
				}
				filter.push({'text':data,'value':data});
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
			getMarketDatas(date){
				this.reportTimes = null;
				this.dateDatas = [];
				this.reportTimesOption = [];
				this.showData = [];
				this.loading = true;

				if(date){
					ajaxCustom.ajaxGet(this,"api/getPriceTimesByDate", { params : { date : date } },(responese)=>{
						if(responese.body.data.length){
							responese = responese.body.data;
							for(let i = 0;i<responese.length;i++){
								this.reportTimesOption.push({'id':i,'date':responese[i].date});
							}
							this.dateDatas = responese;
							this.reportTimes = this.reportTimesOption[0].date;
							this.showMarkData(this.reportTimes);
							this.loading = false;
						}else{
							alert("该日期没有数据");
							this.loading = false;
						}
					},(responese)=>{
						console.log(responese)
						this.loading = false;
					});
				}else{
					this.loading = false;
					this.showData = this.tableDatas.childDatas;
				}
			},
			showMarkData(times){
				for(let data of this.dateDatas){
					if(data.date == times){
						this.showData = data.childDatas;
					}
				}
			},
			numChangeText(num){
				if(num == 0){ return "首次"; }
				else if(num == 1){ return "二次" }
				else if(num == 2){ return "三次" }
				else if(num == 3){ return "四次" }
			},
			//日期对象格式化
			dateFormat(date){
				var year =date.getFullYear();
				var month = (date.getMonth()+1).toString();
				var day =(date.getDate()).toString();
				if(month.length == 1){
					month = '0'+month;
				}
				if(day.length ==1){
					day = '0'+day;
				}
				var dateTime =year+"-"+month+"-"+day;
				return dateTime;
			},
		},
		mounted(){
			this.getFiltersData(this.tableDatas.childDatas);
		}
	}
</script>

<template>
	<div>
		<headbar :active_number="2"></headbar>

		<div class="main-box">
			<title-box text="网价" text-second="查看网价数据"></title-box>
			<div class="search">
				<el-date-picker v-model="selectDate" type="date" placeholder="选择日期" :picker-options="pickerOptions" @change="getMarketDatas">
			    </el-date-picker>
			    <el-select placeholder="报价次序" v-model="reportTimes" @change="showMarkData">
					<el-option v-for="item in reportTimesOption" :value="item.date" :label="numChangeText(item.id)" ></el-option>
				</el-select>
			</div>
			<el-table :data="showData" style="width:100%;" v-loading='loading'>
				<el-table-column label="品名" prop="product"
				:filters="allFilters.productsFilters" :filter-method="productFilter">
				</el-table-column>
				<el-table-column label="规格" prop="type"
				:filters="allFilters.typeFilters" :filter-method="typeFilter">
				</el-table-column>
				<el-table-column label="材质" prop="material"
				:filters="allFilters.materialFilters" :filter-method="materialFilter">
				</el-table-column>
				<el-table-column label="钢厂/产地" prop="brands" 
				:filters="allFilters.brandsFilters" :filter-method="brandsFilter">
				</el-table-column>
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
	.search{
		float: right;
		margin-bottom: 50px;
	}
	.el-table-filter__content{
		min-width: 100px;
    	height: 150px;
   		overflow: auto;
	}
</style>
