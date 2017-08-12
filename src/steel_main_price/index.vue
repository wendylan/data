<script>
	import Vue from "vue";
	import headbar from "../components/user-headbar.vue";
	import titleBox from "../components/title-box.vue";
	import addr from "../components/adds-input.vue";
	import ajaxCustom from '../components/ajax-custom.js';
	import { Button, DatePicker, Select, Option, Table, TableColumn, Loading, Message} from 'element-ui';
	export default{
		components : {
			addr,
			headbar,
			titleBox,
			ajaxCustom,
			elDatePicker : DatePicker,
			elSelect : Select,
			elOption : Option,
			elButton : Button,
			elTable : Table,
			elTableColumn : TableColumn
		},
		created(){
			// 获取table数据
			let lastWebPriceDatas = window._defultDatas.webPriceDatas[window._defultDatas.webPriceDatas.length-1] ? window._defultDatas.webPriceDatas[window._defultDatas.webPriceDatas.length-1].childDatas : [];
			this.tableDatas = window._defultDatas.marketPriceDatas[window._defultDatas.marketPriceDatas.length-1].childDatas;
			this.tableDatas = this.combineDatas(this.tableDatas, lastWebPriceDatas);
			// 时间控件默认值
			this.report.date = window._defultDatas.marketPriceDatas[window._defultDatas.marketPriceDatas.length-1].created_at;
			this.report.times = this.numChangeText(window._defultDatas.marketPriceDatas.length-1);
			this.report.timesOptions = window._defultDatas.marketPriceDatas;
			// 初始化值
			this.allWebDatas = window._defultDatas.webPriceDatas;
			this.allMainDatas = window._defultDatas.marketPriceDatas;
		},
		data(){
			return {
				tableDatas : null,
				allMainDatas : null,
				allWebDatas : null,
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
				// 运费
				freightInfo : {
					mill : null,
					warehouse : null
				},
				isShowFreight : false
			}
		},
		methods : {
			// 合并相同规格的网价与现货价
			combineDatas(marketDatas, webDatas){
				for(let market of marketDatas){
					for(let web of webDatas){
						if(market.brand==web.brands && market.cate_spec==web.product && market.material==web.material && market.size==web.type){
							// 整合网价
							market.webPrice = web.web_price;
							// 整合计算差价
							market.diffPrice = parseInt(market.price) - parseInt(web.web_price);
						}
					}
				}
				return marketDatas;
			},
			// 获取指定时间内的现货价格  并改变视图
			getWebPriceByDate(date){
				let loadingInstance = Loading.service({ fullscreen : true, text : "正在加载 "+date+" 的数据..." });
				ajaxCustom.ajaxGet(this, "dingoapi/getMainDatasByDate", { params : { date : date } }, (response)=>{
					console.log(response)
					this.allWebDatas = response.body.data.webPriceDatas;
					this.allMainDatas = response.body.data.marketPriceDatas;
					// 设置时间控件值
					this.report.date = this.allMainDatas[this.allMainDatas.length-1].created_at;
					this.report.times = this.numChangeText(this.allMainDatas.length-1);
					this.report.timesOptions = this.allMainDatas;

					// 设置table数据
					let lastWebDatas = response.body.data.webPriceDatas[response.body.data.webPriceDatas.length-1].childDatas;
					let lastMainDatas = this.allMainDatas[this.allMainDatas.length-1].childDatas;
					this.tableDatas = this.combineDatas(lastMainDatas, lastWebDatas);
					this.countResultPrice();

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
					}
					count++;
				}
			},
			// 获取运费并计算包到价
			getFreightByCity(data){
				ajaxCustom.ajaxGet(this, 'dingoapi/getFreightByCity', { params : { city : data.city, area : data.area }}, (response)=>{
					console.log(response);
					this.freightInfo.mill = response.body.data.mill;
					this.freightInfo.warehouse = response.body.data.warehouse;
					this.countResultPrice();
					this.isShowFreight = true;
				}, (response)=>{
					console.log(response);
				});
			},
			// 在获得运费的前提下, 往table添加运费和包到价
			countResultPrice(){
				if(this.freightInfo.mill && this.freightInfo.warehouse){
					for(let table of this.allMainDatas){
						for(let _data of table.childDatas){
							if(_data.transport === "直送"){
								Vue.set(_data, "resultPrice", parseInt(_data.price) + parseInt(this.freightInfo.mill));
								Vue.set(_data, "freight", this.freightInfo.mill);
							}else{
								Vue.set(_data, "resultPrice", parseInt(_data.price) + parseInt(this.freightInfo.warehouse));
								Vue.set(_data, "freight", this.freightInfo.warehouse);
							}
						}
					}
				}
			},
			numChangeText(num){
				if(num == 0){ return "首次"; }
				else if(num == 1){ return "二次"; }
				else if(num == 2){ return "三次"; }
				else if(num == 3){ return "四次"; }
			}
		}
	}
</script>

<template>
	<div>
		<headbar :active_number="2"></headbar>
		<div class="main-warpper">
			<title-box :text="['现货价', '查看现货价数据']" >
				<div class="project-selecting">
					<!-- <span>选择项目 : </span>
					<el-select >
						<el-option></el-option>
					</el-select>
					<el-button type="default" >新建</el-button> -->
					<span>送达地址 : </span>
					<addr province="广东" @change="getFreightByCity"></addr>
				</div>
			</title-box>
			<div class="report-search">
				<el-date-picker v-model="report.date" type="date" placeholder="选择日期" :picker-options="report.pickerOptions" @change="getWebPriceByDate" size="small"></el-date-picker>
			    <el-select placeholder="报价次序" v-model="report.times" @change="showTableDatas" size="small">
					<el-option v-for="(item, index) in report.timesOptions" :value="item.id" :label="numChangeText(index)"></el-option>
				</el-select>
			</div>
			<el-table :data="tableDatas" v-show="!isShowFreight" >
				<el-table-column prop="cate_spec" label="品牌"></el-table-column>
				<el-table-column prop="size" label="规格"></el-table-column>
				<el-table-column prop="material" label="材质"></el-table-column>
				<el-table-column prop="brand" label="品牌"></el-table-column>
				<el-table-column prop="webPrice" label="网价" sortable></el-table-column>
				<el-table-column prop="price" label="现货价" sortable></el-table-column>
				<el-table-column prop="diffPrice" label="差价" sortable></el-table-column>
				<el-table-column prop="inventory" label="库存"></el-table-column>
			</el-table>
			<el-table :data="tableDatas" v-show="isShowFreight" >
				<el-table-column prop="cate_spec" label="品牌"></el-table-column>
				<el-table-column prop="size" label="规格"></el-table-column>
				<el-table-column prop="material" label="材质"></el-table-column>
				<el-table-column prop="brand" label="品牌"></el-table-column>
				<el-table-column prop="webPrice" label="网价" sortable></el-table-column>
				<el-table-column label="包到价" align="center">
					<el-table-column prop="price" label="现货价" sortable></el-table-column>
					<el-table-column prop="freight" label="运费" sortable></el-table-column>
					<el-table-column prop="resultPrice" label="总价" sortable></el-table-column>
				</el-table-column>
				<el-table-column prop="diffPrice" label="差价" sortable></el-table-column>
				<el-table-column prop="inventory" label="库存"></el-table-column>
			</el-table>
		</div>
	</div>
</template>

<style>
	*{
		font-family:"微软雅黑";
	}
	.main-warpper{
		width:1280px;
		margin:auto;
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
	.report-search{
		margin-bottom: 20px;
	}
	.project-selecting{
		margin-top:50px;
	}
</style>
