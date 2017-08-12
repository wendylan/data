<script>
	import { Table,TableColumn, Select, Option, Input, Button, MessageBox, Loading, Checkbox  } from "element-ui";
	import sortable from "../../freight/sortable.vue";
	import addressUi from "../../components/adds-input.vue";
	import multiple from "../../components/multiple.vue";
	import ajaxCustom from '../../components/ajax-custom.js';
	export default{
		components : {
			multiple,
			MessageBox,
			elTable : Table,
			elTableColumn : TableColumn,
			elSelect : Select,
			elOption : Option,
			elInput : Input,
			elButton : Button,
			addressUi : addressUi,
			elCheckbox : Checkbox
		},
		created : function(){
			let loadingInstance = Loading.service({target:"#price-info"});
			ajaxCustom.ajaxGet(this, "dingoapi/getSteelMarketDatas", {params : { id : this.$route.params.id }}, (responese)=>{
				console.log(responese)
				let responeseData = responese.body.data;
				this.reportDate = responese.body.data.parentResult.created_at;

				// 初始化必要的数据
				for(let data of responeseData.childResult){
					data.transportPrice = "";
					data.ownPrice = parseInt(data.price);
					data.allPrice = "";
					data.display = true;
				}

				// 合并table数据中 品名/规格/材质 属性相同的数据, 并区分自提与直送价格
				responeseData.childResult = this.combineData(responeseData.childResult);

				// 将网价添加到table数据中
				this.addWebpriceToTable(responeseData.childResult, responeseData.webDatas);

				// 获取当天网价报价次数
				this.webPriceTimes = this.getWebPriceTimes(responeseData.webDatas);

				// 获得size/marterial/brand的去重数据
				this.filterDatas.size = this.delDuplication(responeseData.childResult, "size");
				this.filterDatas.material = this.delDuplication(responeseData.childResult, "material");
				this.filterDatas.brands = this.delDuplication(responeseData.childResult, "brand");

				// 获取全部品牌名称
				for(let data of this.filterDatas.brands){
					this.allBrands.push(data.value);
				}

				// table数据排序
				responeseData.childResult = this.sortTableDatas(responeseData.childResult);

				this.tableData = responeseData.childResult;
				this.searchDatas.brand = responeseData.parentResult[0].brand;
				this.reportDate = responeseData.parentResult[0].created_at;
				loadingInstance.close();
			}, (responese)=>{
				alert(responese.body.message);
				console.log(responese)
				loadingInstance.close();
			});
		},
		mounted(){
			this.watchScroll();
			console.log(window.$vueData.projectInfo)
		},
		data(){
			return {
				tableData : [],
				allBrands : [],
				reportDate : "",
				reportTimes : "",
				reportTimesOption : [],
				reportDate : "",
				tableDisplay : {
					directTransportPrice : true,
					selfTransportPrice : true,
					diffPrice : false
				},
				filterArr : {
					cate_spec : [],
					size : [],
					material : [],
					brands : [],
					inventory : [],
					productStatus : []
				},
				filterDatas : {
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
					brands : [],
					productStatus : [
						{
							text : "正常货",
							value : "正常货"
						},
						{
							text : "正常水锈货",
							value : "正常水锈货"
						},
						{
							text : "锈货",
							value : "锈货"
						}
					],
					transportType : [
						{
							text : "钢厂直送",
							value : "钢厂直送"
						},
						{
							text : "物流承运",
							value : "物流承运"
						}
					],
					inventory : [
						{
							text : "有货",
							value : "有货"
						},
						{
							text : "无货",
							value : "无货"
						},
						{
							text : "货少",
							value : "货少"
						},
						{
							text : "电议",
							value : "电议"
						}
					]
				},
				searchDatas : {
					brand : "",
					city : "",
					area : "",
					address:""
				},
				showSelectBox : null,
				isSearch : false,
				webPriceTimes : 1
			}
		},
		methods : {
			filterCate_spec(value, row){
				return value == row.cate_spec;
			},
			filterStandard(value, row){
				return value == row.size;
			},
			filterMaterial(value, row){
				return value == row.material;
			},
			filterBrands(value, row){
				return value == row.brand;
			},
			filterInventory(value, row){
				return value == row.inventory;
			},
			watchScroll(){
				var elementDistance = $("table.header-table").offset().top;
				window.onscroll = function(){
					let distance = document.documentElement.scrollTop || document.body.scrollTop;
					if(distance<elementDistance){
						$("table.header-table").removeClass("float-top");
						$(".temp-block").css({"height" : "0px"});
					}else{
						$("table.header-table").addClass("float-top");
						$(".temp-block").css({"height" : "85px"});
					}
				}
			},
			combineData(priceData){
				// 合并相同规格的直送与自提 数据
				for(let data of priceData){
					for(let _data of priceData){
						if(data.brand==_data.brand && data.cate_spec==_data.cate_spec && data.material==_data.material && data.size==_data.size){
							if(_data.transport == "直送"){
								data.freeTransportPrice = _data.price;
							}else{
								data.selfTransportPrice = _data.price;
							}
						}
					}
				}

				let sortChildDatas = [];
				for(let data of priceData){
					let isRepect = false;
					for(let sortData of sortChildDatas){
						if(data.brand==sortData.brand && data.cate_spec==sortData.cate_spec && data.material==sortData.material && data.size==sortData.size){
							isRepect = true;
						}
					}
					if(!isRepect){
						data.selfTransportPrice = data.selfTransportPrice ? data.selfTransportPrice : 0;
						data.freeTransportPrice = data.freeTransportPrice ? data.freeTransportPrice : 0;
						sortChildDatas.push(data);
					}
				}

				return sortChildDatas;
			},
			delDuplication(objectData, key){
				let resultArr = [];
				for(let data of objectData){
					let isRepeat = false;
					for(let filter of resultArr){
						if(filter.value == data[key]){
							isRepeat = true;
						}
					}
					if(!isRepeat){
						resultArr.push({
							text : data[key],
							value : data[key]
						});
					}
				}

				return resultArr;
			},
			getWebPriceTimes(webDatas){
				// 计算当天的报价次数
				let webTimes = [];
				for(let data of webDatas){
					let isRepeat = false;
					if(webTimes.length==0){
						webTimes.push(data);
					}
					for(let _data of webTimes){
						if(_data.file_name==data.file_name){
							isRepeat = true;
							break;
						}
					}
					if(!isRepeat){
						webTimes.push(data);
					}
				}
				return webTimes.length;
			},
			addWebpriceToTable(tableDatas, webDatas){
				for(let tableData of tableDatas){
					tableData.webPrice = [];
					// 设置默认数据
					tableData.freeDifferencePrice = 0;
					tableData.selfDifferencePrice = 0;

					// 循环抽出与市场数据相同材质规格的网价数据
					for(let webDataDate of webDatas){
						if( (webDataDate.brands===tableData.brand || webDataDate.brands=="珠海粤钢"&&tableData.brand=="粤钢") && webDataDate.product===tableData.cate_spec && webDataDate.material===tableData.material && webDataDate.type.replace("Ф","") === tableData.size){
							tableData.webPrice.push(webDataDate.web_price);
						}
					}
					// 网价数据分报价次数
					for(let i=0; i<tableData.webPrice.length; i++){
						tableData["webPrice"+(i+1)] = tableData.webPrice[i];
					}

					// 计算最新差价
					if(parseInt(tableData.freeTransportPrice) != 0){
							// 直送
						let lastDifferencePrice = parseInt(tableData.freeTransportPrice) - parseInt(tableData.webPrice[tableData.webPrice.length-1]);
						tableData.freeDifferencePrice = ( isNaN(lastDifferencePrice) ? "-" : lastDifferencePrice);
					}
					if(parseInt(tableData.selfTransportPrice) != 0){
							// 自提
						let lastDifferencePrice = parseInt(tableData.selfTransportPrice) - parseInt(tableData.webPrice[tableData.webPrice.length-1]);
						tableData.selfDifferencePrice = ( isNaN(lastDifferencePrice) ? "-" : lastDifferencePrice);
					}
					delete tableData.webPrice;
				}
			},
			sortTableDatas(tableDatas){
				const allCateSpec = ["高线", "螺纹钢", "盘螺"];
				let allCateSpecArr = [];
				let resultArr = [];

				for(let cateSpec of allCateSpec){
					let tempArr = [];
					for(let data of tableDatas){
						if(data.cate_spec == cateSpec){
							tempArr.push(data);
						}
					}
					allCateSpecArr.push(JSON.parse(JSON.stringify(tempArr)));
				}

				for(let cateSpecData of allCateSpecArr){
					cateSpecData.sort(function(a, b){
						return a.size - b.size;
					});
				}

				for(let data of allCateSpecArr){
					for(let _data of data){
						resultArr.push(_data);
					}
				}

				return resultArr;
			},
			searchTransportPrice(){
				if(this.searchDatas.city.length!=0 && this.searchDatas.area.length!=0){
					this.isSearch = true;
					this.searchDatas.brands = this.allBrands;
					ajaxCustom.ajaxGet(this,"dingoapi/searchTransportForCity", { params : this.searchDatas },(responese)=>{
						console.log(responese)
						for(let data of this.tableData){
							for(let transportData of responese.body.data){
								if(data.brand == transportData.brand){
									if(transportData.data.length !== 0){
										if(isNaN(parseInt(data.price))){
											data.transportPrice = 0;
											data.allPrice = 0;
										}else{
											data.transportPrice = transportData.data[0].transport_price;
											data.allPrice = parseInt(transportData.data[0].transport_price) + parseInt(data.price);
										}
									}else{
										data.transportPrice = "暂无";
										data.allPrice = data.price;
									}
								}
							}

						}
					},(responese)=>{
						console.log(responese)
					});
				}else{
					this.openMsgBox();
				}

			},
			searchTarget(data){
				this.searchDatas.city = data.city;
				this.searchDatas.area = data.area;
			},
			openMsgBox(){
				this.$alert('请选择城市与区域', '', {
					confirmButtonText: '确定'
				});
			},
			getMarketDatas(date){
				this.reportTimes = null;
				ajaxCustom.ajaxGet(this,"dingoapi/getMarketDatasAtDate", { params : { date : date } },(responese)=>{
					console.log(responese)
					if(responese.body.data.length){
						this.reportTimesOption = responese.body.data;
						for(let item of this.reportTimesOption){
							if(item.id == this.$route.params.id){
								this.reportTimes = item.id;
							}
						}
					}else{
						alert("该日期没有数据");
					}
				},(responese)=>{
					console.log(responese)
				});
			},
			numChangeText(num){
				if(num == 0){ return "首次"; }
				else if(num == 1){ return "二次" }
				else if(num == 2){ return "三次" }
				else if(num == 3){ return "四次" }
			},
			loadDataAtDate(){
				this.$router.push('/'+this.reportTimes)
				this.$router.go();
			},
			sortTable(event, key){
				this.filterArr[key] = event;

				// 清空选项时 重置表格
				if(!this.filterArr.cate_spec.length && !this.filterArr.material.length && !this.filterArr.size.length && !this.filterArr.brands.length && !this.filterArr.productStatus.length && !this.filterArr.inventory.length){
					for(let _data of this.tableData){
						_data.display = true;
					}

				}else{
					for(let _data of this.tableData){
						_data.display = false;
					}

					let lineArr = [];
					for(let data in this.filterArr){
						if(this.filterArr[data].length){
							lineArr.push(this.filterArr[data]);
						}
					}
					// 笛卡尔积
					let figureOutGroup = this.getArrGroup(lineArr);

					// 显示符合条件的数据
					for(let lineData of this.tableData){
						for(let temp of figureOutGroup){
							let fitingCount = 0;
							for(let value of temp){
								if( (lineData.cate_spec==value) | (lineData.material==value) | (lineData.size==value) | (lineData.brand==value) | (lineData.product_status==value) | (lineData.inventory==value) ){
									fitingCount++;
								}
							}
							if(fitingCount === temp.length){
								lineData.display = true;
								break;
							}
						}
					}

				}
			},
			getArrGroup(list){
				//parent上一级索引;count指针计数
				var point = {};
				var result = [];
				var pIndex = null;
				var tempCount = 0;
				var temp  = [];
				//根据参数列生成指针对象
				for(var index in list){
					if(typeof list[index] == 'object'){
						point[index] = {'parent':pIndex,'count':0}
						pIndex = index;
					}
				}
				//单维度数据结构直接返回
				if(pIndex == null){
					return list;
				}
				//动态生成笛卡尔积
				while(true){
					for(var index in list){
						tempCount = point[index]['count'];
						temp.push(list[index][tempCount]);
					}
					//压入结果数组
					result.push(temp);
					temp = [];
					//检查指针最大值问题
					while(true){
						if(point[index]['count']+1 >= list[index].length){
							point[index]['count'] = 0;
							pIndex = point[index]['parent'];
							if(pIndex == null){
								return result;
							}
							//赋值parent进行再次检查
							index = pIndex;
						}else{
							point[index]['count']++;
							break;
						}
					}
				}
			},
			sortTableLine(methods, key){
				if(methods === "desc"){
					this.tableData.sort(function(a, b){
						a[key] = a[key] == '-' ? 0 : a[key];
						b[key] = b[key] == '-' ? 0 : b[key];
						if(parseInt(b[key]) > parseInt(a[key])){
							return 1;
						}else if(parseInt(b[key]) < parseInt(a[key])){
							return -1;
						}else{
							return 0;
						}
					});
				}else{
					this.tableData.sort(function(a, b){
						a[key] = a[key] == '-' ? 0 : a[key];
						b[key] = b[key] == '-' ? 0 : b[key];
						if(parseInt(a[key]) > parseInt(b[key])){
							return 1;
						}else if(parseInt(a[key]) < parseInt(b[key])){
							return -1;
						}else{
							return 0;
						}
					});
				}

			},
			downloadExcel(){
				let date = this.reportDate.replace(':', '-');
				$("#download-table").table2excel({
					exclude: ".noExl",
					name: "Excel Document Name",
					filename: date + ".xls",
					fileext: ".xls",
					exclude_img: true,
					exclude_links: true,
					exclude_inputs: true
				});
			}
		},
		watch : {
			// 动态路由跳转, 重新加载数据
			'$route' (to, from) {
				this.tableData = null;
				let loadingInstance = Loading.service({target:"#price-info"});
				ajaxCustom.ajaxGet(this, "dingoapi/getSteelMarketDatas", {params : { id : this.$route.params.id }}, (responese)=>{
					let responeseData = responese.body.data;
					// 设置跳转功能的初始值
					this.reportDate = responese.body.data.parentResult[0].created_at;
					for(let item of this.reportTimesOption){
						if(item.id == this.$route.params.id){
							this.reportTimes = item.id;
						}
					}

					for(let data of responeseData.childResult){
						data.transportPrice = "";
						data.ownPrice = parseInt(data.price);
						data.allPrice = "";
						data.display = true;
					}

					responeseData.childResult = this.combineData(responeseData.childResult);

					this.addWebpriceToTable(responeseData.childResult, responeseData.webDatas);

					this.webPriceTimes = this.getWebPriceTimes(responeseData.webDatas);

					this.filterDatas.size = this.delDuplication(responeseData.childResult, "size");
					this.filterDatas.material = this.delDuplication(responeseData.childResult, "material");
					this.filterDatas.brands = this.delDuplication(responeseData.childResult, "brand");

					for(let data of this.filterDatas.brands){
						this.allBrands.push(data.value);
					}

					responeseData.childResult = this.sortTableDatas(responeseData.childResult);

					this.tableData = responeseData.childResult;
					this.searchDatas.brand = responeseData.parentResult[0].brand;
					this.reportDate = responeseData.parentResult[0].created_at;
					loadingInstance.close();
				}, (responese)=>{
					alert(responese.body.message);
					console.log(responese)
					loadingInstance.close();
				});
			}
		}
	}
