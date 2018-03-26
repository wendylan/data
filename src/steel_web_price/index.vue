<script>
	import headerbar from "../components/same-headerbar.vue";
	import proTable from '../components/table.vue';
	import filterBar from '../components/filter-bar.vue';
	import ajaxCustom from '../components/ajax-custom.js';
	import sortMethods from '../components/steel-sort.js';
	import { Button, Table, TableColumn, Select, Option, DatePicker, Loading, Message } from 'element-ui'
	export default{
		components : {
			headerbar,
			elButton : Button,
			elTable : Table,
			elTableColumn : TableColumn,
			elSelect : Select,
			elDatePicker : DatePicker,
			elOption : Option,
			proTable : proTable,
			filterBar : filterBar
		},
		created(){
				// 保存所有网价
				this.allWebPriceDatas = window._defultDatas;
				// 显示当天最后一次报价
				this.tableDatas = window._defultDatas[window._defultDatas.length-1].childDatas;
				let result = sortMethods.todo(this.tableDatas, [
					{ text : "品名", key : "product" },
					{ text : "规格", key : "type" },
					{ text : "材质", key : "material" }
				], "desc", "web_price");
				this.tableDatas = result;

				this.filterDatas = JSON.parse(JSON.stringify(this.tableDatas));
				this.tempTableDatas = JSON.parse(JSON.stringify(this.tableDatas));
				// 获取当天最后一次报价时间
				this.report.date = new Date(parseInt(window._defultDatas[window._defultDatas.length-1].date) * 1000).toLocaleString().replace(/\//g, "-").split(" ")[0];
				// 获取当天报价次数下拉options
				this.report.timesOptions = window._defultDatas;
				// 默认选中当天最后一次报价
				this.report.times = this.numChangeText(window._defultDatas.length - 1) + '(' + this.timestampToDate(window._defultDatas[window._defultDatas.length-1].date) + ')';
		},
		data(){
			return {
				allWebPriceDatas : null,
				tableDatas : null,
				tempTableDatas : null,
				// table过滤器
				tableFilters : {},
				filterDatas : null,
				// 报价选择控件
				report : {
					date : '',
					pickerOptions:{
						disabledDate(time) {
                            let tmp = time.getDay();
                            if(tmp == 0 || tmp == 6 ){
                                return true;
                            }
                            return time.getTime() > Date.now();
	                    }
					},
					times : "",
					timesOptions : []
				},
			}
		},
		methods:{
			// 请求指定日期内的网价数据
			getWebPriceByDate(date){
				let loadingInstance = Loading.service({ fullscreen : true, text : "正在加载 "+date+" 的数据..." });
				ajaxCustom.ajaxGet(this, "dingoapi/getPriceTimesByDate", { params : { date : date } }, (response)=>{
					console.log(response);
					this.allWebPriceDatas = response.body.data;
					this.tableDatas = this.allWebPriceDatas[this.allWebPriceDatas.length-1].childDatas;
					let result = sortMethods.todo(this.tableDatas, [
						{ text : "品名", key : "product" },
						{ text : "规格", key : "type" },
						{ text : "材质", key : "material" }
					], 'desc', "web_price");
					this.tableDatas = result;
					this.tempTableDatas = JSON.parse(JSON.stringify(this.tableDatas));
					this.report.timesOptions = this.allWebPriceDatas;
					this.report.times = this.numChangeText(this.allWebPriceDatas.length - 1);

					loadingInstance.close();
				}, (response)=>{
					this.tableDatas = [];
					alert(response.body.message);

					loadingInstance.close();
				});
			},
			// 显示匹配的报价次数
			showTableDatas(id){
				let count = 0;
				for(let data of this.allWebPriceDatas){
					if(data.id === id){
						Message.success("切换到"+ this.numChangeText(count) +"报价");
						this.tableDatas = data.childDatas;
					}
					count++;
				}
				let result = sortMethods.todo(this.tableDatas, [
					{ text : "品名", key : "product" },
					{ text : "规格", key : "type" },
					{ text : "材质", key : "material" }
				], 'desc', "web_price");
				this.tableDatas = result;
				this.tempTableDatas = JSON.parse(JSON.stringify(this.tableDatas));
			},
			// 筛选table
			getListToChange(filterDatas, extra){
				this.tableDatas = filterDatas;
				if(extra){
					extra[0].selected || extra[1].selected ? this.sortByBrands() : false;
				}
			},
			// 按品牌来归类排序
			sortByBrands(){
				let result = sortMethods.classify(this.tableDatas, "product");
				for (var i = 0; i < result.length; i++) {
					result[i] = sortMethods.classify(result[i], "brands");
					for (var j = 0; j < result[i].length; j++) {
						result[i][j] = sortMethods.classify(result[i][j], "material").sort(function(a, b){
							return a[0].material > b[0].material;
						});
						for(let data of result[i][j]){
							data = sortMethods.todo(data, [
								{ text : "品名", key : "product" },
								{ text : "规格", key : "type" },
								{ text : "材质", key : "material" },
								{ text : "网价", key : "web_price" },
							], "desc", "web_price");
						}
					}
				}
				// 降维
				let realDatas = [];
				for(let datas of result){
					for(let _datas of datas){
						for(let __datas__ of _datas){
							for(let data of __datas__){
								realDatas.push(data);
							}
						}
					}
				}
				this.tableDatas = realDatas;
			},
			numChangeText(num){
				let labels = ["首次", "二次", "三次", "四次"];
				if(num === (this.report.timesOptions.length - 1)){
					return "最新";
				}else{
					for (var i = 0; i < labels.length; i++) {
						if(i == num){
							return labels[i];
						}
					}
				}
			},
			timestampToDate(date){
				return new Date(parseInt(date) * 1000).toLocaleString('en-GB', { hour12 : false }).split(' ')[1].substring(0, 5);
			}
		},
		watch : {
			tableDatas(){
				this.filterDatas = JSON.parse(JSON.stringify(this.tempTableDatas));
			}
		},
	}
</script>

<template>
	<div>
		<headerbar active_number="webPrice" :text="['网价', '查看网价数据']" >
			<div>
				<div>
					<filter-bar :data="filterDatas" :index="[
						{ title : '品名', key : 'product' },
						{ title : '规格' , key : 'type'},
						{ title : '材质', key : 'material'},
						{ title : '品牌', key : 'brands' }
					]" @list="getListToChange" @sortByBrands="sortByBrands" style="background-color: #fff;"></filter-bar>

				</div>
				<div style="background-color: #fff; padding: 15px;">
					<div class="report-search">
						<el-date-picker v-model="report.date" type="date" placeholder="选择日期" :picker-options="report.pickerOptions" @change="getWebPriceByDate" size="small"></el-date-picker>
					    <el-select placeholder="报价次序" v-model="report.times" @change="showTableDatas" size="small">
							<el-option v-for="(item, index) in report.timesOptions" :value="item.id" :label="numChangeText(index) + '(' + timestampToDate(item.date) + ')'">
								<span style="float: left">{{ numChangeText(index) }}</span>
								<span style="float: right; font-size: 13px">{{ timestampToDate(item.date) }}</span>
							</el-option>
						</el-select>
					</div>
					<div id="check">
						<pro-table v-model="tableDatas" :index="[
							{ title :'品名', key : 'product' },
							{ title :'规格', key : 'type' },
							{ title :'材质', key : 'material' },
							{ title :'钢厂/产地', key : 'brands' },
							{ title :'~价格(元/吨)', key : 'web_price' },
							{ title : '涨跌', key : 'price_change' }
						]"></pro-table>
					</div>
				</div>
			</div>
		</headerbar>
	</div>
</template>

<style scoped>
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
	.report-search{
		margin-bottom: 10px;
		float: right;
	}
	.el-table-filter__content{
		min-width: 100px;
    	height: 150px;
   		overflow: auto;
	}
	#check{
		clear: both;
	}
	.el-select-dropdown__item.selected span{
		color:rgb(132, 146, 166);
	}
	.el-select-dropdown__item.selected>span{
		color:#FFF;
	}
</style>
