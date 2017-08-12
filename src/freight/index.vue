<script>
	import sortable from "./sortable.vue";
	import headbar from "../components/headbar.vue";
	import provinceList from "../../res/json/provinceList.json";
	import ajaxCustom from '../components/ajax-custom.js';
	import { Select, Option, Input, Button, Table, TableColumn, Checkbox, CheckboxGroup, Radio,RadioGroup,RadioButton } from "element-ui";
	export default{
		created : function(){
			var _this = this;
			this.getFreights();
			provinceList.province.forEach(function(value){
				if(value.name === "广东"){
					_this.provinceList = value.cityList;
				}
			});
			this.selectedCity.push('广州市');
		},
		components : {
			sortable,
			headbar,
			elSelect : Select,
			elOption : Option,
			elInput : Input,
			elButton : Button,
			elTable : Table,
			elTableColumn : TableColumn,
			elCheckbox : Checkbox,
			elCheckboxGroup : CheckboxGroup,
			elRadio : Radio,
			elRadioGroup : RadioGroup,
			elRadioButton : RadioButton
		},
		mounted:function (){
			var shead=0;
			window.onscroll=function(){
				shead=document.body.scrollTop;
				let table=document.getElementById("tTable").style;
				if(shead>223){
					table.position="fixed";
					table.top="0px";
				}else{
					table.position="";
					table.top="";
				}
				table=document.getElementById("mTable").style;
				if(shead>223){
					table.position="fixed";
					table.top="0px";
				}else{
					table.position="";
					table.top="";
				}
			};
			this.sinceOnClick();
        },
		data(){
			return {
				brandsGroup:[],
				brands:[
					{name:"韶钢",id:1},{name:"湘钢",id:2},{name:"粤钢",id:3},{name:"马钢",id:4},
					{name:"桂鑫",id:5},{name:"华美",id:6},{name:"德润",id:7},{name:"杰钢",id:8},
					{name:"永达",id:9},{name:"福鑫",id:10},{name:"达味",id:11},{name:"圣力",id:12},
					{name:"科信达",id:13},{name:"腾达",id:14},{name:"龙川腾达",id:15},{name:"宝华",id:16},
					{name:"中山宝华",id:17},{name:"粤北钢铁",id:18}
				],
				millTable:[],
				milltablecache:[],
				millTransport:[],
				tableData : [],
				provinceList : "",
				selectedCity : [],
				transport_methods : '2',
				city :"",
				area : "",
				adds : "",
				areaArray : "",
				cityAllChoose : 'init',
				brandAllChoose : 'init',
				activeCol:""
			}
		},
		methods : {
			/*初始化获得运费数据*/
			getFreights(){
				ajaxCustom.ajaxGet(this,"dingoapi/getAllFreightsData", (responese)=>{
					this.millTransport=responese.body.data.mill;
					//显示钢厂直送表数据
					this.getMillTable(this.millTransport,"广州市");
					//缓存钢厂直送表
					this.milltablecache=this.backupMillTable(this.millTable);
					//显示广州仓发货数据
					for (var i = 0; i < responese.body.data.logistics.length; i++) {
						//表格只显示广州市的数据
						if(responese.body.data.logistics[i].city=='广州市'){
							this.tableData.push({
								'area':responese.body.data.logistics[i].area,
								'city':responese.body.data.logistics[i].city,
								'count':responese.body.data.logistics[i].transport_count,
								'freight':responese.body.data.logistics[i].transport_price,
								'isHide':'on',
								'other':responese.body.data.logistics[i].transport_car_price,
								'remarks':responese.body.data.logistics[i].remarks
							});
						}else{
							this.tableData.push({
								'area':responese.body.data.logistics[i].area,
								'city':responese.body.data.logistics[i].city,
								'count':responese.body.data.logistics[i].transport_count,
								'freight':responese.body.data.logistics[i].transport_price,
								'isHide':'off',
								'other':responese.body.data.logistics[i].transport_car_price,
								'remarks':responese.body.data.logistics[i].remarks
							});
						}
					}
				}, (responese)=>{
					console.log(responese);
				});
			},
			//钢厂直送数据显示
			getMillTable(data,city,area,adds){
				this.millTable=[];
			    area=(area==''?undefined:area);
			    adds=(adds==''?undefined:adds);
				for (var i = 0; i < data.length; i++) {
					if(data[i].city==city&&(area==undefined?1:data[i].area==area)&&(adds==undefined?1:data[i].adds==adds)){
						this.millTable.push(data[i]);
					}
				}
			},
			//广州仓发货数据显示
			tableDataDisplay(data,city,area,adds){
				area=(area==''?undefined:area);
			    adds=(adds==''?undefined:adds);
				for (var i = 0; i < data.length; i++) {
					data[i].isHide='off';
					if (data[i].city==city&&(area==undefined?1:data[i].area==area)&&(adds==undefined?1:data[i].adds==adds)) {
						data[i].isHide='on';
					}
				}
			},
			//钢厂直送备份
			backupMillTable(data){
				let datareturn=[];
				for (var i = 0; i < data.length; i++) {
					datareturn.push(data[i]);
				}
				return datareturn;
			},
			//直接在地址栏搜索
			seachFreightRecord(city,area,adds){
				//广州仓发货
				if(this.transport_methods=='2'){
					this.tableDataDisplay(this.tableData,city,area,adds);
				}
				//钢厂直送
				if(this.transport_methods=='1'){
					this.getMillTable(this.millTransport,city,area,adds);
					this.milltablecache=this.backupMillTable(this.millTable);
				}
			},
			//地区选入
			cityAllChooseIn(provinceList){
				//selectedCity绑定城市数据
				this.selectedCity=[];
				let citys=this.selectedCity;
				provinceList.forEach(function(value){
					citys.push(value.name);
				});
			},
			//地区清空
			cityEmpty(){
				this.cityAllChoose='2';
				this.selectedCity=[];
			},
			//获得地区信息
			setArea(){
				this.area = "";
				this.areaArray = this.city;
			},
			//品牌选入
			brandAllChooseIn(brands){
				this.brandsGroup=[];
				let brandsg=this.brandsGroup;
				for (var j = 0; j < brands.length; j++){
					brandsg.push(brands[j].name);
				}
			},
			//品牌清空
			brandEmpty(){
				this.brandAllChoose='2';
				this.brandsGroup=[];
			},
			//钢厂直送
			setChooseMethodToMillTransport(){
				this.directOnClick();
				this.transport_methods='1';
			},
			//广州仓发货
			setChooseMethodToWarehouse(){
				this.sinceOnClick();
				this.transport_methods='2';
			},
			//按钮css
			sinceOnClick(){
				let sinceStyle=document.getElementById('since').style;
				let directStyle=document.getElementById('direct').style;
				sinceStyle.color="#20a0ff";
				directStyle.color="#20a0ff";
				sinceStyle.backgroundColor="#ddd";
				sinceStyle.borderColor="#20a0ff";
				directStyle.backgroundColor="#fff";
				directStyle.borderColor="#20a0ff";
			},
			//按钮css
			directOnClick(){
				let sinceStyle=document.getElementById('since').style;
				let directStyle=document.getElementById('direct').style;
				sinceStyle.backgroundColor="#fff";
				sinceStyle.borderColor="#20a0ff";
				directStyle.backgroundColor="#ddd";
				directStyle.borderColor="#20a0ff";
			},
			//升序
			asc(data){
				this.updatepage(data);
			},
			//降序
			desc(data){
				this.updatepage(data);
			},
			//页面刷新
			updatepage(data){
				this.activeCol=data.col;
				if (this.transport_methods=='1') {
					this.millTable=null;
					this.millTable=data.data;
				}else{
					this.tableData=null;
					this.tableData=data.data;
				}
			}

			
		},
		watch : {
			//城市筛选
			selectedCity(newVal, oldVal){
				for (var i = 0; i < this.tableData.length; i++) {
					this.tableData[i].isHide='off';
					for (var j = 0; j < newVal.length; j++) {
						if(newVal[j]==this.tableData[i].city){
							this.tableData[i].isHide='on';
						}
					}
				}				
			},
			/*按品牌筛选*/
			brandsGroup(newVal,oldVal){
				this.millTable=[];
				console.log(this.milltablecache[1].brand);
				for (var i = 0; i < this.milltablecache.length; i++) {
					for (var j = 0; j < newVal.length; j++) {
						if(newVal[j]==this.milltablecache[i].brand){
							this.millTable.push(this.milltablecache[i]);
						}
					}
				}
			},
			//品牌全选
			brandAllChoose(newVal,oldVal){
				if (newVal=='1') {
					this.brandEmpty();
				}else if(newVal=='2'){
					return;
				}
				else{
					this.brandAllChooseIn(this.brands);
				}
			},
			//地区全选
			cityAllChoose(newVal,oldVal){
				if (newVal=='1') {
					this.cityEmpty();
				}else if(newVal=='2'){
					return;
				}
				else{
					this.cityAllChooseIn(this.provinceList);
				}
			}
		}
	}
