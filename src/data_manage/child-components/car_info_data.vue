<script>
    import _ from 'lodash';
    import headerbar from '../../components/admin-headerbar.vue';
    import ajaxCustom from '../../components/ajax-custom.js';
    import { Button, Input, Form, FormItem } from 'element-ui';
	export default{
		components : {
			headerbar,
			elButton : Button,
            elInput : Input,
            elForm : Form,
            elFormItem : FormItem
		},
		created(){
			this.getCarInfo();
		},
		data(){
			return {
				carInfoData : [],
				isEdit : -1,
				keyword : null,
				tempCarInfoDetail : {},
				dialogFormVisible : false,
				newCarInfoDetail : {
					car_source : '',
					plate_number : '',
					driver : '',
					driver_idcard_num : '',
					driver_tel : '',
					remarks : ''
				},
				currentcarInfoData : [],
			}
		},
		methods : {
			// 获取物流信息
			getCarInfo(){
				ajaxCustom.ajaxGet(this, 'dingoapi/getCarInfo', (response)=>{
					console.log(response);
					if(response.body.data.length){
						this.carInfoData = response.body.data;
						this.currentcarInfoData = this.carInfoData.reverse();
					}
				}, (response)=>{
					alert(response.body.message);
				});
			},
			// 新增一条物流信息
			newOneCarInfo(data){
				ajaxCustom.ajaxPost(this, 'dingoapi/addCarInfo', this.newCarInfoDetail, (response)=>{
					console.log(response);
					alert(response.body.message);
					this.carInfoData = response.body.data;
					this.currentcarInfoData = this.carInfoData.reverse();
					this.dialogFormVisible = false;
				}, (response)=>{
					console.log(response);
				});
			},
			// 修改
			editCarInfo(index){
				this.isEdit = index;
				this.tempCarInfoDetail = JSON.parse(JSON.stringify(this.currentcarInfoData[index]));
			},
			// 删除物流信息
			delCarInfo(index, id){
				var dataId = id;
				var _this = this;
				ajaxCustom.ajaxPost(this,'dingoapi/deleteCarInfo', {id : dataId}, (responese)=>{
					console.log(responese);
					if(responese.body.status_code ==200){
						alert(responese.body.message);
						_this.currentcarInfoData.splice(index, 1);
					}else{
						alert(responese.body.message);
					}

				},(responese)=>{
					alert(responese.body.message);
				} );
			},
			// 保存修改
			saveChanging(index){
				delete this.tempCarInfoDetail.created_at;
				delete this.tempCarInfoDetail.updated_at;
				ajaxCustom.ajaxPost(this,'dingoapi/editCarInfo', this.tempCarInfoDetail, (responese)=>{
					console.log(responese);
					if(responese.body.status_code == 200){
						this.currentcarInfoData[index] = this.tempCarInfoDetail;
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
			// 取消修改
			cancelChanging(){
				this.isEdit = -1;
			},
			// 搜索功能
			handleIconClick() {
                this.currentcarInfoData = _.filter(this.carInfoData, (val)=>{
                    return (
                        val.plate_number.includes(this.keyword) ||
						val.driver.includes(this.keyword) ||
						val.driver_tel.includes(this.keyword)
                    );
                });
			},
		}
	}

</script>

<template>
	<headerbar active_number="5-7" :text="['物流司机数据','查看/编辑物流司机数据']">
		<div>
			<div style="background-color: #fff;padding: 15px;">
				<el-button @click="dialogFormVisible=true" type="primary">新建</el-button>
				<el-input class="leftBox"  style="float:right;"  placeholder="搜索" v-model="keyword" icon="search" @change="handleIconClick"></el-input>
			</div>
			<table width="100%" >
				<thead>
					<tr>
						<th>所属物流公司</th>
						<th>车牌号</th>
						<th>司机姓名</th>
						<th>身份证</th>
						<th>联系电话</th>
						<th>备注</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(data, index) of currentcarInfoData">
						<template v-if="isEdit!=index">
							<td>{{ data.car_source }}</td>
							<td>{{ data.plate_number }}</td>
							<td>{{ data.driver }}</td>
							<td>{{ data.driver_idcard_num }}</td>
							<td>{{ data.driver_tel }}</td>
							<td>{{ data.remarks }}</td>
							<td>
								<el-button size="small" @click="editCarInfo(index)">修改</el-button>
								<el-button size="small" type="danger" @click="delCarInfo(index, data.id)">删除</el-button>
							</td>
						</template>
						<template v-else>
							<td><el-input size="small" v-model="tempCarInfoDetail.car_source"></el-input> </td>
							<td><el-input size="small" v-model="tempCarInfoDetail.plate_number"></el-input> </td>
							<td><el-input size="small" v-model="tempCarInfoDetail.driver"></el-input> </td>
							<td><el-input size="small" v-model="tempCarInfoDetail.driver_idcard_num" style="width: 180px;"></el-input> </td>
							<td><el-input size="small" v-model="tempCarInfoDetail.driver_tel"></el-input> </td>
							<td><el-input size="small" v-model="tempCarInfoDetail.remarks"></el-input> </td>
							<td>
								<el-button size="small" type="info" @click="saveChanging(index)">保存</el-button>
								<el-button size="small" @click="cancelChanging()">取消</el-button>
							</td>
						</template>
					</tr>
				</tbody>
			</table>

			<!-- 新增品牌详情弹出框 -->
			<el-dialog title="新增物流司机数据" v-model="dialogFormVisible" style="text-align: center;">
				<el-form :model="newCarInfoDetail" label-width="100px" label-position="right" inline>
					<el-form-item label="所属物流公司:">
						<el-input v-model="newCarInfoDetail.car_source" auto-complete="off"  ></el-input>
					</el-form-item>
					<el-form-item label="车牌号:">
						<el-input v-model="newCarInfoDetail.plate_number" auto-complete="off"  ></el-input>
					</el-form-item>
					<el-form-item label="司机姓名:" >
						<el-input v-model="newCarInfoDetail.driver" auto-complete="off" ></el-input>
					</el-form-item>
					<el-form-item label="身份证:" >
						<el-input v-model="newCarInfoDetail.driver_idcard_num" auto-complete="off" :maxlength="18" :minlength="18"></el-input>
					</el-form-item>
					<el-form-item label="联系电话:" >
						<el-input v-model="newCarInfoDetail.driver_tel" auto-complete="off" :maxlength="11" :minlength="11"></el-input>
					</el-form-item>
					<el-form-item label="备注:" >
						<el-input v-model="newCarInfoDetail.remarks" auto-complete="off" ></el-input>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click="dialogFormVisible = false">取 消</el-button>
					<el-button type="primary" @click="newOneCarInfo(newCarInfoDetail)">确 定</el-button>
				</div>
			</el-dialog>
		</div>
	</headerbar>
</template>

<style scoped>
	.leftBox{
		display:inline-block;
		float:left;
		width:25%;
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
