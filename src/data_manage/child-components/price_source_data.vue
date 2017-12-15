<script>
	import ajaxCustom from '../../components/ajax-custom.js';
	import headerbar from '../../components/admin-headerbar.vue';
	import{ Button, Dialog, Form, FormItem, Select, Option, Input } from 'element-ui';
	export default{
		created() {
			this.getPriceSourceData();
		},
		components : {
			headerbar,
			elButton : Button,
			elDialog : Dialog,
			elForm : Form,
			elFormItem : FormItem,
			elSelect : Select,
			elOption : Option,
			elInput : Input,
		},
		data(){
			return {
				priceSourcetData : [],
				isEdit : -1,
				tempChangingData : {},
				dialogFormVisible : false,
				newPriceSource : {
					name : '',
					company_type : '',
					short_name : ''
				},
			}
		},
		methods : {
			getPriceSourceData(){
				ajaxCustom.ajaxGet(this, 'dingoapi/getAllPriceSource', (response)=>{
					console.log(response);
					this.priceSourcetData = response.body.data_price_sources;
				},(response)=>{
					console.log(response);
				});
			},
			editPriceSource(index){
				this.isEdit = index;
				this.tempChangingData = JSON.parse(JSON.stringify(this.priceSourcetData[index]));
			},
			delPriceSource(index, id){
				var dataId = id;
				var _this = this;
				ajaxCustom.ajaxPost(this,'dingoapi/delPriceSourceName', { id : dataId }, (responese)=>{
					console.log(responese);
					if(responese.status == 200){
						window.location.reload();
					}
				},(responese)=>{
					alert(responese.body.message);
				} );
			},
			saveChanging(index){
				ajaxCustom.ajaxPost(this,'dingoapi/editPriceSourceName', this.tempChangingData, (responese)=>{
					console.log(responese);
					if(responese.status == 200){
						window.location.reload();
					}
				},(responese)=>{
					alert(responese.body.message);
					console.log(responese);
				} );

			},
			cancelChanging(){
				this.isEdit = -1;
			},
			newOnePriceSource(data){
				ajaxCustom.ajaxPost(this, 'dingoapi/addPricSourceName', { data : data }, (response)=>{
					console.log(response);
				}, (response)=>{
					console.log(response);
				});
			},
		},
	}
</script>
<template>
	<headerbar active_number="5-5" :text="['供应商','查看/编辑供应商简称']">
		<div style="background-color: #fff;padding: 15px;margin-bottom: 30px;">
			<table width="100%" cellspacing="0" cellpadding="0">
				<thead>
					<tr>
						<th>供应商</th>
						<th>供应商类型</th>
						<th>供应商简称</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(data, index) of priceSourcetData">
						<template v-if="isEdit!=index">
							<td>{{ data.name }}</td>
							<td>{{ data.company_type }}</td>
							<td>{{ data.short_name }}</td>
							<td>
								<el-button size="small" @click="editPriceSource(index)">修改</el-button>
								<el-button size="small" type="danger" @click="delPriceSource(index, data.id)">删除</el-button>
							</td>
						</template>
						<template v-else>
							<td>{{ tempChangingData.name }}</td>
							<td>{{ tempChangingData.company_type }}</td>
							<td> <el-input size="small" v-model="tempChangingData.short_name"></el-input> </td>
							<td>
								<el-button size="small" type="info" @click="saveChanging(index)">保存</el-button>
								<el-button size="small" @click="cancelChanging()">取消</el-button>
							</td>
						</template>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- 新增供应商弹出框 -->
		<el-dialog title="新增供应商" :visible.sync="dialogFormVisible">
			<el-form :model="newPriceSource" label-width="150" >
				<el-form-item label="供应商名称">
					<el-input v-model="newPriceSource.name" auto-complete="off"  style="width: 200px;display: inline-block;"></el-input>
				</el-form-item>
				<el-form-item label="供应商类型">
					<el-select v-model="newPriceSource.company_type" style="width: 200px;">
						<el-option label="厂家" value="厂家"></el-option>
						<el-option label="供应商" value="供应商"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="供应商简称" >
					<el-input v-model="newPriceSource.short_name" auto-complete="off" style="width: 200px;display: inline-block;"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogFormVisible = false">取 消</el-button>
				<el-button type="primary" @click="newOnePriceSource(newPriceSource)">确 定</el-button>
			</div>
		</el-dialog>
	</headerbar>
</template>
<style scoped>
	h1,h4{
		font-weight:400;
	}
	h4{
		color:#8492A6;
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
