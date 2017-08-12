<script>
	import headbar from "../components/agent-header.vue";
	import titleBox from "../components/title-box.vue";
	import ajaxCustom from '../components/ajax-custom.js';
	import addsInput from '../components/adds-input.vue';
	import { Option, Select, Table, Button, TableColumn, DatePicker, Loading } from "element-ui";
	export default{
		components : {
			headbar,
			titleBox,
			addsInput,
			elOption : Option,
			elSelect : Select,
			elButton : Button,
			elTable : Table,
			elTableColumn : TableColumn,
			elDatePicker : DatePicker
		},
		data(){
			return {
				quotation : ['一次', '二次', '三次', '四次', '五次'],
				selectQuotationOption : [],
				selectQuotation : null,
				city : null,
				marketPrice : [],
				marketPriceAll : [],
				freight : [],
				date : Date.now(),
				pickerOptions: {
					disabledDate(time) {
						return time.getTime() > Date.now() ;
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
			}
		},
		created(){
			this.getSoptPrice();
		},
		methods : {
			/*table过滤器信息获取*/
			getFiltersData(data){
				let filters = this.allFilters;
				for (var i = 0; i < data.length; i++) {
						this.getFilter(filters.size, data[i].size);
						this.getFilter(filters.material, data[i].material);
						this.getFilter(filters.brand, data[i].brand);
				}
			},
			getFilter(filter, data){
				for (var i = 0; i < filter.length; i++) {
					if(filter[i].text == data){
						return ;
					}
				}
				filter.push({'text' : data, 'value' : data});
			},

			productFilter(value, row){
				return row.cate_spec === value;
			},
			sizeFilter(value, row){
				return row.size === value;
			},
			materialFilter(value, row){
				return row.material === value;
			},
			brandFilter(value, row){
				return row.brand ===value;
			},
			getFreight( city ){
				//通过改变selectQuotation的值控制table的刷新
				this.selectQuotation=null;
				//
				let loadingInstance = Loading.service({ fullscreen: true });
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
				this.marketPrice = this.marketPriceAll[value];
				if(this.marketPrice){
					this.getFiltersData(this.marketPrice);
				}
			},
			//获取现货价格
			getSoptPrice(date){
				this.selectQuotation = null;
				let loadingInstance = Loading.service({ fullscreen: true });
				ajaxCustom.ajaxGet(this, "dingoapi/getSoptPrice", { params : { 'date' : date } }, (responese)=>{
					if (!responese.data.length) {
						//当日无数据，清空表数据
						this.marketPrice = [];
					}else{
						//获取数据
						let index = responese.data.length-1;
						this.marketPriceAll = responese.data;
						if (this.marketPriceAll.length) {
							for (let i = 0; i < this.marketPriceAll.length; i++) {
								this.marketPriceAll[i] = this.getPriceTotal(this.SoptPriceAddFreight(this.marketPriceAll[i], this.freight));
							}
						}

						//报价次数选择框操作
						this.selectQuotationOption = [];
						for (let i = 0; i <= index; i++) {
							this.selectQuotationOption.push(this.quotation[i]);
						}
						this.selectQuotation = index;
					}
					console.log(responese);
					loadingInstance.close();
				}, (responese)=>{
					console.log(responese);
					loadingInstance.close();
				});
			},
			
			changeDate(date){
				console.log(date);
				this.getSoptPrice(date);
			},
			changeAdds(adds){
				this.city = adds.city;
				this.getFreight(adds);
			},
			SoptPriceAddFreight(info, freight){
				for (var i = 0; i < info.length; i++) {
					if (info[i].transport=='广州仓发货') {
						info[i].freight=parseInt(freight.warehouse);
					}else{
						info[i].freight=parseInt(freight.mill);
					}
				}
				return info;
			},
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
					return city+'到货价';
				}else{
					return '现货价';
				}
			},
		}
	}
</script>

<template>
	<div >
		<headbar :active_number="1"></headbar>
		<div class='main-warpper'>
			<title-box :text="['现货价', '提供每日最新钢材现货价']" >
				<div>
					<span>查看区域指数 ：广东省 </span>
					<adds-input  province='广东' @change='changeAdds'></adds-input>
				</div>
			</title-box>
			<div>
				<el-date-picker v-model="date" type="date" placeholder="选择日期" :picker-options="pickerOptions" @change='changeDate' ></el-date-picker>
				<el-select v-model='selectQuotation' @change='setQuotation'>
					<el-option v-for='(item,index) in selectQuotationOption' :label='item' :value='index'></el-option>
				</el-select>
			</div>
			<div  style="margin-top:20px;">
				<el-table :data="marketPrice" style="width: 100%" >
					<el-table-column prop="cate_spec" label="品名" 
					:filters="allFilters.cate_spec" :filter-method="productFilter">
					</el-table-column>
					<el-table-column prop="size" label="规格" 
					:filters="allFilters.size" :filter-method="sizeFilter">
					</el-table-column>
					<el-table-column prop="material" label="材质" 
					:filters="allFilters.material" :filter-method="materialFilter"> 
					</el-table-column>
					<el-table-column prop="brand" label="品牌"
					:filters="allFilters.brand" :filter-method="brandFilter"> 
					</el-table-column>
					<el-table-column prop="total" :label="priceLabel(city)"> </el-table-column>
					<el-table-column prop="inventory" label="市场库存"> </el-table-column>
				</el-table>
			</div>
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
	.el-table-filter__content{
		min-width: 100px;
    	height: 150px;
   		overflow: auto;
	}
</style>
