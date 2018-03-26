<script>
	import Vue from "vue";
	import headerbar from "../components/same-headerbar.vue";
	import ajaxCustom from '../components/ajax-custom.js';
	import filterBar from '../components/filter-bar.vue';
	import citySelecting from '../components/adds-input.vue';
	import sortMethods from '../components/steel-sort.js';
	import { Button, Input, DatePicker, Select, Option, Table, TableColumn } from 'element-ui';
	export default{
		components : {
			headerbar,
			filterBar,
			citySelecting,
			ajaxCustom,
			elDatePicker : DatePicker,
			elInput : Input,
			elSelect : Select,
			elOption : Option,
			elButton : Button,
			elTable : Table,
			elTableColumn : TableColumn,
		},
		created(){
			// 获取后台数据
			this.nameList = window._defaultDatas.nameList;
			this.marketPrice = window._defaultDatas.marketPriceDatas[window._defaultDatas.marketPriceDatas.length-1];
			this.webPrice = window._defaultDatas.webPriceDatas[window._defaultDatas.webPriceDatas.length-1];
			// 整合价格数据
			let mixDatas = this.combineDatas(this.marketPrice.childDatas, this.webPrice.childDatas);
			this.filterDatas = JSON.parse(JSON.stringify(mixDatas));
			this.mainDatas = this.createTreeDatas(JSON.parse(JSON.stringify(mixDatas)));
			this.tableInfo = this.createTableHead(this.mainDatas);
		},
		data(){
			return {
				marketPrice : [],
				webPrice : [],
				mainDatas : [],
				mainDatasCache : [],
				filterDatas : [],
				tableInfo : [],
				transportPrice : {
					free : 0,
					self : 0
				},
				// 品牌别名
				nameList : []
			}
		},
		methods : {
			// 合并相同规格的网价与现货价
			combineDatas(marketDatas, webDatas){
				for(let market of marketDatas){
					// 初始空值
					market.webPrice = 0;
					market.diffPrice = 0;
					market.count = 0;
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
							market.diffPrice = parseInt(market.price) - parseInt(web.web_price);
						}
					}
				}
				return marketDatas;
			},
			createTreeDatas(lineDatas){
				let splitDatasByBrands = sortMethods.classify(lineDatas, "brand");
				let collect = [];
				// 求一个三维数组，分品牌/分规格/分供应商
				for(let brandsDatas of splitDatasByBrands){
					let collectByBrands = [];
					for(let data of brandsDatas){
						let collectBySame = [];
						collectBySame.push(data);
						for(let _data of brandsDatas){
							if(data.cate_spec==_data.cate_spec && data.material==_data.material && data.size==_data.size && data.id!==_data.id){
								collectBySame.push(_data);
							}
						}
						// 合并同规格数据后，向其插入供应商的集合
						let details = [];
						for(let data of collectBySame){
							details.push({
								id : data.id,
								brand : data.brand,
								supplier : data.price_source,
								price : data.price,
								transport : data.transport,
								warehouse : data.warehouse
							})
						}
						collectBySame = collectBySame[0];
						collectBySame.details = details;
						collectByBrands.push(collectBySame);
					}
					collect.push(collectByBrands);
				}
				return collect;
			},
			// 创建渲染表头的数据
			createTableHead(mainDatas){
				let result = [];
				for(let oneBrandDatas of mainDatas){
					let theadInfo = [];
					for(let steelDatas of oneBrandDatas){
						for(let data of steelDatas.details){
							if(theadInfo.length === 0){
								theadInfo.push(data);
							}else{
								let isHas = false;
								for(let _data of theadInfo){
									if(_data.supplier==data.supplier && _data.transport==data.transport && _data.warehouse==data.warehouse){
										isHas = true;
									}
								}
								!isHas ? theadInfo.push(data) : false;
							}
						}
					}
					result.push(theadInfo);
				}

				// 生成条件为 相同供应商 && 相同运输方式 && 不同仓库 的集合，并删除原有的数据，将新的集合插入为multiple, 不符合条件的旧数据项为single
				let newResult = [];
				for(let i=0; i<result.length; i++){
					let saveCollect = [];
					for(let j=0; j<result[i].length; j++){
						let copyDatas = JSON.parse(JSON.stringify(result[i]));
						let collect = [JSON.parse(JSON.stringify(result[i][j]))];
						let indexByWhile = 0;
						// 判断是否符合条件, 是则copy数据项并删除原有的数据项
						while(indexByWhile<copyDatas.length){
							if(result[i][j].supplier==copyDatas[indexByWhile].supplier && result[i][j].transport==copyDatas[indexByWhile].transport && result[i][j].warehouse!=copyDatas[indexByWhile].warehouse){
								collect.push(copyDatas[indexByWhile]);
								copyDatas.splice(indexByWhile, 1);
							}else{
								indexByWhile++;
							}
						}
						// collect.length>1 ? saveCollect.push(collect) : false;
						saveCollect.push(collect)
						result[i] = copyDatas;
						// 在循环最后将结果带出循环
						if(j==result[i].length-1){
							newResult.push(saveCollect);
						}
					}
				}
				return newResult;
			},
			getListToChange(data){
				this.mainDatas = this.createTreeDatas(JSON.parse(JSON.stringify(data)));
			},
			// 根据tableInfo来设置colspan
			setColspan(datas, type){
				if(type === "直送"){
					let index = 0;
					// 直送没有仓库信息，数据统一在single中
					for(let data of datas){
						for(let _data of data){
							if(_data.transport == type){
								index++;
							}
						}
					}
					return index;
				}else{
					// 自提中单一仓库colspan为2，两个仓库为4
					let multipleIndex = 0;
					for(let multiple of datas){
						if(multiple[0].transport == type){
							if(multiple.length === 2){
								multipleIndex += 4;
							}else{
								multipleIndex += 2;
							}
						}

					}
					return multipleIndex;
				}
			},
			// 通过mainDatas中的detils,以及tableInfo算出供应商这行的table数据
			setLineBySupplier(detailDatas, theadIndex, transportByFree, transportBySelf){
				let tableStructure = JSON.parse(JSON.stringify(this.tableInfo[theadIndex]));
				for(let datas of tableStructure){
					for(let data of datas){
						delete data.price;
						delete data.id;
					}
				}

				// 当前行是否有符合结构的数据，有则收集价格
				for(let datas of tableStructure){
					for(let data of datas){
						for(let detil of detailDatas){
							if(data.supplier==detil.supplier && data.transport==detil.transport && data.warehouse==detil.warehouse){
								data.price = detil.price;
							}
						}
					}
				}

				// 当前行的数据
				let tableLine = [];
				//添加直送数据
				for(let company of transportByFree){
					let isHas = false;
					for(let datas of tableStructure){
						for(let data of datas){
							if(data.supplier===company.supplier && data.transport=="直送" && data.price){
								tableLine.push({
									val : data.price,
									transport : "直送",
									supplier : data.supplier
								});
								isHas = true;
								break;
							}
						}
					}
					isHas ? false : tableLine.push('-');
				}
				// 添加自提数据
				for(let company of transportBySelf){
					for(let datas of tableStructure){
						if(datas[0].supplier===company.supplier && datas.length===1 && datas[0].transport!="直送"){
							for(let _data of this.setOneWarehouse(datas)){
								tableLine.push(_data);
							}
						}
						if(datas[0].supplier===company.supplier && datas.length===2){
							for(let _data of this.setTwoWarehouse(datas)){
								tableLine.push(_data);
							}
						}
						if(datas[0].supplier===company.supplier && datas.length>2){
							for(let _data of this.setThreeWarehouse(datas)){
								tableLine.push(_data);
							}
						}
					}
				}
				//添加运费
				for(let data of tableLine){
					if( typeof(data.val)==="number" ){
						if(data.transport && data.transport === "直送"){
							data.val += this.transportPrice.free ? parseInt(this.transportPrice.free) : 0;
						}else{
							data.val += this.transportPrice.self ? parseInt(this.transportPrice.self) : 0;
						}
					}
				}
				return tableLine;
			},
			setOneWarehouse(datas){
				let result = [];
				for(let data of datas){
					if(data.price){
						result.push({
							val : data.price,
							transport : "自提",
							supplier : data.supplier
						});
						result.push({
							val : data.warehouse,
						});
					}else{
						result.push({
							val : '-'
						});
						result.push({
							val : '-'
						});
					}
				}
				return result;
			},
			setTwoWarehouse(datas){
				let result = [];
				for(let data of datas){
					if(data.price){
						result.push({
							val : data.price,
							transport : "自提",
							supplier : data.supplier
						});
						result.push({
							val : data.warehouse,
						});
					}else{
						result.push({
							val : '-'
						});
						result.push({
							val : '-'
						});
					}
				}
				return result;
			},
			setThreeWarehouse(datas){
				let warehouseStr = "";
				for (var i = 0; i < datas.length; i++) {
					warehouseStr += datas[i].warehouse + ( i==(datas.length-1) ? '' : ', ' );
				}
				if(datas[0].price){
					return [{ val : datas[0].price, transport : "自提", supplier : datas[0].supplier }, { val : warehouseStr }];
				}else{
					return [{ val : '-' }, { val : '-' }]
				}
			},
			// 两个仓库不同价格的，设置colspan长度为4
			setColspanByTransport(datas){
				let maxNumber = 0;
				for(let data of datas){
					let count = 0;
					for(let _data of datas){
						if(data.supplier==_data.supplier && data.transport==_data.transport && data.warehouse!=_data.warehouse){
							count++;
						}
					}
					if(count === 2){
						maxNumber = 4;
					}
				}
				return maxNumber;
			},
			hasTransportType(datas, type){
				let index = 0;
				for(let key in datas){
					for(let data of datas[key]){
						if(data.transport === type){
							index++;
						}
					}
				}
				return index>0 ? index : false;
			},
			filterTransport(datas, type){
				let result = [];
				if(type === "直送"){
					for(let key in datas){
						for(let data of datas[key]){
							if(data.transport === type){
								result.push(data);
							}
						}
					}
				}else{
					for(let arr of datas){
						if(arr.length > 1){
							if(arr.length === 2){
								result.push({
									supplier : arr[0].supplier,
									colspan : 4
								});
							}else{
								result.push({
									supplier : arr[0].supplier,
									colspan : 2
								});
							}

						}else{
							for(let data of arr){
								if(data.transport === type){
									result.push({
										supplier : data.supplier,
										colspan : 2
									});
								}
							}
						}
					}
				}
				return result;
			},
			getAddressData(datas){
				console.log(datas);
				let brands = [];
				for(let data of this.mainDatas){
					brands.push(data[0].brand);
				}
				ajaxCustom.ajaxGet(this, "api/searchTransportForCity", { params : { brands : brands, city : datas.city, area : datas.area, address : "" } }, (responese)=>{
					console.log(responese)
				}, (responese)=>{
					alert(responese.body.message);
				});
			},
			countDiffPrice(details, theadIndex, brandDatas, webPrice){
				let tableLine = this.setLineBySupplier(details, theadIndex, this.filterTransport(brandDatas, '直送'), this.filterTransport(brandDatas, '广州仓发货'));
				if(webPrice){
					tableLine.sort(function(a, b){
						if(a!=='-' && b!=='-'){
							a.price = a.supplier ? a.val : 0;
							b.price = b.supplier ? b.val : 0;
							return b.price - a.price;
						}
					});
					let result = [];
					// 找出最大差价 并排版成数组
					for(let data of tableLine){
						if(data.transport && data.transport==="直送"){
							result.push({ val : (webPrice - data.val), supplier : data.supplier });
							result.push({ val : data.supplier });
							break;
						}
					}
					if(result.length === 0){
						result.push({ val : '-', warehouse : '-' });
						result.push({ val : '-', warehouse : '-' });
					}
					for(let data of tableLine){
						if(data.transport && data.transport!=="直送"){
							result.push({ val : (webPrice - data.val), supplier : data.supplier });
							result.push({ val : data.supplier });
							break;
						}
					}
					if(result.length < 4){
						for (var i = result.length; i < 3; i++) {
							result.push({ val : '-', warehouse : '-' });
							result.push({ val : '-', warehouse : '-' });
						}
					}
					return result;
				}else{
					return [{ val : '-' }, { val : '-' }, { val : '-' }, { val : '-' }];
				}

			},
			countProfit(count, bestPrice){
				// console.log(bestPrice);
				let selector = {
					options : [],
					selected : null
				};
				for(let data of bestPrice){
					if(data.supplier && data.val!=='-'){
						data.val = data.val * ( parseInt(count) ? parseInt(count) : 0);
					}
					if(data.supplier && selector.options.length===0){
						selector.options.push({
							supplier : data.supplier
						});
					}
				}
				// for(let data of bestPrice){
				// 	let hasName = false;
				// 	if(data.supplier){
				// 		for(let _data of selector.options){
				// 			if(data.supplier===_data.supplier){
				// 				hasName = true;
				// 			}
				// 		}
				// 		if(!hasName){
				// 			selector.options.push({ supplier : data.supplier });
				// 		}
				// 	}
				// }
				// for(let data of bestPrice){
				// 	data.selector = selector;
				// }
				// console.log(selector.options);
				// console.log(bestPrice);
				return bestPrice;
			},
			moveToBrand(brand){
				let tablesDom = document.getElementsByTagName("table");
				for(let data of tablesDom){
					if(data.attributes["data-brand"].value == brand){
						document.body.scrollTop = data.offsetTop;
					}
				}
			}
		}
	}
