<script>
	import headerbar from '../../components/admin-headerbar.vue';
	import jsonData from "../../../res/json/provinceList.json";
	import ajaxCustom from '../../components/ajax-custom.js';
	export default{
		components : {
			headerbar,
		},
		mounted : function(){
			var _this = this;
			for(let _province of jsonData.province){
				if(_province.name === "广东"){
					_this.jsonAddress = _province;
				}
			}
			ajaxCustom.ajaxGet(this,"dingoapi/getAllbrands", (responese)=>{
				// console.log(responese.body.data);
				this.brandsList = responese.body.data;
			},(responese)=>{
				console.log(responese);
			} );
		},
		data(){
			return {
				jsonAddress : [],
				handleView: "1",
				selectedCity: "",
				selectedArea : "",
				brandsList:[],
				address : "",
				brands:"",
				companyTransport : {
					type : 1,
					origin : {
						city : "",
						area : "",
						address : ""
					},
					destination : {
						city : "",
						area : "",
						address : ""
					},
					brand : "",
					transport_price : "",
					transport_count : "",
					transport_car_price : "",
					remarks : ""
				},
				factoryTransport : {
					type : 2,
					destination : {
						city : "",
						area : "",
						address : ""
					},
					brand : "",
					size : "",
					transport_price : "",
					transport_count : "",
					transport_car_price : "",
					remarks : ""
				},
				sizeList : [6,6.5,8,10,12,14,16,18,20,22,25,28,32,36,40]
			}
		},
		methods : {
			chooseCity(){
				this.address=this.selectedCity;
				return true;
			},
			postCompanyTransport(){
				ajaxCustom.ajaxPost(this,'dingoapi/createFreightPrice', this.companyTransport, (responese)=>{
					console.log(responese);
					if(responese.body.status_code == 200){
						alert(responese.body.message);
						//提交成功重置数据
						// for(let data in this.companyTransport){
						// 	this.companyTransport[data] = "";
						// }
						// this.companyTransport.type = 1;
					}else{
						alert(responese.body.message);
					}
				},(responese)=>{
					alert(responese.body.message);
					console.log(responese);
				});
			},
			factoryCompanyTransport(){
				ajaxCustom.ajaxPost(this,'dingoapi/createFreightPrice', this.factoryTransport, (responese)=>{
					console.log(responese);
					if(responese.body.status_code == 200){
						alert(responese.body.message);
						// //提交成功重置数据
						// for(let data in this.factoryTransport){
						// 	if(data == "size"){
						// 		this.factoryTransport[data] = [];
						// 	}else{
						// 		this.factoryTransport[data] = "";
						// 	}
						// }
						// this.factoryTransport.type = 2;
					}else{
						alert(responese.body.message);
					}
				},(responese)=>{
					alert(responese.body.message);
					console.log(responese);
				});
			},
			selectedAll(){
				this.factoryTransport.size = JSON.parse(JSON.stringify(this.sizeList));
			}
		},
		// 选择City时初始化Area数据
		watch : {
			"companyTransport.destination.city" : {
				handler : function(newVal, oldVal){
					if(newVal && oldVal){
						this.companyTransport.destination.area = "";
					}
                },
                deep:true
			},
			"companyTransport.origin.city" : {
				handler : function(newVal, oldVal){
					if(newVal && oldVal){
						this.companyTransport.origin.area = "";
					}
                },
                deep:true
			},
			"factoryTransport.destination.city" : {
				handler : function(newVal, oldVal){
					if(newVal && oldVal){
						this.factoryTransport.destination.area = "";
					}
                },
                deep:true
			}
		}
	}
</script>

