<script>
	import headerbar from '../components/same-headerbar.vue';
	import ajaxCustom from '../components/ajax-custom.js';
	// import desc from '../components/steel-sort.js';
	import proTable from '../components/table.vue';
	// import sortMethods from '../components/steel-sort.js';
	import draggable from 'vuedraggable';
	import { Tag, Steps, Step, Switch, Tabs, TabPane, Select, Option, Button, RadioGroup, Radio, Table, TableColumn, DatePicker, Input, Dialog } from 'element-ui';
	export default{
		components : {
			headerbar,
			ajaxCustom,
			draggable,
			elSelect : Select,
			elOption : Option,
			elButton : Button,
			elRadioGroup : RadioGroup,
			elRadio : Radio,
			elTable : Table,
			elTableColumn : TableColumn,
			elDatePicker : DatePicker,
			elInput : Input,
			elDialog : Dialog,
			elTabs : Tabs,
			elSwitch : Switch,
			elTabPane : TabPane,
			elSteps : Steps,
			elStep : Step,
			elTag : Tag,
			proTable : proTable,
		},
		created(){
			let index = 0;
			for(let data of window._defaultDatas.orders){
				data.index = index;
				index++;
			}
			this.orders = window._defaultDatas.orders;
			this.ordersCache = JSON.parse(JSON.stringify(this.orders));
			this.projectInfo.options = window._defaultDatas.projects;
			this.tableDatasByWeb = JSON.parse(JSON.stringify(window._defaultDatas.webPriceDatas));
			this.tableDatasByMarket = JSON.parse(JSON.stringify(window._defaultDatas.marketPriceDatas));
			// 初始化自定义属性
			for(let data of this.tableDatasByWeb){
				data.amount = 0;
				data.priceType = 1;
				this.$set(data, "range", true);
				this.$set(data, "show", false);
				this.$set(data, "filtered", true);
				data.cate_spec = data.product;
				data.size = data.type;
				data.brand = data.brands;
				data.price = data.web_price;
				this.allPriceDatas.push(data);
			}
			for(let data of this.tableDatasByMarket){
				data.amount = 0;
				data.priceType = 0;
				this.$set(data, "range", true);
				this.$set(data, "show", true);
				this.$set(data, "filtered", true);
				this.allPriceDatas.push(data);
			}
		},
		data(){
			return {
				orders : [],
				// Dialog打开的订单
				orderData : [],
				// Dialog打开的订单中的steel规格
				orderDetail : [],
				ordersCache : [],
				// 网价混合现货价
				allPriceDatas : [],
				// 网价与现货价
				tableDatasByWeb : [],
				tableDatasByMarket : [],
				projectInfo : {
					info : null,
					options : [],
					selected : null
				},
				// 日期选择器控件
				orderDate : null,
				pickerOptions: {
					disabledDate(time) {
						return time.getTime() > Date.now();
					}
				},
				// 切换table的控件
				tabsInfo : {
					active : 'all',
					tabIndex : [
						{ label : "全部订单", name : 'all' },
						{ label : "未处理", name : '0' },
						{ label : "处理中", name : '1' },
						{ label : "待确认", name : '2' },
						{ label : "待发货", name : '3' },
						{ label : "待收货", name : '4' },
						{ label : "已完成", name : '5' },
						{ label : "已取消", name : '6' }
					]
				},
				// Dialog打开订单中的Form表单数据
				dialogForm : {
					transport : { options : ["卖房直送", "买方自提"], selected : null },
					cars : [{ number : null, tel : null, name : null, idCard : null }],
					consignee : null,
					consigneeTel : null,
					consignee_addr : null,
					startRange : null,
					remarks : null,
					handler : {
						buy : [],
						sell : []
					}
				},
				radioSelecter : {
					steel : null,
					steelRange : true,
					steelPrice : 0,
					swich : false
				},
				boxDisplay : false,
				isNextPage : false
			}
		},
		methods : {
			setStatus(status){
				const statusStyle = [
					{ status : 0, label : "未处理" },
					{ status : 1, label : "处理中" },
					{ status : 2, label : "待确认" },
					{ status : 3, label : "待发货" },
					{ status : 4, label : "待收货" },
					{ status : 5, label : "已完成" },
					{ status : 6, label : "已取消" }
				]
				for(let data of statusStyle){
					if(data.status == status){
						return data.label;
					}
				}
			},
			filterTableLine(data){
				if(data){
					this.orders = [];
					this.tabsInfo.active = 'all';
					for(let _data of this.ordersCache){
						if(_data.project_id === data){
							this.orders.push(_data);
						}
					}
				}
			},
			showAllTableLine(tab, event){
				this.projectInfo.selected = null;
				this.orders = JSON.parse(JSON.stringify(this.ordersCache));
			},
			showOrder(index){
				this.orderData = JSON.parse(JSON.stringify(this.orders[index]));
				this.boxDisplay = true;
				this.isNextPage = false;
				this.displayRange(true);
				// 时间控件赋值
				if(this.orderData.date_of_receipt.length > 1){
					this.orderData.date_of_receipt = this.orderData.date_of_receipt.split(' - ');
				}
				// 状态临时前端变更
				if(this.orders[index].status == 0){
					this.$set(this.orders[index], "status", 1);
					this.$set(this.ordersCache[index], "status", 1);
				}
			},
			countNumber(key){
				let total = 0;
				for(let data of this.orderData.orderDetail){
					total += (parseFloat(data[key]) | 0);
				}
				return total;
			},
			splitLine(index, data){
				let newLine = JSON.parse(JSON.stringify(data));
				delete newLine['id'];
				newLine.isExtra = true;
				this.orderData.orderDetail.splice(index+1, 0, newLine);
				// 添加索引
				for(let i =0; i<this.orderData.orderDetail.length; i++){
					this.orderData.orderDetail[i].index = i;
				}
			},
			// 是否有 拆单
			hasExtra(){
				for(let data of this.orderData.orderDetail){
					if(!data.id){
						return true;
					}
				}
				return false;
			},
			hideShowAllTableDatas(key, type){
				let display = null;
				type === "hide" ? display = false : display = true;
				for(let data of this.allPriceDatas){
					data[key] = display;
					this.$set(data, key, display);
				}
			},
			displayRange(isDisplay){
				let limitBrands = [this.orderData.orderDetail[0].brand];
				for(let data of this.orderData.orderDetail){
					let hasSame = false;
					for(let _data of limitBrands){
						if(_data === data.brand){
							hasSame = true;
						}
					}
					hasSame ? null : limitBrands.push(data.brand);
				}
				this.hideShowAllTableDatas("range", "hide");
				if(isDisplay){
					this.hideShowAllTableDatas("range", "hide");
					for(let data of this.allPriceDatas){
						let hasBrand = false;
						for(let _data of limitBrands){
							if(data.brand === _data){
								this.$set(data, "range", true);
							}
						}
					}
				}else{
					this.hideShowAllTableDatas("range", "show");
				}
			},
			showChosen(isOpen){
				if(isOpen){
					this.hideShowAllTableDatas("filtered", "hide");
					this.hideShowAllTableDatas("range", "show");
					this.hideShowAllTableDatas("show", "show");
					let result = [];
					for(let data of this.allPriceDatas){
						if(parseInt(data.amount)){
							data.filtered = true;
						}
					}
				}else{
					this.hideShowAllTableDatas("filtered", "show");
					this.hideShowAllTableDatas("range", "show");
					this.hideShowAllTableDatas("show", "show");
					this.displayPrice(this.radioSelecter.steelPrice);
					this.displayRange(this.radioSelecter.steelRange);
					this.displayFilered(this.radioSelecter.steel);
				}
			},
			displayFilered(index){
				if(index >= 0){
					this.hideShowAllTableDatas("filtered", "hide");
					for(let data of this.allPriceDatas){
						if(
							data.cate_spec===this.orderData.orderDetail[index].cate_spec &&
							data.material===this.orderData.orderDetail[index].material &&
							data.size===this.orderData.orderDetail[index].size
						){
							data.filtered = true;
						}
					}
				}else{
					this.hideShowAllTableDatas("filtered", "show");
				}
			},
			displayPrice(type){
				this.hideShowAllTableDatas("show", "hide");
				for(let data of this.allPriceDatas){
					if(data.priceType == type){
						data.show = true;
					}
				}
			},
			// table排序
			sortPrice(type, sortKey){
				if(type === "asce"){
					this.orders.sort(function(a, b){
						return a[sortKey] > b[sortKey];
					});
				}else{
					this.orders.sort(function(a, b){
						return b[sortKey] > a[sortKey];
					});
				}
			},
			countTotal(price, freight, amount, index){
				let tempPrice = parseFloat(price) ? parseFloat(price) : 0;
				let tempFreight = parseFloat(freight) ? parseFloat(freight) : 0;
				let tempAmount = parseFloat(amount) ? parseFloat(amount) : 0;
				let result = ( tempPrice + tempFreight ) * tempAmount;
				let total;
				if(result.toString().indexOf('.') >= 0){
					total = result.toString().substring(0, result.toString().indexOf('.')+3);
				}else{
					total = result;
				}
				this.orderData.orderDetail[index].total = total;
				return total;
			},
			sureDatas(){
				this.isNextPage = false;
				let result = [];
				for(let data of this.allPriceDatas){
					if(data.amount){
						result.push(data);
					}
				}
				for(let data of this.orderData.orderDetail){
					for(let _data of result){
						if(
							data.cate_spec===_data.cate_spec &&
							data.material===_data.material &&
							data.size===_data.size
						){
							data.unit_price = _data.price;
							data.amount = _data.amount;
						}
					}
				}
				this.isNextPage = false;
			},
			updateOrder(){
				let date_of_receipt;
				if(this.orderData.date_of_receipt.length){
					date_of_receipt = this.orderData.date_of_receipt[0].length ? this.orderData.date_of_receipt[0].replace('T', ' ').replace('Z', '') + " - " + this.orderData.date_of_receipt[1].replace('T', ' ').replace('Z', '') : '';
				}else {
					date_of_receipt = null;
				}
				let postData = {
					id : this.orderData.id,
					status : this.orderData.status,
					detailOrder : this.orderData.orderDetail,
					receiver : this.orderData.receiver,
					receiver_tel : this.orderData.receiver_tel,
					date_of_receipt : date_of_receipt,
					place_of_receipt : this.orderData.place_of_receipt,
					remarks : this.orderData.remarks,
					transport_function : this.orderData.transport_function,
					bussinessInfo : this.orderData.bussinessInfo[0],
					logistics_info : this.orderData.logisticsInfo,
					car_info_change : this.orderData.logisticsInfo.length ? 1 : 0
				}
				let url = null;
				if(postData.status < 2){
					url = "dingoapi/updateOrder";
				}else if(postData.status == 3){
					url = "dingoapi/sendForReceived";
				}else{
					alert("操作有误");
					return false;
				}
				ajaxCustom.ajaxPost(this, url, postData, (response)=>{
					console.log(response);
					alert("保存成功");
					window.location.reload();
				}, (response)=>{
					alert(response.body.message);
				});
			}
		},
		computed : {
			weightTotal(){
				return this.countNumber("amount");
			},
			weightOrderTotal(){
				return this.countNumber("out_warehouse_amount");
			},
			moneyTotal(){
				return this.countNumber("total");
			}
		}
	}
