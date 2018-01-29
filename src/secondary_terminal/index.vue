<script>
	import headerbar from '../components/same-headerbar.vue';
	import ajaxCustom from '../components/ajax-custom.js';
	import addsInput from '../components/adds-input.vue';
	import proeTable from '../components/table.vue';
	import filterBar from '../components/filter-bar.vue';
	import sortMethods from '../components/steel-sort.js';
	import { Option, Select, Table, Button, TableColumn, DatePicker, Loading } from "element-ui";
	export default{
		components : {
			headerbar,
			addsInput,
			proeTable,
			elOption : Option,
			elSelect : Select,
			elButton : Button,
			elTable : Table,
			elTableColumn : TableColumn,
			elDatePicker : DatePicker,
			filterBar : filterBar,
		},
		data(){
			return {
				priceDisplayChange : true,
				recordDate : null,
				quotation : ['首次', '二次', '三次', '四次', '五次'],
				// 选择次数数组
				selectQuotationOption : [],
				// 当前次数
				selectQuotation : null,
				// 城市
				city : null,
				priceDisplay : this.priceLabel(this.city),
				// 表格数据
				marketPrice : [],
				// 当天全部市场数据
				marketPriceAll : [],
				// 运费数组
				freight : [],
				date : Date.now(),
				pickerOptions: {
					disabledDate(time) {
                        let tmp = time.getDay();
                        if(tmp == 0 || tmp == 6 ){
                            return true;
                        }
                        return time.getTime() > Date.now();
					}
				},
				loading : false,
				allFilters : {
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
					size : [],
					material : [],
					brand : []
				},
				filterDatas : [],
				tempTableDatas : [],
			}
		},
		created(){
			this.getSoptPrice();
		},
		methods : {
			// 获取运费
			getFreight( city ){
				//通过改变selectQuotation的值控制table的刷新
				this.selectQuotation=null;

				let loadingInstance = Loading.service({ fullscreen : true, text : "正在加载 "+ city.city +" 的数据..." });
				//获取运费区域指数
				ajaxCustom.ajaxGet(this, "dingoapi/getFreightByCity",
				{ params : { 'city' : city  } }, (responese)=>{
					this.freight = responese.data.data;
					//计算并保存区域到货价
					if (this.marketPriceAll.length) {
						for (var i = 0 ; i < this.marketPriceAll.length; i++) {
							this.marketPriceAll[i] = this.getPriceTotal(this.SoptPriceAddFreight(this.marketPriceAll[i], this.freight));
						}
						this.selectQuotation = this.marketPriceAll.length-1;
					}
					console.log(responese);
					loadingInstance.close();

				}, (responese)=>{
					alert(responese.data.massage);
					loadingInstance.close();
				});
			},
			//报价次序选择（同时渲染table）
			setQuotation(value){
				if(value >= 0 && value != null){
					this.marketPrice = this.marketPriceAll[value];
					this.marketPrice = sortMethods.todo(this.marketPrice, [
						{ text : "品名", key : "cate_spec" },
						{ text : "规格", key : "size" },
						{ text : "材质", key : "material" }
					], 'desc', 'total');
					this.tempTableDatas = JSON.parse(JSON.stringify(this.marketPrice));
				}
			},
			//获取现货价格
			getSoptPrice(date){
				this.selectQuotation = null;
				let loadingInstance = Loading.service({ fullscreen : true});
				ajaxCustom.ajaxGet(this, "dingoapi/getSoptPrice", { params : { 'date' : date } }, (responese)=>{
					this.recordDate = responese.body.date;
					if (!responese.body.soptPrice.length) {
						//当日无数据，清空表数据
						this.marketPrice = [];
						alert('当天没有数据,请查看其他的日期');
					}else{
						this.date = responese.body.date;
						//获取数据
						let index = responese.body.soptPrice.length-1;
						// console.log(index);
						this.marketPriceAll = responese.body.soptPrice;
						if (this.marketPriceAll.length) {
							for (let i = 0; i < this.marketPriceAll.length; i++) {
								this.marketPriceAll[i] = this.getPriceTotal(this.SoptPriceAddFreight(this.marketPriceAll[i], this.freight));
							}
						}
						let times = responese.body.times;
						//报价次数选择框操作
						this.selectQuotationOption = [];
						for (let i = 0; i <= index; i++) {
							if( i==index ){
								this.selectQuotationOption.push('最新  '+times[i]);
								break;
							}
							this.selectQuotationOption.push(this.quotation[i]+'  '+times[i]);
						}
						this.selectQuotation = index;
					}
					// window.document.getElementById('total').click();
					console.log(responese);
					loadingInstance.close();
				}, (responese)=>{
					alert(responese.body.message);
					loadingInstance.close();
				});
			},
			// 改变日期获取现货价和网价
			changeDate(date){
				if(date != this.recordDate){
					this.getSoptPrice(date);
				}
			},
			// 改变地址获取运费
			changeAdds(adds){
				this.city = adds.city;
				this.getFreight(adds);
				this.priceDisplay = this.priceLabel(this.city);
				this.priceDisplayChange = !this.priceDisplayChange;
			},
			// 为数据添加上运费
			SoptPriceAddFreight(info, freight){
				for (var i = 0; i < info.length; i++) {
					if (info[i].transport=='广州仓发货') {
						if (freight.warehouse){
							info[i].freight=parseInt(freight.warehouse);
							continue ;
						}
					}else{
						for(let brand in freight.mill){
							if(info[i].brand == brand){
								info[i].freight = parseInt(freight.mill[brand]);
								break;
							}
						}
					}
					if(!info[i].freight){
						info[i].freight = 0;
					}
				}
				return info;
			},
			// 总价
			getPriceTotal(info){
				for (var i = 0; i < info.length; i++) {
					if(info[i].freight){
						info[i].total=info[i].freight+info[i].price;
					}else {
						info[i].total=info[i].price;
					}
				}
				return info;
			},
			priceLabel(city){
				if(city){
					return '~' + city + '到货价';
				}else{
					return '~现货价';
				}
			},
			// 筛选table
			getListToChange(filterDatas){
				this.marketPrice = filterDatas;
			},
			// 按品牌来归类排序
			sortByBrands(){
				let result = sortMethods.classify(this.marketPrice, "cate_spec");
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
							], "desc");
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
				this.marketPrice = realDatas;
			}
		},
		watch : {
			marketPrice(){
				this.filterDatas = JSON.parse(JSON.stringify(this.tempTableDatas));
			},
		},
	}