<template>
	<headerbar active_number="5-2" :text="['运费数据','添加新的运费数据记录']">
		<div class="white_style">
		 	<el-radio class="radio" v-model="handleView" label='1' >物流承运</el-radio>
			<el-radio class="radio" v-model="handleView" label='2' >钢厂直送</el-radio>
			<div style="margin-top: 10px;">
				<div v-show="handleView==1">
					<el-popover
					ref="popover3"
					placement="right"
					width="400"
					trigger="click">
						<div class="popov">
							<div>
								<h5 >{{ jsonAddress.name }}</h5>
								<el-radio  v-for="item in jsonAddress.cityList" class="radio" v-model="companyTransport.origin.city" :label="item.name" v-if="chooseCity()">
								  	{{item.name}}
								</el-radio>
								<div v-show="companyTransport.origin.city">
									<template v-for="city in jsonAddress.cityList" v-if="companyTransport.origin.city==city.name">
										<h5>地区</h5>
										<el-radio  v-for="item in city.areaList" class="radio" v-model="companyTransport.origin.area" :label="item" v-if="chooseCity()">
										  	{{item}}
										</el-radio>
										<h5>没有此地区? 手动输入:</h5>
										<el-input v-model="companyTransport.origin.area" size="small" style="width:50%;"></el-input>
									</template>

								</div>
							</div>
						</div>
					</el-popover>
					<el-popover
					ref="popover4"
					placement="right"
					width="400"
					trigger="click">
						<div class="popov">
							<div>
								<h5 >{{ jsonAddress.name }}</h5>
								<el-radio  v-for="item in jsonAddress.cityList" class="radio" v-model="companyTransport.destination.city" :label="item.name" v-if="chooseCity()">
								  	{{item.name}}
								</el-radio>
								<div v-show="companyTransport.destination.city">
									<template v-for="city in jsonAddress.cityList" v-if="companyTransport.destination.city==city.name">
										<h5>地区</h5>
										<el-radio  v-for="item in city.areaList" class="radio" v-model="companyTransport.destination.area" :label="item" v-if="chooseCity()">
										  	{{item}}
										</el-radio>
										<h5>没有此地区? 手动输入:</h5>
										<el-input v-model="companyTransport.destination.area" size="small" style="width:50%;"></el-input>
									</template>

								</div>
							</div>
						</div>
					</el-popover>
					<el-form label-width="80px">
						<el-form-item label="始发地：">
							<el-input :value="companyTransport.origin.city+' '+companyTransport.origin.area" v-popover:popover3></el-input>
							<br/>
							<el-input placeholder="详细地址" v-model="companyTransport.origin.address"></el-input>
							<br>
						</el-form-item >
						<el-form-item label="送到：">
							<el-input :value="companyTransport.destination.city+' '+companyTransport.destination.area" v-popover:popover4></el-input>
							<br/>
							<el-input placeholder="详细地址" v-model="companyTransport.destination.address"></el-input>
							<br>
						</el-form-item >
						<el-form-item label="运费：">
							<el-input v-model="companyTransport.transport_price"></el-input>
							<span>元/吨</span>
							<br>
						</el-form-item >
						<el-form-item label="包车费：">
							<el-input type="number" v-model="companyTransport.transport_car_price"></el-input>
							<span>元/车</span>
							<br>
						</el-form-item>
						<el-form-item label="限载量：" >
							<el-input v-model="companyTransport.transport_count"></el-input>
							<span>吨</span>
							<br>
						</el-form-item>
						<el-form-item label="备注：" >
							<el-input v-model="companyTransport.remarks"></el-input>
							<el-button type="primary" @click="postCompanyTransport()">新增</el-button>
						</el-form-item>
					</el-form>
				</div>
				<div v-show="handleView!=1">
					<el-popover
					ref="popover5"
					placement="right"
					width="400"
					trigger="click">
						<div class="popov">
							<div>
								<h5 >{{ jsonAddress.name }}</h5>
								<el-radio  v-for="item in jsonAddress.cityList" class="radio" v-model="factoryTransport.destination.city" :label="item.name" v-if="chooseCity()">
								  	{{item.name}}
								</el-radio>
								<div v-show="factoryTransport.destination.city">
									<template v-for="city in jsonAddress.cityList" v-if="factoryTransport.destination.city==city.name">
										<h5>地区</h5>
										<el-radio  v-for="item in city.areaList" class="radio" v-model="factoryTransport.destination.area" :label="item" v-if="chooseCity()">
										  	{{item}}
										</el-radio>
										<h5>没有此地区? 手动输入:</h5>
										<el-input v-model="factoryTransport.destination.area" size="small" style="width:50%;"></el-input>
									</template>

								</div>
							</div>
						</div>
					</el-popover>
					<el-form label-width="80px">
						<el-form-item label="品牌：" >
							<el-select  v-model="factoryTransport.brand">
								<el-option v-for="item in brandsList" :label="item" :value="item"></el-option>
							</el-select>
							<br>
						</el-form-item>
						<el-form-item label="规格：" >
							<el-select  v-model="factoryTransport.size" multiple>
								<el-option v-for="item in sizeList" :label="item" :value="item"></el-option>
							</el-select>
							<el-button size="small" type="default" @click="selectedAll()">全选</el-button>
							<br>
						</el-form-item>
						<el-form-item label="送到：">
							<el-input :value="factoryTransport.destination.city+' '+factoryTransport.destination.area" v-popover:popover5></el-input>
							<br/>
							<el-input placeholder="详细地址" v-model="factoryTransport.destination.address"></el-input>
							<br/>
						</el-form-item>
						<el-form-item label="运费：" >
							<el-input type="number" v-model="factoryTransport.transport_price"></el-input>
							<span>元/吨</span>
							<br>
						</el-form-item>
						<el-form-item label="限载量：" >
							<el-input v-model="factoryTransport.transport_count"></el-input>
							<span>吨</span>
							<br>
						</el-form-item>
						<el-form-item label="备注："  >
							<el-input v-model="factoryTransport.remarks"></el-input>
							<el-button type="primary" @click="factoryCompanyTransport()">新增</el-button>
						</el-form-item>
					</el-form>
				</div>
			</div>
		</div>
	</headerbar>
</template>

<style scoped>
	.popov{
		height: 400px;
		overflow: scroll
	}
	h1,h4{
		font-weight:400;
	}
	h4{
		color:#8492A6;
	}
	.el-input{
		width:18%;
	}
	.el-select{
		width: 18%;
	}
	.white_style{
		background-color: #fff;
		padding: 15px;
	}
</style>

<style>
	html body .el-radio+.el-radio{
		margin-left:15px;
	}
	.el-radio, .el-radio__inner, .el-radio__input{
	    display: inline-block;
	}
</style>
