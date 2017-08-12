<script>
	import headbar from "../components/agent-header.vue";
	import titleBox from "../components/title-box.vue";
	import ajaxCustom from '../components/ajax-custom.js';
	import addsInput from '../components/adds-input.vue';
	import { Input, Select, Option, RadioGroup, Radio, DatePicker, Button, CheckboxGroup, Checkbox, Table, TableColumn, Tooltip} from 'element-ui';
	export default{
		components : {
			headbar,
			titleBox,
			addsInput,
			elInput : Input,
			elSelect : Select,
			elOption : Option,
			elRadioGroup : RadioGroup,
			elRadio : Radio,
			elDatePicker : DatePicker,
			elButton : Button,
			elCheckboxGroup : CheckboxGroup,
			elCheckbox : Checkbox,
			elTable : Table,
			elTableColumn : TableColumn,
			elTooltip : Tooltip,
		},
		created(){
			this.getBrands();
		},
		data(){
			return {
				city : '',
				upper_limit : null||5,
				floor_limit : null||5,
				// 选中的当前品牌
				brands : '',
				// 品牌数据源
				brandData : [],
				// 选中的当前品名
				product : '',
				// 品名数据源
				productGroup : [],
				// 选中的当前规格
				type : '',
				// 规格数据源
				typeGroup : [],
				// 选中的当前材质
				material : '',
				// 材质数据源
				materialGroup : [],
				// 时间段/时间点
				searchWay : 1,
				timeSlot : true,
				timePoint : false,
				//禁止选中日期（今日之后的日期）
                pickerOptions: {
                    disabledDate(time) {
                        return time.getTime() > Date.now() ;
                    }
                },
                // 选择时间段
                foremost : null,
                final : null,
                // 选择时间点
                forePoint : null,
                // 表格数据
                tableData : [
					{
						brand : "广钢",
						product : "螺纹钢",
						size : "18-25",
						material : "HRB400E",
						marketDiff : [28, 25, 25],
						// todayMarDiff : 29,
						// weekMarDiff : 25,
						// monMarDiff : 25,
						avgDiff : [26, 25, 25],
						// todayAvgDiff : 29,
						// weekAvgDiff : 29,
						// monAvgDiff : 29,
						// todayWebAvg : 29,
						// weekWebAvg : 29,
						// monWebAvg : 29,
						webAvg : [3300, 3320, 3300] 
					},
					{
						brand : "韶钢",
						product : "螺纹钢",
						size : "18-25",
						material : "HRB400E",
						marketDiff : [20, 25, 25],
						// todayMarDiff : 29,
						// weekMarDiff : 25,
						// monMarDiff : 25,
						avgDiff : [22, 25, 25],
						// todayAvgDiff : 29,
						// weekAvgDiff : 29,
						// monAvgDiff : 29,
						// todayWebAvg : 29,
						// weekWebAvg : 29,
						// monWebAvg : 29,
						webAvg : [3300, 3320, 3300] 
					},
					{
						brand : "粤钢",
						product : "螺纹钢",
						size : "18-25",
						material : "HRB400E",
						marketDiff : [27, 25, 25],
						// todayMarDiff : 29,
						// weekMarDiff : 25,
						// monMarDiff : 25,
						avgDiff : [23, 25, 25],
						// todayAvgDiff : 29,
						// weekAvgDiff : 29,
						// monAvgDiff : 29,
						// todayWebAvg : 29,
						// weekWebAvg : 29,
						// monWebAvg : 29,
						webAvg : [3300, 3320, 3300] 
					}
                ],
                marketDiff : true,
                avgDiff : true,
                webAvg : true,
                isShowOptions : false,
			}
		},
		methods : {
			// 获取城市
			getCity(adds){
				this.city = adds.city;
				console.log(this.city);
			},
			searchData(){
				let data = {};
				if(this.foremost !=undefined && this.final != undefined){
					if(this.material != ''){
						let foremost = new Date(this.foremost);
						let final = new Date(this.final);
						data.foremostDate = foremost.getTime()/1000;
						data.finalDate = final.getTime()/1000 + 86400;
						// data.upper_limit = this.upper_limit;
						// data.floor_limit = this.floor_limit;
						data.brand = this.brands.name;
						data.product = this.product.name;
						data.type = this.type.name;
						data.material = this.material;
						console.log(data);
						ajaxCustom.ajaxPost(this, "dingoapi/seachHistoryPrice", {data}, (response)=>{
							console.log(response);

						}, (response)=>{
							console.log(response);
						});
					}
				}
			},
			getAvg(arr){
				let sum = 0;
				let undefinedCount = 0;
				for(let i = 0 ; i < arr.length;i++){
					if(arr[i] != undefined){
						sum += arr[i];
					}else{
						undefinedCount++;
					}
				}
				if(undefinedCount == arr.length){
					alert("暂无数据");
				}
				let avg = parseInt(sum/(arr.length - undefinedCount));
				return avg;
			},
			// 获取品牌
			getBrands(){
				ajaxCustom.ajaxGet(this, 'dingoapi/getFactorys', (response)=>{
					console.log(response);
					let brands = response.body.data;
					this.brandData = [];
					for(var i = 0; i < brands.length; i++){
						this.brandData.push({ 'name' : brands[i].brand });
					}
				}, (response)=>{
					console.log(response);
				});
			},
			// 获取品名
			getBrandsProduct(brand){
				this.product = "";
				if(brand){
					ajaxCustom.ajaxPost(this, "dingoapi/getProductsData", {brand :brand.name}, (response)=>{
						console.log(response);
						brand.product = null;
						let productData = response.body.data;
						for(let i = 0; i < productData.length;i++){
							this.getProductsData(brand, productData[i]);
						}
						this.productGroup = brand.product;
					}, (response)=>{
						console.log(response);
					});
				}
			},
			// 获取规格
			getProductsData(brand, data){
				if(brand.product == null){
					brand.product = [{ name : data.product, type : [{ name : data.type, material : [data.material]}] }];
				}else{
					for(let i = 0; i < brand.product.length; i++ ){
						if(brand.product[i].name == data.product){
							this.getTypeData(brand.product[i], data);
							return;
						}
					}
					brand.product.push({ name : data.product, type : [{ name : data.type, material : [data.material]}]});
				}
			},
			// 获取材质
			getTypeData(product, data){
				for(let i = 0; i < product.type.length; i++){
					if(product.type[i].name == data.type){
						this.getMaterialData(product.type[i], data);
						return;
					}
				}
				product.type.push({ name : data.type, material : [data.material]});
			},
			getMaterialData(type, data){
				type.material.push(data.material);
			},
			// 改变规格
			changeProduct(product){
				this.type = '';
				this.typeGroup = product.type;
			},
			// 改变材质
			changeType(type){
				this.material = '';
				this.materialGroup = type.material;
			},
			changeMaterial(){
				console.log(this.brands, this.product, this.type, this.material);
				this.searchData();
			},
			// 时间段
			foreDate(foremost){
				if(foremost){
					foremost = this.dateFormat(foremost);
					console.log(foremost);
				}
			},
			finalDate(final){
				if(final){
					final = this.dateFormat(final);
					console.log(final);
				}
			},
			// 时间点
			forePointDate(forePoint){
				if(forePoint){
					forePoint = this.dateFormat(forePoint);
					console.log(forePoint);
				}
			},
			// 清空数据函数
			clearAllData(){
				this.brands = '';
				this.productGroup = '';
				this.foremost = '';
				this.final = '';
				this.forePoint = '';
			},
			// 控制左边的弹出框
			showBox(){
				this.isShowOptions = !this.isShowOptions;
			},
			// 对数据进行排序
			sortTable(methods){
				if( methods == "asce" ){
					this.tableData.sort(function(a, b){
						return a - b;
					});
				}else{
					this.tableData.sort(function(a, b){
						return b - a;
					});
				}
			},
			//日期对象格式化
			dateFormat(date){
				var year = date.getFullYear();
				var month = (date.getMonth()+1).toString();
				var day = (date.getDate()).toString();
				if(month.length == 1){
					month = '0' + month;
				}
				if(day.length == 1){
					day = '0' + day;
				}
				var dateTime = year + "-" + month + "-" +day;
				return dateTime;
			},
		},
	}
