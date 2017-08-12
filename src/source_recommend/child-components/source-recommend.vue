<script>
	import recommend from "../../../res/json/recommend.json";
	import ajaxCustom from '../../components/ajax-custom.js';
	import echarts from "echarts";
	import { Button, Select, Input, Table, TableColumn, Option } from 'element-ui'
	export default{
		components : {
			elTable : Table,
			elTableColumn : TableColumn,
			elSelect : Select,
			elOption : Option,
			elInput : Input,
			elButton : Button
		},
		created : function(){
			ajaxCustom.ajaxGet(this,"dingoapi/getRecommendingResource", (responese)=>{
				console.log(responese)
				this.recommendStandard = recommend;
				// 后端数据转换到前端控制器数据格式
				var recommendData = [];
				var brandsData = responese.body.data.brandData;
				for(let data of brandsData){
					// let steelArr = [];
					let tempArr = [];
					tempArr.brand = data.brand
					tempArr.threeMonthData = data.resourceDatas===null ? "" : data.resourceDatas;
					tempArr.type = [];
					for(let steelName in data.steel){
						let tempType = {};
						tempType.name = steelName;
						tempType.value = [];
						tempType.value2 = [];
						for(let material in data.steel[steelName]){
							if(material[material.length-1] === 'E'){
								for(let size of data.steel[steelName][material]){
									tempType.value.push(size);
								}
							}else{
								for(let size of data.steel[steelName][material]){
									tempType.value2.push(size);
								}
							}
						}
						tempArr.type.push(tempType);
					}
					recommendData.push(tempArr);
				}
				// 获取平均数
				let id = 0;
				for(let data of recommendData){
					// let meanOfMonth = 0;
					// let _meanOfMonth = 0;
					// let monthsMean = [];
					data.id = id;
					if(data.threeMonthData.length){
						let tempArr = [];
						for(let dataMonth of data.threeMonthData){
							tempArr.push({
								mean : parseInt(dataMonth.material),
								_mean : parseInt(dataMonth._material),
								created_at : dataMonth.created_at.substring(0, 10)
							});
						}
						data.threeMonthData = tempArr;
					}
					id++;
				}

				// 加入运费字段
				for(let data of recommendData){
					let notBrand = true;
					for(let transport of responese.body.data.transportData){
						if(data.brand === transport.brand){
							data.transport = transport;
							notBrand = false;
						}
					}
					if(notBrand){
						for(let brandData of responese.body.data.transportData){
							if(brandData.type===1 && brandData.city==="广州市" && brandData.area==="黄埔区"){
								data.transport = brandData;
							}
						}
					}
				}
				this.recommendData = recommendData;

				//获取所有品牌名称
				for(let data of brandsData){
					this.allBrands.push({
						text : data.brand,
						value : data.brand
					});
				}
				this.filtersOfBrands = this.allBrands;
			}, (responese)=>{
				console.log(responese)
			});
		},
		data(){
			return {
				baseProvince : "广东",
				filtersOfBrands :  [
						{ text : '桂鑫' , value : '桂鑫' },
						{ text : '广钢' , value : '广钢' },
						{ text : '韶钢' , value : '韶钢' },
					],
				contrast : false,
				allBrands : [""],
				diffBrand : [{
					selected : ""
				}],
				recommendData : "",
				recommendStandard : "",
				searchCity : "",
				tempTableData : [],
				// recommendData : [
				// 	{
				// 		brand : "桂鑫",
				// 		type : [
				// 			{name : "高线" , value : ['8','10'],value2:['8','10']},
				// 			{name : "盘螺" , value : ['6','8','10'],value2 : ['6','8','10']},
				// 			{name : "螺纹钢" ,value : ['12','14','16','18','20','22','24','26','28','30','32','34'],
				// 							value2 : ['12','14','16','18','20','22','24','26','28','30','32','34']},
				// 		],
				// 		source : "充足",
				// 		freight : "0元/吨",
				// 		delivery : "钢厂直送",
				// 		threeMonthData : [],
				// 		id : "l1",
				// 		isLoaded : false
				// 	},
				// 	{
				// 		brand : "广钢",
				// 		type : [
				// 			{name : "高线" , value : ['8','10'],value2:['8','10']},
				// 			{name : "盘螺" , value : ['6','8','10'],value2 : ['6','8','10']},
				// 			{name : "螺纹钢" ,value : ['12','14','16','18','20','22','24','26','28','30','32','34'],
				// 							value2 : ['12','14','16','18','20','22','24','26','28','30','32','34']},
				// 		],
				// 		source : "充足",
				// 		freight : "35元/吨",
				// 		delivery : "仓库发货",
				// 		threeMonthData : [],
				// 		id : "l2",
				// 		isLoaded : false
				// 	},
				// 	{
				// 		brand : "韶钢",
				// 		type : [
				// 			{name : "高线" , value : ['8','10'],value2:['8','10']},
				// 			{name : "盘螺" , value : ['6','8','10'],value2 : ['6','8','10']},
				// 			{name : "螺纹钢" ,value : ['12','14','16','18','20','22','24','26','28','30','32','34'],
				// 							value2 : ['12','14','16','18','20','22','24','26','28','30','32','34']},
				// 		],
				// 		source : "充足",
				// 		freight : "*元/吨",
				// 		delivery : "...",
				// 		threeMonthData : [],
				// 		id : "l3",
				// 		isLoaded : false
				// 	},
				// ]

			}
		},
		methods : {
			startDiff(){
				let strings = "";
				for(let data of this.diffBrand){
					if(data.selected){
						strings += data.selected + '&';
					}
				}
				this.$router.push({ path : "/"+strings });
			},
			addInput(data){
				if(data && this.diffBrand.length<4){
					let count = 0;
					for(let data of this.diffBrand){
						if(!data.selected){
							count++;
						}
					}
					if(count<1){
						this.diffBrand.push({
							selected : ""
						});
					}

				}
			},
			addBrand(data){
				this.contrast = true;
				if(this.diffBrand.length<5){
					this.diffBrand[this.diffBrand.length-1].selected = data;
				}
				if(this.diffBrand.length == 1){
					this.diffBrand.push({
						selected : ""
					});
				}
			},
			selectBrand(brand){
				console.log(brand)
				this.diffBrandCount.push("");
			},
			getcontrastItem(){
				this.contrast=!this.contrast;
			},
			filterBrands(value, row){
				return value === row.brand;
			},
			clean(){
				this.diffBrand = [];
				this.diffBrand.push({
					selected : ""
				});
			},
			// initCharts(index, isLoaded){
			initCharts(data){
				if(document.getElementById(data.id)!=null){
					data.isLoaded = true;
					this.getcharts(document.getElementById(data.id), data);
					return true;
				}else{
					return true;
				}
			},
			getcharts (dom, data){
				// console.log(data.threeMonthData)
				var dataDate = [];
				var mean = [];
				var _mean = [];
				if(data.threeMonthData.length){
					data.threeMonthData.sort(function(dataA, dataB){
						let valA = new Date(dataA.created_at);
						let valB = new Date(dataB.created_at);
						return valA.getTime() - valB.getTime();
					});
				}

				for(let _data of data.threeMonthData){
					dataDate.push(_data.created_at.substring(0, 7)+"     ");
					mean.push(_data.mean);
					_mean.push(_data._mean);
				}
				var myChart = echarts.init(dom);
				myChart.setOption(
					{
						title: {
							text: "统计",
								textStyle: {
								fontSize :12
							}
						},
						tooltip: {
							trigger: 'axis'
						},
						legend: {
							data : ['18-25(抗震)','18-25(非抗震)']
						},
						grid: {
							left: '3%',
							right: '4%',
							bottom: '3%',
							containLabel: true
						},
						toolbox: {
							feature: {

							}
						},
						xAxis: {
							name : '时间',
							type: 'category',
							boundaryGap: false,
							data: dataDate
						},
						yAxis: {
							name : '价格',
							type: 'value'
						},
						series: [
							{
								name :'18-25(抗震)',
								type:'line',
								data:mean
							},
							{
								name:'18-25(非抗震)',
								type:'line',
								data:_mean
							},
						]
					}
				);
			},
			// showRecommendData(selectedData){

			// },
			resetList(){
				this.searchCity = null;
			}
		},
		watch : {
			searchCity(selectedData, oldVal){
				// 重置
				if(selectedData === null){
					console.log(this.recommendData, this.tempTableData)
					if(this.tempTableData.length !== 0){
						this.recommendData = [];
						for(let data of this.tempTableData){
							this.recommendData.push(data);
						}
					}else{
						return false;
					}
					return false;
				}

				// 搜索
				if(this.tempTableData.length === 0){
					this.tempTableData = [];
					for(let data of this.recommendData){
						this.tempTableData.push(data);
					}
				}else{
					this.recommendData = [];
					for(let data of this.tempTableData){
						this.recommendData.push(data);
					}
				}

				let recommendBrands = [];
				for(let data of this.recommendStandard){
					if(selectedData == data.city){
						recommendBrands = data.brands;
					}
				}

				let i=0;
				while(i<this.recommendData.length){
					let isDelete = true;
					for(let brand of recommendBrands){
						if(this.recommendData[i].brand == brand){
							isDelete = false;
						}
					}
					if(isDelete){
						this.recommendData.splice(i, 1)
						i = 0;
						continue;
					}
					i++;
				}
			}
		}
	}
