<script>
	import headerbar from '../../components/same-headerbar.vue';
	import ajaxCustom from '../../components/ajax-custom.js';
	import { Input , Select , Option, Loading, Switch, Dialog, Cascader } from "element-ui";
	import  steelHeader from "./child-components/steel-header.vue";
	import  steelBox from "./child-components/steel-list.vue";
	import  steelTools from "./child-components/steel-tools.vue";
	import  pinyin from "pinyin";
	export default{
		components : {
			headerbar,
			steelHeader : steelHeader,
			steelTools : steelTools,
			steelBox : steelBox,
			elDialog:Dialog,
			elInput : Input,
			elSelect : Select,
			elOption : Option,
			elSwitch : Switch,
			elCascader : Cascader
		},
		created : function(){
			this.getSteelData();
		},
		data(){
			return {
				listDatas : [],
				loadData : [],
				allBrandsData : [],
				webPriceData : null,
				tempRecordBrand : "",
				showBrand : "",
				isDisplay : false,
				reportTime : null,
				selectedModel : {
					brands : {
						selected : null,
						items : []
					},
					transport : {
						selected : null,
						items : []
					},
					priceQueue : {
						selected : null,
						items : []
					},
					priceSource : {
						selected : null,
						items : []
					},
					warehouseModel : {
						selected : null,
						items : []
					},
					paymentKind : {
						selected : "款到发货",
						items : []
					},
					product_status : {
						selected : [],
						items : [
							{ label : "正常货", value : "正常货" },
							{ label : "正常水锈货", value : "正常水锈货" },
							{ label : "锈货", value : "锈货" },
							{ label : "旧货", value : "旧货" }
						]
					}
				},
				excessWarehouseArr : [],
				createOptions : null,
				noticeSwith : true,
				isUpdate : true,
				tempToSaveText : "",
				canSaving : false,
				hasExcessWarehouse : false
			}
		},
		methods : {
			initWrittenData(){
				let loadingInstance = Loading.service({fullscreen: true});
				var _this = this;
				ajaxCustom.ajaxGet(this,"dingoapi/getMarketData", { params : { id : this.$route.params.id } }, (responese)=>{
					console.log(responese)
					responese = responese.body;
					this.selectedModel.priceQueue.selected = '第' + this.transferNumber(responese.data.parentData.price_queue) + "次报价";

					// 设置货源情况的下拉选择
					_this.initSteel(responese);

					// 标记size为18,8,36的数据
					this.createSign(responese.data.childData);

					// 若不是admin  判断是否已发布
					if(!responese.data.isAdmin){
						this.isDisplay = responese.data.parentData.display==1 ? true : false;
					}

					// 父字段数据
					this.reportTime = responese.data.parentData.created_at;
					// 数据allBrandData已与视图绑定
					this.allBrandsData = JSON.parse(JSON.stringify(responese.data.childData));
					loadingInstance.close();
				}, (responese)=>{
					console.log(responese);
					loadingInstance.close();
				});
			},
			initSteel(responese){
				console.log(responese)
				var steelDatas = responese.data.childData;
				// 给后端数据加上前端的Select选项数据
				for(let brand of steelDatas){
					for(let source of brand.data){
						for(let steelData of source.data){
							for(let warehouse of steelData.steelData){
								for(let material of warehouse.material){
									for(let size of material.size){
										size.productOptions = [
											{ value : "有货", label : "有货" },
											{ value : "无货", label : "无货" },
											{ value : "货少", label : "货少" },
											{ value : "电议", label : "电议" }
										]

										size.warehouseModel = {
											warehouseOptions : JSON.parse(JSON.stringify(this.selectedModel.warehouseModel.items)),
											selected : size.warehouse
										}
										for(let data of size.warehouseModel.warehouseOptions){
											data.value = data.label;
										}
									}
								}
							}

						}
					}
				}
			},
			// 标记size为18和8的数据
			createSign(allData){
				for(let brandData of allData){
					for(let sourceData of brandData.data){
						for(let wareData of sourceData.data){
							for(let steel of wareData.steelData){
								for(let material of steel.material){
									for(let size of material.size){
										if(size.size==18 || size.size==8 || size.size==36){
											size.index = size.size;
										}
									}
								}
							}
						}
					}
				}
			},
			transferNumber(num){
				let chineseNum;
				switch(num){
					case '0':
						chineseNum = '一'
						break;
					case '1':
						chineseNum = '二'
						break;
					case '2':
						chineseNum = '三'
						break;
					case '3':
						chineseNum = '四'
						break;
					case '4':
						chineseNum = '五'
						break;
					default:
						chineseNum = parseInt(num)+1;
				}
				return chineseNum;
			},
			// 获取品牌数据的规格
			getSteelInfo(){
				this.isUpdate = false;
				this.listDatas = null;
				let loadingInstance = Loading.service({target:"#list-box", text:"加载中······"});

				let tempSave = this.selectedModel.transport;
				this.selectedModel = JSON.parse(JSON.stringify(this.createOptions));
				this.selectedModel.transport = tempSave;

				console.log(this.createOptions.brands.selected);
				ajaxCustom.ajaxGet(this,"dingoapi/getAllspecsAndNotice", { params : { data : this.createOptions.brands.selected } }, (responese)=>{
					console.log(responese);
					let noticeData = responese.body.data.noticeData;
					// 规格数据加上表单的数据绑定
					for(let productName of responese.body.data.specsData){
						for(let _material of productName.material){
							let count = 0;
							for(let _size of _material.size){
								_size.size = _size.name;
								_size.inventory = "有货";
								_size.transport = this.selectedModel.transport.selected;
								_size.price = null;
								_size.product_status = '正常货';
								_size.productOptions = [
									{ value : "有货", label : "有货" },
									{ value : "无货", label : "无货" },
									{ value : "货少", label : "货少" },
									{ value : "电议", label : "电议" }
								]

								// 加入仓库的下拉选项
								_size.warehouseModel = {
									warehouseOptions : []
								};
								for(let data of this.selectedModel.warehouseModel.items){
									_size.warehouseModel.warehouseOptions.push({ value : data.label, label : data.label });
								}
								//设置默认值
								_size.warehouseModel.selected = this.createOptions.warehouseModel.selected;

								//加入风险提示数据
								for(let noticePrice of noticeData){
									if(noticePrice.brand==this.createOptions.brands.selected && noticePrice.cate_spec==productName.name && noticePrice.material==_material.name && noticePrice.size==_size.name){
										if(_size.transport == "广州仓发货" && noticePrice.transport_type  == 1){
											_size.maxNumber = noticePrice.self_maxNumber;
											_size.minNumber = noticePrice.self_minNumber;
										}else if(_size.transport == "直送" && noticePrice.transport_type  == 2){
											_size.maxNumber = noticePrice.maxNumber;
											_size.minNumber = noticePrice.minNumber;
										}

									}
								}

								// 标记size为18和8的数据
								if(_size.size==36 || _size.size==18 || _size.size==8){
									_size.index = count;
								}
								count++;
							}
						}
					}

					// 检查是否已经有录入过的相同数据, 有则删除
					for(let brand of this.allBrandsData){
						if(brand.name == this.createOptions.brands.selected){
							for(let sourceData of brand.data){
								// 是否有录入相同的数据
								if(sourceData.name == this.createOptions.priceSource.selected && sourceData.warehouse == this.createOptions.warehouseModel.selected){
									// 遍历allBrandsData
									for(let warehouseData of sourceData.data){
										if(warehouseData.name == this.createOptions.warehouseModel.selected){
											for(let sepcName of warehouseData.steelData){
												for(let material of sepcName.material){
													for(let _size of material.size){
														// 遍历listData
														for(let productName of responese.body.data.specsData){
															for(let _material of productName.material){
																for(let index in _material.size){
																	if(productName.name==sepcName.name && _material.name==material.name && _size.size==_material.size[index].size && _size.transport==_material.size[index].transport){
																		// delete 相同的数据
																		_material.size.splice(index, 1);
																	}
																}
															}
														}
														// end
													}
												}
											}
										}
									}
								}
							}
						}
					}

					this.selectedModel.transport.selected = this.selectedModel.transport.selected;
					this.listDatas = responese.body.data.specsData;
					loadingInstance.close();
				}, (responese)=>{
					alert(responese.body.message);
					console.log(responese);
					loadingInstance.close();
				} );
			},
			// 设置新增选项的可选数据
			getSteelData : function(){
				this.listDatas = [];
				this.listDatas = null;
				// var needBrand = brand;
				ajaxCustom.ajaxGet(this,"dingoapi/getDataFromSetting", (responese)=>{
					console.log(responese);
					this.webPriceData = responese.body.data.webDatas;
					// 绑定下拉选项的数据, 品牌、报价、运输、次序
					var brandsSelect = responese.body.data.brands;
					var transportSelect = responese.body.data.transport_type.split(",");
					var priceSourceSelect = responese.body.data.price_source;
					var warehouseSelect = responese.body.data.warehouseData;
					var paymentKind = responese.body.data.paymentKind;
					// 设置品牌的下拉选项
					for(let data of brandsSelect){
						this.selectedModel.brands.items.push({
							label : data,
							value : data
						});
					}
					// 设置运输的下拉选项
					for(let data of transportSelect){
						this.selectedModel.transport.items.push({
							label : data,
							value : data
						});
					}

					// 设置报价来源的下拉选项
					for(let data of priceSourceSelect){
						this.selectedModel.priceSource.items.push({
							label : data.name,
							value : data.id,
							pinyin : pinyin(data.name, { style : pinyin.STYLE_FIRST_LETTER }).join(''),
							company_type : data.company_type
						});
					}
					this.selectedModel.priceSource.allItem = JSON.parse(JSON.stringify(this.selectedModel.priceSource.items));

					// 设置仓库的下拉选项
					for(let data of warehouseSelect){
						this.selectedModel.warehouseModel.items.push({
							label : data.warehouse_name,
							value : data.id,
						});
					}

					// 设置付款方式的下拉选项
					for(let data of paymentKind){
						this.selectedModel.paymentKind.items.push({
							label : data.payment_name,
							value : data.id,
						});
					}

					this.createOptions = JSON.parse(JSON.stringify(this.selectedModel));

					// 请求已录入的数据
					this.initWrittenData();

				}, (responese)=>{
					console.log(responese);
				} );
			},

			// 是否添加额外的仓库
			excessWarehouse(warehouseArr, isMoreWarehouse){
				console.log(warehouseArr, isMoreWarehouse)
				this.hasExcessWarehouse = isMoreWarehouse;
				this.excessWarehouseArr = warehouseArr;

			},

			// 检查是否超出价格波动的limit
			isLimit(){
				let alertMsg = "";
				for(let _steelData of this.listDatas){
					for(let _material of _steelData.material){
						for(let _size of _material.size){
							// 判断与网价数据是否相同, 是则计算判断
							if(parseInt(_size.price)>8000 ){
								alertMsg += _steelData.name+'-'+_material.name+'-Φ'+_size.size+'-'+"超出了价格波动的限制\n";
							}else if(parseInt(_size.price) < 2000){
								alertMsg += _steelData.name+'-'+_material.name+'-Φ'+_size.size+'-'+"超出了价格波动的限制\n";
							}else{
								for(let web of this.webPriceData){
									if(this.selectedModel.brands.selected==web.brands && _steelData.name==web.product && _material.name==web.material && _size.size==web.type && (_size.maxNumber || _size.self_maxNumber) && _size.price){
										let diffPrice = parseInt(_size.price) - parseInt(web.web_price);
										if( _size.transport=="直送" && (diffPrice>=_size.maxNumber || diffPrice<=parseInt('-'+_size.minNumber.toString())) ){
											alertMsg += _steelData.name+'-'+_material.name+'-Φ'+_size.size+'-'+"超出了价格波动的限制\n";
										}
										if( _size.transport=="广州仓发货" && (diffPrice>=_size.self_maxNumber || diffPrice<=parseInt('-'+_size.self_minNumber.toString())) ){
											alertMsg += _steelData.name+'-'+_material.name+'-Φ'+_size.size+'-'+"超出了价格波动的限制\n";
										}
									}
								}
							}
						}
					}
				}
				// 开启波动提示的情况下 禁止提交
				if(alertMsg.length && this.noticeSwith){
					alert(alertMsg);
					this.canSaving = false;
					return false;
				}else{
					return true;
				}
			},

			// 添加或更新数据
			postMarketData : function(){
				// 禁止重复提交
				this.canSaving = true;

				// 检查是否超出价格波动的limit
				if(!this.isLimit()){
					return false;
				}

				if(this.hasExcessWarehouse && !this.isUpdate && !confirm("此次暂存会额外添加到 : "+this.excessWarehouseArr+", 请确认.")){
					this.canSaving = false;
					return false;
				}

				// 更新或是暂存
				if(this.isUpdate){
					let updateData = [];
					// 组合为后台对应的标识符
					for(let data of this.allBrandsData){
						if(data.name == this.loadData[0]){
							for(let company of data.data){
								if(company.name == this.loadData[1]){
									for(let warehouse of company.data){
										if(warehouse.name == this.loadData[2]){
											// 钢材数据
											for(let steelData of warehouse.steelData){
												for(let material of steelData.material){
													for(let size of material.size){
														updateData.push({
															id : size.id,
															brand : data.name,
															cate_spec : steelData.name,
															material : material.name,
															size : size.size,
															price : size.price,
															inventory : size.inventory,
															price_source : company.name,
															warehouse : size.warehouseModel.selected,
															payment_kind : this.selectedModel.paymentKind.selected,
															transport : size.transport,
															product_status : size.product_status
														});
													}
												}
											}
										}
									}
								}
							}
						}
					}

					ajaxCustom.ajaxPost(this,"dingoapi/editMarketData", { updateData : updateData }, (responese)=>{

						console.log(responese)
						responese = responese.body;
						if(responese.status_code == 200 ){
							alert(responese.message);
							for(let brand of this.listDatas){
								for(let material of brand.material){
									let index = 0;
									while(index < material.size.length){
										if(!material.size[index].price){
											material.size.splice(index, 1);
										}else{
											index++;
										}
									}
								}
							}
						}else{
							alert(responese.message);
						}
						this.canSaving = false;
					}, (responese)=>{
						alert(responese.body.message);
						console.log(responese)
						this.canSaving = false;
					} );
				}else{
					let postData = {};
					let formData = [];
					for(let steelData of this.listDatas){
						for(let material of steelData.material){
							for(let size of material.size){
								if(size.price){
									// 是否有额外添加的仓库
									if(this.hasExcessWarehouse){
										for(let ware of this.excessWarehouseArr){
											formData.push({
												brand : this.createOptions.brands.selected,
												cate_spec : steelData.name,
												material : material.name,
												size : size.name,
												price : size.price,
												inventory : size.inventory,
												price_source : this.createOptions.priceSource.selected,
												warehouse : ware,
												payment_kind : this.createOptions.paymentKind.selected,
												transport : size.transport,
												product_status : size.product_status
											});
										}
									}
									formData.push({
										brand : this.createOptions.brands.selected,
										cate_spec : steelData.name,
										material : material.name,
										size : size.name,
										price : size.price,
										inventory : size.inventory,
										price_source : this.createOptions.priceSource.selected,
										warehouse : size.warehouseModel.selected,
										payment_kind : this.createOptions.paymentKind.selected,
										transport : size.transport,
										product_status : size.product_status
									});
								}
							}
						}
					}
					postData.formData = formData;
					postData.id = this.$route.params.id;

					ajaxCustom.ajaxPost(this,"dingoapi/createMarketPrice", postData, (responese)=>{
						console.log(responese)
						responese = responese.body;
						if(responese.status_code === 200){
							alert(responese.message);
							window.location.reload();
						}else{
							alert(responese.message);
						}
						this.canSaving = false;
					}, (responese)=>{
						alert(responese.body.message);
						console.log(responese)
						this.canSaving = false;
					} );
				}

			},
			// 接受cascader组件值
			showSelectedData(treeData){
				this.isUpdate = true;
				this.hasExcessWarehouse = false;
				this.loadData = treeData;
			},
			// 接受swich值, 是否打开价格提醒
			noticeSwithChanged(dataChanged){
				this.noticeSwith = dataChanged;
			}
		},
		watch : {
			loadData(newVal, oldVal){
				for(let data of this.allBrandsData){
					if(data.name == newVal[0]){
						for(let company of data.data){
							if(company.name == newVal[1]){
								for(let warehouse of company.data){
									if(warehouse.name == newVal[2]){
										this.listDatas = warehouse.steelData;
										this.selectedModel.paymentKind.selected = company.payment_kind;
										this.selectedModel.brands.selected = data.name;
										if(warehouse.steelData[0].material[0].size[0].transport == "广州仓发货"){
											this.selectedModel.transport.selected = "广州仓发货";
										}else{
											this.selectedModel.transport.selected = "直送";
										}
										break;
									}
								}
							}
						}
					}
				}
			}
		}
	}
