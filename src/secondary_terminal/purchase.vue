<script>
	import titleBox from '../components/title-box.vue';
	import ajaxCustom from '../components/ajax-custom.js';
	import demand from '../components/demand_plan.vue';
	import headbar from "../components/agent-header.vue";
	import projectCreate from '../components/ProjectCreating/project-creating-box.vue';
	import addressUi from '../components/adds-input.vue';
	import order from './components/order.vue';
	import { Select, Option, Button, Radio, Table, TableColumn, DatePicker, Input, Dialog, Loading} from 'element-ui';
	export default{
		components : {
			order,
			demand,
			headbar,
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
			this.getSoptPrice();
		},
		data(){
			return{
				addsselect : 0,
				spotPriceAll : [],
				freight : [],
				spotPrice : [],
				webPrice : [],
				pickerOptions : {
					disabledDate(time) {
						return time.getTime() > Date.now() ;
					}
				},
				date : Date.now(),
				city : null,
				quotation : ['一次', '二次', '三次', '四次', '五次'],
				selectQuotationOption : [],
				selectQuotation : null,
				spotTable : 1,
				filters : {},
				filterMethods : {
					size : function(a, b){ return b['size'] === a;},
					material : function(a, b){ return b['material'] === a;},
					brand : function(a, b){ return b['brand'] === a;},
					warehouse : function(a, b){ return b['warehouse'] === a;},
					spec : function(a, b){ return b['cate_spec'] === a;}
				},
				demand : true,
				showOrder : false,
				order : {
					transport_function : 0,
					orderDetail : []
				},
				// 已选数量的数据
				selectData : [],
			}
		},
		methods : {
			//过滤
			getFiltersData(data){
				if(!data){
					return;
				}
				this.filters={};
				for (var i = 0; i < data.length; i++) {
					this.getFilter('size', data[i].size);
					this.getFilter('material', data[i].material);
					this.getFilter('brand', data[i].brand);
					this.getFilter('warehouse', data[i].warehouse);
					this.getFilter('spec', data[i].cate_spec);
				}
				// this.$set( array or object , 'material', value);
			},
			getFilter(filter, data){
				if(!this.filters[filter]){
					this.filters[filter]=[];
				}
				for (var i = 0; i < this.filters[filter].length; i++) {
					if(this.filters[filter][i].text == data){
						return ;
					}
				}
				this.filters[filter].push({'text' : data, 'value' : data});
			},

			getAddressData(adds){					//地址
				this.getFreight(adds.city, adds.area);
			}, 
			changeDate(date){						//日期
				this.getSoptPrice(date);
			},
			setQuotation(value){					//报价次序
				this.spotPrice = this.spotPriceAll[value];
				this.getFiltersData(this.spotPrice);
			},

			//获取现货价，网价数据
			getSoptPrice(date){
				this.selectQuotation=null;
				let loadingInstance = Loading.service({ fullscreen: true });
				ajaxCustom.ajaxGet(this, "dingoapi/getSoptPrice", { params : { 'date' : date } }, (responese)=>{
					if (!responese.data.length) {
						//当日无数据，清空表数据
						this.spotPrice = [];
					}else{
						//获取数据
						var index = responese.data.length-1;
						this.spotPriceAll = responese.data;
						if (this.spotPriceAll.length) {
							for (var i = 0; i < this.spotPriceAll.length; i++) {
								this.spotPriceAll[i]=this.getPriceTotal(this.SoptPriceAddFreight(this.spotPriceAll[i], this.freight));
							}
						}
						this.spotPrice = this.spotPriceAll[index];
						//报价次数选择框操作
						this.selectQuotationOption = [];
						for (let i = 0; i <= index; i++) {
							this.selectQuotationOption.push(this.quotation[i]);
						}
					}
					console.log(responese);
					//获取网价
					ajaxCustom.ajaxGet(this, "dingoapi/getWebPriceByDate", { params : { date : date} }, (responese)=>{
						console.log(responese);
						if (this.spotPriceAll.length) {
							for (var i = 0; i < this.spotPriceAll.length; i++) {
								this.spotPriceAll[i]=this.calculation(responese.body.data, this.spotPriceAll[i]);
								this.spotPriceAll[i]=this.getTotalDiff(this.spotPriceAll[i]);
							}
						}
						this.selectQuotation=index;
						loadingInstance.close();
					}, (responese)=>{
						alert(responese.data.message);
						loadingInstance.close();
					});
				}, (responese)=>{
					console.log(responese);
					loadingInstance.close();
				});
			},
			//获取运费
			getFreight( city, area ){
				this.selectQuotation = null;
				let loadingInstance = Loading.service({ fullscreen: true });
				//获取运费区域指数
				ajaxCustom.ajaxGet(this, "dingoapi/getFreightByCity", 
				{ params : { 'city' : city, 'area' : area } }, (responese) => {
					this.freight = responese.data.data;
					if (this.spotPriceAll.length) {
						for (var i = 0; i < this.spotPriceAll.length; i++) {
							this.spotPriceAll[i] = this.getPriceTotal(this.SoptPriceAddFreight(this.spotPriceAll[i], this.freight));
							this.spotPriceAll[i] = this.getTotalDiff(this.spotPriceAll[i]);
						}
						this.selectQuotation = this.spotPriceAll.length-1;
					}
					console.log(responese);
					loadingInstance.close();
				}, (responese) => {
					alert(responese.data.message);
					loadingInstance.close();
				});
				this.addsselect = 1;
			},
			//运费计算
			SoptPriceAddFreight(spotPrice, freight){
				for (var i = 0; i < spotPrice.length; i++) {
					if (spotPrice[i].transport == '广州仓发货') {
						if (freight.warehouse) {
							spotPrice[i].freight = parseInt(freight.warehouse);
							continue ;
						}
					}else{
						if(freight.mill){
							spotPrice[i].freight = parseInt(freight.mill);
							continue ;
						}
					}
					spotPrice[i].freight = 0;
				}
				return spotPrice;
			},
			//现货包到价
			getPriceTotal(spotPrice){
				for (var i = 0; i < spotPrice.length; i++) {
					spotPrice[i].total = 0;
					if(spotPrice[i].freight){
						spotPrice[i].total = spotPrice[i].freight + spotPrice[i].price;
					}
				}
				return spotPrice;
			},
			//网价,现货价差价计算
			calculation(webPrice, spotPrice){
				for(let data of spotPrice){
					data.web_price = 0;
					data.web_spot_diff = 0;
					for(let _data of webPrice){
						if(data.cate_spec == _data.product && data.brand == _data.brands && data.size == _data.type && data.material == _data.material)
						{	
							let web_price = parseInt(_data.web_price);
							if (web_price) {
								data.web_price = web_price;
								data.web_spot_diff = data.web_price - data.price;
								break;
							}
						}
					}
				}
				return spotPrice;
			},
			//网价现货包到价差价计算
			getTotalDiff(spotPrice){
				for(let spotPrice of spotPrice){
					if (spotPrice.web_price&&spotPrice.total) {
						spotPrice.web_total_diff = spotPrice.web_price - spotPrice.total;
					}else{
						spotPrice.web_total_diff = 0;
					}
				}
				return spotPrice;
			},

			demandConfirm(data){
				// 默认显示最优价格的数据 
				if(data.length >= 1){
					console.log(1);
					this.nowPlanData = data;
					var filterPlan = [];
					let spot = this.spotPrice;
					let plan = this.nowPlanData;
					for(let i = 0; i < spot.length; i++){
						for(let j = 0; j < plan.length; j++){
							if(
								spot[i].cate_spec == plan[j].spec &&
								spot[i].material == plan[j].material &&
								spot[i].size == plan[j].size
							){
								filterPlan.push(spot[i]);
							}
						}
					}
					filterPlan.sort(function(a, b){
						return (parseInt(a.price) - parseInt(b.price));
					});

					
					let bestPrice = [];
					for(let k = 0; k < filterPlan.length; k++){
						var time = 1;
						for(let g = 0; g < bestPrice.length; g++ ){
							if(
								filterPlan[k].cate_spec == bestPrice[g].cate_spec &&
								filterPlan[k].material == bestPrice[g].material &&
								filterPlan[k].size == bestPrice[g].size
							){
								time = 0;
								break;
							}
						}
						if(time == 1){
							bestPrice.push(filterPlan[k]);
						}
					}

					for(let i = 0;i < plan.length;i++){
						for(let j = 0;j < bestPrice.length;j++){
							if(
								plan[i].cate_spec == bestPrice[j].spec &&
								plan[i].material == bestPrice[j].material &&
								plan[i].size == bestPrice[j].size 
							){
								bestPrice[j].num = plan[i].value;
							}
						}
					}
					this.spotPrice = bestPrice;
					
				}
				this.demand = false;
			},
			demandCancel(){
				this.demand = false;
			},

			createOrder(){
				this.order.orderDetail = [];
				for (var i = 0; i < this.spotPrice.length; i++) {
					if(this.spotPrice[i].num){
						this.order.orderDetail.push(this.spotPrice[i]);
					}
				}
				this.showOrder = !this.showOrder;
			},
			exitOrder(data){
				this.showOrder = !this.showOrder;
			},
			placeOrder(data){
				ajaxCustom.ajaxPost(this,'/dingoapi/saveOrder',data,(responese)=>{
					console.log(responese);
				},(responese)=>{
					console.log(responese);
				});
				this.showOrder = !this.showOrder;
				window.open('/userOrder');
			},
			showTableAll(){
				this.spotPrice = this.spotPriceAll[this.selectQuotation];
			},
			showSelect(){
				this.selectData = [];
				for(let i = 0; i < this.spotPrice.length; i++){
					if(this.spotPrice[i].num){
						this.selectData.push(this.spotPrice[i]);
					}
				}
				this.spotPrice = this.selectData;
			},
		},
	}