</script>

<template>
	<div>
		<headerbar active_number="secondaryTerminal" :identity="2" :text="['现货价', '提供每日最新钢材现货价']">
			<div class="main_box">
				<filter-bar :data="filterDatas" :index="[
						{ title : '品名', key : 'cate_spec' },
						{ title : '规格' , key : 'size'},
						{ title : '材质', key : 'material'},
						{ title : '品牌', key : 'brand' },
						{ title : '库存', key : 'inventory' }
					]" @list="getListToChange" @sortByBrands="sortByBrands" v-if="filterDatas.length" style="text-align: left; background-color: #fff;margin-top: 20px;">
				</filter-bar>
				<div class="middle_box" >
					<div class="inline_one">
						<div class="project-selecting">
							<span>查看区域指数 ：广东省 </span>
							<adds-input  province='广东' @change='changeAdds' ></adds-input>
						</div>
						<div class="report-search">
							<el-date-picker v-model="date" type="date" placeholder="选择日期" :picker-options="pickerOptions" @change='changeDate' size="small" style="width:150px;"></el-date-picker>
							<el-select v-model='selectQuotation' @change='setQuotation' size="small" style="width: 150px;">
								<el-option v-for='(item,index) in selectQuotationOption' :label='item' :value='index' style="text-align: left;padding-left: 10px;"></el-option>
							</el-select>
						</div>
					</div>
					<div v-if="!priceDisplayChange">
						<proe-table v-model="marketPrice" :index="[
							{ title : '品名', key : 'cate_spec' },
							{ title : '规格', key : 'size' },
							{ title : '材质', key : 'material' },
							{ title : '品牌', key : 'brand' },
							{ title : priceDisplay, key : 'total' },
							{ title : '市场库存', key : 'inventory' },
						]"></proe-table>
					</div>
					<div v-if="priceDisplayChange">
						<proe-table v-model="marketPrice" :index="[
							{ title : '品名', key : 'cate_spec' },
							{ title : '规格', key : 'size' },
							{ title : '材质', key : 'material' },
							{ title : '品牌', key : 'brand' },
							{ title : priceDisplay, key : 'total' },
							{ title : '市场库存', key : 'inventory' },
						]"></proe-table>
					</div>
				</div>
			</div>
		</headerbar>
	</div>
</template>

<style scoped>
	*{
		font-family:"微软雅黑";
		padding: 0;
		margin: 0;
		font-size: 14px;
	}
	body{
		background-color:#f8f8f8;
	}
	html body .times-select input.el-input__inner{
		height: 29px;
	}
	.middle_box{
		margin: 20px auto;
		padding:20px;
		background-color: #fff;
		text-align: center;
	}
	.project-selecting{
		float: left;
	}
	.report-search{
		float: right;
	}
	.inline_one{
		background-color: #fff;
		height: 20px;
		clear: both;
	}
	@media screen and (max-width: 992px){
		.inline_one .report-search{
			float: left;
			margin: 10px 0;
		}
	}
</style>
