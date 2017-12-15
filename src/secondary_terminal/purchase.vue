<script>
	import addsData from "../../res/json/provinceList.json";
	import headerbar from '../components/same-headerbar.vue';
	import ajaxCustom from '../components/ajax-custom.js';
	import projectChanger from '../components/project_to_text.js';
	import desc from '../components/steel-sort.js';
	import demand from '../components/demand_plan.vue';
	import projectCreate from '../components/ProjectCreating/project-creating-box.vue';
	import order from './components/order_second_terminal.vue';

	import proTable from '../components/table.vue';
	import filterBar from '../components/filter-bar-buy.vue';
	import sortMethods from '../components/steel-sort.js';
	import { Select, Option, Button, RadioGroup, Radio, Table, TableColumn, DatePicker, Input, Dialog, Loading, MessageBox, Message, Tabs, TabPane } from 'element-ui';
	export default{
		components : {
			headerbar,
			order,
			demand,
			ajaxCustom,
			projectCreate,
			elSelect : Select,
			elOption : Option,
			elButton : Button,
			elRadioGroup : RadioGroup,
			elRadio : Radio,
			elTable : Table,
			elTableColumn : TableColumn,
			elTabs : Tabs,
			elTabPane : TabPane,
			elDatePicker : DatePicker,
			elInput : Input,
			elDialog : Dialog,
			proTable : proTable,
			filterBar : filterBar
		},
		created(){
			this.getSoptPrice();
			this.getAllProjects();
			this.getOtherName();
			this.getCity();
		},
		data(){
			return{
				isOrderChange : 0,
				activeName : 'first',
				formDatas : {
					city : null,
					area : null
				},
				addsData,
				cityOption : [],
				areaOption : [],
				openBox : false,
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
				// 项目
				userProject : {
					item : [],
					selected : null,
					info : {}
				},
				// 品牌选择
				brands : {
					selected : [],
					item : []
				},
				// 选择的品牌或者项目中的品牌
				selectBrands : [],
				// 价格排序方式
				sortWay : null,
				// 需求计划单传过来的数据
				planDataSelect : [],
				// 别名表
				nameList : [],
				hasChange : 0,
				showFilterBool : false,
				fiterData : [],
				isShowSelect : false,
				webPriceTotal :0,
				spotPriceTotal :0,
				priceDifftTotal :0,
				amountTotal :0,
				adds:{
					city:null,
					area:null
				}
			}
		},
		methods : {
			// 获取市区
			getCity(){
				for (var i = 0; i < this.addsData.province.length; i++) {
					if (this.addsData.province[i].name=='广东') {
						this.cityOption=this.addsData.province[i].cityList;
					}
				}
			},
			// 获取县
			getArea(){
				this.formDatas.area = "";
				for (var i = 0; i < this.cityOption.length; i++) {
					if (this.cityOption[i].name == this.formDatas.city) {
						this.areaOption=this.cityOption[i].areaList;
					}
				}
			},
			// 别名处理
			getOtherName(){
				ajaxCustom.ajaxGet(this, 'dingoapi/getBrandsElseName', (response)=>{
					console.log(response);
					this.nameList = response.body.data.nameList;
				}, (response)=>{
					alert(response.body.message);
				});
			},
			// 改变品牌
			changeBrand(data){
				let brand = this.userProject.selected;
				if(data.length != 0){
					if(brand){
						MessageBox.confirm('当前已选中品牌范围与送达地址，是否清空当前数据选择项目？', '提示', {
							confirmButtonText: '确定',
							cancelButtonText: '取消',
							type: 'warning'
						}).then(() => {
							this.spotTable = true;
							this.userProject.selected = null;
							this.selectBrands = data;
							this.showTableAll();

						}).catch(() => {
							this.brands.selected = [];
						});
					}else{
						this.selectBrands = data;
						this.showTableAll();
					}
				}
			},
			// 获取所有品牌
			// getAllBrands(){
			// 	ajaxCustom.ajaxGet(this, "dingoapi/getAllProduct", (responese)=>{
			// 		console.log(responese)
					// let resData = responese.body;
					// let arr = [];
					// for(let brand of resData.brand){
					// 	arr.push({ "value" : brand.brand});
					// }
					// this.brands.item = arr;
			// 	}, (responese)=>{
			// 		alert(responese.body.message);
			// 	});
			// },
			// 新建项目
			addProject(formDatas){
				ajaxCustom.ajaxPost(this, "dingoapi/addProjectDatas", formDatas, (response)=>{
					console.log(response)
					alert("添加成功");
					this.userProject.item = response.body.data.reverse();
					this.userProject.selected = this.userProject.list[0].project_info_id;
				}, (response)=>{
					alert(response.body.message);
				});
			},
			// 获取项目
			getAllProjects(){
				ajaxCustom.ajaxGet(this, "dingoapi/getOrderPageDefault", (response)=>{
					console.log(response);
					let project = response.body.data.projectDatas;
					if(project.length){
						this.userProject.item = project.reverse();
					}
				}, (response)=>{
					alert(response.body.message);
				});
			},
			// 变更项目
			changeProject(selectPro){
				let pro = this.userProject.item;
				var brands = null;
				for(let i = 0; i < pro.length; i++ ){
					if(pro[i].project_info_id == selectPro){
						brands = pro[i].brands;
						this.userProject.info = pro[i];
						this.userProject.info.settlementText = projectChanger.todo(pro[i], true);
						this.getFreight(pro[i].city, pro[i].area);
					}
				}
				if(brands){
					let brand = this.brands.selected;
					if(brand.length != 0){
						MessageBox.confirm('当前已选中项目，是否清空当前数据品牌范围与送达地址？', '提示', {
							confirmButtonText: '确定',
							cancelButtonText: '取消',
							type: 'warning'
						}).then(() => {
							this.brands.selected = [];
							this.selectBrands = brands;
							this.formDatas.city = null;
							this.formDatas.area = null;
							this.showTableAll();

						}).catch(() => {
							this.userProject.selected = null;
						});
					}else{
						this.selectBrands = brands;
						this.showTableAll();
					}
				}
			},
			//过滤
			getFiltersData(data){
				if(!data){
					return;
				}
				this.filters = {};
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
					this.filters[filter] = [];
				}
				for (var i = 0; i < this.filters[filter].length; i++) {
					if(this.filters[filter][i].text == data){
						return ;
					}
				}
				this.filters[filter].push({'text' : data, 'value' : data});
			},
			// 获取地址进行运费计算
			getAddressData(value){					//地址
				if(value){
					this.getFreight(this.formDatas.city, this.formDatas.area);
				}
			},
			emptyAdds(){
				this.formDatas.city = null;
				this.formDatas.area = null;
				this.spotTable = true;
			},
			// 改变日期获取现货价网价的数据
			changeDate(date){						//日期
				this.getSoptPrice(date);
			},
			// 改变时间次序
			setQuotation(value){					//报价次序
				if(value>=0){
					this.spotPrice = this.spotPriceAll[value];
					this.spotPrice = desc.todo(this.spotPrice, [
						{ text : "品名", key : "cate_spec" },
						{ text : "规格", key : "size" },
						{ text : "材质", key : "material" }
					], "desc", "price");

					// this.fiterData = this.spotPrice;
					// this.hasChange += 1;
					this.showTableAll();
				}
			},
			//获取现货价，网价数据
			getSoptPrice(date){
				this.selectQuotation = null;
				let loadingInstance = Loading.service({ fullscreen: true});
				ajaxCustom.ajaxGet(this, "dingoapi/getSoptPrice", { params : { 'date' : date } }, (responese)=>{
					if (!responese.body.soptPrice.length) {
						//当日无数据，清空表数据
						this.spotPrice = [];
					}else{
						this.date = responese.body.date;
						let times = responese.body.times;
						//获取数据
						var index = responese.body.soptPrice.length;
						var data =	responese.body.soptPrice;
						for (let i = 0; i < index; i++) {
							data[i] = desc.todo(data[i], [
								{ text : "品名", key : "cate_spec" },
								{ text : "规格", key : "size" },
								{ text : "材质", key : "material" },
							], "desc", "price");
						}
						this.spotPriceAll = data;
						if (this.spotPriceAll.length) {
							for (let i = 0; i < this.spotPriceAll.length; i++) {
								this.spotPriceAll[i] = this.getPriceTotal(this.SoptPriceAddFreight(this.spotPriceAll[i], this.freight));
								this.spotPriceAll[i] = this.calculation(responese.body.webprice, this.spotPriceAll[i]);
								this.spotPriceAll[i] = this.getTotalDiff(this.spotPriceAll[i]);
							}
						}
						this.getFiltersData(this.spotPrice);
						//报价次数选择框操作
						this.selectQuotationOption = [];
						for (let i = 0; i < index; i++) {
							if( i==index-1 ){
								this.selectQuotationOption.push('最新  '+times[i]);
								break;
							}
							this.selectQuotationOption.push(this.quotation[i]+'  '+times[i]);
						}

						let brands = responese.body.brands[index-1];
						let arr = [];
						for(let brand of brands){
							arr.push({ "value" : brand});
						}
						this.brands.item = arr;

						this.selectQuotation = index-1;
					}
					loadingInstance.close();
				}, (responese)=>{
					alert(responese.body.message);
					loadingInstance.close();
				});
			},
			//获取运费
			getFreight( city, area ){
				//记录送到区域
				this.adds.city = city;
				this.adds.area = area;
				// this.selectQuotation = null;
				let loadingInstance = Loading.service({ fullscreen: true });
				this.spotPrice = [];
				//获取运费区域指数
				if(area){
					ajaxCustom.ajaxGet(this, "dingoapi/getFreightByCity",
					{ params : { 'city' : city, 'area' : area } }, (responese) => {
						this.freight = responese.data.data;
						if (this.spotPriceAll.length) {
							for (var i = 0; i < this.spotPriceAll.length; i++) {
								this.spotPriceAll[i] = this.getPriceTotal(this.SoptPriceAddFreight(this.spotPriceAll[i], this.freight));
								this.spotPriceAll[i] = this.getTotalDiff(this.spotPriceAll[i]);
							}
							this.spotTable = 0;
						}
						this.showTableAll();
						this.updateAllCal()
						console.log(responese)
						loadingInstance.close();
					}, (responese) => {
						alert(responese.data.message);
						loadingInstance.close();
					});
					this.addsselect = 1;
				}
			},
			//运费计算
			SoptPriceAddFreight(spotPrice, freight){
				for (var i = 0; i < spotPrice.length; i++) {
					if (spotPrice[i].transport == '广州仓发货') {
						if (freight.warehouse) {
							this.$set(spotPrice[i], 'freight', parseInt(freight.warehouse));
							continue ;
						}
					}else{
						for(let brand in freight.mill){
							if(spotPrice[i].brand == brand){
								this.$set(spotPrice[i], 'freight', parseInt(freight.mill[brand]));
								break;
							}
						}
					}
					if(!spotPrice[i].freight){
						spotPrice[i].freight = '-';
					}
				}
				return spotPrice;
			},
			//现货包到价
			getPriceTotal(spotPrice){
				for (var i = 0; i < spotPrice.length; i++) {
					spotPrice[i].total = '-';
					if(parseInt(spotPrice[i].freight)){
						spotPrice[i].total = spotPrice[i].freight + spotPrice[i].price;
					}
				}
				return spotPrice;
			},
			//网价,现货价差价计算
			calculation(webPrice, spotPrice){
				for(let data of spotPrice){
					for(let item of this.nameList){
						if(data.brand == item.abbreviation){
							data.elseName = item.full_name;
							break;
						}else if(data.brand == item.full_name){
							data.elseName = item.abbreviation;
							break;
						}
					}
					data.web_price = '-';
					data.web_spot_diff = '-';
					for(let _data of webPrice){
						if(data.cate_spec == _data.product && (data.brand == _data.brands ||  data.elseName==_data.brands)&& data.size == _data.type && data.material == _data.material)
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
					spotPrice.web_total_diff = spotPrice.web_price - spotPrice.total;
					if(isNaN(spotPrice.web_total_diff)){
						spotPrice.web_total_diff = '-';
					}
				}
				return spotPrice;
			},
			// 默认显示现货价最优价格的数据
			demandConfirm(data){
				this.sortWay = data.way;
				this.planDataSelect = data.selectData;
				this.demand = false;

			},
			updateAllCal(){
				let mayChangeKey = this.spotTable?'web_spot_diff':'web_total_diff';
				let price = this.spotTable?'price':'total';
				let data = this.spotPriceAll[this.selectQuotation];
				this.webPriceTotal=this.calculationTotal('web_price', data);
				this.spotPriceTotal=this.calculationTotal(price, data);
				this.priceDifftTotal=this.calculationTotal(mayChangeKey, data);
				this.amountTotal=this.calculationTotal('amount', data);
			},
			// 跳过的时候进行数据清空
			demandCancel(){
				// this.userProject.selected = null;
				// this.brands.selected = [];
				// this.selectBrands = [];
				// this.planDataSelect = [];
				this.demand = false;
				// this.fiterData = this.spotPriceAll[this.selectQuotation];
				// this.hasChange += 1;
				this.showTableAll();
			},
			back(){
				this.demand = true;
			},
			// 生成订单
			createOrder(){
				var count = 0;
				for(let i = 0; i < this.spotPrice.length;i++ ){
					if(this.spotPrice[i].amount){
						count++;
					}
				}
				if(!count){
					Message({
						type : 'warning',
						message : '请输入数量'
					});
					return;
				}
				var date = new Date();
				date = this.dateFormat(date);
				if(this.date != date){
					MessageBox.confirm('网价和市场价不是今天的数据, 是否继续下单?', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					}).then(() => {
						this.existNum();
						this.isOrderChange+=1;
						this.showOrder = !this.showOrder;

					}).catch(() => {
						this.showOrder = false;
					});

				}else{
					this.existNum();
					this.showOrder = !this.showOrder;
				}
			},
			// 判断是否输入订单数量
			existNum(){
				this.order.orderDetail = [];
				for (let i = 0; i < this.spotPrice.length; i++) {
					if(this.spotPrice[i].amount){
						this.order.orderDetail.push(JSON.parse(JSON.stringify(this.spotPrice[i])));
					}
				}
			},
			exitOrder(){
				this.showOrder = !this.showOrder;
			},
			placeOrder(data){
				data.project_id = this.userProject.selected;
				ajaxCustom.ajaxPost(this, '/dingoapi/saveStOrder', data, (responese)=>{
					console.log(responese);
					window.location.href='/stUserOrder';
				}, (responese)=>{
					alert(responese.body.message);
				});
				this.showOrder = !this.showOrder;
			},
			// 查看所有
			showTableAll(){
				this.spotPrice = [];
				let data = this.spotPriceAll[this.selectQuotation];
				for (var i = 0; i < data.length; i++) {
					if(this.isInBrandsArray(data[i])&&this.isInType(data[i])){
						this.spotPrice.push(data[i]);
					}
				}

				let result = sortMethods.todo(this.spotPrice, [
					{ text : "品名", key : "cate_spec" },
					{ text : "规格", key : "size" },
					{ text : "材质", key : "material" },
					{ text : "差价", key : "web_spot_diff" }
				], 'asce');
				this.spotPrice = result;
				this.fiterData = this.spotPrice;
				this.hasChange += 1;
				this.isShowSelect = false;
			},
			isInBrandsArray(item){
				if(this.selectBrands.length==0){
					return true;
				}
				for (var i = 0; i < this.selectBrands.length; i++) {
					if(this.selectBrands[i]==item.brand){
						return true;
					}
				}
				return false;
			},
			isInType(item){
				if(this.planDataSelect.length==0){
					return true;
				}
				for (var i = 0; i < this.planDataSelect.length; i++) {
					if(this.planDataSelect[i].size==item.size&&this.planDataSelect[i].material==item.material&&this.planDataSelect[i].spec==item.cate_spec){
						return true;
					}
				}
				return false;
			},
			// 查看所选
			showSelect(){
				this.selectData = [];
				this.spotPrice = this.spotPriceAll[this.selectQuotation];
				for(let i = 0; i < this.spotPrice.length; i++){
					if(this.spotPrice[i].amount){
						this.selectData.push(this.spotPrice[i]);
					}
				}
				this.spotPrice = this.selectData;
				this.fiterData = this.spotPrice;
				this.hasChange += 1;
				this.isShowSelect = true;

			},
			//日期对象格式化
			dateFormat(date){
				var year = date.getFullYear();
				var month = (date.getMonth()+1).toString();
				var day = (date.getDate()).toString();
				if(month.length == 1){
					month = '0'+ month;
				}
				if(day.length == 1){
					day = '0' + day;
				}
				var dateTime = year + "-" + month + "-" + day;
				return dateTime;
			},
			//差价最大
			bestDiffPrice(data){
				let items = this.planDataSelect;
				let recorddata = [];
				for(let j = 0; j<items.length; j++){
					recorddata.push({});
					for (var i = 0; i < data.length; i++) {
						if( data[i].size == items[j].size && data[i].material == items[j].material && data[i].cate_spec == items[j].spec
							&& this.isInBrandsLimit(this.selectBrands, data[i].brand) && data[i].web_spot_diff!='-'){
							if(!recorddata[j].id || recorddata[j].web_spot_diff < data[i].web_spot_diff){
								recorddata[j] = data[i];
							}
						}
					}
				}
				recorddata = this.deleteNullObject(recorddata);
				return recorddata;
			},
			//现货价最低
			bestPrice(data){
				let items = this.planDataSelect;
				let recorddata = [];
				for(let j = 0; j<items.length; j++){
					recorddata.push({});
					for (var i = 0; i < data.length; i++) {
						if( data[i].size == items[j].size && data[i].material == items[j].material && data[i].cate_spec == items[j].spec
							&& this.isInBrandsLimit(this.selectBrands, data[i].brand)){
							if(!recorddata[j].id || recorddata[j].price > data[i].price){
								recorddata[j] = data[i];
							}
						}
					}
				}
				recorddata = this.deleteNullObject(recorddata);
				return recorddata;
			},
			//品牌优先
			sortByBrand(data){
				let  spotPriceData = this.groupByBrand(data);
				spotPriceData = this.getBrandsInLimit(spotPriceData);
				let brandSelectData = this.getBestPriceSourceByBrand(spotPriceData);
				return brandSelectData;
			},
			//仓库优先
			sortByWarehouse(data){
				let  spotPriceData = this.groupByWarehouse(data);
				let returndata = this.getBestPriceSourceByWarehouse(spotPriceData);
				return returndata;
			},
			//去除空对象
			deleteNullObject(data){
				let returndata = [];
				for (var i = 0; i < data.length; i++) {
					if(data[i].id){
						returndata.push(data[i]);
					}
				}
				return returndata;
			},
			//品牌分组
			groupByBrand(data){
				let datareturn = [];
				for (var i = 0; i < data.length; i++) {
					let door = false;
					for (var j = 0; j < datareturn.length&&!door; j++) {
						if(datareturn[j].name==data[i].brand){
							datareturn[j].items.push(data[i]);
							door = true;
						}else{
							door = false;
						}
					}
					if (!door) {
						datareturn.push({items:[data[i]], name:data[i].brand});
					}
				}
				return datareturn;
			},
			//仓库分组
			groupByWarehouse(data){
				let datareturn = [];
				for (var i = 0; i < data.length; i++) {
					let door = false;
					for (var j = 0; j < datareturn.length&&!door; j++) {
						if(datareturn[j].name==data[i].warehouse){
							datareturn[j].items.push(data[i]);
							door = true;
						}else{
							door = false;
						}
					}
					if (!door) {
						datareturn.push({items:[data[i]], name:data[i].warehouse});
					}
				}
				return datareturn;
			},
			//判断是否在品牌范围内
			isInBrandsLimit(brands, brand){
				for(let item of brands){
					if(item == brand){
						return true;
					}
				}
				return false;
			},
			//获取品牌范围内数据
			getBrandsInLimit(brandsPrice){
				let inLimitGroup = [];
				for(let item of brandsPrice){
					if(this.isInBrandsLimit(this.selectBrands, item.name)){
						inLimitGroup.push(item);
					}
				}
				return inLimitGroup;
			},
			//获取最佳数据组合（现货最全以及差价最大）
			getBestPriceSourceByBrand(data){
				let returndata = { name:'init', items:[], priceTotal : -1 };
				for (var i = 0; i < data.length; i++) {
					let item =this.getPlanSelectPriceData(data[i].items);
					if( returndata.items.length < item.data.length){
						returndata = { name:data[i].name, items:item.data, priceTotal:item.priceSum };
					}else {
						if(returndata.priceTotal<item.priceSum&&returndata.items.length==item.data.length){
							returndata = { name:data[i].name, items:item.data, priceTotal:item.priceSum };
						}
					}
				}
				return returndata.items;
			},
			//获取最佳仓库最佳数据
			getBestPriceSourceByWarehouse(data){
				let warehouseGroup = [];
				for (let i = 0; i < data.length; i++) {
					if(data[i].name == '钢厂直送'){
						warehouseGroup.push(this.sortByBrand(data[i].items));
					}else{
						warehouseGroup.push(this.bestDiffPrice(data[i].items));
					}
				}
				let returndata = { name:'init', items:[], priceTotal:-1 };
				for (let i = 0; i < warehouseGroup.length; i++) {
					let item = this.getPlanSelectPriceData(warehouseGroup[i]);
					if(returndata.items.length<item.data.length){
						returndata = { name:data[i].name, items:item.data, priceTotal:item.priceSum };
					}else {
						if(returndata.priceTotal<item.priceSum&&returndata.items.length==item.data.length){
							returndata = { name:data[i].name, items:item.data, priceTotal:item.priceSum };
						}
					}
				}
				return returndata.items;
			},
			//获取整合计划单数据（包括总价和具体数据）
			getPlanSelectPriceData(data){
				let returndata = [];
				let priceSum = 0;
				for ( let item of this.planDataSelect ) {
					for (var i = 0; i < data.length; i++) {
						if(data[i].size == item.size && data[i].material == item.material && data[i].cate_spec == item.spec){
							returndata.push(data[i]);
							priceSum+=item.value*data[i].web_spot_diff;
							break;
						}
					}
				}
				return {data:returndata, priceSum:priceSum};
			},
			//赋值
			addAmount(data){
				for (let item of this.planDataSelect) {
					for (var i = 0; i < data.length; i++) {
						if(data[i].size == item.size && data[i].material == item.material && data[i].cate_spec == item.spec){
							data[i].amount = item.value;
						}
					}
				}
			},
			//清空数量
			deleteAmount(data){
				for (var i = 0; i < data.length; i++) {
					if(data[i].amount){
						data[i].amount = null;
					}
				}
			},
			// filter-bar数据的渲染 nm
			getListToChange(result){
				this.spotPrice = result;
			},
			// 排序方式
			sortPrice(type, key, text){
				let result = sortMethods.todo(this.spotPrice, [
					{ text : "品名", key : "cate_spec" },
					{ text : "规格", key : "size" },
					{ text : "材质", key : "material" },
					{ text : text, key : key }
				], type);
				let data = this.spotPriceAll[this.selectQuotation];
				for (var i = 0; i < data.length; i++) {
					for (var j = 0; j < result.length; j++) {
						if(result[j].id==data[i].id){
							data[i] = result[j];
						}
					}
				}
				this.spotPrice = result;
			},
			// 显示筛选品牌材质规格等选项
			showFilter(){
				if(this.showFilterBool){
					$(".showAllHeight").css({minHeight:'100px'});
				}else{
					$(".showAllHeight").css({minHeight:'240px'});
				}
				this.showFilterBool = !this.showFilterBool;
			},
			//总价
			calculationTotal(key, data){
				if(!data){
					return 0;
				}
				let sum = 0;
				if(key == 'amount'){
					for (let i = 0; i < data.length; i++) {
						if(data[i].amount){
							sum += parseInt(data[i][key]);
						}
					}
					return sum;
				}
				for (let i = 0; i < data.length; i++) {
					if((data[i][key]!='-')&&parseInt(data[i][key])&&(data[i].amount)){
						sum += (parseInt(data[i][key])*parseInt(data[i].amount));
					}
				}
				return sum;
			},
			calBegin(item){
				let data = this.spotPriceAll[this.selectQuotation];
				for (var i = 0; i < data.length; i++) {
					if(data[i].id==item.id){
						this.spotPriceAll[this.selectQuotation][i] = item;
					}
				}
				this.updateAllCal();
			},
			closeOrder(){
				this.showOrder = !this.showOrder;
			}

		},
		watch : {
			sortWay(n){
				this.spotPrice = this.spotPriceAll[this.selectQuotation];
				this.deleteAmount(this.spotPrice);
				if(n==1){
					let spot = this.bestDiffPrice(this.spotPrice);
					this.addAmount(spot);
				}else if(n==2){
					let spot = this.bestPrice(this.spotPrice);
					this.addAmount(spot);
				}else if(n==4){
					let spot = this.sortByBrand(this.spotPrice);
					this.addAmount(spot);
				}else if(n==3){
					let spot = this.sortByWarehouse(this.spotPrice);
					this.addAmount(spot);
				}
				// this.showTableAll(1);
				this.showSelect();
				this.updateAllCal();
			}
		}
	}