</script>

<template>
	<headerbar active_number="4" :text="['市场价格','新增网价数据']">
		<h4>创建时间 : {{ reportTime }}</h4>
		<br><br>

		<steel-header
		@showSelectedData="showSelectedData"
		@noticeSwithChanged="noticeSwithChanged"
		@getSteelInfo="getSteelInfo"
		@excessWarehouse="excessWarehouse"
		:all-brands-data="allBrandsData"
		:selected-model="selectedModel"
		:create-options="createOptions"
		:notice-swith="noticeSwith"
		:data-date="isDisplay"></steel-header>

		<steel-tools
		:list-datas="listDatas"
		:selected-model="selectedModel"
		:create-options="createOptions"
		:web-price-data="webPriceData"
		:data-date="isDisplay"></steel-tools>

		<h4 :style="isUpdate ? 'color:#f7ba2a' : 'color:#ff4949'" v-show="listDatas!=null">{{ isUpdate ? "你现在可以查看, 更改, 删除(价格为空的数据将被删除)以下的数据 :" : "你现在可以添加以下的数据 :" }}</h4>

		<div id="list-box">
			<steel-box :list-datas="listDatas" :selected-model="selectedModel" ></steel-box>
		</div>

		<hr />
		<p v-if="hasExcessWarehouse" style="text-align:center;" >提示 : 此次暂存会额外添加到 {{excessWarehouseArr}} </p>
		<el-button v-show="!isDisplay && listDatas!=null" :disabled="canSaving" style="display:block;margin:auto;" size="small" :type="isUpdate ? 'warning' : 'danger'" @click="postMarketData()" >{{ isUpdate ? "确认更改" : "暂存数据" }}</el-button>
	</headerbar>
</template>

<style scoped>
	.main-warpper{
		width:100%;
		margin:auto;
		padding:25px 0px 25px 0px;
		color:#1F2D3D;
	}
	h1,h4{
		font-weight:400;
	}
	h4{
		color:#8492A6;
	}

	.source-btn{
		background-color:#FFF;
		border:solid 1px #DEDEDE;
		cursor:pointer;
		font-style:"微软雅黑";
	}
	.text-tips p{
		color:#8492A6;
	}
	.text-tips p span{
		font-weight:700;
		color:#54667a;
	}
	.title-style{
		color:#8492A6;
	}
	#list-box{
		min-height:300px;
	}
</style>

<style>
	.el-input__icon+.el-input__inner{
		padding-right:0px;
	}
	.el-popover{
		overflow: auto;
		max-height:500px;
	}
</style>
