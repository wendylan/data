<script>
import headerbar from '../../components/admin-headerbar.vue';
import jsonData from "../../../res/json/provinceList.json";
import ajaxCustom from '../../components/ajax-custom.js';
	export default{
		components : {
			headerbar,
		},
		created : function(){
			this.initJsonData(jsonData);
			ajaxCustom.ajaxGet(this,'dingoapi/getFreightPrice', (responese)=>{
				console.log(responese)
				this.transportData = responese.body.data;
				this.isLoading = false;
			},(responese)=>{
				console.log(responese)
				this.isLoading = false;
			});
		},
		data(){
			return {
				transportData : "",
				tempChangingData : "",
				JsonCityList : "",
				isEdit : -1,
				isLoading : true,
				changeType : 1,
				sizeList : ["6","6.5","8","10","12","14","16","18","20","22","25","28","32","36","40"]
			}
		},
		methods : {
			initJsonData : function(jsonData){
				for(let data of jsonData.province){
					if(data.name == "广东"){
						this.JsonCityList = data.cityList;
					}
				}
			},
			editCompanyTransport : function(index){
				console.log(this.transportData[index]);
				this.isEdit = index;
				this.tempChangingData = JSON.parse(JSON.stringify(this.transportData[index]));
				this.tempChangingData.size = JSON.parse(this.transportData[index].size);
				console.log(JSON.parse(JSON.stringify(this.transportData[index])))
			},
			delCompanyTransport : function(index, id){
				var dataId = id;
				var _this = this;
				ajaxCustom.ajaxPost(this,'dingoapi/delFreightPrice', {id : dataId}, (responese)=>{
					console.log(responese);
					if(responese.body.status_code ==200){
						alert(responese.body.message);
						_this.transportData.splice(index, 1);
					}else{
						alert(responese.body.message);
					}

				},(responese)=>{
					alert(responese.body.message);
					console.log(responese);
				} );
			},
			saveChanging(index){
				delete this.tempChangingData.created_at;
				delete this.tempChangingData.updated_at;
				ajaxCustom.ajaxPost(this,'dingoapi/editFreightPrice', this.tempChangingData, (responese)=>{
					console.log(responese);
					if(responese.body.status_code == 200){
						this.transportData[index] = this.tempChangingData;
						this.isEdit = -1;
						alert(responese.body.message);
					}else{
						alert(responese.body.message);
					}

				},(responese)=>{
					alert(responese.body.message);
					console.log(responese);
				} );

			},
			cancelChanging(){
				this.isEdit = -1;
			}
		}
	}

</script>