</script>
<template>
	<div>
		<headerbar active_number="2" :identity="2" :text="['需求计划单','钢材现货购买']">
			<div>
				<div class="box_project">
					<el-tabs v-model="activeName">
					    <el-tab-pane label="选择品牌" name="first">
					    	<p>
						    	<span><b>选择品牌:</b></span>
								<el-select v-model="brands.selected" size="small" multiple @change="changeBrand">
									<el-option v-for="item in brands.item" :value="item.value" :label="item.value"></el-option>
								</el-select>
					    	</p>
							<p v-show='!demand'>
								<span><b>送达地址:</b></span>
								<el-select v-model="formDatas.city" @change="getArea()" size="small" placeholder="城市">
									<el-option v-for="item in cityOption " :label="item.name" :value="item.name"></el-option>
								</el-select>
								<el-select v-model="formDatas.area" size="small" placeholder="区\县" @change="getAddressData">
									<el-option v-for="item in areaOption " :label="item" :value="item"></el-option>
								</el-select><el-button @click=emptyAdds() size="small">置空</el-button>
							</p>
					    </el-tab-pane>
					    <el-tab-pane label="选择项目" name="second">
					    	<div v-show="!userProject.selected">
					    		<p>
									<span><b>选择项目:</b></span>
									<el-select size="small" v-model="userProject.selected" @change="changeProject">
										<el-option  v-for="pro in userProject.item" :label="`${pro.name}(${pro.company})`" :value="pro.project_info_id">
											<span style="float: left">{{ pro.name }}</span>
			      							<span style="float: right; color: #8492a6; font-size: 13px">{{ pro.company.length ? pro.company : "无" }}</span>
										</el-option>
									</el-select>
									<el-button size="small" @click="openBox=!openBox">新建</el-button>
					    		</p>
							</div>

							<div class="project-info" v-show="userProject.selected">
								<p>
									<span class="set-weight">项目名称:</span>{{ userProject.info.name }} <i class="el-icon-edit" @click="userProject.selected=null"></i>
								</p>
								<p>
									<span class="set-weight">项目地址:</span>{{ userProject.info.province + userProject.info.city + userProject.info.area + userProject.info.addr }}
								</p>
								<p><span class="set-weight">结算条件:</span>{{ userProject.info.settlementText }}</p>
								<p><span class="set-weight">品牌范围:</span> <span v-for="item of userProject.info.brands">{{ item }}  </span></p>
							</div>
					    </el-tab-pane>
					</el-tabs>
				</div>

				<div class="main_warpper" v-show='!demand'>
					<div>
						<div style="float:left;margin-bottom:10px;">
							<div>
								<span style="display: inline-block;width: 70px;"><b>选择排序:</b></span>
								<el-radio-group v-model="sortWay" >
									<el-radio :label='1'>差价最大</el-radio>
									<el-radio :label='2' >现货价最低</el-radio>
									<el-radio :label='3' >同仓库优先</el-radio>
									<el-radio :label='4' >同品牌优先</el-radio>
								</el-radio-group>
							</div>
							<div v-if='addsselect'>
								<span style="display: inline-block;width: 70px;"><b>显示项:</b></span>
								<el-radio v-model="spotTable" :label='1'>现货价</el-radio>
								<el-radio v-model="spotTable" :label='0' >包到价</el-radio>
							</div>
						</div>
						<div style="float:right;margin-bottom:10px;">
							<!-- <el-date-picker v-model="date" type="date" placeholder="选择日期" :picker-options="pickerOptions" @change='changeDate' size="small">
							</el-date-picker> -->
							<span>{{date}}</span>
						    <el-select v-model='selectQuotation' @change='setQuotation' size="small">
								<el-option v-for='(item,index) in selectQuotationOption' :label='item' :value='index'></el-option>
							</el-select>
						</div>
					</div>
					<div class="to-center">
						<filter-bar v-show="!demand && fiterData.length" :data="fiterData" :index="[
								{ title : '品名', key : 'cate_spec' },
								{ title : '规格' , key : 'size'},
								{ title : '材质', key : 'material'},
								{ title : '品牌', key : 'brand' }
							]" @list="getListToChange" :init="hasChange" class="showAllHeight">
						</filter-bar>
						<div class="selecter">
							<div v-if="!isShowSelect">
								<p v-if="!showFilterBool"><span @click="showFilter">查看更多<i class="el-icon-arrow-down" style="margin-left: 10px;"></i></span></p>
								<p v-if="showFilterBool"><span @click="showFilter">收起<i class="el-icon-arrow-up" style="margin-left: 10px;"></i></span></p>
							</div>
						</div>
						<!-- 现货价 -->
						<div id="check">
							<pro-table v-model="spotPrice" v-show='spotTable'>
								<template slot="thead">
									<th>品名</th>
									<th>规格</th>
									<th>材质</th>
									<th>品牌</th>
									<th>
										<span>网价</span>
										<div class="sort-icon">
											<div class="sort-icon">
												<div @click="sortPrice('asce', 'web_price', '网价')" >▲</div>
												<div @click="sortPrice('desc', 'web_price', '网价')" class="same_top">▼</div>
											</div>
										</div>
									</th>
									<th>
										<span>现货价</span>
										<div class="sort-icon">
											<div class="sort-icon">
												<div @click="sortPrice('asce', 'price', '现货价')" >▲</div>
												<div @click="sortPrice('desc', 'price', '现货价')" class="same_top">▼</div>
											</div>
										</div>
									</th>
									<th>
										<span>差价</span>
										<div class="sort-icon">
											<div class="sort-icon">
												<div @click="sortPrice('asce', 'web_spot_diff', '差价')" >▲</div>
												<div @click="sortPrice('desc', 'web_spot_diff', '差价')" class="same_top">▼</div>
											</div>
										</div>
									</th>
									<th>仓库</th>
									<th>库存</th>
									<th>输入数量</th>
								</template>
								<template slot="tbody" scope="props">
									<td>{{ props.line.cate_spec }}</td>
									<td>{{ props.line.size }}</td>
									<td>{{ props.line.material }}</td>
									<td>{{ props.line.brand }}</td>
									<td>{{ props.line.web_price }}</td>
									<td>{{ props.line.price }}</td>
									<td>{{ props.line.web_spot_diff }}</td>
									<td>{{ props.line.warehouse }}</td>
									<td>{{ props.line.inventory }}</td>
									<td>
										<el-input v-model.number="props.line.amount" type="number" min="0" style="width:100%;" size="small" @change="calBegin(props.line)" ></el-input>
									</td>
								</template>
							</pro-table>
							<!-- 包到价 -->
							<pro-table v-model="spotPrice" v-show='!spotTable' class="tablespot">
								<template slot="thead">
									<tr>
										<th :rowspan="2">品名</th>
										<th :rowspan="2">规格</th>
										<th :rowspan="2">材质</th>
										<th :rowspan="2">钢厂/品牌</th>
										<th :rowspan="2">
											<span>网价</span>
											<div class="sort-icon">
												<div class="sort-icon">
													<div @click="sortPrice('asce', 'web_price', '网价')" >▲</div>
													<div @click="sortPrice('desc', 'web_price', '网价')" class="same_top">▼</div>
												</div>
											</div>
										</th>
										<th colspan="3">包到价</th>
										<th :rowspan="2">
											<span>差价</span>
											<div class="sort-icon">
												<div class="sort-icon">
													<div @click="sortPrice('asce', 'web_spot_diff', '差价')" >▲</div>
													<div @click="sortPrice('desc', 'web_spot_diff', '差价')" class="same_top">▼</div>
												</div>
											</div>
										</th>
										<th :rowspan="2">仓库</th>
										<th :rowspan="2">库存</th>
										<th :rowspan="2">输入数量</th>
									</tr>
									<tr>
										<th>
											<span>现货价</span>
											<div class="sort-icon">
												<div class="sort-icon">
													<div @click="sortPrice('asce', 'price', '现货价')" >▲</div>
													<div @click="sortPrice('desc', 'price', '现货价')" class="same_top">▼</div>
												</div>
											</div>
										</th>
										<th>
											<span>运费</span>
											<div class="sort-icon">
												<div class="sort-icon">
													<div @click="sortPrice('asce', 'freight', '运费')" >▲</div>
													<div @click="sortPrice('desc', 'freight', '运费')" class="same_top">▼</div>
												</div>
											</div>
										</th>
										<th>
											<span>总价</span>
											<div class="sort-icon">
												<div class="sort-icon">
													<div @click="sortPrice('asce', 'total', '总价')" >▲</div>
													<div @click="sortPrice('desc', 'total', '总价')" class="same_top">▼</div>
												</div>
											</div>
										</th>
									</tr>
								</template>
								<template slot="tbody" scope="props">
									<td>{{ props.line.cate_spec }}</td>
									<td>{{ props.line.size }}</td>
									<td>{{ props.line.material }}</td>
									<td>{{ props.line.brand }}</td>
									<td>{{ props.line.web_price }}</td>
									<td>{{ props.line.price }}</td>
									<td>{{ props.line.freight=="-"?"待定":props.line.freight }}</td>
									<td>{{ props.line.total }}</td>
									<td>{{ props.line.web_total_diff }}</td>
									<td>{{ props.line.warehouse }}</td>
									<td>{{ props.line.inventory }}</td>
									<td>
										<el-input v-model.number="props.line.amount" type="number" min="0" style="width:100%;"  size="small"
										@change="calBegin(props.line)"></el-input>
									</td>
								</template>
							</pro-table>

						</div>
						<el-dialog v-model="showOrder"  title="计划单"  size="large">
							<order @exit='exitOrder' @order='placeOrder' :data='order' :receivedInfo = "adds"  :change='isOrderChange' @close="closeOrder"></order>
						</el-dialog>
					</div>
				</div>
			</div>
		</headerbar>
		<div class="main_top">
			<div class="bottom-bar" v-show='!demand'>
				<div style="margin-left: 45px;margin-right: 38px" >
					<table>
						<tr>
							<td>合计：</td>
							<td>网价*数量</td>
							<td>{{webPriceTotal}}</td>
							<td v-show='!spotTable'>包到价*数量</td>
							<td v-show='spotTable'>现货价*数量</td>
							<td>{{spotPriceTotal}}</td>
							<td>差价*数量</td>
							<td>{{priceDifftTotal}}</td>
							<td>总吨数</td>
							<td>{{amountTotal}}</td>
						</tr>
					</table>
				</div>
				<div>
					<el-button class="same_box_width" @click='back'>返回</el-button>
					<el-button type="warning" class="same_box_width" @click='showTableAll'>查看所有</el-button>
					<el-button type="success" class="same_box_width" @click='showSelect'>查看所选</el-button>
					<el-button type="primary" class="same_box_width" @click='createOrder'>下单</el-button>
				</div>
			</div>

			<demand :brands='selectBrands' @confirm='demandConfirm' @cancel='demandCancel'  v-show='demand' :way="true" :data="userProject"></demand>
		</div>
		<project-create :open-box="openBox" @getFormDatas="addProject" :role="2"></project-create>
	</div>
