<script>
import headerbar from '../../components/same-headerbar.vue';
import ajaxCustom from '../../components/ajax-custom.js';
import usuallySource from "../../../res/json/usually_steel_brand_source.json";
import {Select, Table, TableColumn, DatePicker, Loading } from 'element-ui';
	export default{
		components : {
			headerbar,
		},
		data(){
			return {
				loading : false,
				date : {},
				recorded : [],//已经录入的数据
				noRecord : [],//未录入的数据
				haveToRecord : [],//必须录入的数据

		        listDatas : [],
		        selectedInfo : {},
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
						selected : [],
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
		        dialogTableVisible : false,
		        isLoading : false,
		        setWare : null,

				//今天之后的日期不能选中
				pickerOptions: {
					disabledDate(time) {
						return time.getTime() > Date.now() ;
					}
				},
	        };
		},

		created(){
			this.getSteelConfData();
			this.date = new Date();
		},
		mounted:function(){
			this.haveToRecord=usuallySource.brandsource;
			this.getRecord(this.date);
		},

		methods : {

			//获取当日录入信息
			getRecord(date){
				date=this.dateFormat(date);
				ajaxCustom.ajaxGet(this,'dingoapi/getSteelBrandSource',{params:{"date":date}},function (response){
					// this.loading = true ;
					console.log(response);
					// 当日没有数据录入
					if(!response.body.data.data.length){
						this.recorded=[];
						this.noRecord=[];
						alert("当日没有数据录入");
						this.loading = false;
						return ;
					}
					//获得已录入数据（分组）
					this.recorded=this.groupRecord(response.body.data.data);
					//获得未录入数据
					let recorded = this.recorded;
					let haveToRecord=this.haveToRecord;
					this.noRecord = []; //未录入数据容器
					for (let j = 0; j < haveToRecord.length; j++) {
						let watchDog = 1;
						for (let i = 0; i < recorded.length; i++) {
							//万钢=桂万钢，新抚钢=新抚顺
							if( recorded[i].brand=='万钢' ){
								recorded[i].brand = '桂万钢';
							}
							if( recorded[i].brand=='新抚顺' ){
								recorded[i].brand = '新抚钢';
							}

							if( recorded[i].brand==haveToRecord[j].brand && recorded[i].price_source==haveToRecord[j].price_source ){
								watchDog=0;
								break;
							}
						}
						if (watchDog) {
							//放入parent_id
							haveToRecord[j].parent_id=response.body.data.parent_id;
							this.noRecord.push(haveToRecord[j]);
						}
					}

					this.loading = false;

				},function (response){
					this.loading = false;
					console.log(response);
				});
			},

			//已录入数据分组排序
			groupRecord(data){
				let brand =[];
				for (let i = 0; i < data.length; i++) {
					let watchDog = 1;
					for (let j = 0; j < brand.length; j++) {
						if(data[i].brand==brand[j]){
							watchDog = 0 ;
							break ;
						}
					}
					if(watchDog){
						brand.push(data[i].brand);
					}
				}
				let returndata=[]
				for (let j = 0; j < brand.length; j++) {
					for (let i = 0; i < data.length; i++) {
						if(data[i].brand==brand[j]){
							returndata.push(data[i]);
						}
					}
				}
				return returndata;
			},

			//日期对象格式化
			dateFormat(date){
				let day = this.numberHandle(date.getDate());
				let month = this.numberHandle(date.getMonth()+1);
				return date.getFullYear() + '-' + month + '-' + day;
			},

			//日期或月份小于10时前面要加0
			numberHandle(number){
				if (number<10) {
					return '0' + number;
				}
				return number;
			},

			// 获取必要的规格信息
			getSteelConfData(){
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

				}, (responese)=>{
					console.log(responese);
				} );
			},

			addBrandPrice(id, brand, priceSource){
				this.selectedInfo = {
					parentId : id,
					brand : brand,
					company : priceSource
				}

				this.dialogTableVisible = true;
				this.isLoading = true;
				ajaxCustom.ajaxGet(this, "dingoapi/getAllspecsAndNotice", { params : { data : brand } }, (responese)=>{
					console.log(responese)
					for(let data of responese.body.data.specsData){
						for(let material of data.material){
							for(let size of material.size){
								size.price = "";
								size.wareHouse = ""
								size.status = "有货";
								size.type = "正常货";
							}
						}
					}
					this.listDatas = responese.body.data.specsData;
					this.isLoading = false;
				},(responese)=>{
					console.log(responese)
					this.isLoading = false;
				})
			},
			postPriceData(){
				let postDatas = [];
				for(let data of this.listDatas){
					for(let material of data.material){
						for(let size of material.size){
							if(size.price.length && size.wareHouse){
								postDatas.push({
									parent_id : this.selectedInfo.parentId,
									brand : this.selectedInfo.brand,
									cate_spec : data.name,
									material : material.name,
									size : size.name,
									price : size.price,
									wareHouse : size.wareHouse,
									inventory : size.status,
									price_source : this.selectedInfo.company,
									warehouse : size.wareHouse,
									transport : this.selectedModel.transport.selected,
									payment_kind : this.selectedModel.paymentKind.selected,
									product_status : size.type
								});
							}
						}
					}
				}

				if(postDatas.length){
					ajaxCustom.ajaxPost(this, "dingoapi/fillMarketPrice", { data : postDatas }, (responese)=>{
						console.log(responese)
						alert(responese.body.message);
						this.dialogTableVisible = false;
						this.getRecord(this.date);
					}, (responese)=>{
						console.log(responese)
						alert("出现异常, 请刷新重试");
					});
				}else{
					this.dialogTableVisible = false;
				}

			}
		},
		watch : {
			setWare(newVal, oldVal){
				console.log(newVal)
				if(confirm("是否要将所有仓库设为: "+newVal)){
					for(let data of this.listDatas){
						for(let material of data.material){
							for(let size of material.size){
								size.wareHouse = newVal;
							}
						}
					}
				}
			}
		}
	}
