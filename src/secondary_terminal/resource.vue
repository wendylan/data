<script>
	import headerbar from '../components/same-headerbar.vue';
	import multiple from "../components/multiple.vue";
	import addressUi from '../components/adds-input.vue';
	import ajaxCustom from '../components/ajax-custom.js';
	import { Input, Select, Option, RadioGroup, Radio, DatePicker, Button, CheckboxGroup, Checkbox, Table, TableColumn, Tooltip, Loading, Dialog, Message, Form, FormItem } from 'element-ui';
	export default{
		components : {
			headerbar,
			addressUi,
			multiple,
			elDialog : Dialog,
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
            elForm : Form,
            elFormItem : FormItem
		},
		created(){
			document.addEventListener("click", this.hidePanel);
			// 获取固定框的品名,品牌,规格,材质
			this.getInitData();
			// 获取最开始的表格数据
			this.getInitTable();
			//不可选的日期
			window.disabledDate = [];
		},
		data(){
			return {
				initData:{
                    // 品牌数据源
                    brandData : [],
                    // 品名数据源
                    productGroup : [],
                    // 规格数据源
                    typeGroup : [],
                    // 材质数据源
                    materialGroup : [],
                },
				// 时间段/时间点
				timeSlot : false,
				timePoint : false,
				//禁止选中日期（今日之后的日期）
                pickerOptions: {
                    disabledDate(time) {
                    	let disabledDate = window.disabledDate;
                    	for (let i = 0; i <disabledDate.length; i++) {
                             let disableTime = (new Date(disabledDate[i])).getTime()-28800000;
                             if(time.getTime() == disableTime){
                             	return true;
                             }
                    	}
                        return time.getTime() > Date.now();
                    },
                },
                date : null,
                // 选择时间段
				dateRange : null,
				// 表格的时间段
				tableDateRange : null,
				// 表格的时间点数组
				dateArray : [],
                // 选择时间点
                forePoint : null,
                // 表格数据
                tableData : [],
                analysisData : [],
                // 运费
                freight : null,
                marketDiff : false,
                avgDiff : true,
                webAvg : true,
                // 是否弹出固定框
                isShowOptions : false,
                filterDatas : {
					brands : []
                },
                filterArr : {
					brands : []
                },
                // 请求后的材质规格数据数组
                allData : [],
                // 别名表
                originalData : null,
				displayLabel : {
					web_price : {
						date : true,
						week : null,
						month : null
					},
					spot_price : {
						date : true,
						week : null,
						month : null
					},
					price_diff : {
						date : true,
						week : true,
						month : true
					},
					cate_spec : {
						steel : true,
						disk : false,
						highSpeedWire : false
					}
				},
                tableLength : {
					web_price : 1,
					spot_price : 1,
					price_diff : 3,
                },
                newestDataDate : { label : "", value : "" },
                specOrder : {
					"螺纹钢" : 2,
					"盘螺" : 1,
					"高线" : 0
                },
                popover : false,
                canLoadData : true,
                popoverData : [
					{name : "螺纹钢", data : [], sizeLimit : "18-25E" },
					{name : "盘螺", data : [], sizeLimit : "8-10E" },
					{name : "高线", data : [], sizeLimit : "8-10" }
				],
                // 当前搜索表单显示的数据
                searchInfo : {
                    upper_limit : null|5,
                    floor_limit : null|5,
                    brands : [],
                    product : '',
                    material : '',
                    type : ''
                },
                rules : {
					brands : [
						{ required: true, type: "array", message: '请选择品牌', trigger: 'change' },
					],
					product : [
						{ required: true, message: '请选择材质', trigger: 'change' },
					],
					material : [
						{ required: true, message: '请选择材质', trigger: 'change' },
					],
					type : [
						{ required: true, message: '请选择规格', trigger: 'change' },
					],
				}
			}
		},
		computed:{
			//view层控制计算一级表头的长度
			chooseLength (){
				return this.chooseArray.length;
			},
			chooseArray (){
				let array = JSON.parse(JSON.stringify(this.dateArray));
				if(this.tableDateRange){
					array.push(this.tableDateRange);
				}
				return array;
			},
		},
		methods : {
			// 点击其他地方隐藏弹出框
			hidePanel(event){
				var sp = document.getElementById("selectBox");
				if(sp){
					if(!sp.contains(event.target)){            //这句是说如果我们点击到了id为myPanel以外的区域
						this.isShowOptions = false;
					}
				}
			},
			// 获取固定框的品名,品牌,规格,材质
			getInitData(){
				ajaxCustom.ajaxGet(this, 'dingoapi/getAllProduct', (response)=>{
					response = response.body;
					let brand = response.brand;
					// this.brandData = brand;
                    this.initData.brandData = brand;
				}, (response)=>{
					alert(response.body.message);
				});
			},
			// 改变品牌
			changBrand(brand){
				if(brand.length){
					ajaxCustom.ajaxGet(this, "dingoapi/getBrandGroupSpec", { params : { 'brand' : brand } }, (response)=>{
						console.log(response);
						this.allData = response.body.data;
						let arr = [];
						for(let product in this.allData ){
							arr.push({ 'cate_spec' : this.allData[product].name, 'material' : this.allData[product].material });
						}
						this.initData.productGroup = arr;
                        this.searchInfo.product= '';
                        this.searchInfo.material = '';
                        this.searchInfo.type = '';
					}, (response)=>{
						alert(response.body.message);
					});
				}
			},
			// 改变品名
			changProduct(product){
				let arr = [];
				let material = this.initData.productGroup;
				for(let i = 0; i < material.length;i++){
					if(material[i].cate_spec == product){
						let data = material[i].material;
						for(let j= 0; j< data.length; j++){
							arr.push({ 'material' : data[j].name, 'size' : data[j].size });
						}
					}
				}
				this.initData.materialGroup = arr;
                this.searchInfo.material = '';
                this.searchInfo.type = '';
			},
			// 改变材质
			changMaterial(material){
				let arr = [];
				let size = this.initData.materialGroup;
				for(let i = 0; i < size.length; i++){
					if(size[i].material == material){
						let data = size[i].size;
						for(let j = 0; j < data.length; j++){
							arr.push({ 'size' : data[j].name});
						}
					}
				}
				// 额外添加size段, 需要解析为单个size后提交
				if(this.product == "螺纹钢"){
					arr.push({ "size" : "18 - 25" });
				}else if(this.product == "盘螺"){
					arr.push({ "size" : "8 - 10" });
				}
				else{
					arr.push({"size" : "8 - 10" });
				}
				this.initData.typeGroup = arr;
                this.searchInfo.type= '';
			},
			// 获取最开始的表格数据
			getInitTable(){
				let loadingInstance = Loading.service({ fullscreen: true, text : "正在加载数据,请耐心等待..." });
				ajaxCustom.ajaxGet(this, 'dingoapi/getResourceInfo', (response)=>{
					// console.log(response);
					let data = response.data.data;
					this.date = response.data.date;
					this.newestDataDate.value = this.getNewestDataDate(response.data.data);
					this.newestDataDate.label = this.getDateString(this.newestDataDate.value);
					this.tableData = this.dataHandle(data);
					for(let item of this.tableData){
						//价差（网-现）数据
						item.diffDate = this.calDateData(this.newestDataDate.value, 'price_diff', item.data);
						item.previousDiffDate = this.getPreviousDateData(this.newestDataDate.value, 'price_diff', item.data);
						item.diffDateFloat = this.getFloatString(item.previousDiffDate, item.diffDate);

						item.diffWeekAvg = this.getDaysAvg(7, 'price_diff', item.data);
						item.previousDiffWeekAvg = this.getDaysAvg(7, 'price_diff', item.data, 6);
						item.diffWeekAvgFloat = this.getFloatString(item.previousDiffWeekAvg, item.diffWeekAvg);

						item.diffMountAvg = this.getDaysAvg(30, 'price_diff', item.data);
						//网价数据
						item.webDate = this.calDateData(this.newestDataDate.value, 'web', item.data);
						// item.previousWebDate = this.getPreviousDateData(this.newestDataDate.value, 'web', item.data);
						item.webDateFloat = this.getWebFloat(item.data,this.newestDataDate.value);

						item.webWeekAvg = this.getDaysAvg(7, 'web', item.data);
						item.previousWebWeekAvg = this.getDaysAvg(7, 'web', item.data, 6);
						item.webWeekAvgFloat = this.getFloatString(item.previousWebWeekAvg, item.webWeekAvg);

						item.webMountAvg = this.getDaysAvg(30, 'web', item.data);
						//现货价数据
						item.spotDate = this.calDateData(this.newestDataDate.value, 'spot', item.data);
						item.previousSpotDate = this.getPreviousDateData(this.newestDataDate.value, 'spot', item.data);
						item.spotDateFloat = this.getFloatString(item.previousSpotDate, item.spotDate);

						item.spotWeekAvg = this.getDaysAvg(7, 'spot', item.data);
						item.previousSpotWeekAvg = this.getDaysAvg(7, 'spot', item.data, 6);
						item.spotWeekAvgFloat = this.getFloatString(item.previousSpotWeekAvg, item.spotWeekAvg);

						item.spotMountAvg = this.getDaysAvg(30, 'spot', item.data);
						//到货价差预处理｛不然会报undefined异常｝
						item.descDiffDateFloat = {};
						item.descDiffWeekFloat = {};
						//显示数据控制
						item.display = true;
						if(item.cate_spec=="螺纹钢"){
							item._display = true;
						}else{
							item._display = false;
						}
					}
					// 默认广州仓今天/昨日价格从大到小
					this.sortTableLine('desc', '', 'diffDate', this.tableData);
					// 品牌筛选过滤
					this.filterDatas.brands = this.filterDatasFunc(this.filterDatas, this.tableData);
					loadingInstance.close();
				}, (response)=>{
					alert(response.body.message);
					loadingInstance.close();
				});
			},
			//异常数据剔除
			exceptionDataEliminate(dataArray, upper_limit, floor_limit){
				//上限
				let upperLimitCount = parseInt(dataArray.length*(upper_limit/100));
				// 下限
				let floorLimitCount = parseInt(dataArray.length*(floor_limit/100));
				let returndata = [];
				//排序
				for (let i = 0; i < dataArray.length-1; i++) {
					for (let j = i+1; j < dataArray.length; j++) {
						if(dataArray[i].price_diff < dataArray[j].price_diff){
							let tmp = null;
							tmp = dataArray[i];
							dataArray[i] = dataArray[j];
							dataArray[j] = tmp;
						}
					}
				}
				//剔除异常数据
				for (let i = upperLimitCount; i < dataArray.length-floorLimitCount; i++) {
					returndata.push(dataArray[i]);
				}
				return returndata;
				// return dataArray;
			},
			//计算最新报价的上一次报价，用于计算最新报价浮动
			getPreviousDateData(date, key, data){
				for(let item of data){
					if(item.date!=date){
						return item[key];
					}
				}
				return null;
			},
			//按日期获取数据
			calDateData(date, key, data){
				for(let item of data){
					if(item.date==date){
						return item[key];
					}
				}
				return null;
			},
			//数据初始化计算
			dataHandle(data){
				let items = [];
				let disk = [];
				let highSpeedWire = [];
				for (var i = 0; i < data.length; i++) {
					items=this.formatData(data[i].data, items, "HRB400E", "18-25", "螺纹钢");
					disk=this.formatData(data[i].disk, disk, "HRB400E", "8-10", "盘螺");
					highSpeedWire=this.formatData(data[i].highSpeedWire, highSpeedWire, "HPB300", "8-10", "高线");
				}
				items = this.arrayPush(items, disk);
				items = this.arrayPush(items, highSpeedWire);
				return items;
			},
			//合并数组
			arrayPush(addedArray, addArray){
				for(let item of addArray){
					addedArray.push(item);
				}
				return addedArray;
			},
			//数据格式转化（增加标志属性‘品名’‘材质’‘规格’‘是否在剔除范围’）
			formatData(data, items, material, size, cate_spec){
				if(data.data.length){
					let arrayItems = data.data;
					for(let item of arrayItems){
						item.date = data.date;
						let door = 1;
						for (var j = 0; j < items.length; j++) {
							if(items[j].brand == item.brand){
								door = 0;
								items[j].data.push(item);
							}
						}
						if(door){
							let brandData = {
								'brand':item.brand,
								'material':material,
								'size':size,
								'cate_spec':cate_spec,
								'data':[]
							};
							brandData.data.push(item);
							items.push(brandData);
						}
					}
				}
				return items;
			},
			//计算时间段内数据的平均数
			getDaysAvg(days, key, data, startdDay){
				let endTime = (Date.parse(new Date(this.date)))-(days*86400000);
				let startTime = Number.POSITIVE_INFINITY;
				if(startdDay){
					startTime = (Date.parse(new Date(this.date)))-(startdDay*86400000);
					endTime = (Date.parse(new Date(this.date)))-(days*86400000)-(startdDay*86400000);
				}
				let sum = 0;
				let count = 0;
				let result = null;
				data = this.exceptionDataEliminate(JSON.parse(JSON.stringify(data)), 5, 5);
				for(let item of data){
					let time = Date.parse(new Date(item.date));
					if(time<startTime && time > endTime){
						sum += parseInt(item[key])
						count += 1;
					}
				}
				if(count){
					result = parseInt(sum/count);
				}
				return result;
			},
			//获取最新的日期
			getNewestDataDate(data){
				for (var i = 0; i < data.length; i++) {
					if(data[i].sopt.length&&data[i].web.length){
						return data[i].date;
					}
				}
				return null;
			},
			//最新日期的显示处理（‘昨日’‘今日’）
			getDateString(date){
				if(Date.parse(this.date)==Date.parse(date)){
					return "今日";
				}else if((Date.parse(this.date)-86400000)==Date.parse(date)){
					return "昨日";
				}else{
					return date;
				}
			},
			//相较上次浮动数据处理
			getFloatString(oldValue, newValue){
				let float = parseInt(newValue) - parseInt(oldValue);
				if(isNaN(float)){
					return { vlaue : "", type : 3};
				}
				if(float > 0){
					return { value : ("↑"+float), type : 0};
				}
				if(float==0){
					return {value : "-平", type : 2};
				}
				if(float<0){
					return {value : ("↓"+(-1*float)), type : 1};
				}
			},
			//网价浮动数据处理
			getWebFloat(data,date){
				for(let item of data){
					if( date==item.date){
						return this.getWebFloatString(item.web_float)
					}
				}
				return {value : "-平", type : 2};
			},
			getWebFloatString(float){
				if(float=='-'){
					return {value : "-平", type : 2};
				}
				float = parseInt(float);
				if(isNaN(float)){
					return { vlaue : "", type : 3};
				}
				if(float > 0){
					return { value : ("↑"+float), type : 0};
				}
				if(float<0){
					return {value : ("↓"+(-1*float)), type : 1};
				}
			},
			// 获取地址进行运费计算
			getAddressData(adds){			//地址
				this.marketDiff = true;
				if((!(adds.city&&adds.area))||(adds.area=="")){
					this.marketDiff = false;
					return;
				}
				this.getFreight(adds.city, adds.area);
			},
			// 获取运费
			getFreight(city, area){
				ajaxCustom.ajaxGet(this, 'dingoapi/getFreightByCity', { params : { 'city' : city, 'area' : area }}, (response)=>{
					this.freight = response.body.data;
					this.tableData = this.spotAddFreight(this.tableData, this.freight);
					this.tableData.push();
					// 今日到货平均差
					this.descHandle();
				}, (response)=>{
					alert(response.body.message);
				});
			},

			// 计算运费相关的table信息(日到货价差，周平均到货价差，月平均到货价差)
			spotAddFreight(spotPrice, freight){
				for(let item of this.tableData){
					for (var i = 0; i < item.data.length; i++) {
						//计算不同品牌每日的到货差价
						item.data[i].desc_diff = this.calDescDiff(item.data[i], freight);
					}

					item.descDiffDate = this.calDateData(this.newestDataDate.value, 'desc_diff', item.data);
					item.previousDescDiffDate = this.getPreviousDateData(this.newestDataDate.value, 'desc_diff', item.data);
					item.descDiffDateFloat = this.getFloatString(item.previousDescDiffDate, item.descDiffDate);

					item.descDiffWeek = this.getDaysAvg(7, 'desc_diff', item.data);
					item.previousDiffWeekAvg = this.getDaysAvg(7, 'desc_diff', item.data, 6);
					item.descDiffWeekFloat = this.getFloatString(item.previousDiffWeekAvg, item.descDiffWeek);

					item.descDiffMount = this.getDaysAvg(30, 'desc_diff', item.data);
				}
				return spotPrice;
			},
			//初始化数据的到货价计算
			calDescDiff(data, freight){
				if(data.trans == '仓'){
					if(!freight.warehouse){
						return NaN;
					}
					return data.price_diff - freight.warehouse;
				}else{
					for(let item in freight.mill){
						if(item == data.brand){
							return data.price_diff - freight.mill[item];
						}
					}
					return NaN;
				}
			},
			//搜索功能的到货价计算
			calAnalysisDescDiff(brand, freight, data){
				if(data.method == 'warehouse'){
					if(!freight.warehouse){
						return NaN;
					}
					return data.web_price - data.price - freight.warehouse;
				}else{
					if(data.method == 'mill'){
						for(let item in freight.mill){
							if(item == brand){
								return data.web_price - data.price - freight.mill[item];
							}
						}
					}
					return NaN;
				}
			},
			// 时间段
			changDateRange(daterange){
				this.analysisData = [];
				this.tableDateRange = daterange;
			},
			// 时间点
			forePointDate(forePoint){
				this.analysisData = [];
				if(forePoint){
					forePoint = this.dateFormat(forePoint);
					let dateArr = this.dateArray;
					let menu = 1;
					for(let i = 0; i < dateArr.length;i++ ){
						if(dateArr[i] == forePoint){
							menu = 0;
						}
					}
					if(menu){
						this.dateArray.unshift(forePoint);
					}
				}
				this.forePoint = '';
				this.dateArray.sort();
				window.disabledDate = this.dateArray;
				console.log(window.disabledDate);
			},
			// 删除时间点
			delOne(index){
				let dateArr = this.dateArray;
				dateArr.splice(index, 1);
			},
			// 清空数据函数
			clearAllData(){
				this.searchInfo.brands = [];
				this.searchInfo.product = '';
				this.searchInfo.type = '';
				this.searchInfo.material = '';
				this.timeSlot = false;
				this.timePoint = false;
				this.dateRange = '';
				this.forePoint = '';
				this.dateArray = [];
				// 品牌筛选过滤
				this.filterDatas.brands = this.filterDatasFunc(this.filterDatas, this.tableData);
			},
			//品牌筛选过滤，筛选有近1月数据的品牌为【搜索更多】的品牌选择范围
			filterDatasFunc(filterDataArr, dataArr){
				filterDataArr.brands = [];
				for(let item of dataArr){
					let door = 1;
					for(let data of filterDataArr.brands){
						if(data.text == item.brand){
							door = 0;
						}
					}
					if(door){
						filterDataArr.brands.push({ text : item.brand, value : item.brand });
					}
				}
				return filterDataArr.brands;
			},
			// 控制左边的弹出框
			showBox(event){
				event.stopPropagation();
				this.isShowOptions = !this.isShowOptions;
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
            submitInfo(name){
                console.log(this.$refs[name]);
				this.$refs[name].validate((valid) => {
					if (valid) {

						this.search();
					} else {
						console.log('error submit!!');
						return false;
					}
				});
            },
			// 查询时间段时间点数据
			search(){
                if(!this.dateArray.length && !this.tableDateRange){
                    Message.warning("请选择一个时间段或者时间点");
                    return;
                }
				this.filterDatas.brands = [];
				let data = {};
				data.timePart = this.tableDateRange;
				data.timePoints = this.dateArray;
				data.discardTopPart = this.searchInfo.upper_limit;
				data.discardBottomPart = this.searchInfo.floor_limit;

				data.brands = this.searchInfo.brands;
				data.spec = this.searchInfo.product;
				data.size = this.searchInfo.type;
				data.material = this.searchInfo.material;
                console.log(data);
				let loadingInstance = Loading.service({ fullscreen: true, text : "正在加载数据..." });
				ajaxCustom.ajaxGet(this, "dingoapi/getResourceAnalysis", {params : { data }}, (response)=>{
					this.analysisData = [];
					this.originalData = response.body;
					let timePointsData = response.body.timePointsData;
					for (var i = 0; i < this.searchInfo.brands.length; i++){
						this.analysisData.push({'brand' : this.searchInfo.brands[i], 'spec' : this.searchInfo.product, 'size' : this.searchInfo.type, 'material' : this.searchInfo.material, 'display' : true });
						for (var j = 0; j < this.dateArray.length; j++) {
							let date = this.dateArray[j];
							this.analysisData[i][date] = this.getPointData({}, timePointsData,i,date);
						}
						this.analysisData[i][this.tableDateRange] = this.getPartData(response.body.timePartData, this.searchInfo.brands[i]);
						this.filterDatas.brands = this.filterDatasFunc(this.filterDatas, this.analysisData);
					}
					this.isShowOptions = !this.isShowOptions;
					loadingInstance.close();
				}, (response)=>{
					alert(response.body.message);
					loadingInstance.close();
				});
			},
			//获取时间点数据
			getPointData(dateData, timePointsData, i, date){
				for(let item in timePointsData){
					if (timePointsData[item].brand == this.searchInfo.brands[i]) {
						for (let redate in timePointsData[item].prices)  {
							if (redate == date) {
								dateData.soptPrice = timePointsData[item].prices[date].price;
								dateData.webPrice = timePointsData[item].prices[date].web_price;
								dateData.priceDiff = 0;
								if(dateData.soptPrice&&dateData.webPrice){
									dateData.priceDiff =
									timePointsData[item].prices[date].web_price - timePointsData[item].prices[date].price;
									if(this.freight){
										dateData.desPriceDiff=
										this.calAnalysisDescDiff(timePointsData[item].brand, this.freight, timePointsData[item].prices[date]);
									}
								}
							}
						}
					}
				}
				return dateData;
			},
			// 时间点时间段的数据的平均包到价差,平均价差,平均网价
			getPartData(data, brand){
				let PriceAll = [];
				for (var i = 0; i < data.length; i++) {
					if(data[i].brand==brand){
						let dataDate = data[i].prices;
						for(let item in dataDate){
							if(dataDate[item].price && dataDate[item].web_price){
								dataDate[item].price_diff = parseInt(dataDate[item].web_price) - dataDate[item].price;
								if(this.freight){
									dataDate[item].desc_price_diff = this.calAnalysisDescDiff(brand, this.freight, dataDate[item]);
								}
								PriceAll.push(dataDate[item]);
							}
						}
					}
				}
				let result = this.avgPrice(PriceAll, ['web_price', 'price', 'price_diff', 'desc_price_diff']);
				let desPriceDiff = result.desc_price_diff;
				let priceDiff = result.price_diff;
				let webPrice = result.web_price;
				let soptPrice = result.price;
				return {'priceDiff' : priceDiff, 'desPriceDiff' : desPriceDiff, 'webPrice' : webPrice, 'soptPrice' : soptPrice };
			},
			// 求平均
			avgPrice(arr, keyArray){
				let result = {};
				for (let key of keyArray) {
					let sum = 0;
					let catArr = this.exceptionDataEliminate(arr, this.searchInfo.upper_limit, this.searchInfo.floor_limit);
					for(let i = 0; i < catArr.length; i++){
						sum += parseInt(catArr[i][key]);
					}
					result[key] = parseInt(sum/catArr.length);
				}
				return result;
			},
			// 表格数据排序
			sortTableLine(methods, value, key, arr){
				let tmp = this.sortFunc(methods, value, key, arr);
				if(arr==this.tableData){
					this.tableData = tmp;
					this.tableData.push();
				}else if(arr == this.analysisData){
					this.analysisData = tmp;
					this.analysisData.push();
				}
				return tmp;
			},
			//排序function
			sortFunc(methods, value, key, arr){
				for(let i=0; i<arr.length;i++){
					for(let j=0;j<arr.length-1;j++){
						if(this.judgeResult(methods, value, key, arr[j], arr[j+1])){
							let temp = arr[j+1];
							arr[j+1] = arr[j];
							arr[j] = temp;
						}
					}
				}
				return arr;
			},
			//sortFunc中数据交换的开关
			judgeResult(methods, value, key, a, b){
				if(methods == "desc"){
					if(value){
						return a[value][key] < b[value][key];
					}
					let result = a[key]<b[key];
					return this.specJudge(a, b, result);
				}else{
					if(value){
						return a[value][key] > b[value][key];
					}
					let result = a[key] > b[key];
					return this.specJudge(a, b, result);
				}
			},
			//因排序同时考虑品名之间的比较
			specJudge(a, b, result){
				if(this.specOrder[a['cate_spec']]<this.specOrder[b['cate_spec']]){
					return true;
				}else if(this.specOrder[a['cate_spec']]>this.specOrder[b['cate_spec']]){
					return false;
				}else{
					return result;
				}
			},
			//资源推荐(表头) 品牌筛选
			sortTable(data){
				this.filterArr.brands = data;
				// 清空选项时 重置表格
				if( !this.filterArr.brands.length){
					for(let _data of this.tableData){
						_data.display = true;
					}

				}else{
					for(let _data of this.tableData){
						_data.display = false;
					}
					for(let lineData of this.tableData ){
						for(let tmp of this.filterArr.brands){
							if(lineData.brand == tmp){
								lineData.display = true;
								this.$set(lineData, 'display', true);
							}
						}
					}
				}
				// 解决浏览器不刷新问题
				this.tableData.push();
			},
			//搜索更多(表头)品牌筛选
			sortTableTime(data){
				this.filterArr.brands = data;
				// 清空选项时 重置表格
				if( !this.filterArr.brands.length){
					for(let _data of this.analysisData){
						_data.display = true;
					}

				}else{
					for(let _data of this.analysisData){
						_data.display = false;
					}

					for(let lineData of this.analysisData ){
						for(let tmp of this.filterArr.brands){
							if(lineData.brand == tmp){
								lineData.display = true;
							}
						}
					}
				}
			},
			//链接到品牌详情
			moreInfo(brand){
				this.$router.push("/brandManage?brand="+ brand);
			},
			//[搜索更多]到货处理
			descHandle(){
				if(!this.originalData){
					return ;
				}
				let data = this.getDesPriceDiffData(this.originalData);
				for (var i = 0; i < this.analysisData.length; i++) {
					for (var j = 0; j < data.length; j++) {
						if(data[j].brand == this.analysisData[i].brand){
							this.analysisData[i][data[j].key]['desPriceDiff'] =  data[j].desPriceDiff;
						}
					}
				}
				this.analysisData.push();
			},
			//【搜索更多】数据获取到货价差
			getDesPriceDiffData(data){
				let timePartData = data.timePartData;
				let timePointsData = data.timePointsData;
				let rData = [];
				//时间段到货价差
				for (let i = 0; i < timePartData.length; i++) {
					let desPriceDiff = [];
					for(let item in timePartData[i].prices){
						let judgeResult = this.calAnalysisDescDiff(timePartData[i].brand, this.freight, timePartData[i].prices[item]);
						if(!isNaN(judgeResult)){
							desPriceDiff.push({desc_price_diff:judgeResult});
						}

					}
					let result = this.avgPrice(desPriceDiff, ['desc_price_diff']);
					rData.push({key : this.tableDateRange, brand : timePartData[i].brand, desPriceDiff : result.desc_price_diff});
				}
				//时间点到货价差
				for (let i = 0; i < timePointsData.length; i++) {
					for(let item in timePointsData[i].prices){
						let result = this.calAnalysisDescDiff(timePointsData[i].brand, this.freight, timePointsData[i].prices[item]);
						if(isNaN(result)){
							result = '-';
						}
						rData.push({ key : item, brand : timePointsData[i].brand, desPriceDiff : result });
					}
				}
				return rData;
			},
			//获取table显示数据长度
			tableHeadLengthCal(key){
				let count = 0;
				for(let item in this.displayLabel[key]){
					if(this.displayLabel[key][item]){
						count += 1;
					}
				}
				this.tableLength[key] = count;
			},
			//table数据显示
			tableHandleDisPlay(cate){
				for (var i = 0; i < this.tableData.length; i++) {
					if(cate == this.tableData[i].cate_spec){
						this.tableData[i]._display = !this.tableData[i]._display;
					}
				}
				this.tableData.push();
			},
			//计算最新指数数据并保证页面数据没有改动的情况下计算一次
			checkIndex(){
				let popoverData = this.popoverData;
				let tableData = this.tableData;
				if(this.canLoadData){
					for(let item of tableData){
						for (var i = 0; i < popoverData.length; i++) {
							if(popoverData[i].name == item.cate_spec && item.spotDate){
								popoverData[i].data.push(item);
								break;
							}
						}
					}
					this.canLoadData = false;
				}
				this.popover = true;
			},
			//记录第一个显示的table数据的下标以及同品名的长度
			tableDataRecord(data){
				let popoverData = this.popoverData;
				for(let i = 0; i < 3;i++){
					let sum = 0;
					let start = 1;
					let startIndex = null;
					for (let j = 0; j < data.length; j++) {
						if( data[j].cate_spec == popoverData[i].name ){
							if((data[j][this.marketDiff?'descDiffDate':'diffDate']||data[j][this.marketDiff?'descDiffDate':'diffDate']==0)&&data[j].display){
								if(start){
									startIndex = j;
									start = 0;
								}
								sum += 1;
							}
						}
					}
					popoverData[i].count = sum;
					popoverData[i].startIndex = startIndex;
				}
				return data;
			},
			//获取开始下标以及长度等数据
			checkIsTableRecordIndex(index){
				let popoverData = this.popoverData;
				for (var i = 0; i < popoverData.length; i++) {
					if( popoverData[i].startIndex == index ){
						return { display:true, _length:popoverData[i].count, name:popoverData[i].name, sizeLimit:popoverData[i].sizeLimit };
					}
				}
				return { display:false, _length:null, name:null, sizeLimit:null };
			},
			//table[最新指数]排序
			sortPopoverData(methods, key, index){
				this.popoverData[index].data = this.sortFunc(methods, null, key, this.popoverData[index].data);
				this.popoverData[index].data.push();
			},
			//上下浮颜色显示
			getFontColor(type){
				if(type==0){
					return "red_font";
				}
				if(type==1){
					return "green_font";
				}
				if(type==2){
					return "yellow_font";
				}
			},
		},
	}
	</script>
	<template>
	<div>
		<headerbar active_number="stResource" :text="['资源推荐','推荐区域优势品牌']">
			<div>
				<div class="addr_box">
					<span> 选择送达地区: 广东省</span>
					<address-ui province="广东" grade="1" @getAddressData='getAddressData' ></address-ui>
					<el-button type="primary" size="small" style="float:right;" @click="checkIndex">最新指数</el-button>
				</div>

				<div class="price_box">
					<template v-if="!(timeSlot || timePoint)" >
						<span><b>显示项 :</b></span>
						<div class="inline_box">
							<label class="same_color" style="margin-right:20px;">差价:</label>
							<el-checkbox label="最新" v-model="displayLabel.price_diff.date" @change="tableHeadLengthCal('price_diff')"></el-checkbox>
							<el-checkbox label="周" v-model="displayLabel.price_diff.week" @change="tableHeadLengthCal('price_diff')"></el-checkbox>
							<el-checkbox label="月" v-model="displayLabel.price_diff.month" @change="tableHeadLengthCal('price_diff')"></el-checkbox>
						</div>
                        <div class="inline_box">
							<label class="same_color" >网价:</label>
							<el-checkbox label="最新" v-model="displayLabel.web_price.date" @change="tableHeadLengthCal('web_price')"></el-checkbox>
							<el-checkbox label="周" v-model="displayLabel.web_price.week" @change="tableHeadLengthCal('web_price')" style="margin-left:30px;display:inline-block;"></el-checkbox>
							<el-checkbox label="月" v-model="displayLabel.web_price.month" @change="tableHeadLengthCal('web_price')"  style="margin-left:30px;display:inline-block;"></el-checkbox>
						</div>
                        <div class="inline_box" style="margin-left: 75px">
							<label class="same_color" style="margin-right:5px;">现货价:</label>
							<el-checkbox label="最新" v-model="displayLabel.spot_price.date" @change="tableHeadLengthCal('spot_price')"></el-checkbox>
							<el-checkbox label="周" v-model="displayLabel.spot_price.week"  @change="tableHeadLengthCal('spot_price')"></el-checkbox>
							<el-checkbox label="月" v-model="displayLabel.spot_price.month"  @change="tableHeadLengthCal('spot_price')"></el-checkbox>
						</div>
						<div class="inline_box">
							<label class="same_color">品名:</label>
							<el-checkbox label="螺纹钢" v-model="displayLabel.cate_spec.steel" @change="tableHandleDisPlay('螺纹钢')"></el-checkbox>
							<el-checkbox label="盘螺" v-model="displayLabel.cate_spec.disk" @change="tableHandleDisPlay('盘螺')"></el-checkbox>
							<el-checkbox label="高线" v-model="displayLabel.cate_spec.highSpeedWire" @change="tableHandleDisPlay('高线')"></el-checkbox>
						</div>
						<span style="float:right">{{ this.newestDataDate.value }} &nbsp;&nbsp;  单位:元/吨</span>
					</template>

					<!-- 选择时间段时间点的table数据 -->
                    <div class="overflow_box" v-if="timeSlot || timePoint">

					<!-- <table v-if="timeSlot || timePoint" style="background:url('/data/images/back.png');"> -->
					<table  style="background:url('/data/images/back.png');">
						<thead>
							<th rowspan="2">推荐品牌
								<!-- <multiple name="推荐品牌" :options="filterDatas.brands" v-on:selectedArr="sortTableTime"></multiple> -->
							</th>
							<th rowspan="2" class="sm_width">品名</th>
							<th rowspan="2" class="sm_width">规格</th>
							<th rowspan="2" class="sm_width">材质</th>
							<th :colspan="chooseLength" v-if="marketDiff">到货平均价差
								 <el-tooltip class="item" content="平均包到价差 = 选中日期内,网价与市场包到价之差的平均数" placement="top">
									<span>(网价-到货价)</span>
								</el-tooltip>
							</th>
							<th :colspan="chooseLength" v-if="!marketDiff">广州仓平均价差
								<el-tooltip class="item" style="font-weight:none;" content="平均价差 =选中日期内,网价与市场价之差的平均数" placement="top">
									<span>(网价-现货价)</span><span style="display:inline-block;width:20px;background:#dedede;border-radious:50%;">?</span>
								</el-tooltip>
							</th>
							<th :colspan="chooseLength" >平均网价</th>
							<th :colspan="chooseLength" >平均现货价</th>
							<tr>
								<template v-if="marketDiff">
									<td v-for='item in chooseArray'>{{item}}
										<div class="sort-icon">
											<div @click="sortTableLine('asce', item, 'desPriceDiff', analysisData)">▲</div>
											<div @click="sortTableLine('desc', item, 'desPriceDiff', analysisData)" style="margin-top:-3px;">▼</div>
										</div>
									</td>
								</template>
								<template  v-if="!marketDiff">
									<td v-for='item in chooseArray'>{{item}}
										<div class="sort-icon">
											<div @click="sortTableLine('asce', item, 'priceDiff', analysisData)">▲</div>
											<div @click="sortTableLine('desc', item, 'priceDiff', analysisData)" style="margin-top:-3px;">▼</div>
										</div>
									</td>
								</template>
								<template >
									<td v-for='item in chooseArray'>{{item}}
										<div class="sort-icon">
											<div @click="sortTableLine('asce', item, 'webPrice', analysisData)">▲</div>
											<div @click="sortTableLine('desc', item, 'webPrice', analysisData)" style="margin-top:-3px;">▼</div>
										</div>
									</td>
								</template>
								<template >
									<td v-for='item in chooseArray'>{{item}}
										<div class="sort-icon">
											<div @click="sortTableLine('asce', item, 'soptPrice', analysisData)">▲</div>
											<div @click="sortTableLine('desc', item, 'soptPrice', analysisData)" style="margin-top:-3px;">▼</div>
										</div>
									</td>
								</template>
							</tr>
						</thead>
						<tbody>
							<tr v-for="item in analysisData">
								<template v-if="item.display">
									<td>
										<a href="javascript:void(0)" @click="moreInfo(item.brand)">{{item.brand}}</a>
									</td>
									<td class="sm_width">{{ item.spec }}</td>
									<td class="sm_width">{{ item.size }}</td>
									<td class="sm_width">{{ item.material }}</td>
									<template v-if="marketDiff" v-for="date in chooseArray">
										<td>{{ item[date].desPriceDiff ? item[date].desPriceDiff  : '-' }}</td>
									</template>
									<template v-if="!marketDiff" v-for="date in chooseArray">
										<td>{{ item[date].priceDiff ? item[date].priceDiff : '-'  }}</td>
									</template>
									<template v-if="webAvg" v-for="date in chooseArray">
										<td>{{ item[date].webPrice ? item[date].webPrice : '-' }}</td>
									</template>
									<template v-if="webAvg" v-for="date in chooseArray">
										<td>{{ item[date].soptPrice ? item[date].soptPrice : '-' }}</td>
									</template>
								</template>
							</tr>
						</tbody>
					</table>

                    </div>

					<!-- 今日近一周近一月table数据 -->
					<table v-else style="background:url('/data/images/back.png');">
						<thead>
							<tr>
								<th rowspan="2">
									<multiple name="推荐品牌" :options="filterDatas.brands" v-on:selectedArr="sortTable"></multiple>
								</th>
								<th rowspan="2" >品名/规格材质</th>
								<!-- <th rowspan="2">规格材质</th> -->
								<!-- <th rowspan="2">材质</th> -->
                                <th rowspan="2" v-if="marketDiff && (displayLabel.price_diff.date)">最新价差
                                    <div class="sort-icon">
                                        <div @click="sortTableLine('asce', '', 'descDiffDate', tableData )">▲</div>
                                        <div @click="sortTableLine('desc', '', 'descDiffDate', tableData )" style="margin-top:-3px;">▼</div>
                                    </div>
                                </th>
								<th :colspan="(displayLabel.price_diff.date)?(tableLength.price_diff-1):(tableLength.price_diff)" v-if="(marketDiff) && (displayLabel.price_diff.week || displayLabel.price_diff.month)">到货平均价差
									 <el-tooltip class="item" content="平均包到价差 =选中日期内,网价与市场包到价之差的平均数" placement="top">
										<span>(网价-到货价)</span>
									</el-tooltip>
								</th>
                                <th rowspan="2" v-if="(!marketDiff) && (displayLabel.price_diff.date)">最新价差
                                    <div class="sort-icon">
                                        <div @click="sortTableLine('asce','', 'diffDate', tableData)">▲</div>
                                        <div @click="sortTableLine('desc', '', 'diffDate', tableData)" style="margin-top:-3px;">▼</div>
                                    </div>
                                </th>
								<th :colspan="(displayLabel.price_diff.date)?(tableLength.price_diff-1):(tableLength.price_diff)" v-if="(!marketDiff) && ( displayLabel.price_diff.week || displayLabel.price_diff.month)" >广州仓平均价差
									<el-tooltip class="item" style="font-weight:none;" content="平均价差 =选中日期内,网价与市场价之差的平均数" placement="top">
										<span>(网价-现货价)</span><span style="display:inline-block;width:20px;background:#dedede;border-radious:50%;">?</span>
									</el-tooltip>
								</th>
                                <th rowspan="2" v-if="displayLabel.web_price.date" >最新网价
                                    <div class="sort-icon">
                                        <div @click="sortTableLine('asce', '', 'webDate', tableData)">▲</div>
                                        <div @click="sortTableLine('desc', '', 'webDate', tableData)" style="margin-top:-3px;">▼</div>
                                    </div>
                                </th>
								<th :colspan="(displayLabel.web_price.date)?(tableLength.web_price-1):(tableLength.web_price)" v-if="displayLabel.web_price.week || displayLabel.web_price.month" >平均网价</th>
                                <th rowspan="2" v-if="displayLabel.spot_price.date">最新现货价
                                    <div class="sort-icon">
                                        <div @click="sortTableLine('asce', '', 'spotDate', tableData)">▲</div>
                                        <div @click="sortTableLine('desc', '', 'spotDate', tableData)" style="margin-top:-3px;">▼</div>
                                    </div>
                                </th>
								<th :colspan="(displayLabel.spot_price.date)?(tableLength.spot_price-1):(tableLength.spot_price) " v-if=" displayLabel.spot_price.week || displayLabel.spot_price.month" >平均现货价</th>
							</tr>
							<tr>
								<template v-if="marketDiff">
									<td v-if="displayLabel.price_diff.week" >近一周
										<div class="sort-icon">
											<div @click="sortTableLine('asce', '', 'descDiffWeek', tableData)">▲</div>
											<div @click="sortTableLine('desc', '', 'descDiffWeek', tableData)" style="margin-top:-3px;">▼</div>
										</div>
									</td>
									<td v-if="displayLabel.price_diff.month" >近一月
										<div class="sort-icon">
											<div @click="sortTableLine('asce','', 'descDiffMount', tableData)">▲</div>
											<div @click="sortTableLine('desc','', 'descDiffMount', tableData)" style="margin-top:-3px;">▼</div>
										</div>
									</td>
								</template>
								<template  v-if="!marketDiff">
									<td v-if="displayLabel.price_diff.week" >近一周
										<div class="sort-icon">
											<div @click="sortTableLine('asce', '', 'diffWeekAvg', tableData)">▲</div>
											<div @click="sortTableLine('desc', '', 'diffWeekAvg', tableData)" style="margin-top:-3px;">▼</div>
										</div>
									</td>
									<td v-if="displayLabel.price_diff.month" >近一月
										<div class="sort-icon">
											<div @click="sortTableLine('asce', '', 'diffMountAvg', tableData)">▲</div>
											<div @click="sortTableLine('desc', '', 'diffMountAvg', tableData)" style="margin-top:-3px;">▼</div>
										</div>
									</td>
								</template>
								<template >
									<td v-if="displayLabel.web_price.week" >近一周
										<div class="sort-icon">
											<div @click="sortTableLine('asce', '', 'webWeekAvg', tableData)">▲</div>
											<div @click="sortTableLine('desc', '', 'webWeekAvg', tableData)" style="margin-top:-3px;">▼</div>
										</div>
									</td>
									<td v-if="displayLabel.web_price.month" >近一月
										<div class="sort-icon">
											<div @click="sortTableLine('asce', '', 'webMountAvg', tableData)">▲</div>
											<div @click="sortTableLine('desc', '', 'webMountAvg', tableData)" style="margin-top:-3px;">▼</div>
										</div>
									</td>
								</template>
								<template>
									<td v-if="displayLabel.spot_price.week" >近一周
										<div class="sort-icon">
											<div @click="sortTableLine('asce', '', 'spotWeekAvg', tableData)">▲</div>
											<div @click="sortTableLine('desc', '', 'spotWeekAvg', tableData)" style="margin-top:-3px;">▼</div>
										</div>
									</td>
									<td v-if="displayLabel.spot_price.month" >近一月
										<div class="sort-icon">
											<div @click="sortTableLine('asce', '', 'spotMountAvg', tableData)">▲</div>
											<div @click="sortTableLine('desc', '', 'spotMountAvg', tableData)" style="margin-top:-3px;">▼</div>
										</div>
									</td>
								</template>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="(item, index) in tableDataRecord(tableData)"
								v-if="(item[marketDiff?'descDiffDate':'diffDate']||item[marketDiff?'descDiffDate':'diffDate']==0) && item.display && item._display"
							>
								<template>
									<td>
										<a href="javascript:void(0)" @click="moreInfo(item.brand)">{{item.brand}}</a>
									</td>
									<td  v-if="checkIsTableRecordIndex(index).display" :rowspan="checkIsTableRecordIndex(index)._length" style="background:#eef1f6;">
										{{checkIsTableRecordIndex(index).name}} / {{checkIsTableRecordIndex(index).sizeLimit}}
									</td>
									<!-- <td  v-if="checkIsTableRecordIndex(index).display" :rowspan="checkIsTableRecordIndex(index)._length">
										{{checkIsTableRecordIndex(index).sizeLimit}}
									</td> -->
									<!-- <td>{{item.material}}</td> -->
									<template v-if="marketDiff">
										<td v-if="displayLabel.price_diff.date" >
											{{ !item.descDiffDate ? (item.descDiffDate==0?0:'-') : item.descDiffDate }}
											<!-- <font :class="getFontColor(item.descDiffDateFloat.type)">{{item.descDiffDateFloat.value}}</font> -->
										</td>
										<td v-if="displayLabel.price_diff.week" >
											{{ !item.descDiffWeek ? (item.descDiffWeek==0?0:'-') : item.descDiffWeek }}
											<!-- <font :class="getFontColor(item.descDiffWeekFloat.type)">{{item.descDiffWeekFloat.value}}</font> -->
										</td>
										<td v-if="displayLabel.price_diff.month" >
											{{ !item.descDiffMount ? (item.descDiffMount==0?0:'-') : item.descDiffMount }}
											<!-- <font></font> -->
										</td>
									</template>
									<template v-if="!marketDiff">
										<td v-if="displayLabel.price_diff.date" >
											{{ !item.diffDate ? (item.diffDate==0?0:'-') : item.diffDate }}
											<!-- <font :class="getFontColor(item.diffDateFloat.type)">{{item.diffDateFloat.value}}</font> -->
										</td>
										<td v-if="displayLabel.price_diff.week" >
											{{ !item.diffWeekAvg ? (item.diffWeekAvg==0?0:'-') : item.diffWeekAvg }}
											<!-- <font :class="getFontColor(item.diffWeekAvgFloat.type)">{{item.diffWeekAvgFloat.value}}</font> -->
										</td>
										<td v-if="displayLabel.price_diff.month" >
											{{ !item.diffMountAvg ? (item.diffMountAvg==0?0:'-') : item.diffMountAvg }}
											<!-- <font>{{item.diffWeekAvgFloat}}</font> -->
										</td>
									</template>
									<template>
										<td v-if="displayLabel.web_price.date" >
											{{ !item.webDate ? '-' : item.webDate }}
											<font :class="getFontColor(item.webDateFloat.type)">{{item.webDateFloat.value}}</font>
										</td>
										<td v-if="displayLabel.web_price.week" >
											{{ !item.webWeekAvg ? '-' : item.webWeekAvg }}
											<font :class="getFontColor(item.webWeekAvgFloat.type)">{{item.webWeekAvgFloat.value}}</font>
										</td>
										<td v-if="displayLabel.web_price.month" >
											{{ !item.webMountAvg ? '-' : item.webMountAvg }}
											<!-- <font>{{item.diffWeekAvgFloat}}</font> -->
										</td>
									</template>
									<template>
										<td v-if="displayLabel.spot_price.date" >
											{{ !item.spotDate ? '-' : item.spotDate }}
											<font :class="getFontColor(item.spotDateFloat.type)">{{item.spotDateFloat.value}}</font>
										</td>
										<td v-if="displayLabel.spot_price.week" >
											{{ !item.spotWeekAvg ? '-' : item.spotWeekAvg }}
											<font :class="getFontColor(item.spotWeekAvgFloat.type)">{{item.spotWeekAvgFloat.value}}</font>
										</td>
										<td v-if="displayLabel.spot_price.month" >
											{{ !item.spotMountAvg ? '-' : item.spotMountAvg }}
											<!-- <font>{{item.diffWeekAvgFloat}}</font> -->
										</td>
									</template>
								</template>
							</tr>
						</tbody>
					</table>

				</div>
			</div>
		</headerbar>

        <!-- 最新指数弹出框 -->
        <el-dialog v-model="popover"  :title="'广东区域市场最新指数'+'  '+newestDataDate.value"  size="large" style="text-align:center;">
            <div style="float:left;width:33%;margin-top:0px;margin-bottom:50px;" v-for="(item,_index) in popoverData">
                <div class="top_style">
                    <span>{{item.name+item.sizeLimit}}</span>
                </div>
                <table style="background:url('/data/images/back.png');margin-top:0px;">
                    <thead>
                        <tr>
                            <th style="width:40px;">序列</th>
                            <th>钢厂</th>
                            <th>现货价
                                <div class="sort-icon">
                                    <div @click="sortPopoverData('asce','spotDate',_index)">▲</div>
                                    <div @click="sortPopoverData('desc','spotDate',_index)" style="margin-top:-3px;">▼</div>
                                </div>
                            </th>
                            <th>网价
                                <div class="sort-icon">
                                    <div @click="sortPopoverData('asce','webDate',_index)">▲</div>
                                    <div @click="sortPopoverData('desc','webDate',_index)" style="margin-top:-3px;">▼</div>
                                </div>
                            </th>
                            <th>价差
                                <div class="sort-icon">
                                    <div @click="sortPopoverData('asce','diffDate',_index)">▲</div>
                                    <div @click="sortPopoverData('desc','diffDate',_index)" style="margin-top:-3px;">▼</div>
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="(li, index) in item.data">
                            <td style="width:40px;">{{index+1}}</td>
                            <td>{{li.brand}}</td>
                            <td>
                                {{li.spotDate}}
                                <font :class="getFontColor(li.spotDateFloat.type)">{{li.spotDateFloat.value}}</font>
                            </td>
                            <td>
                                {{li.webDate}}
                                <font :class="getFontColor(li.webDateFloat.type)">{{li.webDateFloat.value}}</font>
                            </td>
                            <td>
                                {{li.diffDate}}
                                <font :class="getFontColor(li.diffDateFloat.type)">{{li.diffDateFloat.value}}</font>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </el-dialog>

		<!-- 固定框 -->
		<div class="fixBox">
			<button id="onBox" @click="showBox">搜索更多数据
				<i class="el-icon-arrow-left" style="font-size:20px;"></i>
			</button>
			<div id="selectBox" v-show="isShowOptions">
				<div>
                    <el-form :model="searchInfo" :rules="rules" ref="searchInfo"  label-width="120px">
    					<el-form-item label="剔除异常数据:">
    						<span>上限
    							<el-input type="number" v-model="searchInfo.upper_limit" style="width:60px;" size="small"></el-input>%,
    						</span>
    						<span>下限
    							<el-input type="number" v-model="searchInfo.floor_limit" style="width:60px;" size="small"></el-input>%,
    						</span>
    					</el-form-item>

                        <el-form-item prop="brands" label="品牌">
                            <el-select v-model="searchInfo.brands" multiple  @change="changBrand" >
    							<el-option v-for="item in initData.brandData" :label="item.brand" :value="item.brand"></el-option>
    						</el-select>
                        </el-form-item>

                        <el-form-item prop="product" label="品名" >
                            <el-select v-model="searchInfo.product" @change="changProduct">
    							<el-option v-for="item in initData.productGroup" :label="item.cate_spec" :value="item.cate_spec"></el-option>
    						</el-select>
                        </el-form-item>

                        <el-form-item prop="material" label="材质" >
                            <el-select v-model="searchInfo.material" @change="changMaterial">
    							<el-option v-for="item in initData.materialGroup" :label="item.material" :value="item.material"></el-option>
    						</el-select>
                        </el-form-item>

                        <el-form-item prop="type" label="规格" >
                            <el-select v-model="searchInfo.type">
    							<el-option v-for="item in initData.typeGroup" :label="item.size" :value="item.size"></el-option>
    						</el-select>
                        </el-form-item>
                    </el-form>
					<p>
						<span class="fixWidth">查询方式:</span>
						<el-checkbox label="时间段" v-model="timeSlot"></el-checkbox>
						<el-checkbox label="时间点" v-model="timePoint"></el-checkbox>
					</p>
					<p v-if="timeSlot">
						<span class="fixWidth">选择时间段:</span>
						<el-date-picker v-model="dateRange" type="daterange"  @change="changDateRange" :picker-options="pickerOptions" placeholder="选择日期范围"></el-date-picker>
					</p>
					<p v-if="timePoint">
						<span class="fixWidth">选择时间点:</span>
						<el-date-picker v-model="forePoint" type="date" :picker-options="pickerOptions"  @change="forePointDate(forePoint)" placeholder="选择时间点"></el-date-picker><br>
					</p>
					<p v-for="(date, index) in dateArray" style="text-align:center;margin-top:5px;" v-if="timePoint">
						<span>{{ date }} <el-button type="small" @click="delOne(index)">删除</el-button></span>
					</p>
					<p class="button_box">
						<el-button @click="clearAllData" type="danger">重置</el-button>
						<!-- <el-button @click="search">查询</el-button> -->
						<el-button @click="submitInfo('searchInfo')">查询</el-button>
					</p>
				</div>
				<button id="offBox" @click="showBox">数据统计分析
					<i class="el-icon-arrow-right" style="font-size:20px;"></i>
				</button>
			</div>
		</div>
	</div>
</template>
<style scoped>
	*{
		font-size: 14px;
	}
	a{
		text-decoration: none;
	}
	#selectBox{
		position: relative;
		width: 450px;
		height: auto;
		padding: 10px;
		background-color: #409EFF;
		color: #fff;
	}
	#selectBox p{
		margin-top: 20px;
	}
	#selectBox .el-checkbox{
		color: #fff;
	}
	.fixWidth{
		display: inline-block;
		width: 90px;
		margin-left: 50px;
	}
	.fixBox{
		font-size: 14px;
		position: absolute;
		right: 40px;
		top:200px;
		z-index: 2;
	}
	#offBox{
		position: absolute;
		right: -40px;
		top: 0;
		display: inline-block;
		width: 20px;
		height: auto;
		border: none;
		padding: 20px 30px 10px 10px;
		text-align: center;
		font-size: 18px;
		color: #fff;
		background-color: #409EFF;
	}
	#onBox{
		position: absolute;
		left: 0;
		top: 25px;
		display: inline-block;
		width: 20px;
		border: none;
		padding: 20px 30px 10px 10px;
		text-align: center;
		font-size: 18px;
		height: auto;
		color: #fff;
		background-color: #409EFF;
	}
    .inline_box{
        display: inline-block;
        width: 40%;
        margin-left: 20px;
    }
    .same_color{
        color:#F56C6C;
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
	.addr_box{
		padding:10px 15px;
		background-color: #fff;
	}
	.price_box{
		margin-top:10px;
		margin-bottom: 30px;
		padding:15px;
		background-color: #fff;
	}
	.button_box{
		text-align: center;
	}
	.button_box button{
		width: 80px;
		text-align: center;
		padding: 8px;
		margin: 5px;
	}
	.red_font{
		color:#aa1010;
	}
	.green_font{
		color:#10aa10;
	}
	.yellow_font{
		color:#aaaa10;
	}
    .sm_width{
        width:80px;
    }
    .top_style{
        font-weight: bold;
        width:99.9%;
        border: 1px solid #dfe6ec;
        display:inline-block;
        background:#eef1f6;
        margin-bottom:0px;
        height:40px;
        line-height:40px;
    }

    .overflow_box {
        min-width:1000px;
        overflow-x:scroll;
        overflow-y:hidden;
    }
    .overflow_box table{
        min-width:100%;
        width: auto;
    }

</style>
