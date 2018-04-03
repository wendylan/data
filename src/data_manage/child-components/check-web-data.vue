<script>
	import headerbar from '../../components/same-headerbar.vue';
	import ajaxCustom from '../../components/ajax-custom.js';
	import { Input, Button, Table, TableColumn, Popover, Select, Option, Pagination,Message,Loading } from "element-ui";
	export default{
		components : {
			headerbar,
			Message,
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
			// this.getFiltersData(this.tableData);
		},
		mounted(){
			// this.getFiltersData(this.tableData);
			// console.log(this.tableData);
		},
		data(){
			return {
				canSubmit:true,
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
				isEdit : false,
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
			saveWebPriceData(){
				this.isEdit = false;
				var newRecord=this.edited;
				if (this.canSubmit) {
					ajaxCustom.ajaxPost(this,"dingoapi/updateWebPriceData",{newRecord:newRecord},(responese)=>{
						this.submitMessage(responese.data.message,responese.headers.status);
					}, (responese)=>{
						console.log(responese);
					});
				}
				else{
					this.editError('表单有误不能提交!!!');
				}
			},
			changeData(){
				if(this.changePriceModel.method == 1){
					for(let tableItem of this.tableData){
						if(this.changePriceModel.name === tableItem.product){
							tableItem.web_price = parseInt(tableItem.web_price) + parseInt(this.changePriceModel.number);
						}
					}
				}else if(this.changePriceModel.method == 2){
					for(let tableItem of this.tableData){
						if(this.changePriceModel.name === tableItem.product){
							tableItem.web_price = parseInt(tableItem.web_price) - parseInt(this.changePriceModel.number);
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
				ajaxCustom.ajaxGet(this,"dingoapi/checkWebPriceData",{params:{data:this.$route.params.time}}, (responese)=>{
					console.log(responese);
					if (responese.data.data.type=="") {
						loadingInstance.close();
						this.$message({showClose: true,message: '抱歉，暂无数据'});
					}else{
						this.tableData=responese.data.data;
						this.getFiltersData(this.tableData);
						// console.log(this.tableData);
						loadingInstance.close();
					}
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
			edit(editRecord){
				var reg=/^\+?[1-9][0-9]*$/;
				var edit=true;
				for (let i = 0; i < this.edited.length; i++) {
					if (this.edited[i].id==editRecord.id) {
					this.edited[i].web_price=editRecord.web_price;
					edit=false;
					break;
					}
				}
				if (edit) {
					this.edited.push(editRecord);
				}
				for (let i = 0; i < this.edited.length; i++) {
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
			submitMessage(errMsg,msgType){
				this.$message({message:errMsg,type:msgType});
			},
			dateFormat: function (shijianchuo){
				//shijianchuo是整数，否则要parseInt转换
				var time = new Date(parseInt(shijianchuo) * 1000);
				var y = time.getFullYear();
				var m = time.getMonth()+1;
				var d = time.getDate();
				var h = time.getHours();
				var mm = time.getMinutes();
				var s = time.getSeconds();
				return y+'-'+this.formatTime(m)+'-'+this.formatTime(d)+' '+this.formatTime(h)+':'+this.formatTime(mm)+':'+this.formatTime(s);
			},
			formatTime:function(m){
				return m<10?'0'+m:m ;
			},
			saveAsExcel(tableID){
				let date = this.dateFormat(this.$route.params.time);
				let time = this.dateFormat(this.$route.params.time).split(' ')[1];
				date = date.split(' ')[0] + ' ' + time;

				$("#"+tableID).table2excel({
					exclude: ".noExl",
					name: "Excel Document Name",
					filename: date + ".xls",
					fileext: ".xls",
					exclude_img: true,
					exclude_links: true,
					exclude_inputs: true
				});
			}
		}
	}
</script>

<template>
	<headerbar active_number="4" :text="['网价数据','新增网价数据']">
		<div class="controller-bar">
			<el-button >导 入 时 间</el-button>
			<el-button type="success" @click="toEdit()" >编辑网价</el-button>
			<el-button style="float:right;" type="default" @click="saveAsExcel('mytable')">导出excel</el-button>
			<div class="time-display">
				<p>{{dateFormat($route.params.time)}}</p>
			</div>
			<template v-if="isEdit">
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
				<el-button type="default" v-popover:showBox>
				统一调价</el-button>
				<el-button type="default" @click="saveWebPriceData()">保存</el-button>
			</template>
		</div>

		<br/>

		<div style="display:none;">
			<table id="mytable">
				<tr>
					<th>品名</th>
					<th>规格</th>
					<th>材质</th>
					<th>钢厂/产地</th>
					<th>价格(元/吨)</th>
					<th>浮动</th>
				</tr>
				<tr v-for="line in tableData">
					<td>{{ line.product }}</td>
					<td>{{ line.type }}</td>
					<td>{{ line.material }}</td>
					<td>{{ line.brands }}</td>
					<td>{{ line.web_price }}</td>
					<td>{{ line.price_change }}</td>
				</tr>
			</table>
		</div>

		<div>
			<el-table :data="tableData" style="width:100%;" >
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
				<el-table-column label="价格(元/吨)" sortable prop="web_price" >
					<template scope="scope" >
						<template v-if="!isEdit">
							<span >{{ scope.row.web_price}}</span>
						</template>
						<template v-else>
							<el-input v-model="scope.row.web_price"
							 @change="edit(scope.row)"
							></el-input>
						</template>
					</template>
				</el-table-column>
				<el-table-column prop="price_change" label="浮动" sortable></el-table-column>
				<!-- <el-table-column prop="source_states" label="资源情况"></el-table-column> -->
			</el-table>
		</div>
	</headerbar>
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
	.el-table-filter{
		position: absolute;
    	left: 508px;
    	top: 334px;
    	transform-origin: center top 0px;
    	z-index: 2000;
	}
	.time-display{
		color: #888;
	}
	.el-table-filter__content{
		min-width: 100px;
    	height: 150px;
   		overflow: auto;
	}
</style>