</script>
<template>
	<headerbar active_number="data_search" :text="['后台补录','管理后台的市场价数据']">
		<div>
			<div class="block" style="padding-left:50px;">
				<span class="demonstration">选择时间</span>
				<el-date-picker v-model="date" :picker-options="pickerOptions" @change="getRecord(date)"></el-date-picker>
			</div>
			<div>
				<br><br>

				<!-- 补录弹出框 -->
				<el-dialog :title="'补录 : ' + selectedInfo.brand + ' ' + selectedInfo.company" :close-on-click-modal="false" v-model="dialogTableVisible">
					<div class="content" v-show="!isLoading">
						<div style="margin-bottom:5px;" v-if="listDatas.length != 0">
							<div style="margin-bottom:5px;">
								<span>选择运输和付款方式 : </span>
								<select v-model="selectedModel.transport.selected">
									<option v-for="item in this.selectedModel.transport.items" :value="item.value">{{ item.label }}</option>
								</select>
								<select v-model="selectedModel.paymentKind.selected">
									<option v-for="item in this.selectedModel.paymentKind.items" :value="item.value">{{ item.label }}</option>
								</select>
							</div>
							<div>
								<span>统一将仓库选定为 : </span>
								<select v-model="setWare">
									<option v-for="item in selectedModel.warehouseModel.items" :value="item.label">{{ item.label }}</option>
								</select>
							</div>
						</div>
						<div v-for="specs in listDatas">
							<p>{{ specs.name }} : </p>
							<div class="material-box" v-for="material in specs.material">
								<p>{{ material.name }} :</p>
								<div class="size-box" v-for="size in material.size">
									<span>Φ{{ size.name }} : </span>
									<input type="text" v-model="size.price" />
									<select v-model="size.status">
										<option value="有货">有货</option>
										<option value="无货">无货</option>
										<option value="货少">货少</option>
										<option value="电议">电议</option>
									</select>
									<select v-model="size.type">
										<option value="正常货">正常货</option>
										<option value="正常水锈货">正常水锈货</option>
										<option value="锈货">锈货</option>
										<option value="旧货">旧货</option>
									</select>
									<select v-model="size.wareHouse">
										<option v-for="item in selectedModel.warehouseModel.items" :value="item.label">{{ item.label }}</option>
									</select>
								</div>
							</div>
							<div style="clear:both;"></div>
						</div>
						<div v-if="listDatas.length == 0">
							<h4>没有此品牌的数据</h4>
						</div>
					</div>
					<span slot="footer" class="dialog-footer">
					    <el-button @click="dialogTableVisible = false">取 消</el-button>
					    <el-button type="primary" @click="postPriceData()">确 定</el-button>
					</span>
				</el-dialog>
				<!-- End 补录弹出框 -->

			    <el-table stripe height="600" style="width: 50%;float:left" :data="recorded" v-loading.body="loading" >
				      <el-table-column prop="brand" label="已报价品牌"></el-table-column>
				      <el-table-column prop="price_source" label="已报价公司"></el-table-column>
			    </el-table>

			    <el-table stripe height="600" style="width: 50%;float:right" :data="noRecord" v-loading.body="loading" >
					<el-table-column width="150" prop="brand" label="还没报价的品牌"></el-table-column>
					<el-table-column prop="price_source" label="还没报价的公司"></el-table-column>
					<el-table-column width="100" label="操作">
						<template scope="scope">
							<el-button type="default" size="mini" @click="addBrandPrice(scope.row.parent_id, scope.row.brand, scope.row.price_source)">补录</el-button>
						</template>
					</el-table-column>
			    </el-table>
			</div>
		</div>
	</headerbar>
</template>

<style scoped>
	 .main-warpper{
	        width:1280px;
	        margin:auto;
	        padding:25px;
	        color:#1F2D3D;
	 }
 	.loading{
 		color: red;
 	}
 	.content>div>p{
 		padding:5px;
 		background-color: #DEDEDE;
 	}
 	.material-box{
 		float : left;
 		margin-right:20px;
 	}
 	.size-box{
 		margin:5px;
 	}
 	.size-box input{
 		width: 50px;
 		padding: 0px 5px 0px 5px;
 		border: solid 1px #AAA;
 	}
</style>