</script>

<template>
	<div class="main-warpper" id="price-info">
		<h1>报价详情</h1>
		<h4>提供每日最新钢铁价格</h4>
		<br><br>

		<div class="controller-box">
			<address-ui @getAddressData="searchTarget" province="广东" style="float:left;" ></address-ui>
			<el-input style="float:left;"  placeholder="详细地址" size="small" v-model="searchDatas.address"></el-input>
			<el-button  style="float:left;" size="small" type="success" @click="searchTransportPrice()" >查询送到价</el-button>
			<el-button style="float:right;" @click="downloadExcel()">导出为Excel</el-button>
			<div style="clear:both;"></div>
		</div>
		<hr />

		<div style="float:right;">
			<el-date-picker style="width:150px;" v-model="reportDate" size="small" :editable="false" type="date" placeholder="选择日期" @change="getMarketDatas"></el-date-picker>
			<el-select size="small" placeholder="报价次序" v-model="reportTimes" >
				<el-option v-for="item in reportTimesOption" :value="item.id" :label="numChangeText(item.price_queue)" ></el-option>
			</el-select>
			<el-button size="small" type="default" @click="loadDataAtDate()">跳转</el-button>
		</div>
		<div style="float:left;">
			<span>显示项 : </span>
			<el-checkbox label="" v-model="tableDisplay.directTransportPrice">直送价</el-checkbox>
			<el-checkbox label="" v-model="tableDisplay.selfTransportPrice" >自提价</el-checkbox>
			<el-checkbox label="" v-model="tableDisplay.diffPrice" >差价</el-checkbox>
		</div>
		<div style="clear:both;"></div>
		<br>

		<div class="temp-block "></div>
		<table class="header-table" width="100%" border=1>
			<thead>
				<tr>
					<th rowspan="3">
						<multiple name="品名" :options="filterDatas.cate_spec" v-on:selectedArr="sortTable($event, 'cate_spec')"></multiple>
					</th>
					<th rowspan="3" >
						<multiple name="规格" :options="filterDatas.size" v-on:selectedArr="sortTable($event, 'size')"></multiple>
					</th>
					<th rowspan="3" >
						<multiple name="材质" :options="filterDatas.material" v-on:selectedArr="sortTable($event, 'material')"></multiple>
					</th>
					<th rowspan="3" >
						<multiple name="钢厂/品牌" :options="filterDatas.brands" v-on:selectedArr="sortTable($event, 'brands')"></multiple>
					</th>
					<template v-if="tableDisplay.directTransportPrice && !tableDisplay.selfTransportPrice || !tableDisplay.directTransportPrice && tableDisplay.selfTransportPrice">
						<th rowspan="1" colspan="1">市场价</th>
					</template>
					<template v-if="tableDisplay.directTransportPrice && tableDisplay.selfTransportPrice">
						<th rowspan="1" colspan="2">市场价</th>
					</template>
					<th rowspan="3" v-if="webPriceTimes!=0">
						<select class="thead-select" v-model="webPriceTimes" >
							<option value="1">网价-首次</option>
							<option value="2">网价-二次</option>
							<option value="3">网价-三次</option>
						</select>
					</th>
					<th rowspan="1" colspan="2" v-if="tableDisplay.diffPrice" >最新差价</th>
					<th rowspan="3">
						<multiple name="库存情况" :options="filterDatas.inventory" v-on:selectedArr="sortTable($event, 'inventory')" ></multiple>
					</th>
					<th rowspan="3">
						<multiple name="货物品质" :options="filterDatas.productStatus" v-on:selectedArr="sortTable($event, 'productStatus')" ></multiple>
					</th>
					<th rowspan="1" colspan="6" v-if="isSearch" >送到价</th>
				</tr>
				<tr>
					<template v-if="tableDisplay.directTransportPrice && !tableDisplay.selfTransportPrice">
						<th rowspan="2" colspan="1" >直送
							<div class="sort-icon">
								<div @click="sortTableLine('asce', 'freeTransportPrice')">▲</div>
								<div @click="sortTableLine('desc', 'freeTransportPrice')" style="margin-top:-7px;">▼</div>
							</div>
						</th>
					</template>
					<template v-if="tableDisplay.selfTransportPrice && !tableDisplay.directTransportPrice">
						<th rowspan="2" colspan="1">自提
							<div class="sort-icon">
								<div @click="sortTableLine('asce', 'selfTransportPrice')">▲</div>
								<div @click="sortTableLine('desc', 'selfTransportPrice')" style="margin-top:-7px;">▼</div>
							</div>
						</th>
					</template>
					<template v-if="tableDisplay.directTransportPrice && tableDisplay.selfTransportPrice">
						<th rowspan="2">直送
							<div class="sort-icon">
								<div @click="sortTableLine('asce', 'freeTransportPrice')">▲</div>
								<div @click="sortTableLine('desc', 'freeTransportPrice')" style="margin-top:-7px;">▼</div>
							</div>
						</th>
						<th rowspan="2">自提
							<div class="sort-icon">
								<div @click="sortTableLine('asce', 'selfTransportPrice')">▲</div>
								<div @click="sortTableLine('desc', 'selfTransportPrice')" style="margin-top:-7px;">▼</div>
							</div>
						</th>
					</template>

					<template v-if="tableDisplay.diffPrice">
						<th rowspan="2" >直送
							<div class="sort-icon">
								<div @click="sortTableLine('asce', 'freeDifferencePrice')">▲</div>
								<div @click="sortTableLine('desc', 'freeDifferencePrice')" style="margin-top:-7px;">▼</div>
							</div>
						</th>
						<th rowspan="2" >自提
							<div class="sort-icon">
								<div @click="sortTableLine('asce', 'selfDifferencePrice')">▲</div>
								<div @click="sortTableLine('desc', 'selfDifferencePrice')" style="margin-top:-7px;">▼</div>
							</div>
						</th>
					</template>

					<th rowspan="1" colspan="3" v-if="isSearch" >直送价</th>
					<th rowspan="1" colspan="3" v-if="isSearch" >自提价</th>
				</tr>
				<tr v-if="isSearch">
					<th rowspan="1" >单价</th>
					<th rowspan="1" >运费</th>
					<th rowspan="1" >总价</th>

					<th rowspan="1" >单价</th>
					<th rowspan="1" >运费</th>
					<th rowspan="1" >总价</th>
				</tr>
			</thead>
		</table>
		<table class="content-table" width="100%" border=1>
			<tbody>
				<tr v-for="data in tableData">
					<template v-if="data.display">
						<td> {{ data.cate_spec }} </td>
						<td> {{ data.size }} </td>
						<td> {{ data.material }} </td>
						<td> {{ data.brand }} </td>

						<template v-if="tableDisplay.directTransportPrice && !tableDisplay.selfTransportPrice">
							<td> {{ data.freeTransportPrice ? data.freeTransportPrice : '-' }} </td>
						</template>

						<template v-if="tableDisplay.selfTransportPrice && !tableDisplay.directTransportPrice">
							<td> {{ data.selfTransportPrice ? data.selfTransportPrice : '-' }} </td>
						</template>

						<template v-if="tableDisplay.directTransportPrice && tableDisplay.selfTransportPrice">
							<td> {{ data.freeTransportPrice ? data.freeTransportPrice : '-' }} </td>
							<td> {{ data.selfTransportPrice ? data.selfTransportPrice : '-' }} </td>
						</template>

						<td v-if="webPriceTimes==1" > {{ data.webPrice1 ? data.webPrice1 : '-' }} </td>
						<td v-if="webPriceTimes==2" > {{ data.webPrice2 ? data.webPrice2 : '-' }} </td>
						<td v-if="webPriceTimes==3" > {{ data.webPrice3 ? data.webPrice3 : '-' }} </td>

						<template v-if="tableDisplay.diffPrice">
							<td> {{ data.freeDifferencePrice ? data.freeDifferencePrice : '-' }} </td>
							<td> {{ data.selfDifferencePrice ? data.selfDifferencePrice : '-' }} </td>
						</template>

						<td> {{ data.inventory }} </td>
						<td> {{ data.product_status }} </td>
						<!-- search result  -->
						<template v-if="isSearch">
							<td> {{ data.freeTransportPrice ? data.freeTransportPrice : '-' }} </td>
							<td> {{ data.transportPrice }} </td>
							<td> {{ data.freeTransportPrice ? (isNaN(parseInt(data.freeTransportPrice) + parseInt(data.transportPrice)) ? '-' : parseInt(data.freeTransportPrice) + parseInt(data.transportPrice)) : '-' }} </td>
							<td> {{ data.selfTransportPrice ? data.selfTransportPrice : '-' }} </td>
							<td> {{ data.transportPrice }} </td>
							<td> {{ data.selfTransportPrice ? (isNaN(parseInt(data.selfTransportPrice) + parseInt(data.transportPrice)) ? '-' : parseInt(data.selfTransportPrice) + parseInt(data.transportPrice)) : '-' }} </td>
						</template>
					</template>
				</tr>
			</tbody>
		</table>

		<table id="download-table" style="display:none;">
			<thead>
				<tr>
					<th rowspan="3">品名</th>
					<th rowspan="3" >规格</th>
					<th rowspan="3" >材质</th>
					<th rowspan="3" >钢厂/品牌</th>
					<template v-if="tableDisplay.directTransportPrice && !tableDisplay.selfTransportPrice || !tableDisplay.directTransportPrice && tableDisplay.selfTransportPrice">
						<th rowspan="1" colspan="1">市场价</th>
					</template>
					<template v-if="tableDisplay.directTransportPrice && tableDisplay.selfTransportPrice">
						<th rowspan="1" colspan="2">市场价</th>
					</template>
					<th rowspan="3" >网价</th>
					<th rowspan="1" colspan="2" v-if="tableDisplay.diffPrice" >最新差价</th>
					<th rowspan="3">库存情况</th>
					<th rowspan="3">货物品质</th>
					<th rowspan="1" colspan="6" v-if="isSearch" >送到价</th>
				</tr>
				<tr>
					<template v-if="tableDisplay.directTransportPrice && !tableDisplay.selfTransportPrice">
						<th rowspan="2" colspan="1" >直送</th>
					</template>
					<template v-if="tableDisplay.selfTransportPrice && !tableDisplay.directTransportPrice">
						<th rowspan="2" colspan="1">自提</th>
					</template>
					<template v-if="tableDisplay.directTransportPrice && tableDisplay.selfTransportPrice">
						<th rowspan="2">直送</th>
						<th rowspan="2">自提</th>
					</template>

					<template v-if="tableDisplay.diffPrice">
						<th rowspan="2" >直送</th>
						<th rowspan="2" >自提</th>
					</template>

					<th rowspan="1" colspan="3" v-if="isSearch" >直送价</th>
					<th rowspan="1" colspan="3" v-if="isSearch" >自提价</th>
				</tr>
				<tr v-if="isSearch">
					<th rowspan="1" >单价</th>
					<th rowspan="1" >运费</th>
					<th rowspan="1" >总价</th>

					<th rowspan="1" >单价</th>
					<th rowspan="1" >运费</th>
					<th rowspan="1" >总价</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="data in tableData">
					<template v-if="data.display">
						<td> {{ data.cate_spec }} </td>
						<td> {{ data.size }} </td>
						<td> {{ data.material }} </td>
						<td> {{ data.brand }} </td>

						<template v-if="tableDisplay.directTransportPrice && !tableDisplay.selfTransportPrice">
							<td> {{ data.freeTransportPrice ? data.freeTransportPrice : '-' }} </td>
						</template>

						<template v-if="tableDisplay.selfTransportPrice && !tableDisplay.directTransportPrice">
							<td> {{ data.selfTransportPrice ? data.selfTransportPrice : '-' }} </td>
						</template>

						<template v-if="tableDisplay.directTransportPrice && tableDisplay.selfTransportPrice">
							<td> {{ data.freeTransportPrice ? data.freeTransportPrice : '-' }} </td>
							<td> {{ data.selfTransportPrice ? data.selfTransportPrice : '-' }} </td>
						</template>

						<td v-if="webPriceTimes==1" > {{ data.webPrice1 ? data.webPrice1 : '-' }} </td>
						<td v-if="webPriceTimes==2" > {{ data.webPrice2 ? data.webPrice2 : '-' }} </td>
						<td v-if="webPriceTimes==3" > {{ data.webPrice3 ? data.webPrice3 : '-' }} </td>

						<template v-if="tableDisplay.diffPrice">
							<td> {{ data.freeDifferencePrice ? data.freeDifferencePrice : '-' }} </td>
							<td> {{ data.selfDifferencePrice ? data.selfDifferencePrice : '-' }} </td>
						</template>

						<td> {{ data.inventory }} </td>
						<td> {{ data.product_status }} </td>
						<!-- search result  -->
						<template v-if="isSearch">
							<td> {{ data.freeTransportPrice ? data.freeTransportPrice : '-' }} </td>
							<td> {{ data.transportPrice }} </td>
							<td> {{ data.freeTransportPrice ? (isNaN(parseInt(data.freeTransportPrice) + parseInt(data.transportPrice)) ? '-' : parseInt(data.freeTransportPrice) + parseInt(data.transportPrice)) : '-' }} </td>
							<td> {{ data.selfTransportPrice ? data.selfTransportPrice : '-' }} </td>
							<td> {{ data.transportPrice }} </td>
							<td> {{ data.selfTransportPrice ? (isNaN(parseInt(data.selfTransportPrice) + parseInt(data.transportPrice)) ? '-' : parseInt(data.selfTransportPrice) + parseInt(data.transportPrice)) : '-' }} </td>
						</template>
					</template>
				</tr>
			</tbody>
		</table>

	</div>
</template>

<style scoped>
	.main-warpper{
		width:1280px;
		margin:auto;
		padding:25px;
		color:#1F2D3D;
	}
	h1,h4{
		font-weight:400;
	}
	h4{
		color:#8492A6;
	}
	.el-input, .el-select{
		width:100px;
	}

	table{
		float:right;
	    table-layout: fixed;
	    border-collapse:collapse;
	    border:1px solid black;
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

	.thead-select{
		width:100%;
	}
	.sort-icon{
		position: relative;
		top: 3px;
		display:inline-block;
		width:20px;
		font-size: 12px;
		color:#97a8be;
	}
	.sort-icon>div{
		width:auto;
		height:auto;
		margin:0;
		padding:0;
		cursor:pointer;
	}
	.content-table{
		margin-bottom:50px;
	}
</style>

<style>
	#price-info .el-table{
		font-style:12px;
		text-align:center;
	}

	#price-info .el-table .cell, .el-table th>div{
		padding-left: 0;
		padding-right: 0;
		text-align:center;
	}
	.float-top{
		position:fixed;
		top:0;
		width:1230px;
		z-index:1;
	}
</style>