</script>

<template>
	<div>
		<headerbar active_number="dealing_tool" :text="['下单助手', '下单助手']">
			<div>
				<filter-bar :data="filterDatas" :index="[
					{ title : '品名', key : 'cate_spec' },
					{ title : '规格' , key : 'size'},
					{ title : '材质', key : 'material'},
					{ title : '品牌', key : 'brand' }
					]" @list="getListToChange" class="filter_class">
				</filter-bar>

				<div class="left-jump-bar">
					<div class="brand" v-for="datas in mainDatas" @click="moveToBrand(datas[0].brand)">{{ datas[0].brand }}</div>
				</div>

				<div class="selecting-tool">
					<div>
						<span>直送运费 : </span>
						<el-input type="number" v-model="transportPrice.free" style="width:100px;"></el-input>
					</div>
					<div>
						<div style="width:170px;margin:auto;">
							<span>自提运费 : </span>
							<el-input type="number" v-model="transportPrice.self" style="width:100px;"></el-input>
						</div>
					</div>
					<div>
						<el-button style="margin:auto;">统一调价</el-button>
					</div>
					<div style="clear:both;"></div>
				</div>

				<div class="table-box">
					<table class="table-style" v-for="(brandDatas, theadIndex) in tableInfo" :data-brand="brandDatas[0][0].brand">
						<thead>
							<tr>
								<th rowspan="2">品牌</th>
								<th rowspan="2">品名</th>
								<th rowspan="2">规格</th>
								<th rowspan="2">网价/元</th>
								<th rowspan="2">重量/吨</th>
								<th v-if="hasTransportType(brandDatas, '直送')" :colspan="setColspan(brandDatas, '直送')">直送</th>
								<th v-if="hasTransportType(brandDatas, '广州仓发货')" :colspan="setColspan(brandDatas, '广州仓发货')">自提</th>
								<th colspan="4">最大差价</th>
								<th colspan="4">利润</th>
							</tr>
							<tr>
								<template v-for="data in filterTransport(brandDatas, '直送')">
									<th>{{ data.supplier }}</th>
								</template>
								<template v-for="data in filterTransport(brandDatas, '广州仓发货')">
									<th :colspan="data.colspan">{{ data.supplier }}</th>
								</template>
								<th colspan="2">直送</th>
								<th colspan="2">自提</th>
								<th colspan="2">直送</th>
								<th colspan="2">自提</th>
							</tr>
						</thead>
						<tbody>
							<template v-for="brandDatasArr in mainDatas">
								<template v-for="(val, index) in brandDatasArr">
									<tr v-if="val.brand == brandDatas[0][0].brand">
        								<td>{{ val.brand }}</td>
        								<td>{{ val.cate_spec }}</td>
        								<td>{{ val.size }}</td>
        								<td>{{ val.webPrice==0 ? '-' : val.webPrice }}</td>
        								<td><input v-model="val.count" type="number" style="width:100%;"></td>
										<template v-for="data in setLineBySupplier(val.details, theadIndex, filterTransport(brandDatas, '直送'), filterTransport(brandDatas, '广州仓发货'))">
											<td>{{ typeof(data.val)=="number" ? (data.val + ( (data.transport=='直送' ? transportPrice.free : transportPrice.self) | 0 ) ) : data.val }}</td>
										</template>
										<template v-for="data in countDiffPrice(val.details, theadIndex, brandDatas, val.webPrice)">
											<td>{{ data.val }}</td>
										</template>
										<template v-for="data in countProfit(val.count, countDiffPrice(val.details, theadIndex, brandDatas, val.webPrice))">
											<td v-if="data.val==NaN">
												<select v-model="data.selector.selected">
													<option v-for="opt in data.selector.options">{{ opt.supplier }}</option>
												</select>
											</td>
											<td v-else>{{ data.val }}</td>
										</template>
        							</tr>
								</template>
							</template>
						</tbody>
					</table>
				</div>
			</div>
		</headerbar>
	</div>
