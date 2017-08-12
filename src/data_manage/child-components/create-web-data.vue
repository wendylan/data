<script>
	import { Input, Button, Table, TableColumn, Popover, Select, Option, Pagination,Loading} from "element-ui";
	import ajaxCustom from '../../components/ajax-custom.js';
	export default{
		components : {
			elInput : Input,
			elButton : Button,
			elTable : Table,
			elTableColumn : TableColumn,
			elPopover : Popover,
			elSelect : Select,
			elOption : Option,
			elPagination : Pagination
		},
		created:function(){
			this.getWebPrice();
		},
		data(){
			return {
				editValue :'',
				canSubmit:true,
				isEdit : false,
				edited:[],
				tableData : [],
				typeOption : [
					{
						value : "高线",
						label : "高线"
					},
					{
						value : "盘螺",
						label : "盘螺"
					},
					{
						value : "螺纹钢",
						label : "螺纹钢"
					}
				],
				methodsOption : [
					{
						value : 1,
						label : "上浮"
					},
					{
						value : 2,
						label : "下浮"
					}
				],
				changePriceModel : {
					name : null,
					method : null,
					number : null
				},
				allFilters:{
					productsFilters:[],
					typeFilters:[],
					materialFilters:[],
					brandsFilters:[]
				}
			}
		},
		methods : {
			toEdit(){

				this.isEdit = true;
			},
			/*保存网价*/
			saveWebPriceData(edited){
				console.log(edited.length== 0);
				if (edited.length!=0) {
					var newRecord=this.tableData;
					if (this.canSubmit) {
						ajaxCustom.ajaxPost(this,"dingoapi/saveWebPriceData",{newRecord:newRecord},(responese)=>{
							this.submitSuccess(responese.data.data,responese.data.status);
						}, (responese)=>{
							console.log(responese);
						});
					}else{
						this.editError('表单有误不能提交!!!');
					}
				}
				else{
					this.isEdit=false;
				}
			},
			changeData(){
				if(this.changePriceModel.method == 1){
					for(let tableItem of this.tableData){
						if(this.changePriceModel.name === tableItem.product){
							tableItem.web_price = parseInt(tableItem.web_price) + parseInt(this.changePriceModel.number);
							tableItem.price_change='+'+this.changePriceModel.number;
						}
					}
				}else if(this.changePriceModel.method == 2){
					for(let tableItem of this.tableData){
						if(this.changePriceModel.name === tableItem.product){
							tableItem.web_price = parseInt(tableItem.web_price) - parseInt(this.changePriceModel.number);
							tableItem.price_change='-'+this.changePriceModel.number;
							if (tableItem.web_price<0) {
								this.canSubmit=false;
								this.editError("网价不能小于0");
							}
						}
					}
				}
			},
			/*获取新增网价数据*/
			getWebPrice(){
				let loadingInstance = Loading.service({target:"#table",text:"数据加载中"});
				ajaxCustom.ajaxGet(this,"dingoapi/initForGetWebPrice", (responese)=>{
					console.log(responese);
					this.tableData=responese.body.data.webPriceDataRecord;
					loadingInstance.close();
					this.getFiltersData(this.tableData);
				}, (responese)=>{
					loadingInstance.close();
					console.log(responese);
				});
			},
			/*table过滤器信息获取*/
			getFiltersData(data){
				let filters = this.allFilters;
				for (var i = 0; i < data.length; i++) {
						this.getFilter(filters.productsFilters,data[i].product);
						this.getFilter(filters.typeFilters,data[i].type);
						this.getFilter(filters.materialFilters,data[i].material);
						this.getFilter(filters.brandsFilters,data[i].brands);
				}
			},
			getFilter(filter,data){
				for (var i = 0; i < filter.length; i++) {
					if(filter[i].text==data){
						return ;
					}
				}
				filter.push({'text':data,'value':data});
			},
			productFilter(value, row){
				return row.product===value;
			},
			typeFilter(value, row){
				return row.type===value;
			},
			materialFilter(value, row){
				return row.material===value;
			},
			brandsFilter(value, row){
				return row.brands===value;
			},
			/*编辑*/
			edit(editRecord){
				editRecord.price_change=parseInt(editRecord.web_price)-parseInt(this.editValue);
				if (editRecord.price_change>0) {
					editRecord.price_change="+"+editRecord.price_change;
				}
				var reg=/^\+?[1-9][0-9]*$/;
				var edit=true;
				for (var i = 0; i < this.edited.length; i++) {
					if (this.edited[i].id==editRecord.id) {
						this.edited[i].web_price=editRecord.web_price;
						edit=false;
						break;
					}
				}
				if (edit) {
					this.edited.push(editRecord);
				}
				for (i = 0; i < this.edited.length; i++) {
					if(reg.test(this.edited[i].web_price)!=true){
						this.canSubmit=false;
						this.editError("网价数据必须为大于0整数");
						return;
					}
					this.canSubmit=true;
				}
			},
			editError(errMsg){
				this.$message.error(errMsg);
			},
			submitSuccess(errMsg){
				this.$message({message:errMsg,type:'success'});
			},
			getEditValue(value){
				this.editValue=value;
			}
		}
	}
