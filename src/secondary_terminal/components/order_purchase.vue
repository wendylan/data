<script>
	import ajaxCustom from '../../components/ajax-custom.js';
	import projectChanger from '../../components/project_to_text.js';
	import { Table, TableColumn, Button, Select, Option, Dialog, Input, DatePicker, Tag, RadioGroup, Radio } from 'element-ui';
	export default{
		props : {
			// 项目信息
			data : {
				type : Object,
				default : {}
			},
			// 返回计划单是否显示叉叉的传值凭据
			open : {
				type : Boolean
			},
			// 原计划单的数据
			old : {
				type : Array,
				default : []
			},
			// 订单id
			id : {
				type : Number
			},
			index : {
				type : Number
			},
			priceType : {
				type : Number
			}
		},
		components : {
			elTag : Tag,
			elTable : Table,
			elDialog : Dialog,
			elInput : Input,
			elTableColumn : TableColumn,
			elButton : Button,
			elSelect : Select,
			elOption : Option,
			elDatePicker : DatePicker,
			elRadioGroup : RadioGroup,
			elRadio : Radio,
		},
		created(){
			this.changeNumber+=1;
			this.getOtherName();

		},
		computed : {
			// 项目
			project(){
				if(this.data){
					let obj = {
						selected : true,
						info : {
							id : this.data.project_info_id,
							name : this.data.name,
							province : this.data.province,
							city : this.data.city,
							area : this.data.area,
							addr : this.data.addr,
							brands : this.data.brands,
							settlementText : projectChanger.todo(this.data, true)
						}
					};
					return obj;
				}else{
					let obj = {
						selected : true,
						info : { name : "", brands : "" }
					};
					return obj;
				}
			},
			// 是否打开配置单
			openBolean(){
				let obj = this.open;
				return obj;
			},
		},
		data(){
			return {
				tableDatas : [],
				// 合同价计算规则
				contractPriceRule : null,
				// table过滤
				filter : {
					brand : null,
					product : null,
					material : null,
					size : null,
					price_source : null,
					warehouse : null
				},
				// 公司
				companys : {
					list : [],
					selected : null
				},
				// 缓存table数据
				cacheData : [],
				date : Date.now(),
				nameList : [],
				priceWay : 1,
				whereArea : 2,
				dataDate : '',
				changeNumber : 0
			}
		},
		methods : {
			// 品牌范围内的数据
			inBrandsLimits(){
				let brandsLimitData = [];
				let tmp = [];
				if(this.data){
					for(let item of this.cacheData){
						for(let brand of this.data.brands){
							if(item.brand == brand || item.elseName == brand){
								brandsLimitData.push(item);
							}
						}
					}
					for(let item of this.old){
						if(item.isPlay){
							for(let data of brandsLimitData){
								if(data.size == item.size && data.cate_spec == item.cate_spec && data.material == item.material){
									tmp.push(data);
								}
							}
							return tmp;
						}
					}
					return brandsLimitData;
				}
				return brandsLimitData;
			},
			// 点击原计划单的功能
			selectOneOld(data){
				for(let item of this.old){
					if(item == data){
						if(item.isPlay == 1){
							item.isPlay = 0;
						}else{
							item.isPlay = 1;
						}
					}else{
						item.isPlay = 0;
					}
				}

				this.tableDatas = [];
				for(let item of this.cacheData){
					if(item.cate_spec==data.cate_spec&&item.size==data.size){
						if(!item.amount){
							this.$set(item, 'amount', null);
						}
						this.tableDatas.push(item);
					}
				}
				if(this.whereArea == 1){
					this.showTableAll();
					this.getTableFilter();
				}else{
					this.showInBrandsLimit();
					this.getTableFilter();
				}
			},
			// 点击每行的背景的颜色改变
			changeHight(data){
				if( data.isPlay == 1 ){
					return 'selectTr';
				}else{
					return 'noSelectTr';
				}
			},
			// 获取指定时间内的现货价格
			getSoptPrice(){
				ajaxCustom.ajaxGet(this, "dingoapi/getAllSoptPrice", { params : { 'adds' : { city : this.data.city, area : this.data.area } } }, (response)=>{
					console.log(response);
					this.dataDate = response.body.date;
					response = response.body;
					let data = [];
					this.cacheData = [];
					this.tableDatas = [];
					data = response.soptPrice;
					let oldData = [];
					for(let item of this.old){
						item.isPlay = 0;
						let door = 1;
						for(let oldItem of oldData){
							if(item.cate_spec == oldItem.cate_spec && item.size == oldItem.size && item.material == oldItem.material){
								door = 0;
							}
						}
						if(door){
							oldData.push({ cate_spec : item.cate_spec, size : item.size, material : item.material });
						}
					}
					for(let item of oldData){
						for(let respItem of data){
							if(item.cate_spec == respItem.cate_spec && item.size == respItem.size && item.material == respItem.material)
							{
								this.cacheData.push(respItem);
							}
						}
					}
					this.tableDatas = this.cacheData;
					// this.tableDatas = this.showInitBrandData(this.old, this.tableDatas);

					this.initTableData();
					// table数据过滤
					this.getTableFilter();
					// 计算合同价
					this.getContractPrice(this.project.info.id);
					this.showInBrandsLimit();
				}, (response)=>{
					alert(response.body.message);
				});
			},
			// 显示原计划单品牌范围内的数据
			showInitBrandData(old, arr){
				let filter = [];
				for(let j = 0; j < arr.length; j++){
					for(let i = 0; i < old.length; i++ ){
						if(old[i].brand == arr[j].brand ||old[i].brand == arr[j].elseName){
							filter.push(arr[j]);
							break;
						}
					}
				}
				return filter;
			},
			// 传入订单的默认值
			initTableData(){
				let tab = this.inBrandsLimits();
				let old = this.old;
				let record = [];
				for(let j = 0; j < old.length; j++){
					record[j] = { price : 10000, index : null};
					for(let i = 0; i < tab.length; i++){
						let inType = (tab[i].cate_spec == old[j].cate_spec && tab[i].size == old[j].size && tab[i].material == old[j].material);
						if((old[j].brand?(tab[i].brand == old[j].brand ) : (null == old[j].brand) ) &&  inType){
							if(tab[i].price < record[j].price){
								record[j] = { price : tab[i].price, index : i }
							}
						}
					}
				}
				for (var i = 0; i < record.length; i++) {
					if(record[i].index != null){
						tab[record[i].index].amount = old[i].amount;
					}
				}
			},
			// 请求合同价计算规则 并计算合同价
			getContractPrice(id){
				ajaxCustom.ajaxGet(this, "dingoapi/getSettlementInfo", {params : { id : id }}, (response)=>{
					this.contractPriceRule = response.body.data;
					// 初始化合同价
					for(let data of this.cacheData){
						data.countPrice = null;
					}
					// 合同价 : 计算并排序
					this.countContractPrice(this.cacheData);
					// this.sortTableDatasByCountPrice();
				}, (response)=>{
					alert(response.body.message);
				});
			},
			// 计算合同价
			countContractPrice(dataArray){
				var keyName = 'web_price';
				if(this.priceType == 2){
					keyName = 'price';
				}
				for(let data of dataArray){
					// 别名处理
					for(let item of this.nameList){
						if(data.brand == item.abbreviation){
							data.elseName = item.full_name;
							break;
						}else if(data.brand == item.full_name){
							data.elseName = item.abbreviation;
							break;
						}
					}

					for(let rule of this.contractPriceRule){
						// 品牌相同 规格相同
						if( (data.brand == rule.brand || data.elseName == rule.brand ) && data.cate_spec == rule.specification){
							if(data[keyName]){
								data.countPrice = parseInt(this.calPrice(data[keyName],keyName)) + (parseInt(rule.count_number) | 0) + (parseInt(rule.crane) | 0) + (parseInt(rule.freight) | 0) + (parseInt(rule.funds_rate) | 0) + (parseInt(rule.ponderation) | 0);
							}else{
								// 网价为空
								data.countPrice = '-';
								data[keyName] = '-';
							}
							break;
						}
					}
				}
				this.countWebSpot(dataArray);
				this.countSpotCountract(dataArray);
				this.tableDatas.push();
			},
			//若是现货价结算，要先＋30再算合同价
			calPrice(price,key){
				if(key=='price'){
					price += 30 ;
				}
				return price;
			},
			// 计算合同价和市场价的差价
			countSpotCountract(data){
				for(let i = 0; i<data.length; i++ ){
					if(data[i].price && data[i].countPrice && data[i].countPrice != '-'){
						data[i].count_price_diff = parseInt(data[i].countPrice - data[i].price );
					}
				}
			},
			// 计算网价和市场价的差价
			countWebSpot(data){
				for(let i=0; i< data.length; i++){
					if(data[i].web_price && data[i].price && data[i].web_price != '-'){
						data[i].price_diff = parseInt(data[i].web_price - data[i].price);
					}
				}
			},
			// tableDatas排序 将含有合同价的行提升
			sortTableDatasByCountPrice(){
				let uplines = [];
				let downlines = [];
				for(let data of this.tableDatas){
					if(data.countPrice && data.countPrice!=='-'){
						uplines.unshift(data);
					}else{
						data.web_price=='-' ? downlines.push(data) : false;
					}
				}
				if(uplines.concat(downlines).length){
					this.tableDatas = uplines.concat(downlines);
				}
			},
			// 获取别名表
			getOtherName(){
				ajaxCustom.ajaxGet(this, 'dingoapi/getBrandsElseName', (response)=>{
					console.log(response);
					this.nameList = response.body.data.nameList;
				}, (response)=>{
					alert(response.body.message);
				});
			},
			// 打开订单模态框
			makeOrder(){
				let hasAmount = false;
				for(let data of this.tableDatas){
					if(data.amount){
						hasAmount = true;
						break;
					}
				}
				if(hasAmount){
					this.$emit('confirmOrder', this.dataReady(this.cacheData));
				}else{
					alert("先输入数量");
				}
			},
			dataReady(data){
				var selectData = [];
				for (var i = 0; i < data.length; i++) {
					if(data[i].amount){
						selectData.push(data[i]);
					}
				}
				return selectData;
			},
			// 过滤去重
			getTableFilter(){
				let collectArr = {};
				for(let datas of this.tableDatas){
					for(let item in datas){
						collectArr[item] ? collectArr[item] : collectArr[item] = [];
						let hasData = false;
						for(let arr of collectArr[item]){
							if(arr.value == datas[item]){
								hasData = true;
								break;
							}
						}
						if(!hasData){
							collectArr[item].push({ text : datas[item], value : datas[item] });
						}
					}
				}
				this.filter.brand = collectArr.brand;
				this.filter.product = collectArr.cate_spec;
				this.filter.material = collectArr.material;
				this.filter.size = collectArr.size;
				this.filter.price_source = collectArr.price_source;
				this.filter.warehouse = collectArr.warehouse;

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
			brandsFilter(value, row){
				return row.brand === value;
			},
			priceSourceFilter(value, row){
				return row.price_source === value;
			},
			warehouseFilter(value, row){
				return row.warehouse === value;
			},
			// 查看所有品牌
			showTableAll(){
				let tmp = [];
				for(let item of this.old){
					if(item.isPlay){
						for(let data of this.cacheData){
							if(data.size == item.size && data.cate_spec == item.cate_spec && data.material == item.material){
								tmp.push(data);
							}
						}
						this.tableDatas = tmp;
						return;
					}
				}
				let cache = this.cacheData;
				this.tableDatas = cache;
			},
			// 查看范围内品牌
			showInBrandsLimit(){
				this.tableDatas = this.inBrandsLimits() ;

			},
			// 查看所选
			showSelect(){
				let selectData = [];
				for(let i = 0; i < this.cacheData.length; i++){
					if(this.cacheData[i].amount){
						selectData.push(this.cacheData[i]);
					}
				}
				this.tableDatas = selectData;
			},
			// 返回计划单
			offBox(){
				let obj = !this.openBolean;
				this.$emit('getOpen', obj);
			},
			test(){
				console.log(this.tableDatas);
			}
		},
		watch : {
			// 传入的项目改变的话就重新算合同价
			project(){
				this.getContractPrice(this.project.info.id);
			},
			// 根据传进来的订单id是否改变来请求数据
			id(){
				this.changeNumber+=1;
			},
			index(){
				this.changeNumber+=1;
			},
			changeNumber(){
				this.tableDatas = [];
				this.getSoptPrice();
			},
			// 改变品牌范围，改变table数据
			whereArea(n){
				if(n == 1){
					this.showTableAll();
					this.getTableFilter();
				}
				if(n == 2){
					this.showInBrandsLimit();
					this.getTableFilter();
				}
			}
		}
	}
</script>

<template>
	<div class="box">
		<div class="main">
			<div class="project-info">
				<p>
					<span class="set-weight">项目名称：</span>{{ project.info.name }}
					<span v-if="project.info.province" style="margin-left: 20px;">
						<span class="set-weight" >项目地址：</span>{{ project.info.province + project.info.city + project.info.area + project.info.addr }}
					</span>
					<span style="margin-left: 20px;" v-else>
						<span class="set-weight">项目地址：</span>
					</span>
				</p>
				<p><span class="set-weight">结算条件：</span>{{ project.info.settlementText }}</p>
				<p class="oneLine"><span class="set-weight">品牌范围：</span> <span v-for="item of project.info.brands">{{ item }}  </span></p>
			</div>
		</div>
		<div class="main-box">
			<div>
				<p style="color:#FF4949"><b>原计划单</b>(可点击行,选择需要的规格)</p>
				<div class="tableBox">
					<table>
						<thead>
							<tr>
								<th>品名</th>
								<th>规格</th>
								<th>材质</th>
								<th>钢厂/品牌</th>
								<th>计划吨数</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="item in old " @click="selectOneOld(item)" :class="changeHight(item)">
								<td>{{ item.cate_spec }}</td>
								<td>{{ item.size }}</td>
								<td>{{ item.material }}</td>
								<td>{{ item.brand }}</td>
								<td>{{ item.amount }}</td>
							</tr>
						</tbody>
					</table>
				</div>

				<p><b style="color:#FF4949">资源选择</b></p>
				<div style="text-align: left;">
					<label>选择范围:</label>
					<el-radio-group v-model="whereArea">
						<el-radio :label="2">范围内品牌</el-radio>
						<el-radio :label="1">所有品牌</el-radio>
					</el-radio-group>
					<label style="margin-left: 60px;">选择价格:</label>
					<el-radio-group v-model="priceWay">
						<el-radio :label="1">合同价</el-radio>
						<el-radio :label="2">网价</el-radio>
					</el-radio-group>
					<b style="margin-left: 300px;float: right;">报价日期：{{dataDate}}</b>
				</div>
				<el-table :data="tableDatas" height="480" class="table_box" empty-text="今日未发布报价">
					<el-table-column prop="cate_spec" label="品名" :filters="filter.product" :filter-method="productFilter"></el-table-column>
					<el-table-column label="规格" :filters="filter.size" :filter-method="sizeFilter" width="80">
						<template scope="scope" >
							Φ{{scope.row.size}}
						</template>
					</el-table-column>
					<el-table-column prop="material" label="材质" :filters="filter.material" :filter-method="materialFilter" ></el-table-column>
					<el-table-column prop="brand" label="品牌" :filters="filter.brand" :filter-method="brandsFilter" ></el-table-column>
					<el-table-column prop="price_source" label="供应商" style="max-width: 180px;" :filters="filter.price_source" :filter-method="priceSourceFilter"></el-table-column>
					<el-table-column prop="warehouse" label="仓库" :filters="filter.warehouse" :filter-method="warehouseFilter"></el-table-column>
					<el-table-column prop="web_price" label="网价" key="1" v-if="priceWay==2" width="100" sortable></el-table-column>
					<el-table-column prop="countPrice" label="合同价"  key="2" v-if="priceWay==1" width="100" sortable></el-table-column>
					<el-table-column prop="price" label="采购价"  width="100" sortable></el-table-column>
					<el-table-column prop="price_diff" label="差价"  v-if="priceWay==2" width="90" sortable></el-table-column>
					<el-table-column prop="count_price_diff" label="差价"  v-if="priceWay==1" width="90" sortable></el-table-column>
					<el-table-column label="运费" width="90" sortable>
						 <template scope="scope">
							{{scope.row.freight?scope.row.freight:'运费待定'}}
						</template>
					</el-table-column>
					<el-table-column label="输入数量">
						<template scope="scope" >
							<el-input type="number" min='0' size="small" v-model="scope.row.amount" style="width:60px;"></el-input>
						</template>
					</el-table-column>
				</el-table>
			</div>

		</div>
		<div class="bottom-bar">
			<el-button @click="showSelect()" type="success" >查看所选</el-button>
			<el-button @click="makeOrder()" type="primary" >确认配置</el-button>
			<el-button type="success" @click="offBox()">返回</el-button>
		</div>
	</div>
</template>

<style >
	.tableBox table{
        margin-top: 20px;
        width: 100%;
        table-layout: fixed;
        border-collapse:collapse;
        border:1px solid black;
        border:1px solid #e0e6ed;
        text-align:center;
        font-size:14px;
    }
    .tableBox thead{
        background-color:#eef1f6;
    }
    .tableBox thead th{
        text-align: center;
        padding:10px 0px;
        border:1px solid #dfe6ec;
    }
    .tableBox table td{
        padding:10px;
        border:none;
        border-bottom:1px solid #e0e6ed;
        border-right:1px solid #e0e6ed;
    }
    .tableBox table tbody tr:hover{
        background-color: #eff2f7;
    }

	table{
		/*font-family:"微软雅黑";*/
		font-size: 14px;
	}
	body{
		background-color:#f8f8f8;
	}
	.box{
		position: relative;
		height: auto;
		overflow-y: auto;
	}
	.main-box{
		clear: both;
		margin-top: 60px;
	}
	.main{
		width: 78%;
		left: 11%;
		top: 0px;
		background-color: #e2f0e4;
		min-height: 125px;
		position: fixed;
		z-index: 2;
	}
	html body .times-select input.el-input__inner{
		height: 29px;
	}
	.right-btn{
		position: relative;
		float:right;
		top: 3px;
		right: 18px;
		margin-bottom: -50px;
		z-index: 100;

	}
	.self-element-table thead{
		background: #eef1f6;
	}
	.self-element-table thead th{
		padding:10px;
	}
	.self-element-table td,th{
		border:solid 1px #DEDEDE;
		text-align: center;
	}

	.cars-list .el-select{
		margin-right:50px;
	}
	.cars-list>div{
		margin:15px 0px 15px 0px;
	}
	.cars-list .set-margin{
		margin-right: 55px;
	}

	.project-info{
		text-align: left;
		padding-left: 10px;
		padding-top: 10px;
		margin: 0 auto;
    	font-size: 14px;
	}
	.project-info span.set-weight{
		font-weight:600;
	}
	.project-info i{
		font-size: 16px;
    	color: #BBB;
		cursor:pointer;
	}
	.bottom-bar{
		text-align: right;
		position: fixed;
		top: 50px;
		right:20px;
	    width: 110px;
	    height: 180px;
	    z-index: 100;
	    background: aliceblue;
	}
	.bottom-bar button{
		width:100px;
		height: auto;
		display: inline-block;
		margin: 10px;
	}

	i.el-icon-information{
		color:#8492a6;
	}
	.el-table-filter__content{
		height: 150px;
		overflow-y: auto;
	}
	.table_box{
		margin: 10px auto;
		size:2px;
	}
	.main-box .el-table td, .el-table th.is-leaf{
		font-size: 12px;
	}
	#top .el-table__body-wrapper tr{
		cursor: pointer;
	}
	.oneLine{
		width: 600px;
		overflow: hidden;
		text-overflow:ellipsis;
		white-space: nowrap;
	}
	.selectTr{
		background-color: #f0f0f6;
	}
	.noSelectTr{
		background-color: #fff;
	}
</style>