</template>

<style>
	*{
		font-family:"微软雅黑";
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
	html body .el-input__inner{
		height:30px;
	}
	html body .el-button{
		padding:7px;
	}
	.filter_class{
		text-align: left;
		background-color: #fff;
	}

	.selecting-tool{
		margin-top:30px;
	}
	.selecting-tool>div{
		float:left;
		width:33%;
	}
	.table-box{
		margin-top:100px;
		clear:both;
	}
	table.table-style{
		margin-bottom: 30px;
		margin-top: 20px;
		width: 100%;
	    table-layout: fixed;
	    border-collapse:collapse;
		border:1px solid #e0e6ed;
		text-align:center;
		font-size:14px;
	}
	.table-style thead{
		background-color:#eef1f6;
	}
	.table-style thead th{
		text-align: center;
		padding:10px 0px;
		border:1px solid #dfe6ec;
	}
	table.table-style td{
		padding:10px;
		border:none;
		border-bottom:1px solid #e0e6ed;
		border-right:1px solid #e0e6ed;
	}
	table.table-style tbody tr:hover{
		background-color: #eff2f7;
	}

	.left-jump-bar{
		position:fixed;
		right:0;
		top:20%;
		width: 100px;
		border-top-left-radius:7px;
		border-bottom-left-radius: 7px;
		color:white;
		background:#324157;
		text-align:center;
		font-size: 16;
    	font-weight: 700;
		opacity: 0.3;
	}
	.left-jump-bar:hover{
		opacity: 1;
	}
	.brand{
		padding : 5px;
	}
	.brand:hover{
		/*color:black;*/
		cursor:pointer;
		background:#01c0c8;
	}
</style>