</script>
<template>
	<div>
		<headbar :active_number="3"></headbar>
		<div class="main-warpper">
			<h1>运费查询</h1>
			<h4>送往各地运费详细<br><p class="smallh">运费包含17%税费</p></h4>
			<hr />

			<div class="operation-box" id="selectDiv" >
				<div class="controller-box" >
					<span>项目地址 : 广东省 </span>
					<el-select size="small" placeholder="城市" v-model="city" @change="setArea()">
						<el-option v-for="item in provinceList" :label="item.name" :value="item"></el-option>
					</el-select>
					<el-select size="small" placeholder="区/县" v-model="area">
						<template v-if="areaArray">
							<el-option v-for="area in areaArray.areaList" :label="area" :value="area"></el-option>
						</template>
					</el-select>
					<el-input placeholder="详细地址" size="small" v-model="adds"></el-input>
					<el-button size="small" type="success" @click="seachFreightRecord(city.name,area,adds)">查询运费</el-button>
				</div>
				<div>
					<h3>发货方式:
						<el-button size="small" id="since"   type="info" @click="setChooseMethodToWarehouse()">广州仓发货</el-button>
						<el-button size="small" id="direct" type="info" @click="setChooseMethodToMillTransport()">钢厂直送</el-button>
					</h3>
				</div>
				<div v-show="transport_methods=='1'">
					<h3>品&nbsp&nbsp&nbsp&nbsp&nbsp 牌:
						<el-radio class="allChoose" label="0" v-model="brandAllChoose">全选</el-radio>
						<el-radio class="allChoose" label="1" v-model="brandAllChoose">清空</el-radio>
					</h3>
					<div class="alignment">
						<el-checkbox-group v-model="brandsGroup">
							<el-checkbox :label="item.name"  v-for="item of brands"></el-checkbox>
						</el-checkbox-group>
					</div>
				</div>
				<div v-show="transport_methods=='2'">
					<h3>地&nbsp&nbsp&nbsp&nbsp&nbsp 区:
						<el-radio class="allChoose" label="0" v-model="cityAllChoose">全选</el-radio>
						<el-radio class="allChoose" label="1" v-model="cityAllChoose">清空</el-radio>
					</h3>
					<div class="alignment">
						<el-checkbox-group v-model="selectedCity" >
							<el-checkbox v-for="value in provinceList" :label="value.name" ></el-checkbox>
						</el-checkbox-group>
					</div>
				</div>
			</div>
			<table width="50%" v-show="transport_methods=='1'">
				<col span="1" style="width:80px"/>
				<col span="1" style="width:150px"/>
				<col span="2" style="width:80px"/>
				<thead  id="mTable">
					<tr>
						<th style="width:80px">品牌</th>
						<th style="width:150px">地区</th>
						<th style="width:80px">
							<div class="th-sort">
								<div class="sort-name">运费</div>
								<sortable :data="millTable" col="transport_price" :activeCol="activeCol" v-on:asc="asc" v-on:desc="desc"></sortable>
							</div>
						</th>
						<th style="width:80px">
							<div class="th-sort">
								<div class="sort-name">限载量</div>
								<sortable :data="millTable" col="transport_count" :activeCol="activeCol" v-on:asc="asc" v-on:desc="desc"></sortable>
							</div>
						</th>
						<th style="width:249px">备注</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in millTable"  >
						<td>{{item.brand}}</td>
						<td>{{ item.city }}{{ item.area }}<br>{{item.address}}</td>
						<td>{{ item.transport_price }}</td>
						<td>{{ item.transport_count }}</td>
						<td>{{ item.remarks }}</td>
					</tr>
				</tbody>
			</table>
			<table width="50%" v-show="transport_methods=='2'">
				<col span="5" style="width:80px"/>
				<thead id="tTable">
					<tr >
						<th style="width:80px">送达市</th>
						<th style="width:80px">地区</th>
						<th style="width:80px">
							<div class="th-sort">
								<div class="sort-name">运费</div>
								<sortable :data="tableData" col="freight" :activeCol="activeCol" v-on:asc="asc" v-on:desc="desc"></sortable>
							</div>
						</th>
						<th style="width:80px">
							<div class="th-sort">
								<div class="sort-name">限载量</div>
								<sortable :data="tableData" col="count" :activeCol="activeCol" v-on:asc="asc" v-on:desc="desc"></sortable>
							</div>
						</th>
						<th style="width:80px">
							<div class="th-sort">
								<div class="sort-name" >包车费</div>
								<sortable :data="tableData" col="other" :activeCol="activeCol" v-on:asc="asc" v-on:desc="desc"></sortable>
							</div>
						</th>
						<th style="width:239px">备注</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in tableData" v-if="item.isHide=='on'" >
						<td>{{ item.city }}</td>
						<td>{{ item.area }}</td>
						<td>{{ item.freight }}</td>
						<td>{{ item.count }}</td>
						<td>{{ item.other }}</td>
						<td>{{ item.remarks }}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<style scoped>
	*{
		font-family:"微软雅黑";
	}
	hr{
		margin:30px 0px 50px 0px;
		border: none;
		border-top:solid 1px #DEDEDE;
	}
	.main-warpper{
		width:1280px;
		margin:auto;
		padding:25px 0px 25px 0px;
		color:#1F2D3D;
	}
	h1,h4{
		font-weight:400;
	}L
	h4{
		color:#8492A6;
	}
	.el-input, .el-select{
		width:100px;
	}
	.controller-box{
		margin-bottom: 30px;
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
		background-color:#eff2f7;
	}
	thead th{
		text-align: center;
		padding:15px 0px;
		border:none;
	}
	table td{
		padding:15px;
		border:none;
		border-bottom:1px solid #e0e6ed;
	}
	table tbody tr:hover{
		background-color: #eff2f7;
	}
	
	.operation-box{
		position:fixed;
		top:295px;
		width:580px;
		height:550px;
		background-color:#FFF;
	}
	.static-box{
		float:left;
		width:45%;
	}
	.el-checkbox{
		width: 79px;
		margin:5px 0px 5px 15px;
	}
	.col-width{
		width: 200px;
	}
	.allChoose{
		color : #555;
		margin-left: 0px;
	}
	.alignment{
		margin-left: 68px;
		margin-top: 0px;
	}
	h3{
		margin-bottom: 6px;
	}
	.el-button--info:focus, .el-button--info:hover{
		color: #20a0ff;
	}
	.th-sort{
		height:20px;
		width: 70px;
		margin:auto;
	}
	.sort-name{
		margin-top: 3px;
		float: left;
		width:50px;
	}
	.smallh{
		font-size: 5px;
	}
	#tTable{
		z-index: 1;		
	}
	body{
		background-color:#f8f8f8;
	}
</style>