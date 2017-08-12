<script>
	import {RadioGroup, Radio, Select, Option, Input, Button} from 'element-ui';
	export default{
		props : {
			needingDatas : {
				type : Object
			},
			brands : {
				type : Array
			}
		},
		components : {
			elRadioGroup : RadioGroup,
			elRadio : Radio,
			elSelect : Select,
			elOption : Option,
			elInput : Input,
			elButton : Button
		},
		data(){
			return {}
		},
		methods:{
			addBrands(){
				this.needingDatas.childData.push({
					onemoreBrand : '',
					priceType : "网价",
					calculateType : "上浮",
					price : null
				});
			},
			delBrand(index){
				if(this.needingDatas.childData.length >1 ){
					this.needingDatas.childData.splice(index, 1);
				}
			},

		},
	}
</script>

<template>
	<div>
		<div class="needing-select">
			<div class="type-select-box">
				<el-radio-group v-model="needingDatas.conditionType">
				<ul>
					<li><el-radio :label="1">统一包干结算</el-radio></li>
				    <li><el-radio :label="2">分品牌包干结算</el-radio></li>
				    <li><el-radio :label="3">分品名包干结算</el-radio></li>
				    <li><el-radio :label="4">统一分拆结算</el-radio></li>
				    <li><el-radio :label="5">分品牌分拆结算</el-radio></li>
				    <li><el-radio :label="6">综合费率结算</el-radio></li>
				    <li><el-radio :label="7">其他方式结算</el-radio></li>
				</ul>
				</el-radio-group>
			</div>
			<div class="selected-view">
				<!-- 统一包干结算 -->
				<div v-if="needingDatas.conditionType==1">
					<p>统一包干结算 :</p>
					<el-select v-model="needingDatas.beginCalculateType" style="width:100px;" size="small">
						<el-option label="下单后" value="下单后"></el-option>
						<el-option label="到货后" value="到货后"></el-option>
					</el-select>
					<el-input v-model="needingDatas.days" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>日, </span>
					<el-select v-model="needingDatas.priceType" style="width:90px;" size="small">
						<el-option label="现货价" value="现货价"></el-option>
						<el-option label="最新网价" value="最新网价"></el-option>
						<el-option label="首次网价" value="首次网价"></el-option>
						<el-option label="平均网价" value="平均网价"></el-option>
					</el-select>
					<el-select v-model="needingDatas.calculateType" style="width:80px;" size="small">
						<el-option label="上浮" value="上浮"></el-option>
						<el-option label="下浮" value="下浮"></el-option>
					</el-select>
					<el-input v-model="needingDatas.price" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>元/吨</span>
				</div>
				<!-- 分品牌包干结算 -->
				<div v-if="needingDatas.conditionType==2">
					<p>分品牌包干结算 :</p>
					<el-select v-model="needingDatas.beginCalculateType" style="width:100px;" size="small">
							<el-option label="下单后" value="下单后"></el-option>
							<el-option label="到货后" value="到货后"></el-option>
						</el-select>
					<el-input v-model="needingDatas.days" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>日</span>
					<template v-for="(data,index) in needingDatas.childData">
						<br>
						<el-select v-model="data.onemoreBrand" style="width:100px;margin-top:20px;" size="small">
							<el-option v-for="item in brands" :label="item" :value="item" ></el-option>
						</el-select>
						<el-select v-model="data.priceType" style="width:90px;" size="small">
							<el-option label="现货价" value="现货价"></el-option>
							<el-option label="最新网价" value="最新网价"></el-option>
							<el-option label="首次网价" value="首次网价"></el-option>
							<el-option label="平均网价" value="平均网价"></el-option>
						</el-select>
						<el-select v-model="data.calculateType" style="width:80px;" size="small">
							<el-option label="上浮" value="上浮"></el-option>
							<el-option label="下浮" value="下浮"></el-option>
						</el-select>
						<el-input v-model="data.price" type="number" min="0" style="width:55px;" size="small"></el-input>   
						<span>元/吨</span>
						<el-button @click="delBrand(index)" size="small">删除</el-button>
					</template>
					<br><br>
					<el-button @click="addBrands" size="small">新增品牌</el-button>
				</div>
				<!-- 分品名包干结算 -->
				<div v-if="needingDatas.conditionType==3">
					<p>分品名包干结算 :</p>
					<el-select v-model="needingDatas.beginCalculateType" style="width:100px;" size="small">
						<el-option label="下单后" value="下单后"></el-option>
						<el-option label="到货后" value="到货后"></el-option>
					</el-select>
					<el-input v-model="needingDatas.days" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>日,参考网价 </span>
					<br>
					<template v-for="item in needingDatas.cate_spec">
						<label>{{item.name}}</label>
						<el-select v-model="item.calculateType" style="width:100px;" size="small">
							<el-option label="上浮" value="上浮"></el-option>
							<el-option label="下浮" value="下浮"></el-option>
						</el-select>
						<el-input v-model="item.price" type="number" min="0" style="width:55px;" size="small"></el-input>
						<span>元/吨</span>
						<br>
					</template>
				</div>

				<!-- 统一分拆结算 -->
				<div v-if="needingDatas.conditionType==4">
					<p>统一分拆结算 :</p>
					<el-select v-model="needingDatas.beginCalculateType" style="width:100px;" size="small">
							<el-option label="下单后" value="下单后"></el-option>
							<el-option label="到货后" value="到货后"></el-option>
					</el-select>
					<el-input v-model="needingDatas.days" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>日, </span>
					<el-select v-model="needingDatas.priceType" style="width:90px;" size="small">
						<el-option label="现货价" value="现货价"></el-option>
						<el-option label="最新网价" value="最新网价"></el-option>
						<el-option label="首次网价" value="首次网价"></el-option>
						<el-option label="平均网价" value="平均网价"></el-option>
					</el-select>
					<el-select v-model="needingDatas.calculateType" style="width:80px;" size="small">
						<el-option label="上浮" value="上浮"></el-option>
						<el-option label="下浮" value="下浮"></el-option>
					</el-select>
					<el-input v-model="needingDatas.price" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>元/吨</span>
					<br>
					<label>运费:</label>
					<el-input v-model="needingDatas.freight" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>元/吨</span>
					<br>
					<label>过磅费:</label>
					<el-input v-model="needingDatas.ponderation_price" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>元/吨</span>
				</div>

				<!-- 分品牌分拆结算 -->
				<div v-if="needingDatas.conditionType==5">
					<p>分品牌分拆结算 :</p>
					<el-select v-model="needingDatas.beginCalculateType" style="width:100px;" size="small">
							<el-option label="下单后" value="下单后"></el-option>
							<el-option label="到货后" value="到货后"></el-option>
					</el-select>
					<el-input v-model="needingDatas.days" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>日, </span>
					<template v-for="(data,index) in needingDatas.childData">
						<br>
						<el-select v-model="data.onemoreBrand" style="width:100px;margin-top:20px;" size="small">
							<el-option v-for="item in brands" :label="item" :value="item" ></el-option>
						</el-select>
						<el-select v-model="data.priceType" style="width:90px;" size="small">
							<el-option label="现货价" value="现货价"></el-option>
							<el-option label="最新网价" value="最新网价"></el-option>
							<el-option label="首次网价" value="首次网价"></el-option>
							<el-option label="平均网价" value="平均网价"></el-option>
						</el-select>
						<el-select v-model="data.calculateType" style="width:80px;" size="small">
							<el-option label="上浮" value="上浮"></el-option>
							<el-option label="下浮" value="下浮"></el-option>
						</el-select>
						<el-input v-model="data.price" type="number" min="0" style="width:55px;" size="small"></el-input>
						<span>元/吨</span>
						<el-button @click="delBrand(index)" size="small">删除</el-button>
					</template>
					<br><br>
					<el-button @click="addBrands" size="small">新增品牌</el-button>
					<br>
					<label>运费:</label>
					<el-input v-model="needingDatas.freight" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>元/吨</span>
					<br>
					<label>过磅费:</label>
					<el-input v-model="needingDatas.ponderation_price" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>元/吨</span>
				</div>

				<!-- 综合费率结算 -->
				<div v-if="needingDatas.conditionType==6">
					<p>综合费率结算 :</p>
					<el-select v-model="needingDatas.beginCalculateType" style="width:100px;" size="small">
						<el-option label="下单后" value="下单后"></el-option>
						<el-option label="到货后" value="到货后"></el-option>
					</el-select>
					<el-input v-model="needingDatas.days" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>日, </span>
					<el-select v-model="needingDatas.priceType" style="width:90px;" size="small">
						<el-option label="现货价" value="现货价"></el-option>
						<el-option label="最新网价" value="最新网价"></el-option>
						<el-option label="首次网价" value="首次网价"></el-option>
						<el-option label="平均网价" value="平均网价"></el-option>
					</el-select>
					<el-select v-model="needingDatas.calculateType" style="width:80px;" size="small">
						<el-option label="上浮" value="上浮"></el-option>
						<el-option label="下浮" value="下浮"></el-option>
					</el-select>
					<el-input v-model="needingDatas.price" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>元/吨</span>
					<br>
					<label>运费:</label>
					<el-input v-model="needingDatas.freight" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>元/吨</span>
					<br>
					<label>过磅费:</label>
					<el-input v-model="needingDatas.ponderation_price" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>元/吨</span>
					<br>
					<label>吊机费:</label>
					<el-input v-model="needingDatas.crane_price" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>元/吨</span>
					<br>
					<label>资金费率:</label>
					<el-input v-model="needingDatas.funds_price_rate" type="number" min="0" style="width:55px;" size="small"></el-input>
					<span>元/吨</span>
				</div>
				<!-- 其他方式结算 -->
				<div v-if="needingDatas.conditionType==7">
					<p>其他方式结算 :</p>
					<el-input  type="textarea" auto-complete="off" style="width:400px;" placeholder="请输入结算描述" v-model="needingDatas.elsePayWay" autosize></el-input>
				</div>
			</div>
		</div>
		<div style="clear:both;"></div>
	</div>
</template>

<style scoped>
	.needing-select{
		height:100%;
	}
	.needing-select>div{
		float:left;
	}
	.type-select-box{
		width: 26%;
		height:100%;
		padding-right:20px;
		border-right:solid 1px #DEDEDE;
	}
	.type-select-box ul li{
		margin-bottom: 10px;
	}
	.selected-view{
		margin:10px 0px 0px 20px;
	}
	.selected-view>div>p{
		font-weight:700;
	}
	.selected-view label{
		margin-top: 20px;
		width: 60px;
	}
	.el-radio-group{
		width: 130px;
	}
</style>