</script>
<template>
	<div>
		<headerbar active_number="supplier_order" :text="['现货订单','钢材现货购买']">
			<div class="page-tools">
				<h1>订单处理与查询</h1>
				<div>
					<div style="float:left;">
						<span>选择项目：</span>
						<el-select v-model="projectInfo.selected" @change="filterTableLine" size="small">
							<el-option v-for="item in projectInfo.options" :value="item.project_info_id" :label="item.name"></el-option>
						</el-select>
					</div>
					<!-- <div style="float:right;margin-bottom:20px;">
						<span>下单日期：</span>
						<el-date-picker v-model="orderDate" align="right" type="daterange" size="small" placeholder="选择日期" :picker-options="pickerOptions"></el-date-picker>
						<el-button type="default" size="small">清空</el-button>
					</div> -->
					<div style="clear:both;"></div>
				</div>
			</div>

			<div class="page-content">
				<el-tabs v-model="tabsInfo.active" @tab-click="showAllTableLine">
					<el-tab-pane v-for="item in tabsInfo.tabIndex" :label="item.label" :name='item.name'>
						<pro-table v-model="orders">
							<template slot="thead">
								<th>订单编号</th>
								<th>
									<span>下单用户</span>
									<div class="sort-icon">
										<div class="sort-icon">
											<div @click="sortPrice('asce', 'user_name')" >▲</div>
											<div @click="sortPrice('desc', 'user_name')" style="margin-top: -5px;">▼</div>
										</div>
									</div>
								</th>
								<th>订单类型</th>
								<th>状态</th>
								<th>下单时间</th>
								<th>收货时间</th>
								<th>订单操作</th>
							</template>
							<template slot="tbody" scope="props" >
								<template v-if="item.name=='all' || item.name==props.line.status" >
									<td>{{ props.line.order_number }}</td>
									<td>{{ props.line.user_name }}</td>
									<td>现货订单</td>
									<td><el-tag type="success">{{ setStatus(props.line.status) }}</el-tag></td>
									<td>{{ props.line.updated_at }}</td>
									<td>{{ props.line.date_of_receipt }}</td>
									<td><el-button type="info" size="mini" @click="showOrder(props.line.index)">查看</el-button></td>
								</template>
							</template>
						</pro-table>
					</el-tab-pane>
				</el-tabs>
			</div>

			<div class="plan-list">
				<el-dialog id="dialog-box" title="计划单" :visible.sync="boxDisplay" width="100%">
					<div v-if="!isNextPage">
						<div v-if="orderData.orderDetail">
							<table class="table-style">
								<thead>
					                <th>品牌</th>
					                <th>品名</th>
					                <th>规格</th>
					                <th>材质</th>
									<th>仓库</th>
					                <th>含税单价(元/吨)</th>
					                <th>运费(元/吨)</th>
									<template v-if="orderData.status>2">
										<th>下单数量(吨)</th>
										<th>出仓数量</th>
									</template>
									<template v-else>
										<th>下单数量(吨)</th>
									</template>
					                <th>总价(元)</th>
					                <th>车号</th>
					                <th>备注</th>
					                <th v-if="orderData.status<=1">操作</th>
								</thead>
								<draggable v-model="orderData.orderDetail" element="tbody">
									<tr v-for="(data, index) in orderData.orderDetail">
										<td>{{ data.brand }}</td>
										<td>{{ data.cate_spec }}</td>
										<td>{{ data.size }}</td>
										<td>{{ data.material }}</td>
										<td><input style="width:100%;" v-model="data.warehouse" /></td>
										<td><input style="width:100%;" v-model="data.unit_price" /></td>
										<td><input style="width:100%;" v-model="data.freight" /></td>
										<template v-if="orderData.status>2">
											<td>{{ data.amount }}</td>
											<td><input style="width:100%;" v-model="data.out_warehouse_amount" /></td>
											<td>{{ countTotal( data.unit_price, data.freight, data.out_warehouse_amount, index) }}</td>
										</template>
										<template v-else>
											<td><input style="width:100%;" v-model="data.amount" /></td>
											<td>{{ countTotal(data.unit_price, data.freight, data.amount, index) }}</td>
										</template>
										<td>{{ data.plate_number }}</td>
										<td>{{ data.remark }}</td>
										<td v-if="orderData.status<=1">
											<el-button v-if="!data.isExtra" size="mini" @click="splitLine(index, data)">拆单</el-button>
											<el-button v-else type="warning" size="mini" @click="orderData.orderDetail.splice(index, 1)">删除</el-button>
										</td>
									</tr>
								</draggable>

								<tr v-if="orderData.orderDetail.length">
									<td colspan='3'>总价</td>
									<td></td>
									<template v-if="orderData.status>2">
										<td colspan='3'></td>
										<td>{{ weightTotal }}</td>
										<td>{{ weightOrderTotal }}</td>
									</template>
									<template v-else>
										<td colspan='3'></td>
										<td>{{ weightTotal }}</td>
									</template>
									<td>{{ moneyTotal }}</td>
									<td></td>
									<td></td>
									<td v-if="orderData.status<=1">
										<!-- <el-button type="info" size="mini" @click="isNextPage=true" :disabled="hasExtra()">配置订单</el-button> -->
									</td>
								</tr>
							</table>
						</div>

						<div class="form-box">
							<div>
								<span>运输方式：</span>
								<el-select v-model="orderData.transport_function" size="small">
									<el-option :value='0' label="直送"></el-option>
									<el-option :value='1' label="自提"></el-option>
								</el-select>
							</div>
							<div>
								<div v-for="(item, index) in orderData.logisticsInfo" class="car_box">
									<span>车号 : </span><el-input v-model="item.plate_number" size="small" style="width:100px;"></el-input>
									<span>联系电话 : </span><el-input v-model="item.driver_tel" size="small" style="width:120px;"></el-input>
									<span>司机 : </span><el-input v-model="item.driver" size="small" style="width:60px;"></el-input>
									<span>身份证 : </span><el-input v-model="item.driver_idcard_num" size="small" style="width:160px;"></el-input>
									<el-button v-if="index==0" size="small" @click="orderData.logisticsInfo.push({ number : null, tel : null, name : null, idCard : null })">新增车号</el-button>
									<el-button v-else size="small" @click="orderData.logisticsInfo.splice(index, 1)">删除</el-button>
								</div>
							</div>
							<div>
								<span>收货人 : </span>
								<el-input v-model="orderData.receiver" size="small" style="width:70px;margin-right:20px;"></el-input>
								<span>联系电话 : </span>
								<el-input v-model="orderData.receiver_tel" size="small" style="width:120px;margin-right:20px;"></el-input>
								<span>送货地址 : </span>
								<el-input v-model="orderData.place_of_receipt" size="small" style="width:150px;margin-right:20px;"></el-input>
							</div>
							<div>
								<span>供货时间 : </span>
								<el-date-picker v-model="orderData.date_of_receipt" align="right" type="daterange" placeholder="选择日期" :picker-options="pickerOptions" size="small" style="margin-right:20px;"></el-date-picker>
								<span>备注 : </span>
								<el-input v-model="orderData.remarks" size="small" style="width:200px;"></el-input>
							</div>
							<hr/>
							<div v-if="orderData.tradeBetween">
								<p>买方(收货单位) : {{ orderData.tradeBetween.buyercompany }}</p>
								<span>经办人 : </span>
								<el-input v-model="orderData.bussinessInfo[0].buyer_name" size="small" style="width:100px;margin-right:20px;"></el-input>
								<span>传真 : </span>
								<el-input v-model="orderData.bussinessInfo[0].buyer_fax" size="small" style="width:100px;margin-right:20px;"></el-input>
								<span>日期 : {{ orderData.bussinessInfo[0].date_create }}</span>
							</div>
							<div v-if="orderData.tradeBetween">
								<p>卖方(供货单位) : {{ orderData.tradeBetween.sellcompany }}</p>
								<span>经办人 : </span>
								<el-input v-model="orderData.bussinessInfo[0].seller_name" size="small" style="width:100px;margin-right:20px;"></el-input>
								<span>传真 : </span>
								<el-input v-model="orderData.bussinessInfo[0].seller_fax" size="small" style="width:100px;margin-right:20px;"></el-input>
								<span>日期 : {{ orderData.bussinessInfo[0].date_create }}</span>
							</div>
						</div>
						<div slot="footer" class="dialog-footer">
							<div v-if="orderData.status<2 || orderData.status==3" style="float:right;margin-bottom:20px;">
								<el-button @click="boxDisplay = false" size="small">取 消</el-button>
								<el-button type="primary" @click="updateOrder()" size="small">发送</el-button>
							</div>
						</div>
					</div>

				</el-dialog>
			</div>
		</headerbar>
	</div>
