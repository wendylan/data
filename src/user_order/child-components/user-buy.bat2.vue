<script>
	import titleBox from '../../components/title-box.vue';
	import ajaxCustom from '../../components/ajax-custom.js';
	import multiple from '../../components/multiple.vue';
	import projectCreate from '../../components/ProjectCreating/project-creating-box.vue';
	import addressUi from '../../components/adds-input.vue';
	import { Select, Option, Button, Radio, Table, TableColumn, DatePicker, Input, Dialog} from 'element-ui';
	export default{
		components : {
			ajaxCustom,
			titleBox,
			multiple,
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
			this.getAllBrands();
			this.getAllProjects();
			// this.report.date = this.dateFormat(new Date());
			// this.getPriceByDate(this.report.date);
			this.report.date = '2017-06-06';
			this.getPriceByDate('2017-06-06');
		},
		data(){
			return{
				isCreateProject : false,
				showPlan : false,
				// 现货价/包到价
				priceWay : '1',
				// 项目地址
				selectCity : null,
				selectArea : null,
				// 品牌
				allBrands : {
					item : [],
					selected : null
				},
				// 项目
				userProject : {
					item : [],
					selected : null
				},
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
				// 显示的表格数据
				allPriceDatas : [],
				tableDatas : [],
				filterArr : {
					cate_spec : [],
					size : [],
					material : [],
					brand : [],
					warehouse : [],
					inventory : []
				},
				// 过滤数据
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
					brand : [],
					warehouse : [],
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
				webPrice : [],
				buyData : {
					rebarData : [],
					transport : {
						way : null,
						message : [
							{
								carNum : null,
								people : null,
								tel : null,
								IDCard : null
							}
						]
					},
				}
			}
		},
		methods : {
			/*table过滤器信息获取*/
			getFiltersData(data){
				let filters = this.allFilters;
				for (var i = 0; i < data.length; i++) {
						this.getFilter(filters.size,data[i].size);
						this.getFilter(filters.material,data[i].material);
						this.getFilter(filters.brand,data[i].brand);
						this.getFilter(filters.warehouse,data[i].warehouse);
				}
			},
			getFilter(filter,data){
				for (var i = 0; i < filter.length; i++) {
					if(filter[i].text == data){
						return ;
					}
				}
				filter.push({'text':data,'value':data});
			},
			productFilter(value, row){
				return row.cate_spec === value;
			},
			typeFilter(value, row){
				return row.size === value;
			},
			materialFilter(value, row){
				return row.material === value;
			},
			brandsFilter(value, row){
				return row.brand === value;
			},
			wareFilter(value, row){
				return row.warehouse === value;
			},
			inventoryFilter(value,row){
				return row.inventory === value;
			},
			numChangeText(num){
				if(num == 0){ return "首次"; }
				else if(num == 1){ return "二次" }
				else if(num == 2){ return "三次" }
				else if(num == 3){ return "四次" }
			},
			getAllBrands(){
				ajaxCustom.ajaxGet(this,"api/getAllBrandsWillHeader",(response)=>{
					this.allBrands.item = response.body;
				},(response)=>{
					console.log(response);
				});
			},
			getAllProjects(){
				ajaxCustom.ajaxGet(this,"api/getProjectOrder",(response)=>{
					let project = response.body.project;
					for(let pro of project){
						this.userProject.item.push(pro.project_name);
					}
				},(response)=>{
					console.log(response);
				});
			},
			getWebPriceData(date){
				ajaxCustom.ajaxGet(this,"dingoapi/getWebPriceByDate",{ params : { date : date} },(response)=>{
					console.log(response);
					this.webPrice = response.body.data;
					this.addWebPrice(this.webPrice,this.tableDatas);
				},(response)=>{
					console.log(response);
				});
			},
			getAddress(data){
				this.selectCity = data.city;
				this.selectArea = data.area;
				ajaxCustom.ajaxGet(this,'dingoapi/getFreightByCity',{ params : { city : this.selectCity, area : this.selectArea }},(response)=>{
					console.log(response);
					var mill = response.body.data.mill;
					var warehouse = response.body.data.warehouse;
					for(let data of this.tableDatas){
						if(data.transport ==="广州仓发货"){
							data.transport_price = Math.round(warehouse);
							data.total_price = parseInt(data.price) + parseInt(data.transport_price);
							let diff_price = parseInt(data.web_price) - parseInt(data.total_price);
							data.diff_price = isNaN(diff_price) ? "-" : diff_price;
						}else{
							data.transport_price = Math.round(mill);
							data.total_price = parseInt(data.price) + parseInt(data.transport_price);
							let diff_price = parseInt(data.web_price) - parseInt(data.total_price);
							data.diff_price = isNaN(diff_price) ? "-" : diff_price;
						}
					}
				},(response)=>{
					console.log(response);
				});
			},
			selectBrandData(brand){
				let searchData = [];
				var tempData = JSON.parse(JSON.stringify(this.tableDatas));
				for(let data of tempData){
					if(data.brand == brand){
						searchData.push(data);
					}
				}
				this.tableDatas = searchData;
			},
			// sortTable(event, key){
			// 	this.filterArr[key] = event;
			// 	console.log(this.filterArr);

			// 	let filter = this.filterArr;
			// 	var lineArr = [];
			// 	for(let i = 0; i<filter.brand.length; i++){
			// 		for(let k = 0; k<filter.cate_spec.length; k++){
			// 			for(let j = 0; j<filter.inventory.length; j++){
			// 				for(let g = 0; g<filter.material.length; g++){
			// 					for(let s = 0; s<filter.size.length; s++){
			// 						for(let b = 0; b<filter.warehouse.length; b++){
			// 							let ares = [filter.brand[i],filter.cate_spec[k],filter.inventory[j],filter.material[g],filter.size[s],filter.warehouse[b]];
			// 							lineArr.push(ares);
			// 						}
			// 					}
			// 				}
			// 			}
			// 		}
			// 	}
			// 	console.log(lineArr);
			// 	let data = this.tableDatas;
			// 	for(let data of this.tableDatas){
			// 		for(let temp of lineArr){
			// 			let count = 0;
			// 			for(let value of temp){
			// 				if((data.brand == value) | (data.cate_spec == value) | (data.inventory == value) | (data.material == value) | (data.size == value) | (data.warehouse == value)){
			// 					count++;
			// 				}
			// 			}
			// 			if(count == temp.length){
			// 				data.display = true;
			// 				break;
			// 			}
			// 		}
			// 	}
			// },

			sortTable(event, key){
				this.filterArr[key] = event;

				// 清空选项时 重置表格
				if(!this.filterArr.cate_spec.length && !this.filterArr.material.length && !this.filterArr.size.length && !this.filterArr.brand.length && !this.filterArr.warehouse.length && !this.filterArr.inventory.length){
					for(let _data of this.tableDatas){
						_data.display = true;
					}

				}else{
					for(let _data of this.tableDatas){
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
					// console.log(figureOutGroup);
					// 显示符合条件的数据
					for(let lineData of this.tableDatas){
						for(let temp of figureOutGroup){
							let fitingCount = 0;
							for(let value of temp){
								if( (lineData.cate_spec==value) | (lineData.size==value) | (lineData.material==value) | (lineData.brand==value) | (lineData.warehouse==value) | (lineData.inventory==value) ){
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
				console.log(list);
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
			sortTableLine(methods,key){
				if( methods == "asce" ){
					this.tableDatas.sort(function(a,b){
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
					this.tableDatas.sort(function(a,b){
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
			//日期对象格式化
			dateFormat(date){
				var year =date.getFullYear();
				var month = (date.getMonth()+1).toString();
				var day =(date.getDate()).toString();
				if(month.length == 1){
					month = '0'+month;
				}
				if(day.length ==1){
					day = '0'+day;
				}
				var dateTime =year+"-"+month+"-"+day;
				return dateTime;
			},
			// 根据日期获取数据和次序
			getPriceByDate(date){
				console.log(date);

				if(date){
					ajaxCustom.ajaxGet(this,"dingoapi/getSoptPrice",{ params : { date : date} },(response)=>{
						console.log(response);
						if(response.body.length >= 1){
							this.allPriceDatas = response.body;
							this.tableDatas = this.allPriceDatas[this.allPriceDatas.length-1];
							this.report.timesOptions = this.allPriceDatas;
							this.report.times = this.numChangeText(this.allPriceDatas.length - 1);
							this.getFiltersData(this.tableDatas);
							this.getWebPriceData(date);
						}else{
							alert("暂无数据");
							console.log(response);
							this.tableDatas = [];
						}
					},(response)=>{
						console.log(response);
						this.tableDatas = [];
					});
				}
			},
			addWebPrice(webPrice,tableData){
				for(let data of tableData){
						data.display = true;
						data.num = 0;
						for(let _data of webPrice){
							if(data.cate_spec == _data.product && data.brand == _data.brands && data.size == _data.type && data.material == _data.material){
								data.web_price = isNaN(_data.web_price) ? "-" : _data.web_price;
								let diff_price = parseInt(data.web_price) - parseInt(data.price);
								data.diff_price = isNaN(diff_price) ? "-" : diff_price;
							}
						}
						if(isNaN(data.web_price)){
							data.web_price = "-";
							data.diff_price = "-";
						}
					}
			},
			showTableDatas(id){
				let priceData = this.allPriceDatas;
				for(let i=0; i<priceData.length;i++){
					if(priceData[i][0].parent_id === id){
						this.tableDatas = priceData[i];
					}
				}
				this.addWebPrice(this.webPrice,this.tableDatas);
			},
			showOrder(){
				this.showPlan = true;
				this.buyData.rebarData = [];
				for(let data of this.tableDatas){
					if(data.num){
						this.buyData.rebarData.push(data);
					}
				}
				console.log(this.buyData);
			},
			addCar(){
				this.buyData.transport.message.push(
						{
							carNum : null,
							people : null,
							tel : null,
							IDCard : null
						}
					);
			},
			delCar(index){
				let mess = this.buyData.transport.message;
				if(mess.length >1){
					mess.splice(index,1);
				}
			},
			finishOrder(){
				this.showPlan = false;
				console.log(this.buyData);
			}
		},
		mounted(){
			
		},
	}
</script>
<template>
	<div>
		<project-create v-if="isCreateProject==true"></project-create>
		<div class="main-warpper">
			<title-box :text="['买买买','钢材现货购买']"></title-box>
			<div>
				<div>
					<span><b>选择品牌:</b></span>
					<el-select size="small" placeholder="请选择" v-model="allBrands.selected" @change="selectBrandData">
						<el-option v-for="brand in allBrands.item" :label="brand" :value="brand"></el-option>
					</el-select>
					<span class="margin-left"><b>选择项目:</b></span>
					<el-select size="small" placeholder="请选择" v-model="userProject.selected">
						<el-option v-for="pro in userProject.item" :label="pro" :value="pro"></el-option>
					</el-select>
					<el-button size="small" @click="isCreateProject=true">新建</el-button>
					<span class="margin-left"><b>送达地址:</b></span>
					<address-ui province="广东" grade="1" @getAddressData="getAddress"></address-ui>
					<span style="color:red">(请选择品牌、选择/新建项目或选择送达地址获取包到价)</span>
				</div>
				<div style="margin-top:20px;font-size:16px;">
					<span><b>显示项:</b></span>
					<el-radio v-model="priceWay" label="1">现货价</el-radio>
					<el-radio v-model="priceWay" label="2">包到价</el-radio>
					<div style="float:right;">
						<el-date-picker v-model="report.date" type="date" placeholder="选择日期" :picker-options="report.pickerOptions" @change="getPriceByDate" size="small"></el-date-picker>
					    <el-select placeholder="报价次序" v-model="report.times" @change="showTableDatas" size="small">
							<el-option v-for="(item, index) in report.timesOptions" :value="item[index].parent_id" :label="numChangeText(index)"></el-option>
						</el-select>
					</div>
				</div>
				<div style="text-align:center;margin-top:20px;" v-if="priceWay ==1">
					<el-table :data="tableDatas" border max-height="400">
						<el-table-column prop="cate_spec" label="品名"
						:filters="allFilters.cate_spec" :filter-method="productFilter">
						</el-table-column>
						<el-table-column prop="brand" label="钢厂/品牌"
						:filters="allFilters.brand" :filter-method="brandsFilter">
						</el-table-column>
						<el-table-column prop="size" label="规格"
						:filters="allFilters.size" :filter-method="typeFilter">
						</el-table-column>
						<el-table-column prop="material" label="材质"
						:filters="allFilters.material" :filter-method="materialFilter">
						</el-table-column>
						<el-table-column prop="web_price" label="网价" sortable></el-table-column>
						<el-table-column prop="price" label="现货价" sortable></el-table-column>
						<el-table-column prop="diff_price" label="差价" sortable></el-table-column>
						<el-table-column prop="warehouse" label="仓库"
						:filters="allFilters.warehouse" :filter-method="wareFilter">
						</el-table-column>
						<el-table-column prop="inventory" label="库存" 
						:filters="allFilters.inventory" :filter-method="inventoryFilter">
						</el-table-column>
						<el-table-column label="输入数量">
							<template scope="scope">
								<el-input type="number" min='0' size="small" v-model="scope.row.num"></el-input>
							</template>
						</el-table-column>
					</el-table>
					<el-button size="large" type="primary" @click="showOrder" style="margin-top:20px;">生成订单</el-button>
				</div>

				<table v-if="priceWay==2 && selectCity && selectArea ">
					<thead>
						<tr>
							<th rowspan="2">
								<multiple name="品名" :options="allFilters.cate_spec" v-on:selectedArr="sortTable($event, 'cate_spec')"></multiple>
							</th>
							<th rowspan="2">
								<multiple name="钢厂/品牌" :options="allFilters.brand" v-on:selectedArr="sortTable($event, 'brand')"></multiple>
							</th>
							<th rowspan="2">
								<multiple name="规格" :options="allFilters.size" v-on:selectedArr="sortTable($event, 'size')"></multiple>
							</th>
							<th rowspan="2">
								<multiple name="材质" :options="allFilters.material" v-on:selectedArr="sortTable($event, 'material')"></multiple>
							</th>
							<th rowspan="2">网价
								<div class="sort-icon">
									<div @click="sortTableLine('asce', 'web_price')">▲</div>
									<div @click="sortTableLine('desc', 'web_price')" style="margin-top:-7px;">▼</div>
								</div>
							</th>
							<th colspan="3">现货包到价</th>
							<th rowspan="2" title="差价的结果是网价减去包到价">差价？
								<div class="sort-icon">
									<div @click="sortTableLine('asce', 'diff_price')">▲</div>
									<div @click="sortTableLine('desc', 'diff_price')" style="margin-top:-7px;">▼</div>
								</div>
							</th>
							<th rowspan="2">
								<multiple name="仓库" :options="allFilters.warehouse" v-on:selectedArr="sortTable($event, 'warehouse')"></multiple>
							</th>
							<th rowspan="2">
								<multiple name="库存" :options="allFilters.inventory" v-on:selectedArr="sortTable($event, 'inventory')"></multiple>
							</th>
							<th rowspan="2">
								<template>
									<p>输入数量</p>
									<el-button size="mini" type="primary" @click="showOrder">生成订单</el-button>
								</template>
							</th>
						</tr>
						<tr>
							<th>单价
								<div class="sort-icon">
									<div @click="sortTableLine('asce', 'price')">▲</div>
									<div @click="sortTableLine('desc', 'price')" style="margin-top:-7px;">▼</div>
								</div>
							</th>
							<th>运费
								<div class="sort-icon">
									<div @click="sortTableLine('asce', 'transport_price')">▲</div>
									<div @click="sortTableLine('desc', 'transport_price')" style="margin-top:-7px;">▼</div>
								</div>
							</th>
							<th>总价
								<div class="sort-icon">
									<div @click="sortTableLine('asce', 'total_price')">▲</div>
									<div @click="sortTableLine('desc', 'total_price')" style="margin-top:-7px;">▼</div>
								</div>
							</th>
						</tr>
					</thead>
					<tbody class="max_height">
						<tr v-for="data in tableDatas">
							<template v-if="data.display">
								<td>{{ data.cate_spec }}</td>
								<td>{{ data.brand }}</td>
								<td>{{ data.size }}</td>
								<td>{{ data.material }}</td>
								<td>{{ data.web_price }}</td>
								<td>{{ data.price }}</td>
								<td>{{ data.transport_price }}</td>
								<td>{{ data.total_price }}</td>
								<td>{{ data.diff_price }}</td>
								<td>{{ data.warehouse }}</td>
								<td>{{ data.inventory }}</td>
								<td><el-input type="number" min='0' size="small" v-model="data.num"></el-input></td>
							</template>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- 生成订单的弹出框开始 -->
			<el-dialog v-model="showPlan" title="计划单" style="text-align:center;" size="large">
				<p style="float:right;"><b>编号:</b>采20170717-1项目简称</p>
				<table>
					<thead>
						<tr>
							<th>序号</th>
							<th>品牌</th>
							<th>品名</th>
							<th>规格</th>
							<th>材质</th>
							<th>仓库</th>
							<th>含税单价<br>(元)</th>
							<th>计划吨数<br>(吨)</th>
							<th>总价<br>(元)</th>
							<th v-if="buyData.transport.way ==2">车号</th>
							<th>备注</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for=" (data,index) in buyData.rebarData">
							<td>{{ index }}</td>
							<td>{{ data.brand }}</td>
							<td>{{ data.cate_spec }}</td>
							<td>{{ data.size }}</td>
							<td>{{ data.material }}</td>
							<td>{{ data.warehouse }}</td>
							<td>{{ data.price }}</td>
							<td>
								<el-input type="number" size="small" min="0" :value="data.num" v-model="data.num" style="width:50px;"></el-input>
							</td>
							<td>{{ data.total_price }}</td>
							<td v-if="buyData.transport.way == 2">
								<el-input type="text"></el-input>
							</td>
							<td>
								<el-input type="text" size="small"></el-input>
							</td>
						</tr>
					</tbody>
				</table>
				<!-- <el-table :data="buyData.rebarData" border show-summary>
					<el-table-column label="序号" width="80">
						<template scope="scope">{{scope.$index}}</template>
					</el-table-column>
					<el-table-column prop="brand" label="钢厂/品牌"></el-table-column>
					<el-table-column prop="cate_spec" label="品名"></el-table-column>
					<el-table-column prop="size" label="规格" width="80"></el-table-column>
					<el-table-column prop="material" label="材质"></el-table-column>
					<el-table-column prop="warehouse" label="仓库"></el-table-column>
					<el-table-column prop="web_price" label="含税单价"></el-table-column>
					<el-table-column label="计划吨数">
						<template scope="scope">
							<el-input type="number" min='0' size="small" ></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="price" label="总价"></el-table-column>
					<el-table-column label="车号" width="100">
						<template scope="scope">
							<el-input type="text" min='0' size="small"></el-input>
						</template>
					</el-table-column>
					<el-table-column label="备注" width="100">
						<template scope="scope">
							<el-input type="text" min='0' size="small"></el-input>
						</template>
					</el-table-column>
				</el-table> -->
				<br>
				<div style="text-align:left;">
					<label>
						<b>物流信息</b>(可在后续操作中补录)
					</label>
					<p>
						<span>运输方式:</span>
						<el-select placeholder="请选择" v-model="buyData.transport.way" size="small">
							<el-option label="买方自提" :value="1"></el-option>
							<el-option label="卖方承运" :value="2"></el-option>
						</el-select>
						<el-button size="small" @click="addCar" v-if="buyData.transport.way == 2">新加车号</el-button>
						<div v-if="buyData.transport.way == 2" v-for="(item,index) in buyData.transport.message " >
							<p>
								<span>车号:</span>
								<el-input type="text" v-model="item.carNum" style="width:30%;margin-right:30px;" size="small"></el-input>

								<span>联系电话:</span>
								<el-input type="text" v-model="item.tel" style="width:30%;" size="small"></el-input>
							</p>
							<p>
								<span>司机:</span>
								<el-input type="text" v-model="item.people" style="width:30%;margin-right:30px;" size="small"></el-input>
								<span>身份证号:</span>
								<el-input type="text" v-model="item.IDCard" style="width:30%;" size="small"></el-input>
								<el-button @click="delCar(index)" size="small">删除</el-button>
							</p>
						</div>
					</p>
				</div>
				<div slot="footer" class="dialog-footer">
					<el-button @click="showPlan = false">返回</el-button>
					<el-button type="primary" @click="finishOrder">确认下单</el-button>
				</div>
			</el-dialog>
			<!-- 生成订单的弹出框结束 -->
		</div>
	</div>
</template>
<style scoped>
	.main-warpper{
		width: 80%;
		margin: 0 auto;
	}
	.margin-left{
		margin-left: 20px;
	}
	table{
		margin-top: 20px;
		width: 100%;
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
	.el-table-filter__content{
		min-width: 100px;
    	height: 150px;
   		overflow: auto;
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
	.max_height{
		height: 200px;
		max-height: 500px;
		overflow: auto;
	}
</style>