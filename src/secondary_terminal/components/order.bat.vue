<script>
import { Input, Table, TableColumn, Button, Dialog, Select, Option, DatePicker } from 'element-ui';
export default{
	components : {
		elDatePicker : DatePicker,
		elInput : Input,
		elTableColumn : TableColumn,
		elTable : Table,
		elButton : Button,
		elDialog : Dialog,
		elSelect : Select,
		elOption : Option
	},
	props : ['data' , 'settlement' ],
	created(){
		this.roles = this.toJson(role);

	},
	data(){
		return {
			roles : [],
			id : null,
			orderList : [],
			orderStatus : 0,
			showOrder : true ,
			transportFunction : 0,
			settle : null,
			pickerOptions : {
				disabledDate(time) {
					return time.getTime() <= Date.now() ;
				}
			},
			logistics_info : [
				{
					plate_number : null,
					driver : null,
					driver_tel : null,
					driver_idcard_num : null
				}
			],
			receiver : null,
			receiver_tel : null,
			date_of_receipt : null,
			place_of_receipt : null,
			remarks : null
		}
	},
	computed : {
		orderData(){
			this.orderList = this.data.orderDetail;
			this.orderStatus = this.data.status;
			this.transportFunction = this.data.transport_function;
			if(this.data.transport_function){
				this.logistics_info = this.data.logisticsInfo;
			}
			this.receiver = this.data.receiver;
			this.receiver_tel = this.data.receiver_tel;
			this.date_of_receipt = this.data.date_of_receipt;
			this.place_of_receipt = this.data.place_of_receipt;
			this.remarks = this.data.remarks;
			this.id = this.data.id;
			this.settle = this.settlement;
			return this.data;
		},
	},
	watch : {
		orderData(n,o){
			console.log(this.orderData);
		}
	},
	methods : {
		toJson(data){
			data = data.replace(/&quot;/g,'"');
			data = JSON.parse(data);
			return data;
		},
		hasRole(role){
			console.log(this.data);
			for (var i = 0; i < this.roles.length; i++) {
				if(this.roles[i].name==role){
					return true;
				}
			}
			return false;
		},
		changeDate(date){
			this.date_of_receipt = date;
			// console.log(date);
		},
		exit(){
			this.$emit('exit', this.showOrder);
		},
		order (){
			this.$emit('order',{
				detailOrder : this.orderList ,
				logistics_info : this.logistics_info,
				receiver : this.notSendUndefined(this.receiver),
				receiver_tel : this.notSendUndefined(this.receiver_tel),
				date_of_receipt : this.notSendUndefined(this.date_of_receipt),
				place_of_receipt : this.notSendUndefined(this.place_of_receipt),
				remarks : this.notSendUndefined(this.remarks),
				transport_function : this.transportFunction
			});
		},
		notSendUndefined(data){
			if(!data){
				return '';
			}
			return data;
		},
		saveOrder(){
			this.$emit('save');
		},
		cancelOrder(){
			this.$emit('cancel',{ id : this.id });
		},
		rollbackOrder(){
			this.$emit('rollback',{ id : this.id });
		},
		confirm(){
			this.$emit('confirm',{ id : this.id });
		},
		sendOrder(){
			this.$emit('send',{
				id : this.id,
				status : this.orderStatus,
				detailOrder : this.orderList ,
				logistics_info : this.logistics_info,
				receiver : this.receiver,
				receiver_tel : this.receiver_tel,
				date_of_receipt : this.date_of_receipt,
				place_of_receipt : this.place_of_receipt,
				remarks : this.remarks,
				transport_function : this.transportFunction
			});
		},
		// 添加车号
		addCar(){
			this.logistics_info.push({
				plate_number : null,
				driver : null,
				driver_tel : null,
				driver_idcard_num : null
			});
		},
		// 删除车号
		delCar(index){
			let mess = this.logistics_info;
			if(mess.length >1){
				mess.splice(index, 1);
			}
		},
	}
}
</script>
<template>
	<div>
		<el-table :data="orderList" border >
			<el-table-column prop="$index" label="序号"></el-table-column>
			<el-table-column prop="brand" label="品牌"></el-table-column>
			<el-table-column prop="cate_spec" label="品名"></el-table-column>
			<el-table-column prop="size" label="规格"></el-table-column>
			<el-table-column prop="material" label="材质"></el-table-column>
			<el-table-column prop="warehouse" label="仓库"></el-table-column>
			<el-table-column prop="price" label="含税单价"></el-table-column>
			<el-table-column prop="amount" label="计划吨数"></el-table-column>
			<el-table-column prop="total" label="总价"></el-table-column>
			<el-table-column prop="" label="车号" v-show='1==0'></el-table-column>
			<el-table-column prop="" label="备注" v-show='1==0'></el-table-column>
		</el-table>
		<div style="text-align:left;margin-top:20px;">
			<div>
				<div v-if="settle">
					<label>
						<b>结算条件</b>
					</label>
					<!-- 统一包干结算 -->
					<template v-if="settle.conditionType==1">
						<p>{{ settle.beginCalculateType + settle.days }}日</p>
						<p>{{ settle.priceType + settle.calculateType + settle.price }}元/吨</p>
					</template>
					<!-- 分品牌包干结算 -->
					<template v-if="settle.conditionType==2">
						<p>{{ settle.beginCalculateType + settle.days }}日</p>
						<p v-for="child in data.settle.childData">
							<span>{{ child.onemoreBrand + child.priceType +  child.calculateType + child.price}}元/吨</span>
						</p>
					</template>
					<!-- 分品名包干结算 -->
					<template v-if="settle.conditionType==3">
						<p>{{ settle.beginCalculateType + settle.days }}日</p>
						<p v-for="cate in data.settle.cate_spec">
							<span>{{ cate.name + cate.calculateType + cate.price }}元/吨</span>
						</p>
					</template>
					<!-- 统一分拆结算 -->
					<template v-if="settle.conditionType==4">
						<p>{{ settle.beginCalculateType + settle.days }}日</p>
						<p>{{ settle.priceType + settle.calculateType + settle.price }}元/吨</p>
						<p>运费{{ settle.freight }} 元/吨</p>
						<p>过磅费{{ settle.ponderation_price }} 元/吨</p>
					</template>
					<!-- 分品牌分拆结算 -->
					<template v-if="settle.conditionType==5">
						<p>{{ settle.beginCalculateType + settle.days }}日</p>
						<p v-for="child in data.settle.childData">
							<span>{{ child.onemoreBrand + child.priceType +  child.calculateType + child.price}}元/吨</span>
						</p>
						<p>运费{{ settle.freight }} 元/吨</p>
						<p>过磅费{{ settle.ponderation_price }} 元/吨</p>
					</template>
					<!-- 综合费率结算 -->
					<template v-if="settle.conditionType==6">
						<p>{{ settle.beginCalculateType + settle.days }}日</p>
						<p>运费{{ settle.freight }} 元/吨</p>
						<p>过磅费{{ settle.ponderation_price }} 元/吨</p>
						<p>吊机费{{ settle.crane_price }} 元/吨</p>
						<p>资金费率{{ settle.funds_price_rate }} 元/吨</p>
					</template>
					<!-- 其他方式结算 -->
					<template v-if="settle.conditionType==7">
						<p>{{ settle.elsePayWay }}</p>
					</template>
				</div>
				
				<label>
					<b>物流信息</b><span style="color:red;font-weight:normal;">(可在后续操作中补录)</span>
				</label>
				<br>
				<span>运输方式:</span>
				<el-select placeholder="请选择" v-model='transportFunction'  size="small">
					<el-option label="买方自提" :value="1"></el-option>
					<el-option label="卖方承运" :value="0"></el-option>
				</el-select>
				<!-- <el-button size="small" @click="addCar" v-if="transportFunction == 1">新加车号</el-button> -->
				<div v-if='transportFunction==1'  style="margin-top:20px;">
					<div v-for='(item, index) in logistics_info'>
						<p>
							<span style="width:60px;display:inline-block;">车号:</span>
							<el-input type="text" v-model="item.plate_number" style="width:30%;margin-right:30px;" size="small"></el-input>

							<span>联系电话:</span>
							<el-input type="text" v-model='item.driver' size="small" style="width:30%;margin-right:30px;"></el-input>
						</p>
						<p>
							<span style="width:60px;display:inline-block;">司机:</span>
							<el-input type="text" v-model='item.driver_tel' size="small" style="width:30%;margin-right:30px;"></el-input>
							<span>身份证号:</span>
							<el-input type="text" v-model='item.driver_idcard_num' size="small" style="width:30%;margin-right:30px;"></el-input>
						</p>
					</div>
				</div>
				<div v-if='orderStatus'>
					<label>
						<b>供货信息</b>
					</label>
					<p>
						<span style="width:60px;display:inline-block;">收货人:</span>
						<el-input type="text"  v-model="receiver" size="small" style="width:30%;margin-right:30px;"></el-input>
						<span>联系电话:</span>
						<el-input type="text" v-model="receiver_tel" size="small" style="width:30%;margin-right:30px;"></el-input>
					</p>
					<p>
						<span>送货地址:</span>
						<el-input type="text" v-model="place_of_receipt" size="small" style="width:30%;margin-right:30px;"></el-input>
					</p>
					<p>
						<span>供货时间:</span>
						<el-date-picker v-model="date_of_receipt" type="date" :picker-options="pickerOptions" placeholder="请选择日期" @change='changeDate'></el-date-picker>
					</p>
					<label style="width:60px;">
						<b>备  注：</b>
					</label>
					<el-input v-model="remarks" type="text" size="small" style="display:inline-block;width:67%;"></el-input>
					<div style="text-align:left;margin-top:20px;width:60%;">
						<div style="float:left;">
							<p><span>买方(收货单位):</span><span></span></p>
							<p><span>经办人:</span><span></span></p>
							<p><span>传真:</span><span></span></p>
							<p><span>日期:</span><span></span></p>
						</div>
						<div style="float:right; margin-left:200px;margin-bottom:50px;">
							<p><span>卖方(供货单位):</span><span></span></p>
							<p><span>经办人:</span><span></span></p>
							<p><span>传真:</span><span></span></p>
							<p><span>日期:</span><span></span></p>
						</div>
					</div>
				</div>
				<div slot="footer" class="dialog-footer" style="clear:both;text-align:center;">
					<el-button type="primary" @click="saveOrder" v-if='orderStatus==3'>保存</el-button>
					<el-button @click='exit'>返回</el-button>
					<el-button type="primary" @click='order()' v-if='!orderStatus&&orderStatus!=0'>确认下单</el-button>
					<el-button type="danger" @click="cancelOrder" 
						v-if='(orderStatus==1&&hasRole("运营中心"))||(orderStatus==0&&hasRole("次终端用户"))'
					>取消订单</el-button>
					<el-button type="primary" @click="sendOrder" v-if='orderStatus==1&&hasRole("运营中心")'>发送订单</el-button>
					<el-button type="primary" @click="confirm" v-if='orderStatus==2&&hasRole("次终端用户")'>确认</el-button>
				</div>
			</div>
		</div>
	</div>
</template>
<style scoped>
	.el-input{
		width: 50px;width:30%;margin-right:30px;
	}
</style>