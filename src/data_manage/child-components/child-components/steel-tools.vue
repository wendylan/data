<script>
import ajaxCustom from '../../../components/ajax-custom.js';
	export default{
		props : ["listDatas", "selectedModel", "createOptions", "webPriceData", "dataDate"],
		data(){
			return{
				changePriceModel : {
					brand : null,
					number : null
				}
			}
		},
		methods : {
			// 统一调价
			changePrice : function(){
				var _this = this;
				for(let data of this.listDatas){
					for(let selectedBrands of this.changePriceModel.brand){
						if(data.name === selectedBrands){
							for(let _material of data.material){
								for(let _size of _material.size){
									if((parseInt(_size.price)) + parseInt(_this.changePriceModel.number) && _size.transport == this.selectedModel.transport.selected){
										_size.price = (parseInt(_size.price)) + parseInt(_this.changePriceModel.number);
									}
								}
							}
						}
					}
				}
				alert("修改完毕");
			},
			// 获取最后一次市场报价
			getLastMarketPrice(){
				ajaxCustom.ajaxGet(this, "dingoapi/getLastMarketPrice", (responese)=>{
					console.log(responese);
					let lastMaketDatas = responese.body.data.childDatas;
					for(let steelData of this.listDatas){
						for(let material of steelData.material){
							for(let size of material.size){
								// 遍历MarketData
								for(let marketData of lastMaketDatas){
									if(marketData.brand==this.createOptions.brands.selected && this.createOptions.priceSource.selected==marketData.price_source && marketData.cate_spec==steelData.name && marketData.material==material.name && marketData.size==size.size && !size.price && size.transport==marketData.transport && this.createOptions.warehouseModel.selected==marketData.warehouse){
										size.price = marketData.price;
									}
								}
							}
						}
					}
				}, (responese)=>{
					alert(responese.body.message);
					console.log(responese)
				});
			},
			// 获取最后一次网价
			getWebPrice(){
				for(let productName of this.listDatas){
					for(let _material of productName.material){
						for(let _size of _material.size){
							// 判断与网价数据是否相同, 是则导入网价
							for(let web of this.webPriceData){
								if(this.selectedModel.brands.selected==web.brands && productName.name==web.product && _material.name==web.material && _size.size==web.type && !_size.price && _size.transport==this.selectedModel.transport.selected){
									_size.price = web.web_price;
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
	<div class="controller-bar">
		<el-popover ref="change_price" placement="bottom" trigger="click">
			<div>
				<el-select placeholder="品名" size="small" v-model="changePriceModel.brand" multiple>
					<el-option v-for="item in listDatas" :label="item.name" :value="item.name"></el-option>
				</el-select>
				<el-input class="set-width" placeholder="元/吨 (可为负数)" type="number" size="small" v-model="changePriceModel.number"></el-input>
				<el-button size="small" type="success" @click="changePrice()">确定</el-button>
			</div>
		</el-popover>

		<div class="text-tips" style="float:left; margin-right:200px;">
			<p>报价次序: <span>{{ selectedModel.priceQueue.selected }}</span></p>
			<p v-if="selectedModel.brands.selected">品牌: <span>{{ selectedModel.brands.selected }}</span></p>
			<p v-if="selectedModel.priceSource.selected">供应商: <span>{{ selectedModel.priceSource.selected }}</span></p>
			<el-radio-group size="small" v-model="selectedModel.transport.selected">
				<el-radio-button v-for="item in selectedModel.transport.items" :label="item.label"></el-radio-button>
			</el-radio-group>
		</div>

		<div class="text-tips" style="float:left; margin-right:10px;">
			<p>操作项 :</p>

			<el-select :disabled="dataDate" placeholder="付款方式" size="small" v-model="selectedModel.paymentKind.selected">
				<el-option v-for="item in selectedModel.paymentKind.items" :label="item.label" :value="item.label"></el-option>
			</el-select>

			<template v-show="!dataDate">
				<el-button size="small" type="default" v-popover:change_price>统一调价</el-button>
				<el-button size="small" type="default" @click="getLastMarketPrice()">读取上次报价</el-button>
				<el-button size="small" type="default" @click="getWebPrice()">读取网价</el-button>
			</template>
		</div>
		<div style="clear:both;"></div>
	</div>
</template>

<style scoped>
	.controller-bar{
		margin-bottom:20px;
	}
	.set-width{
		width:180px;
	}
</style>