</script>

<template>
	<div class="main-warpper">
	<h1>资源推荐</h1>
	<h4>推荐区域优势品牌</h4>
	<div class="posi">

		<el-button v-model="contrast" class="recommendItem" size="small" @click="getcontrastItem()">品牌对比</el-button>
		<div v-if="contrast" >
			<template v-for="data in diffBrand">
				<el-select v-model="data.selected" @change="addInput" >
					<el-option
					      v-for="item in allBrands"
					      :label="item.text"
					      :value="item.value">
					</el-option>
				</el-select>
				<br/>
			</template>
			<el-button size="small" type="success" @click="startDiff()">开始对比</el-button>
			<el-button size="small" @click="clean()">清空</el-button>
		</div>
	</div>
		<br>
		<div class="controller-box" ><br>
			<span>广东省 : </span>
			<el-select size="small" v-model="searchCity">
				<el-option v-for="item in recommendStandard" :label="item.city" :value="item.city"></el-option>
			</el-select>
			<el-button size="small" type="default" @click="resetList()">重置</el-button>
		</div>
		<br>
		<h4>区域优秀品牌推荐：</h4>
		<el-table :data="recommendData" v-if="recommendData.length" border>
			<el-table-column label="品牌"
			:filters="filtersOfBrands"
			:filter-method="filterBrands"
			prop="brand"
			width="100"
			 ></el-table-column>
			<el-table-column label="规格" width="260">
				<template scope="scope">
					<p v-for="item in scope.row.type">
						{{item.name}}<br/>
						<template v-if="item.value.length!=0">
							抗震: <span v-for="data in item.value">{{ data + ',' }}</span> <br/>
						</template>
						<template v-if="item.value2.length!=0">
							非抗震: <span v-for="_data in item.value2">{{ _data + ',' }}</span>
						</template>
					</p>
				</template>
			</el-table-column>
			<!-- <el-table-column label="货源" prop="source"></el-table-column> -->
			<el-table-column label="运费" prop="freight" width="100px">
				<template scope="scope">
					{{ scope.row.transport.transport_price }}
				</template>
			</el-table-column>
			<el-table-column label="发货方式" prop="delivery">
				<template scope="scope">
					{{ scope.row.transport.type==1 ? "物流承运" : "钢厂直送" }}
				</template>
			</el-table-column>
			<el-table-column label="近3个月价格水平" width="400">
				<template scope="scope">
					<template>
						<div :id="scope.row.id" :style="{width:'380px',height:'240px'}"  v-show="initCharts(scope.row)"></div>
					</template>
				</template>
			</el-table-column>
			<el-table-column>
				<template scope="scope">
						<el-button @click="addBrand(scope.row.brand)">+对比</el-button>
				</template>
			</el-table-column>
		</el-table>
		<div v-else v-loading.body="true" style="width:100%;height:300px;"></div>

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
		color:#888;
	}
	.el-input{
		width: 120px;
	}
	.scroll{
		width: 150px;
		height: 150px;
		overflow: scroll;
	}
	.img{
		width: 300px;
		height: 400px;
	}
	.recommendItem{
		background-color: #f80;
		color : #fff;
	}
	.posi{
		width: auto;
		height: 300px;
		position: fixed;
		right: 0%;
		top: 10%;
		z-index: 1;
	}
	.contrastBox{
		background-color: red;
	}
	.el-table{
		width: 100%;
	}
	.toLine{
		margin: 1px 10px;
		float: left;
	}
</style>
