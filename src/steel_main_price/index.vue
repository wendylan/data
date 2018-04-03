<script>
	import Vue from "vue";
	import headerbar from "../components/same-headerbar.vue";
	import addr from "../components/adds-input.vue";
	import proTable from '../components/table.vue';
	import filterBar from '../components/filter-bar.vue';
	import ajaxCustom from '../components/ajax-custom.js';
	import sortMethods from '../components/steel-sort.js';
	import _ from "lodash";
	import { Button, DatePicker, Select, Option, Table, TableColumn, Loading, Message} from 'element-ui';
	export default{
		components : {
			addr,
			headerbar,
			elDatePicker : DatePicker,
			elSelect : Select,
			elOption : Option,
			elButton : Button,
			elTable : Table,
			elTableColumn : TableColumn,
			proTable : proTable,
			filterBar : filterBar
		},
		created(){
			// 初始化值
			this.nameList = window._defultDatas.nameList;
			this.allWebDatas = window._defultDatas.webPriceDatas;
			this.allMainDatas = window._defultDatas.marketPriceDatas;

			// 获取table数据
			let lastWebPriceDatas = window._defultDatas.webPriceDatas[window._defultDatas.webPriceDatas.length-1] ? window._defultDatas.webPriceDatas[window._defultDatas.webPriceDatas.length-1].childDatas : [];
			console.log(window._defultDatas);
			this.tableDatas = window._defultDatas.marketPriceDatas[window._defultDatas.marketPriceDatas.length-1].childDatas;
			this.tableDatas = this.combineDatas(this.tableDatas, lastWebPriceDatas);
			let result = sortMethods.todo(this.tableDatas, [
					{ text : "品名", key : "cate_spec" },
					{ text : "规格", key : "size" },
					{ text : "材质", key : "material" }
				], 'desc', 'price');
			this.tableDatas = result;
			this.filterDatas = JSON.parse(JSON.stringify(this.tableDatas));
			this.tempTableDatas = JSON.parse(JSON.stringify(this.tableDatas));
			// 时间控件默认值
			this.report.date = window._defultDatas.marketPriceDatas[window._defultDatas.marketPriceDatas.length-1].created_at;
			this.report.timesOptions = window._defultDatas.marketPriceDatas;
			// 获取最后一次报价 计算报价时间与次数
			this.report.times = this.numChangeText(window._defultDatas.marketPriceDatas.length-1) + '(' +this.changsDateStr(window._defultDatas.marketPriceDatas[window._defultDatas.marketPriceDatas.length-1].updated_at) + ')';
		},
		data(){
			return {
				tableDatas : null,
				allMainDatas : null,
				allWebDatas : null,
				filterDatas : null,
				tempTableDatas : null,
				// 品牌别名
				nameList : [],
				// 过滤的参数
				tableFilters : [],
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
				// 运费
				freightInfo : {
					mill : null,
					warehouse : null
				},
				isShowFreight : false,
				isCounting : false
			}
		},
		methods : {
			// 合并相同规格的网价与现货价
			combineDatas(marketDatas, webDatas){
				for(let market of marketDatas){
					// 初始对比的空值
					market.webPrice = 9999;
					market.diffPrice = 9999;
					// 加入品牌别名
					for(let item of this.nameList){
						if(market.brand == item.abbreviation){
							market.elseName = item.full_name;
							break;
						}else if(market.brand == item.full_name){
							market.elseName = item.abbreviation;
							break;
						}
					}
					for(let web of webDatas){
						// console.log(market.elseName)
						if( (market.brand==web.brands || market.elseName==web.brands) && market.cate_spec==web.product && market.material==web.material && market.size==web.type){
							// 整合网价
							market.webPrice = web.web_price;
							// 整合计算差价
							market.diffPrice = parseInt(web.web_price) - parseInt(market.price);
						}
					}
				}
				return marketDatas;
			},
			// 按品牌来归类排序
			sortByBrands(){
				let result = sortMethods.classify(this.tableDatas, "cate_spec");
				for (var i = 0; i < result.length; i++) {
					result[i] = sortMethods.classify(result[i], "brand");
					for (var j = 0; j < result[i].length; j++) {
						result[i][j] = sortMethods.classify(result[i][j], "material").sort(function(a, b){
							return a[0].material > b[0].material;
						});
						for(let data of result[i][j]){
							data = sortMethods.todo(data, [
								{ text : "品名", key : "cate_spec" },
								{ text : "规格", key : "size" },
								{ text : "材质", key : "material" },
								{ text : "网价", key : "price" },
							], "desc", "price");
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
			// 获取指定时间内的现货价格  并改变视图
			getWebPriceByDate(date){
				let loadingInstance = Loading.service({ fullscreen : true, text : "正在加载 "+date+" 的数据..." });
				ajaxCustom.ajaxGet(this, "dingoapi/getMainDatasByDate", { params : { date : date } }, (response)=>{
					console.log(response)
					this.allWebDatas = response.body.data.webPriceDatas;
					this.allMainDatas = response.body.data.marketPriceDatas;
					this.countResultPrice();
					// 设置时间控件值
					this.report.date = this.allMainDatas[this.allMainDatas.length-1].updated_at;
					this.report.timesOptions = this.allMainDatas;
					this.report.times = this.numChangeText(this.allMainDatas.length-1);
					this.report.times = this.numChangeText(this.allMainDatas.length-1) + '(' +this.changsDateStr(this.allMainDatas[this.allMainDatas.length-1].updated_at) + ')';

					// 设置table数据
					let lastWebDatas = [];
					let lastMainDatas = [];
					if(response.body.data.webPriceDatas.length){
						lastWebDatas = response.body.data.webPriceDatas[response.body.data.webPriceDatas.length-1].childDatas;
					}
					if(this.allMainDatas.length){
						lastMainDatas = this.allMainDatas[this.allMainDatas.length-1].childDatas;
					}
					
					this.tableDatas = this.combineDatas(lastMainDatas, lastWebDatas);
					let result = sortMethods.todo(this.tableDatas, [
							{ text : "品名", key : "cate_spec" },
							{ text : "规格", key : "size" },
							{ text : "材质", key : "material" }
						], "desc", "price");
					this.tableDatas = result;
					
					this.tempTableDatas = JSON.parse(JSON.stringify(this.tableDatas));

					loadingInstance.close();
				}, (response)=>{
					this.tableDatas = [];
					this.report.timesOptions = [];
					loadingInstance.close();
					alert(response.body.message);
				});
			},
			// 切换报价次序
			showTableDatas(id){
				let count = 0;
				for(let data of this.allMainDatas){
					if(data.id === id){
						Message.success("切换到"+ this.numChangeText(count) +"报价");
						this.tableDatas = this.combineDatas(data.childDatas, this.allWebDatas[this.allWebDatas.length-1].childDatas);
						let result = sortMethods.todo(this.tableDatas, [
								{ text : "品名", key : "cate_spec" },
								{ text : "规格", key : "size" },
								{ text : "材质", key : "material" }
							], 'desc', "price");
						this.tableDatas = result;
					}
					count++;
				}
				this.tempTableDatas = JSON.parse(JSON.stringify(this.tableDatas));
			},
			// 获取运费并计算包到价
			getFreightByCity(data){
				if(data.city){
					let loadingInstance = Loading.service({ fullscreen : true, text : "正在加载 "+data.city + '' + data.area +" 的数据..." });
					ajaxCustom.ajaxGet(this, 'dingoapi/getFreightByCity', { params : { city : data.city, area : data.area }}, (response)=>{
						console.log(response);
						this.freightInfo.mill = response.body.data.mill;
						this.freightInfo.warehouse = response.body.data.warehouse;
						this.countResultPrice();
						this.isShowFreight = true;
						
						this.tableDatas = this.tempTableDatas;

						loadingInstance.close();
					}, (response)=>{
						alert(response.body.message);
						loadingInstance.close();
					});
				}else{
					this.isShowFreight = false;
				}
			},
			// 在获得运费的前提下, 往table添加运费和包到价
			countResultPrice(){
				if(this.freightInfo.mill && this.freightInfo.warehouse){
					for(let table of this.allMainDatas){
						for(let _data of table.childDatas){
							if(_data.transport === "直送"){
								let isHere = false;
								for(let key in this.freightInfo.mill){
									if(key == _data.brand){
										Vue.set(_data, "freight", this.freightInfo.mill[key]);
										Vue.set(_data, "resultPrice", parseInt(_data.price) + parseInt(this.freightInfo.mill[key]));
										isHere = true;
									}
								}
								!isHere ? Vue.set(_data, "freight", 9999) : false;
								!isHere ? Vue.set(_data, "resultPrice", 9999) : false;
							}else{
								Vue.set(_data, "resultPrice", parseInt(_data.price) + parseInt(this.freightInfo.warehouse));
								Vue.set(_data, "freight", this.freightInfo.warehouse);
							}
						}
					}
					// table组件已解除绑，需额外操作
					for(let data of this.tempTableDatas){
						if(data.transport === "直送"){
							let isHere = false;
							for(let key in this.freightInfo.mill){
								if(key == data.brand){
									Vue.set(data, "freight", this.freightInfo.mill[key]);
									Vue.set(data, "resultPrice", parseInt(data.price) + parseInt(this.freightInfo.mill[key]));
									isHere = true;
								}
							}
							!isHere ? Vue.set(data, "freight", 9999) : false;
							!isHere ? Vue.set(data, "resultPrice", 9999) : false;
						}else{
							Vue.set(data, "resultPrice", parseInt(data.price) + parseInt(this.freightInfo.warehouse));
							Vue.set(data, "freight", this.freightInfo.warehouse);
						}
					}
				}
			},
			getListToChange(result){
				this.tableDatas = result;
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
			changsDateStr(date){
				return date.split(' ')[1].substring(0, 5);
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
		<headerbar active_number="mainprice" :text="['现货价', '查看现货价数据']">
			<div>
				<filter-bar :data="filterDatas" :index="[
					{ title : '品名', key : 'cate_spec' },
					{ title : '规格' , key : 'size'},
					{ title : '材质', key : 'material'},
					{ title : '品牌', key : 'brand' },
					{ title : '库存', key : 'inventory' },
					]" @list="getListToChange" @sortByBrands="sortByBrands" class="filter_class">
				</filter-bar>

				<div class="inline_one">
					<div class="project-selecting">
						<span>送达地址 : </span>
						<addr province="广东" @change="getFreightByCity"></addr>
					</div>

					<div class="report-search">
						<el-date-picker v-model="report.date" type="date" placeholder="选择日期" :picker-options="report.pickerOptions" @change="getWebPriceByDate" size="small"></el-date-picker>
					    <el-select placeholder="报价次序" v-model="report.times" @change="showTableDatas" size="small">
							<el-option v-if="report.timesOptions.length" v-for="(item, index) in report.timesOptions" :value="item.id" :key="item.id" :label="numChangeText(index)+'('+changsDateStr(item.updated_at)+')'">
								<span style="float: left">{{ numChangeText(index) }}</span>
								<span style="float: right; font-size: 13px">{{ changsDateStr(item.updated_at) }}</span>
							</el-option>
						</el-select>
					</div>
				</div>

				<div id="check">
					<pro-table v-show="!isShowFreight" v-model="tableDatas" :index="[
						{ title : '品名', key : 'cate_spec' },
						{ title : '规格', key : 'size' },
						{ title : '材质', key : 'material' },
						{ title : '品牌', key : 'brand' },
						{ title : '~网价', key : 'webPrice' },
						{ title : '~现货价', key : 'price' },
						{ title : '~差价', key : 'diffPrice' },
						{ title : '库存', key : 'inventory' }
					]"></pro-table>

					<pro-table v-show="isShowFreight" v-model="tableDatas" :index="[
						{ title : '品名', key : 'cate_spec' },
						{ title : '规格', key : 'size' },
						{ title : '材质', key : 'material' },
						{ title : '品牌', key : 'brand' },
						{ title : '~网价', key : 'webPrice' },
						{ title : '包到价', isGroup : true, child : [
							{ title : '~现货价', key : 'price' },
							{ title : '~运费', key : 'freight' },
							{ title : '~总价', key : 'resultPrice' },
						]},
						{ title : '~差价', key : 'diffPrice' },
						{ title : '库存', key : 'inventory' }
					]"></pro-table>
				</div>
			</div>
		</headerbar>
	</div>
</template>

<style>
	*{
		font-family:"微软雅黑";
		font-size: 14px;
	}
	h1,h4{
		font-weight:400;
	}
	h4{
		color:#000;
	}
	body{
		background-color:#f8f8f8;
	}
	.el-icon-minus{
		color:burlywood;
	}
	.inline_one{
		background-color: #fff;
		height: 50px;
		line-height: 50px;
		clear: both;
	}
	.project-selecting{
		float: left;
		margin-left: 15px;
		padding-left: 15px;
	}
	.report-search{
		float: right;
		padding-right: 15px;
	}
	#check{
		margin-top: -25px;
		background-color: #fff;
		padding: 15px;
	}
	.filter_class{
		text-align: left;
		background-color: #fff;

	}
</style>