</script>
<template>
	<div>
		<headbar></headbar>
		<demand brand='广钢' @confirm='demandConfirm' @cancel='demandCancel' v-if='demand' ></demand>
		<div class="main-warpper" v-if='!demand'>
			<title-box :text="['买买买','钢材现货购买']"></title-box>
			<div>
				<span><b>送达地址:</b></span>
				<address-ui province="广东" grade="1" @getAddressData='getAddressData' ></address-ui>
				<span style="color:red"></span>
			</div>
			<div style="margin-top:20px;font-size:16px;">
				<div v-if='addsselect'>
					<span><b>显示项:</b></span>
					<el-radio v-model="spotTable" :label='1'>现货价</el-radio>
					<el-radio v-model="spotTable" :label='0' >包到价</el-radio>
				</div>
				<div style="float:right;margin-bottom:20px;">
					<el-date-picker v-model="date" type="date" placeholder="选择日期" :picker-options="pickerOptions" @change='changeDate' >
					</el-date-picker>
				    <el-select v-model='selectQuotation' @change='setQuotation'>
						<el-option v-for='(item,index) in selectQuotationOption' :label='item' :value='index'></el-option>
					</el-select>
				</div>
			</div>
			<div class="to-center">

				<el-table :data="spotPrice" border v-show='spotTable' >
					<el-table-column prop="cate_spec" label="品名"  :filters='filters.spec' :filter-method='filterMethods.spec'></el-table-column>
					<el-table-column prop="brand" label="品牌" :filters='filters.brand' :filter-method='filterMethods.brand'></el-table-column>
					<el-table-column prop="size" label="规格" :filters='filters.size' :filter-method='filterMethods.size'></el-table-column>
					<el-table-column prop="material" label="材质" :filters='filters.material' :filter-method='filterMethods.material'>
					</el-table-column>
					<el-table-column prop="web_price" label="网价" sortable >
						<template scope="scope">
							<p>{{scope.row.web_price?scope.row.web_price:''}}</p>
						</template>
					</el-table-column>
					<el-table-column prop="price" label="现货价" sortable></el-table-column>
					<el-table-column  label="差价" sortable>
						<template scope="scope">
							<p>{{scope.row.web_spot_diff?scope.row.web_spot_diff:''}}</p>
						</template>
					</el-table-column>
					<el-table-column prop="warehouse" label="仓库" :filters='filters.warehouse' :filter-method='filterMethods.warehouse'>
					</el-table-column>
					<el-table-column prop="inventory" label="库存" ></el-table-column>
					<el-table-column label="输入数量">
						<template scope="scope" >
							<el-input type="number" min='0' size="small" v-model="scope.row.num" style="width:80px;"></el-input>
						</template>
					</el-table-column>
				</el-table>

				<el-table :data='spotPrice' v-show='!spotTable' >
					<el-table-column prop="cate_spec" label="品名"  :filters='filters.spec' :filter-method='filterMethods.spec'></el-table-column>
					<el-table-column prop="brand" label="品牌" :filters='filters.brand' :filter-method='filterMethods.brand'></el-table-column>
					<el-table-column prop="size" label="规格" :filters='filters.size' :filter-method='filterMethods.size'></el-table-column>
					<el-table-column prop="material" label="材质" :filters='filters.material' :filter-method='filterMethods.material'></el-table-column>
					<el-table-column prop="web_price" label="网价" sortable>
						<template scope="scope">
							<p>{{scope.row.web_price?scope.row.web_price:''}}</p>
						</template>
					</el-table-column>
					<el-table-column  label="现货包到价" >
						<el-table-column prop="price" label="单价" sortable></el-table-column>
						<el-table-column prop="freight" label="运费" sortable>
							<template scope="scope">
								<p>{{scope.row.freight?scope.row.freight:''}}</p>
							</template>
						</el-table-column>
						<el-table-column prop="total" label="总价" sortable>
							<template scope="scope">
								<p>{{scope.row.total?scope.row.total:''}}</p>
							</template>
						</el-table-column>
					</el-table-column>
					<el-table-column prop="web_total_diff" label="差价" sortable>
						<template scope="scope">
							<p>{{scope.row.web_total_diff?scope.row.web_total_diff:''}}</p>
						</template>
					</el-table-column>
					<el-table-column prop="warehouse" label="仓库" :filters='filters.warehouse' :filter-method='filterMethods.warehouse'>
					</el-table-column>
					<el-table-column prop="inventory" label="库存" >
					</el-table-column>
					<el-table-column label="输入数量">
						<template scope="scope">
							<el-input type="number" min='0' size="small" v-model="scope.row.num" style="width:80px;"></el-input>
						</template>
					</el-table-column>
				</el-table>
				<el-button size="large" type="warning" style="margin-top:20px;" @click='showTableAll'>查看所有</el-button>
				<el-button size="large" type="primary" style="margin-top:20px;" @click='createOrder'>生成订单</el-button>
				<el-button size="large" type="success" style="margin-top:20px;" @click='showSelect'>查看所选</el-button>
				<el-dialog v-model="showOrder"  title="计划单"  size="large">
					<order @exit='exitOrder' @order='placeOrder' :data='order'></order>
				</el-dialog>
			</div>
		</div>
	</div>
</template>
<style scoped>
	.main-warpper{
		width: 1280px;
		margin: 0 auto;
	}
	.margin-left{
		margin-left: 20px;
	}
	.to-center{
		position: relative;
		width: 99%;
		clear: both;
		margin: 0 auto;
		text-align: center;
	}
	.el-table{
		height:320px;overflow-y:auto;
	}
	
</style>