<template>
	<headerbar active_number="5-2" :text="['运费数据','查看/编辑运费数据']">
		<div class="white_style">
			<router-link tag="div" to="/create_freight_data">
				<el-button style="float:right;margin-top: -8px;" type="primary">新增数据</el-button>
			</router-link>

			<el-radio class="radio" v-model="changeType" :label="1">物流承运</el-radio>
			<el-radio class="radio" v-model="changeType" :label="2">钢厂直送</el-radio>
		</div>
		<div class="white_style">
			<template v-if="changeType==1">
				<table width="100%" cellspacing="0" cellpadding="0" v-loading="isLoading">
					<thead>
						<tr>
							<th>始发地</th>
							<th>运送到</th>
							<th>运费(元/吨)</th>
							<th>限载量(吨)</th>
							<th>包车费(元)</th>
							<th>备注</th>
							<th>操作</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(data, index) of transportData" v-if="data.type==1">
							<template v-if="isEdit!=index">
								<td>{{ data.origin_city + ' ' + data.origin_area + ' ' + data.origin_address}}</td>
								<td>{{ data.city + ' ' + data.area + ' ' + data.address}}</td>
								<td>{{ data.transport_price }}</td>
								<td>{{ data.transport_count }}</td>
								<td>{{ data.transport_car_price }}</td>
								<td>{{ data.remarks }}</td>
								<td>
									<el-button size="small" @click="editCompanyTransport(index)">修改</el-button>
									<el-button size="small" type="danger" @click="delCompanyTransport(index, data.id)">删除</el-button>
								</td>
							</template>
							<template v-else>
								<td>
									<el-select size="small" v-model="tempChangingData.origin_city">
										<el-option v-for="city in JsonCityList" :label="city.name" :value="city.name" ></el-option>
									</el-select>
									<el-select size="small" v-model="tempChangingData.origin_area">
										<template v-for="city in JsonCityList" v-if="city.name==tempChangingData.origin_city">
												<el-option v-for="area in city.areaList" :label="area" :value="area" ></el-option>
										</template>
									</el-select>
									<br/>
									<el-input size="small" v-model="tempChangingData.origin_address" style="width:150px;"></el-input>
								</td>
								<td>
									<el-select size="small" v-model="tempChangingData.city">
										<el-option v-for="city in JsonCityList" :label="city.name" :value="city.name" ></el-option>
									</el-select>
									<el-select size="small" v-model="tempChangingData.area">
										<template v-for="city in JsonCityList" v-if="city.name==tempChangingData.city">
												<el-option v-for="area in city.areaList" :label="area" :value="area" ></el-option>
										</template>
									</el-select>
									<br/>
									<el-input size="small" v-model="tempChangingData.address" style="width:150px;"></el-input>
								</td>
								<td> <el-input size="small" v-model="tempChangingData.transport_price"></el-input> </td>
								<td> <el-input size="small" v-model="tempChangingData.transport_count"></el-input> </td>
								<td> <el-input size="small" v-model="tempChangingData.transport_car_price"></el-input> </td>
								<td> <el-input size="small" v-model="tempChangingData.remarks"></el-input> </td>
								<td>
									<el-button size="small" type="info" @click="saveChanging(index)">保存</el-button>
									<el-button size="small" @click="cancelChanging()">取消</el-button>
								</td>
							</template>
						</tr>
					</tbody>
				</table>
			</template>
			<template v-else>
				<table width="100%" cellspacing="0" cellpadding="0" v-loading="isLoading">
					<thead>
						<tr>
							<th>品牌</th>
							<th>运送到</th>
							<th>规格</th>
							<th>运费(元/吨)</th>
							<th>限载量(吨)</th>
							<th>备注</th>
							<th>操作</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(data, index) of transportData" v-if="data.type==2">
							<template v-if="isEdit!=index">
								<td>{{ data.brand }}</td>
								<td>{{ data.city + ' ' + data.area + ' ' + data.address }}</td>
								<td>{{ data.size }}</td>
								<td>{{ data.transport_price }}</td>
								<td>{{ data.transport_count }}</td>
								<td>{{ data.remarks }}</td>
								<td>
									<el-button size="small" @click="editCompanyTransport(index)">修改</el-button>
									<el-button size="small" type="danger" @click="delCompanyTransport(index, data.id)">删除</el-button>
								</td>
							</template>
							<template v-else>
								<td>
									<el-input v-model="tempChangingData.brand"></el-input>
								</td>
								<td>
									<el-select size="small" v-model="tempChangingData.city">
										<el-option v-for="city in JsonCityList" :label="city.name" :value="city.name" ></el-option>
									</el-select>
									<el-select size="small" v-model="tempChangingData.area">
										<template v-for="city in JsonCityList" v-if="city.name==tempChangingData.city">
												<el-option v-for="area in city.areaList" :label="area" :value="area" ></el-option>
										</template>
									</el-select>
									<el-input size="small" v-model="tempChangingData.address"></el-input>
								</td>
								<td>
									<el-select size="small" v-model="tempChangingData.size" multiple>
										<el-option v-for="data in sizeList" :label="data" :value="data" ></el-option>
									</el-select>
								</td>
								<td> <el-input size="small" v-model="tempChangingData.transport_price"></el-input> </td>
								<td> <el-input size="small" v-model="tempChangingData.transport_count"></el-input> </td>
								<td> <el-input size="small" v-model="tempChangingData.remarks"></el-input> </td>
								<td width="150px">
									<el-button size="small" type="info" @click="saveChanging(index)">保存</el-button>
									<el-button size="small" @click="cancelChanging(index)">取消</el-button>
								</td>
							</template>
						</tr>
					</tbody>
				</table>
			</template>
		</div>
	</headerbar>
</template>

<style scoped>
	h1,h4{
		font-weight:400;
	}
	h4{
		color:#8492A6;
	}
	.el-select{
		width : 85px;
	}
	.white_style{
		background-color: #fff;
		padding: 15px;
		margin-bottom: 20px;
	}
	table{
		border :solid 1px #DEDEDE;
		font-size:14px;
	}
	table thead{
		background-color:#e0e6ed;
	}
	table tbody tr:hover{
		background-color:#e0e6ed;
	}
	table tr td{
		padding:5px;
		text-align:center;
		border-top :solid 1px #DEDEDE;
	}
	table tr th{
		padding:8px;
		text-align:center;
		border-bottom :solid 1px #DEDEDE;
	}
</style>