</template>
<style>
	body{
		background:#f8f8f8;
	}
	hr{
		margin:10px 0px 20px 0px;
		border: none;
		border-top:solid 1px #DEDEDE;
	}
	.main_top{
		margin-left: 220px;
		margin-top: 0;
	}
	.top{
		margin: 0 auto;
		padding: 15px 0;
		max-width: 1280px;
	}
	.main_warpper{
		margin: 0 15px;
		padding: 5px 15px;
		/*background-color: #fff;*/
		max-width: 1280px;
	}
	.page-tools{
		padding:25px;
		margin:30px 0px 30px;
		border-radius:5px;
		background:#FFF;
	}
	.page-tools>h1{
		font-size:18px;
		font-weight:400;
		color:#999;
	}
	.page-tools>div{
		margin:30px 0px 0px 0px;
	}
	.page-tools div>span{
		font-size:16px;
	}
	.page-content{
		padding:25px;
		margin:30px 0px 30px;
		border-radius:5px;
		background:#FFF;
	}

	html .el-dialog--small{
		width:1280px;
	}

	html .table-body{
		overflow: hidden !important;
        height: auto !important;
	}

	html body .table-style{
		width: 100%;
		margin-top:-1px;
		padding-right:0px;
		border:1px solid #e0e6ed;
		text-align:center;
		font-size:15px;
	}
	html body .table-style thead{
		background-color:#eef1f6;
	}
	html body .table-style thead th{
		text-align: center;
		padding:10px 0px;
		border:1px solid #dfe6ec;
	}
	html body table.table-style{
		margin-bottom: 30px;
		width: 100%;
		table-layout: fixed;
		border-collapse:collapse;
		border:1px solid #e0e6ed;
		text-align:center;
		font-size:14px;
	}
	html body table.table-style td{
		padding:10px;
		border:none;
		border-bottom:1px solid #e0e6ed;
		border-right:1px solid #e0e6ed;
		word-wrap:break-word;
		word-break:break-all;
		font-weight:300;
	}
	html body table.table-style tbody tr:hover{
		background-color: #eff2f7;
	}
	html body div.table-head{
		padding-right:0px !important;
	}
	.form-box{
		font-size:16px;
	}
	.car_box{
		margin:5px;
	}
	.car_box .el-input{
		margin-right:20px;
	}
	.form-box>div{
		padding-left:15px;
		margin:30px 0px 30px;
	}
	.select-steel .el-radio-group{
		display:block;
		width:auto;
		margin:10px auto;
	}
	.el-radio-group>div{
		list-style-type:none;
	}
	.el-radio-group>div{
		width:auto;
		margin : 10px auto;
		padding:5px 5px 5px 5px;
		font-size:16px;
		text-align: center;
	}
	.el-switch__label span{
		display:none;
	}
	.el-steps{
		display: block;
		width: 500px;
		margin:0px auto 20px auto;
		padding-left: 150px;
	}
	.sort-icon{
	    display: inline-block;
	    width: 20px;
	    font-size: 12px;
	    color: #97a8be;
	}
	.sort-icon>div{
		cursor: pointer;
	}
</style>