</template>
<style scoped>
	.main_top{
		margin-left: 210px;
		margin-top: 0;
	}
	body{
		background-color : #f8f8f8;
	}
	.main_warpper{
		margin: 0 15px;
		padding: 5px 15px;
		background-color: #fff;
		max-width: 1280px;
	}
	.box_project{
		background-color: #fff;
		max-width: 1280px;
		margin: 0 15px;
		padding-left: 15px;
	}

	.to-center{
		border-top: 1px dashed #dedede;
		position: relative;
		width: 100%;
		clear: both;
		margin: 0 auto;
		text-align: center;
		margin-bottom: 100px;
	}
	.bottom-bar{
		position: fixed;
	    bottom: 0px;
	    width: 100%;
	    height: 100px;
	    line-height: 50px;
	    z-index: 100;
	    padding-right: 220px;
	    background: aliceblue;
	    text-align: center;
	}
	.set-weight{
		font-weight: bold;
		color: #666;
	}
	.project-info i{
		font-size: 16px;
    	color: #BBB;
		cursor:pointer;
	}
	table.tablespot thead tr th{
		text-align: center;
		padding:10px 20px;
		border:1px solid #dfe6ec;
	}
	.showAllHeight{
		text-align: left;
		height: 100px;
		overflow: hidden;
	}
	.selecter{
	    text-align: center;
	    position: relative;
	    top: -1px;
	    border-top: 1px solid #ddd;
	    transition: border-color .15s ease-in-out;
	}
	.selecter:hover{
		border-color: #e4393c;
	}
	.selecter:hover span{
		color: #e4393c;
	    border-color: #FFF #e4393c #e4393c;
	}
	.selecter span{
	    position: relative;
	    display: inline-block;
	    margin-top: -1px;
	    height: 28px;
	    line-height: 28px;
	    text-align: center;
		padding: 0 20px;
	    border-width: 1px;
	    border-style: solid;
	    border-color: #FFF #DDD #DDD;
	    background: #fff;
	    cursor: pointer;
	    color: #333;
	    transition: border-color .15s ease-in-out;
	}
	.same_box_width{
		width: 100px;
		padding: 10px 8px;
	}
	.same_top{
		margin-top: -5px;
	}
</style>