</script>

<template>
	<div class="main-warpper">
		<h1>网价数据</h1>
		<h4>新增网价数据</h4>
		<br><br>
		<div class="controller-bar">
			<el-button type="primary">Excel导入</el-button>
			<el-button type="success" @click="toEdit()" >编辑网价</el-button>
			<template v-if="isEdit">
				<br><br>
				<el-popover ref="showBox" placement="top-start" width="200" trigger="click" >
					<el-select placeholder="品名" v-model="changePriceModel.name">
						<el-option v-for="option in typeOption" :label="option.label" :value="option.value"></el-option>
					</el-select>
					<el-select placeholder="浮动" v-model="changePriceModel.method">
						<el-option v-for="option in methodsOption" :label="option.label" :value="option.value"></el-option>
					</el-select>
					<el-input v-model="changePriceModel.number">
						<template slot="append">元/吨</template>
					</el-input>
					<el-button type="success" @click="changeData()">保存</el-button>
				</el-popover>
				<el-button type="default" v-popover:showBox>统一调价</el-button>
				<el-button type="default" @click="saveWebPriceData(edited)">保存</el-button>
			</template>
		</div>

		<br/>
		
		<div>
			<el-table :data="tableData" style="width:100%;" id="table" >
				<el-table-column prop="product" label="品名"   
				:filters="allFilters.productsFilters" :filter-method="productFilter"
				></el-table-column>
				<el-table-column prop="type" label="规格"
				:filters="allFilters.typeFilters"      :filter-method="typeFilter">
				></el-table-column>
				<el-table-column prop="material" label="材质"
				:filters="allFilters.materialFilters" :filter-method="materialFilter"
				></el-table-column>
				<el-table-column prop="brands" label="钢厂/产地"
				:filters="allFilters.brandsFilters" :filter-method="brandsFilter"
				></el-table-column>
				<el-table-column label="价格(元/吨)" sortable prop="web_price">
					<template scope="scope" >
						<template v-if="!isEdit">
							<span >{{ scope.row.web_price}}</span>
						</template>
						<template v-else>
							<el-input v-model="scope.row.web_price"
							 @change="edit(scope.row)" @focus="getEditValue(scope.row.web_price)"
							></el-input>
						</template>
					</template>
				</el-table-column>
				<el-table-column prop="price_change" label="浮动" sortable></el-table-column>
				<!-- <el-table-column prop="source_states" label="资源情况"></el-table-column> -->
			</el-table>
		</div>
	</div>
</template>	

<style >
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
		color:#8492A6;
	}
	.page-box{
		width:200px;
		margin:1px auto;
	}
	.page-box p{
		text-align:center;
		font-size:14px;
		color:#54667a;
	}
	.el-table-filter__content{
		min-width: 100px;
    	height: 150px;
   		overflow: auto;
	}
</style>