</script>
<template>
	<div>
		<headbar :active_number="3"></headbar>
		<div class="main-warpper">
			<title-box :text="['资源推荐','推荐区域优势品牌']"></title-box>
			<div>
				<span>选择送达地区: 广东省</span>
				<adds-input province="广东" @change="getCity"></adds-input>
			</div>
			<div style="margin-top:20px;">
				<span>
					<b>显示项:</b>
				</span>
				<el-checkbox label="平均包到价差" v-model="marketDiff"></el-checkbox>
				<el-checkbox label="平均价差" v-model="avgDiff"></el-checkbox>
				<el-checkbox label="平均网价" v-model="webAvg"></el-checkbox>
				<span style="float:right">单位:元/吨</span>

				<!-- <el-table :data="tableData" border style="margin-top:20px;">
					<el-table-column prop="brand" label="推荐品牌"></el-table-column>
					<el-table-column prop="product" label="品名"></el-table-column>
					<el-table-column prop="size" label="规格"></el-table-column>
					<el-table-column prop="material" label="材质" width="100"></el-table-column>
					<el-table-column label="到货平均价差(网价：到货价)" >
						<el-table-column label="今日" prop="todayMarDiff"></el-table-column>
						<el-table-column label="近一周" prop="weekMarDiff"></el-table-column>
						<el-table-column label="近一月" prop="monMarDiff"></el-table-column>
					</el-table-column>
					<el-table-column label="广州仓平均价差(网价：现货价)" >
						<el-table-column label="今日" prop="todayAvgDiff"></el-table-column>
						<el-table-column label="近一周" prop="weekAvgDiff"></el-table-column>
						<el-table-column label="近一月" prop="monAvgDiff"></el-table-column>
					</el-table-column>
					<el-table-column label="平均网价" >
						<el-table-column label="今日" prop="todayWebAvg"></el-table-column>
						<el-table-column label="近一周" prop="weekWebAvg"></el-table-column>
						<el-table-column label="近一月" prop="monWebAvg"></el-table-column>
					</el-table-column>
				</el-table> -->

				<!-- table数据 -->
				<table>
					<thead>
						<tr>
							<th rowspan="2">推荐品牌</th>
							<th rowspan="2">品名</th>
							<th rowspan="2">规格</th>
							<th rowspan="2">材质</th>
							<th colspan="3" v-if="marketDiff">到货平均价差
								 <el-tooltip class="item" content="平均包到价差 =选中日期内,网价与市场包到价之差的平均数" placement="top">
									<span>(网价:到货价)</span>
								</el-tooltip>
							</th>
							<th colspan="3" v-if="avgDiff">广州仓平均价差
								<el-tooltip class="item" style="font-weight:none;" content="平均价差 =选中日期内,网价与市场价之差的平均数" placement="top">
									<span>(网价:现货价)</span><span style="display:inline-block;width:20px;background:#dedede;border-radious:50%;">?</span>
								</el-tooltip>
							</th>
							<th colspan="3" v-if="webAvg">平均网价</th>
						</tr>
						<tr>
							<template v-if="marketDiff">
								<td>今日</td>
								<td>近一周</td>
								<td>近一月</td>
							</template>
							<template  v-if="avgDiff">
								<td>今日</td>
								<td>近一周</td>
								<td>近一月</td>
							</template>
							<template v-if="webAvg">
								<td>今日</td>
								<td>近一周</td>
								<td>近一月</td>
							</template>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in tableData">
							<td><a href="#">{{item.brand}}</a></td>
							<td>{{item.product}}</td>
							<td>{{item.size}}</td>
							<td>{{item.material}}</td>
							<td v-for="data in item.marketDiff" v-if="marketDiff">{{data}}</td>
							<td v-for="data in item.avgDiff" v-if="avgDiff">{{data}}</td>
							<td v-for="data in item.webAvg" v-if="webAvg">{{data}}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<!-- 固定框 -->
		<div class="fixBox">
			<button id="onBox" @click="showBox">点击展开更多
				<i class="el-icon-arrow-right" style="color:#FF4949;font-size:20px;"></i>
			</button>
			<div id="selectBox" v-show="isShowOptions">
				<div>
					<p>
						<span class="fixWidth">剔除异常数据:</span>
						<span>上限
							<el-input type="number" v-model="upper_limit" style="width:60px;" size="small"></el-input>%,
						</span>
						<span>下限
							<el-input type="number" v-model="floor_limit" style="width:60px;" size="small"></el-input>%,
						</span>
					</p>
					<p>
						<span class="fixWidth">品牌:</span>
						<el-select v-model="brands" @change="getBrandsProduct(brands)">
							<el-option v-for="item in brandData" :label="item.name" :value="item"></el-option>
						</el-select>
					</p>
					<p>
						<span class="fixWidth">品名:</span>
						<el-select v-model="product" @change="changeProduct(product)">
							<el-option v-for="item in productGroup" :label="item.name" :value="item"></el-option>
						</el-select>
					</p>
					<p>
						<span class="fixWidth">规格:</span>
						<el-select v-model="type" @change="changeType(type)">
							<el-option v-for="item in typeGroup" :label="item.name" :value="item"></el-option>
						</el-select>
					</p>
					<p>
						<span class="fixWidth">材质:</span>
						<el-select v-model="material" @change="changeMaterial(product)">
							<el-option v-for="item in materialGroup" :label="item.name" :value="item"></el-option>
						</el-select>
					</p>
					<p>
						<span class="fixWidth">查询方式:</span>
						<!-- <el-radio-group v-model="searchWay">
							<el-radio :label="1">时间段</el-radio>
							<el-radio :label="2">时间点</el-radio>
						</el-radio-group> -->
						<el-checkbox label="时间段" v-model="timeSlot"></el-checkbox>
						<el-checkbox label="时间点" v-model="timePoint"></el-checkbox>
					</p>
					<!-- <p v-if="searchWay ==1"> -->
					<p v-if="timeSlot">
						<span class="fixWidth">选择时间段:</span>
						<el-date-picker v-model="foremost" type="date" :picker-options="pickerOptions" style="width:150px;" @change="foreDate(foremost)"></el-date-picker>
						<el-date-picker v-model="final" type="date" :picker-options="pickerOptions" style="width:150px;" @change="finalDate(final)"></el-date-picker>
					</p>
					<!-- <p v-if="searchWay ==2"> -->
					<p v-if="timePoint">
						<span class="fixWidth">选择时间点:</span>
						<el-date-picker v-model="forePoint" type="date" :picker-options="pickerOptions"  @change="forePointDate(forePoint)"></el-date-picker>
					</p>
					<p style="text-align:center;">
						<el-button @click="clearAllData">清空数据</el-button>
					</p>
				</div>
				<button id="offBox" @click="showBox">数据统计分析
					<i class="el-icon-arrow-left" style="color:#58B7FF;font-size:20px;"></i>
				</button>
			</div>
		</div>
		
		

	</div>
