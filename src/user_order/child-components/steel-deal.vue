<script>
	import headbar from "../components/headbar.vue";
	import ajaxCustom from '../components/ajax-custom.js';
	import { Table, TableColumn, Button, Input, Select, Option, Dialog , Form , FormItem, RadioGroup, Radio, Switch, Loading} from 'element-ui';
	import multiple from "../components/multiple.vue";
	import provinceList from "../../res/json/provinceList.json";
	export default{
		components : {
			headbar,
			multiple,
			elTable : Table,
			elTableColumn : TableColumn,
			elButton : Button,
			elInput : Input,
			elSelect : Select,
			elOption : Option,
			elDialog:Dialog,
			elForm:Form,
			elRadio : Radio,
			elRadioGroup : RadioGroup,
			elSwitch : Switch,
			elFormItem:FormItem
		},
		created(){
			this.init();
			for(let province of provinceList.province){
				if(province.name === "广东"){
					this.formSeting.addrList = province.cityList;
				}
			}

		},
		data(){
			return {
				tableDatas : null,
				report : {
					selectedDate : null,
					item : null,
					reportTime : null
				},
				reportDate : null,
				webPriceTimes : null,
				allBrand : {
					item : [],
					selected : null
				},
				projectInfo : null,
				isButtonLoading : false,
				isCreateProjectBox : false,
				formSeting : {
					formLabelWidth : "120px",
					provinceList : null,
					city : null,
					area : null,
					addrList : null,
					
				},
				normalItemDisplay : 1,
				someItemDisplay : 0, 
				brandsItemDisplay : 0,
				priceItemDisplay : 0,
				options: [{
			          value: '下单后',
			          label: '下单后'
			        }, {
			          value: '到货后',
			          label: '到货后'
			        }],
		        weboptions:[{
		        	value : '上浮',
		        	label : '上浮'
		        },{
		        	value : '下浮',
		        	label : '下浮'
		        }],
				value : '' ,
				webvalue : '',
				userProjectInfo : {
					item : null,
					selected : null
				},
				pickerOptions: {
					shortcuts: [{
						text: '查询最新报价',
						onClick(picker) {
							let date = window.firstDate.created_at.split(' ');
							picker.$emit('pick', date);
						}
					}],
					disabledDate(time) {
						return time.getTime() > Date.now();
					}
				},
				tableTypeContro : {
					value : 0,
					isShowDiffPrice : false
				},
				numberToText : [
					{ num : 0, text : "首次" },
					{ num : 1, text : "二次" },
					{ num : 2, text : "三次" },
					{ num : 3, text : "四次" }
				],
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
				// 控制Table列是否显示
				tablecolumnDisplay : {
					brand : true,
					cate_spec : true,
					material : true,
					size : true,
					marketPrice : true,
					unitPrice : true,
					priceDetail : true,
					product_status : true,
					price_source : true,
					webPrice : true
				},
				filterArr : {
					cate_spec : [],
					size : [],
					material : [],
					brands : [],
					inventory : [],
					productStatus : []
				}
			}
		},
		methods : {
			init(){
				ajaxCustom.ajaxGet(this,"api/getSteelMarketList", (responese)=>{
					console.log(responese);
					let resData = responese.body;
					if(resData.status === "success"){
						// this.tableData = resData.data.steelMarketList;
						this.userProjectInfo.item = resData.data.userProjectInfo;
						this.getAllBrands();
					}else{
						alert("暂无数据");
					}
				},(responese)=>{
					alert("ERROR");
					console.log(responese);
				});
			},
			getAllBrands(){
				ajaxCustom.ajaxGet(this,"api/getAllbrands", (responese)=>{
					console.log(responese)
					let resData = responese.body;
					this.allBrand.item = resData;
				},(responese)=>{
					alert("error");
					console.log(responese);
				});
			},
			getMarketDatas(date){
				this.isButtonLoading = true;
				ajaxCustom.ajaxGet(this,"api/getMarketDatasAtDate", { params : { date : date } },(responese)=>{
					console.log(responese)
					if(responese.body.length){
						!window.$vueData ? window.$vueData = {} : null;
						window.$vueData.lastReportId = responese.body[responese.body.length-1].id;
						this.report.item = responese.body;
					}else{
						alert("该日期没有数据");
					}
					this.report.reportTime = null;
					this.isButtonLoading = false;
				},(responese)=>{
					console.log(responese)
					this.isButtonLoading = false;
				});
			},
			setProjectInfo(data){
				for(let item of this.userProjectInfo.item){
					if(item.name == data){
						this.projectInfo = item;
					}
				}
			},
			getMarketDatasFromId(){
				this.searchTransportPrice();
				if(!this.projectInfo){
					alert("请先选择项目");
					return false;
				}
				let loadingInstance = Loading.service({target:"#price-info"});
				ajaxCustom.ajaxGet(this, "api/getSteelMarketDatas", {params : { id : this.report.reportTime }}, (responese)=>{
					console.log(responese);
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

					// table数据排序
					responeseData.childResult = this.sortTableDatas(responeseData.childResult);

					this.tableDatas = responeseData.childResult;
					// this.searchDatas.brand = responeseData.parentResult[0].brand;
					// this.reportDate = responeseData.parentResult[0].created_at;
					this.tableTypeContro.value = 1;
					loadingInstance.close();
				}, (responese)=>{
					loadingInstance.close();
					alert("ERROR");
					console.log(responese);
				});
			},
			searchTransportPrice(){
				let allBrandName = [];
				for(let key in this.allBrand.item){
					allBrandName.push(this.allBrand.item[key]);
				}
				ajaxCustom.ajaxGet(this,"api/searchTransportForCity", { params : { brands : allBrandName, city : "广州市", area : "海珠区", address : "" } },(responese)=>{
					console.log(responese)
					for(let data of this.tableData){
						for(let transportData of responese.body){
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
			sortTable(event, key){
				this.filterArr[key] = event;

				// 清空选项时 重置表格
				if(!this.filterArr.cate_spec.length && !this.filterArr.material.length && !this.filterArr.size.length && !this.filterArr.brands.length && !this.filterArr.productStatus.length && !this.filterArr.inventory.length){
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

					// 显示符合条件的数据
					for(let lineData of this.tableDatas){
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
					this.tableDatas.sort(function(a, b){
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
					this.tableDatas.sort(function(a, b){
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
			queueNumberToText(number){
				for(let item of this.numberToText){
					if(item.num == number){
						return item.text;
					}
				}
			},
			handleClick(tab){
				if(tab.label=="其他"){
					this.normalItemDisplay=0;
				}else{
					this.normalItemDisplay=1;
				}
				if((tab.label == "条款三") || (tab.label == "条款四") || (tab.label == "条款五")){
					this.someItemDisplay = 1;
				}else{
					this.someItemDisplay = 0;
				}
				if(tab.label == "条款二" || tab.label == "条款四"){
					this.brandsItemDisplay = 1;
				}else{
					this.brandsItemDisplay = 0;
				}
				if(tab.label == "条款五"){
					this.priceItemDisplay =1;
				}else{
					this.priceItemDisplay =0;
				}
			},
			addBrand(){
				console.log('新增品牌');
			},
		},
		watch : {
			tableTypeContro : {
				handler(newVal, oldVal){
					if(newVal.value === 1){
						this.tablecolumnDisplay.marketPrice = false;
						this.tablecolumnDisplay.unitPrice = true;
						this.tablecolumnDisplay.priceDetail = false;
						this.tableTypeContro.isShowDiffPrice = false;
					}else if(newVal.value === 2){
						this.tablecolumnDisplay.marketPrice = false;
						this.tablecolumnDisplay.unitPrice = false;
						this.tablecolumnDisplay.priceDetail = true;
					}else if(newVal.value === 3){
						this.tablecolumnDisplay.marketPrice = true;
						this.tablecolumnDisplay.unitPrice = false;
						this.tablecolumnDisplay.priceDetail = false;
					}
				},
				deep : true
			}
		}
	}
</script>

<template>
	<div>
		<headbar :active_number="1"></headbar>
		<div class="first-main-warpper">
			<h1>项目报价</h1>
			<h4>Some text</h4>
			<br><br>
			<!-- 弹出框 -->
			<el-dialog v-model="isCreateProjectBox" >
			    <el-form>
				    <el-form-item label="项目名称:" :label-width="formSeting.formLabelWidth" >
				      <el-input  auto-complete="off" style="width:88%;"  placeholder="请选择项目名称"></el-input>
				    </el-form-item>
				    <el-form-item label="活动区域:" :label-width="formSeting.formLabelWidth">
				    	<b>广东省</b><span></span>
						<el-select  v-model="formSeting.city" placeholder="请选择城市">
							<el-option v-for="item in formSeting.addrList" :label="item.name" :value="item.name"></el-option>
						</el-select>
						<el-select v-model="formSeting.area" placeholder="请选择区/县">
							<template v-for="city in formSeting.addrList">
								<template v-if="formSeting.city == city.name">
									<el-option v-for="area in city.areaList" :label="area" :value="area"></el-option>
								</template>
							</template>
						</el-select>
				    </el-form-item>
				    <el-form-item label="" :label-width="formSeting.formLabelWidth" >
				    	<el-input  auto-complete="off" style="width:88%;"  placeholder="详细地址"></el-input>
				    </el-form-item>
				    <el-form-item label="品牌范围:" :label-width="formSeting.formLabelWidth" >
				    	<el-select  v-model="allBrand.selected" placeholder="请选择品牌" style="width:88%;">
					        <el-option  v-for="item in allBrand.item" :label="item" :value="item"></el-option>
				       </el-select>
				    </el-form-item>

				    <el-form-item label="结算条件:" :label-width="formSeting.formLabelWidth" >
						<el-tabs type="card" @tab-click="handleClick" style="width:88%;">
							<el-tab-pane label="条款一"><b>统一包干结算:</b>
							</el-tab-pane>
						    <el-tab-pane label="条款二"><b>分品牌包干结算:</b>
						    </el-tab-pane>
						    <el-tab-pane label="条款三"><b>统一分拆结算:</b>
						    </el-tab-pane>
						    <el-tab-pane label="条款四"><b>分品牌分拆结算:</b>
						    </el-tab-pane>
						    <el-tab-pane label="条款五"><b>综合费率结算:</b>
						    </el-tab-pane>
						    <el-tab-pane label="其他"><b>其他结算方式:</b>
								<el-input  type="textarea" auto-complete="off"  placeholder="请输入结算描述"  autosize></el-input>
						    </el-tab-pane>
						</el-tabs>
						
						<div>
							<template v-if="normalItemDisplay">
								<el-select v-model="value" style="width:100px;" >
								    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
								</el-select>
								<el-input type="number" style="width:80px;"></el-input>日
							</template>

							<template v-if="brandsItemDisplay">
								<br>
								<el-select  v-model="allBrand.selected" placeholder="品牌" style="width:120px;">
							        <el-option  v-for="item in allBrand.item" :label="item" :value="item"></el-option>
						       	</el-select>
							</template>

							<template v-if="normalItemDisplay">
								<span>	网价 </span>
								<el-select v-model="webvalue" style="width:100px;margin-top:10px;">
								    <el-option v-for="item in weboptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
								</el-select>
								<el-input type="number" style="width:80px;"></el-input>
								<span>元/吨</span>
								<br>
							</template>
							<template v-if="priceItemDisplay">
								<label style="width:90px;">资金费率:</label><el-input type="number" style="width:80px;margin-top:10px;" min="0" ></el-input>
								<span>%</span>
								<br>
							</template>
							<template v-if="someItemDisplay==1">
								<label style="width:90px;">运费:</label><el-input type="number" style="width:80px;margin-top:10px;" min="0" ></el-input>
								<span>元/吨</span>
								<br>
								<label style="width:90px;">过磅费:</label><el-input type="number" style="width:80px;margin-top:10px;" min="0" ></el-input>
								<span>元/吨</span>
								<br>
							</template>
							<template v-if="brandsItemDisplay">
								<el-button @click="addBrand()" size="small">新增品牌</el-button>
							</template>
						</div>
				    </el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click="isCreateProjectBox = false">取 消</el-button>
					<el-button type="primary" @click="isCreateProjectBox = false">新增</el-button>
				</div>
			</el-dialog>
			<!-- 弹出框结束 -->
			<div class="header-select">
				<div>
					<div>
						<span><b>选择项目 : </b></span>
						<el-select size="small" v-model="userProjectInfo.selected" @change="setProjectInfo" >
							<el-option v-for="option in userProjectInfo.item" :label="option.name" :value="option.name"></el-option>
						</el-select>
						<el-button size="small" @click="isCreateProjectBox = true">新建</el-button>
					</div>
					<div class="project-info" v-if="projectInfo">
						<div>
							<span><b>项目名称</b> : {{ projectInfo.name }}</span>
						</div>
						<div>
							<span><b>项目地址</b> : {{ projectInfo.province + projectInfo.city + projectInfo.area + projectInfo.add }}</span>
						</div>
						<div>
							<span><b>结算条件</b> : {{ projectInfo.settlement }}</span>
						</div>
						<div>
							<span><b>品牌范围</b> : FFF</span>
						</div>
					</div>
				</div>
				<div>
					<div>
						<span><b>选择报价 : </b></span>
						<el-date-picker id="detepicker" v-model="report.selectedDate" align="right" type="date" placeholder="选择日期" :picker-options="pickerOptions" @change="getMarketDatas"></el-date-picker>
						<el-select class="times-select" v-model="report.reportTime">
							<el-option v-for="item in report.item" :value="item.id" :label="queueNumberToText(item.price_queue)"></el-option>
						</el-select>
						<el-button size="small" :loading="isButtonLoading" @click="getMarketDatasFromId()">查询</el-button>
					</div>
				</div>
			</div>
			<div style="clear:both;"></div>
			<hr />
			<div v-if="tableDatas">
				<div class="set-margin">
					<el-radio-group v-model="tableTypeContro.value">
						<el-radio :label="1">综合价</el-radio>
						<el-radio :label="2">包到价</el-radio>
						<el-radio :label="3">现货价</el-radio>
					</el-radio-group>
					<div class="set-margin" v-show="tableTypeContro.value==2 || tableTypeContro.value==3">
						<span>显示差价 : </span><el-switch v-model="tableTypeContro.isShowDiffPrice" on-text="" off-text=""></el-switch>
					</div>
				</div>

				<table class="header-table" width="100%" border=1>
					<thead>
						<tr>
							<th rowspan="3" v-if="tablecolumnDisplay.brand">
								<multiple name="钢厂/品牌" :options="filterDatas.brands" v-on:selectedArr="sortTable($event, 'brands')"></multiple>
							</th>
							<th rowspan="3" v-if="tablecolumnDisplay.cate_spec">
								<multiple name="品名" :options="filterDatas.cate_spec" v-on:selectedArr="sortTable($event, 'cate_spec')"></multiple>
							</th>
							<th rowspan="3" v-if="tablecolumnDisplay.size">
								<multiple name="规格" :options="filterDatas.size" v-on:selectedArr="sortTable($event, 'size')"></multiple>
							</th>
							<th rowspan="3" v-if="tablecolumnDisplay.material">
								<multiple name="材质" :options="filterDatas.material" v-on:selectedArr="sortTable($event, 'material')"></multiple>
							</th>
							<th rowspan="3" v-if="webPriceTimes!=0 && tablecolumnDisplay.webPrice">
								<select class="thead-select" v-model="webPriceTimes" >
									<option value="1">网价-首次</option>
									<option value="2">网价-二次</option>
									<option value="3">网价-三次</option>
								</select>
							</th>
							<th rowspan="1" colspan="2" v-if="tablecolumnDisplay.marketPrice">市场价</th>
							<th rowspan="3" v-if="tablecolumnDisplay.unitPrice">综合价</th>
							<th rowspan="1" colspan="6" v-if="tablecolumnDisplay.priceDetail">送到价</th>
							<th rowspan="1" colspan="2" v-if="tableTypeContro.isShowDiffPrice">最新差价</th>
							<template v-if="tablecolumnDisplay.product_status">
								<th rowspan="3">
									<multiple name="库存情况" :options="filterDatas.inventory" v-on:selectedArr="sortTable($event, 'inventory')" ></multiple>
								</th>
								<th rowspan="3">
									<multiple name="货物品质" :options="filterDatas.productStatus" v-on:selectedArr="sortTable($event, 'productStatus')" ></multiple>
								</th>
							</template>
						</tr>
						<tr>
							<template v-if="tablecolumnDisplay.marketPrice">
								<th rowspan="2" colspan="1" >直送
									<div class="sort-icon">
										<div @click="sortTableLine('asce', 'freeTransportPrice')">▲</div>
										<div @click="sortTableLine('desc', 'freeTransportPrice')" style="margin-top:-7px;">▼</div>
									</div>
								</th>
								<th rowspan="2" colspan="1">自提
									<div class="sort-icon">
										<div @click="sortTableLine('asce', 'selfTransportPrice')">▲</div>
										<div @click="sortTableLine('desc', 'selfTransportPrice')" style="margin-top:-7px;">▼</div>
									</div>
								</th>
							</template>

							<template v-if="tablecolumnDisplay.priceDetail">
								<th rowspan="1" colspan="3">直送价</th>
								<th rowspan="1" colspan="3">自提价</th>
							</template>

							<template v-if="tableTypeContro.isShowDiffPrice">
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
						</tr>
						<tr>
							<template v-if="tablecolumnDisplay.priceDetail">
								<th rowspan="1" >单价</th>
								<th rowspan="1" >运费</th>
								<th rowspan="1" >总价</th>

								<th rowspan="1" >单价</th>
								<th rowspan="1" >运费</th>
								<th rowspan="1" >总价</th>
							</template>
						</tr>
					</thead>
				</table>
				<table class="content-table" width="100%" border=1>
				<tbody>
					<tr v-for="data in tableDatas">
						<template v-if="data.display">
							<td v-if="tablecolumnDisplay.brand"> {{ data.brand }} </td>
							<td v-if="tablecolumnDisplay.cate_spec"> {{ data.cate_spec }} </td>
							<td v-if="tablecolumnDisplay.size"> {{ data.size }} </td>
							<td v-if="tablecolumnDisplay.material"> {{ data.material }} </td>

							<template v-if="tablecolumnDisplay.webPrice">
								<td v-if="webPriceTimes==1" > {{ data.webPrice1 ? data.webPrice1 : '-' }} </td>
								<td v-if="webPriceTimes==2" > {{ data.webPrice2 ? data.webPrice2 : '-' }} </td>
								<td v-if="webPriceTimes==3" > {{ data.webPrice3 ? data.webPrice3 : '-' }} </td>
							</template>

							<template v-if="tablecolumnDisplay.marketPrice">
								<td> {{ data.freeTransportPrice ? data.freeTransportPrice : '-' }} </td>
								<td> {{ data.selfTransportPrice ? data.selfTransportPrice : '-' }} </td>
							</template>

							<td v-if="tablecolumnDisplay.unitPrice">综合价</td>

							<template v-if="tablecolumnDisplay.priceDetail">
								<td> {{ data.freeTransportPrice ? data.freeTransportPrice : '-' }} </td>
								<td> {{ data.transportPrice }} </td>
								<td> {{ data.freeTransportPrice ? (isNaN(parseInt(data.freeTransportPrice) + parseInt(data.transportPrice)) ? '-' : parseInt(data.freeTransportPrice) + parseInt(data.transportPrice)) : '-' }} </td>
								<td> {{ data.selfTransportPrice ? data.selfTransportPrice : '-' }} </td>
								<td> {{ data.transportPrice }} </td>
								<td> {{ data.selfTransportPrice ? (isNaN(parseInt(data.selfTransportPrice) + parseInt(data.transportPrice)) ? '-' : parseInt(data.selfTransportPrice) + parseInt(data.transportPrice)) : '-' }} </td>
							</template>

							<template v-if="tableTypeContro.isShowDiffPrice">
								<td> {{ data.freeDifferencePrice ? data.freeDifferencePrice : '-' }} </td>
								<td> {{ data.selfDifferencePrice ? data.selfDifferencePrice : '-' }} </td>
							</template>

							<template v-if="tablecolumnDisplay.product_status">
								<td> {{ data.inventory }} </td>
								<td> {{ data.product_status }} </td>
							</template>
						</template>
					</tr>
				</tbody>
			</table>
			</div>

		</div>

	</div>
</template>

<style scoped>
	.first-main-warpper{
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
	.set-margin{
		margin:7px;
	}
	.project-info{
		color:#666;
	}
	.project-info>div{
		margin:8px;
	}
	b{
		color:#666;
	}
	.header-select>div{
		width:50%;
		float:left;
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
	html body .times-select input.el-input__inner{
		height: 29px;
	}
</style>