</template>
<style scoped>
	.main-warpper{
		width: 80%;
		margin:0 auto;
	}
	#selectBox{
		position: relative;
		width: 450px;
		height: 550px;
		border: 1px solid #dedede;
		margin-top: 20px;
		background: rgba(228,228,228,1);
	}
	#selectBox p{
		margin-top: 20px;
	}
	.fixWidth{
		display: inline-block;
		width: 90px;
		margin-left: 20px;
	}
	.el-checkbox{
		margin-left: 20px;
	}
	.fixBox{
		position: absolute;
		left: 0;
		top:350px;
		z-index: 2;
	}
	#offBox{
		position: absolute;
		right: -40px;
		top: 0;
		display: inline-block;
		width: 20px;
		height: 200px;
		border:1px solid #58B7FF;
		padding: 20px 30px 10px 10px;
		text-align: center;
		font-size: 18px;
		color: #fff;
		background: rgba(204,204,204,1);
	}
	#onBox{
		position: absolute;
		left: 0;
		top: 25px;
		display: inline-block;
		width: 20px;
		height: 200px;
		border:1px solid #FF4949;
		padding: 20px 30px 10px 10px;
		text-align: center;
		font-size: 18px;
		color: #fff;
		background: rgba(204,204,204,1);
	}
	table{
		margin-top: 20px;
		width: 100%;
	    table-layout: fixed;
	    border-collapse:collapse;
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
</style>