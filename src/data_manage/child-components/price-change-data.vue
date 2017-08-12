<script>
	// 暂时无法按需引入 $confirm
	// import { Table, TableColumn, Button, Select, Option } from "element-ui";
	import Vue from "vue";
	import ajaxCustom from '../../components/ajax-custom.js';
	import ElementUI from 'element-ui';
	Vue.use(ElementUI);
	export default{
		// components: {
		// 	elTable : Table,
		// 	elTableColumn : TableColumn,
		// 	elButton : Button,
		// 	elSelect : Select,
		// 	elOption : Option
		// },
		created : function(){
			ajaxCustom.ajaxGet(this,"dingoapi/getNoticeDatas", (responese)=>{
				console.log(responese);
				let tempArr = [];
				for(let data of responese.body.data.noticeDatas){
					tempArr.push({
						id : data.id,
						name : data.brand,
						description : data.cate_spec,
						norms : data.size,
						transport : data.transport_type,
						material : data.material,
						maxNumber : data.maxNumber,
						minNumber : data.minNumber,
						isEdit : false
					});
				}
				this.tableDatas = tempArr;
				this.brandsModel.data = responese.body.data.brandsTreeData.data;
				// this.sourceData = JSON.parse(JSON.stringify(this.tableDatas));
				this.isLoading = false;
			}, (responese)=>{
				console.log(responese);
				alert(responese.body.message);
				this.isLoading = false;
			} );
		},
		data(){
			return {
				tableDatas : [],
				sourceData : {
					id : null,
					name : null,
					description : null,
					norms : null,
					material : null,
					maxNumber : null,
					minNumber : null,
					isEdit : false
				},
				brandsModel : {
					selected : null,
					data : null
				},
				steelTreeModel : {
					data : null,
					selected : {
						steelName : null,
						material : null,
						size : null,
						transport : null,
						maxNum : null,
						minNum : null
					}
				},
				isAbled : false,
				isLoading : true
			}
		},
		methods : {
			toEdit(tableRow){
				this.isAbled = true;
				tableRow.isEdit = true;
				this.sourceData = JSON.parse(JSON.stringify(tableRow));
			},
			deleteData(scope){
				this.$confirm("是否确定删除该行数据 ?", "提示", {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'success'
				}).then(() => {
					this.isLoading = true;
					ajaxCustom.ajaxPost(this,"dingoapi/deleteNoticeDatas", { id : scope.row.id }, (responese)=>{
						console.log(responese);
						this.tableDatas.splice(scope.$index, 1)
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.isLoading = false;
					}, (responese)=>{
						console.log(responese);
						this.isLoading = false;
					} );

				}).catch( (err) => {
					console.log(err);
					// delete callback
				})
			},
			isSaveTable(value, tableRow){
				if(value){
					this.isLoading = true;
					ajaxCustom.ajaxPost(this,"dingoapi/editNoticeDatas", tableRow, (responese)=>{
						console.log(responese);
						if(responese.body.data){
							this.$message({
								message: '修改成功',
								type: 'success'
							});
						}else if(responese.body.data){
							this.$message({
								message: '数据没有变化',
								type: 'warning'
							});
						}
						tableRow.isEdit = false;
						this.isAbled = false;
						this.sourceData = JSON.parse(JSON.stringify(tableRow));
						this.isLoading = false;
					}, (responese)=>{
						alert(responese.body.message);
						console.log(responese);
						this.isLoading = false;
					} );
				}else{
					tableRow.isEdit = false;
					this.isAbled = false;
					tableRow.maxNumber = this.sourceData.maxNumber;
					tableRow.minNumber = this.sourceData.minNumber;
				}
			},
			getSteelStandard(brand){
				ajaxCustom.ajaxGet(this,"dingoapi/allspecs", { params : { data : brand } }, (responese)=>{
					console.log(responese);
					// 规格数据加上表单的数据绑定
					this.steelTreeModel.data = responese.body.data;
					this.steelTreeModel.selected = { steelName : null, material : null, size : null, transport : null}
				}, (responese)=>{
					console.log(responese);
				} );
			},
			newPriceNotice(){
				let newDatas = {
					name : this.brandsModel.selected,
					description : this.steelTreeModel.selected.steelName,
					norms : this.steelTreeModel.selected.size,
					transport : this.steelTreeModel.selected.transport,
					material : this.steelTreeModel.selected.material,
					maxNumber : this.steelTreeModel.selected.maxNum,
					minNumber : this.steelTreeModel.selected.minNum,
					isEdit : false
				}
				let postData = {
					brand : this.brandsModel.selected,
					cate_spec : this.steelTreeModel.selected.steelName,
					size : this.steelTreeModel.selected.size,
					transport_type : this.steelTreeModel.selected.transport,
					material : this.steelTreeModel.selected.material,
					maxNumber : this.steelTreeModel.selected.maxNum,
					minNumber : this.steelTreeModel.selected.minNum,
				}

				this.isLoading = true;
				ajaxCustom.ajaxPost(this,"dingoapi/createPriceNotice", postData, (responese)=>{
					console.log(responese);
					if(parseInt(responese.body.data)){
						this.$message({
							message: '添加成功',
							type: 'success'
						});
						newDatas.id = responese.body;
						this.tableDatas.push(newDatas);
					}else{
						this.$message({
							message: '操作可能失败',
							type: 'warning'
						});
					}
					this.isLoading = false;
				}, (responese)=>{
					alert(responese.body.message);
					console.log(responese);
					this.isLoading = false;
				} );

			}
		}
	}
</script>

<template>
	<div class="main-warpper">
		<h1>风险提示设置</h1>
		<h4>浮动范围挺行数据</h4>
		<br/><br/>
		<div>
			<el-select size="small" placeholder="选择品牌" v-model="brandsModel.selected" @change="getSteelStandard">
				<el-option v-for="item in brandsModel.data" :label="item" :value="item" ></el-option>
			</el-select>

			<el-select size="small" placeholder="选择品名" v-model="steelTreeModel.selected.steelName">
				<el-option v-for="item in steelTreeModel.data" :label="item.name" :value="item.name"></el-option>
			</el-select>

			<el-select size="small" placeholder="选择材质" v-model="steelTreeModel.selected.material">
				<template v-for="data in steelTreeModel.data" v-if="data.name == steelTreeModel.selected.steelName">
					<el-option v-for="material in data.material" :label="material.name" :value="material.name" ></el-option>
				</template>
			</el-select>

			<el-select size="small" placeholder="选择规格" v-model="steelTreeModel.selected.size">
				<template v-for="data in steelTreeModel.data" v-if="data.name == steelTreeModel.selected.steelName">
					<template v-for="material in data.material" v-if="material.name == steelTreeModel.selected.material">
						<el-option v-for="size in material.size" :label="size.name" :value="size.name" ></el-option>
					</template>
				</template>
			</el-select>

			<el-select size="small" placeholder="选择运输方式" v-model="steelTreeModel.selected.transport" >
				<el-option label="广州仓发货" :value="1" ></el-option>
				<el-option label="钢厂直送" :value="2" ></el-option>
			</el-select>

			<el-input size="small" placeholder="最大上浮" style="width:100px;" v-model="steelTreeModel.selected.maxNum"></el-input>
			<el-input size="small" placeholder="最大下浮" style="width:100px;" v-model="steelTreeModel.selected.minNum"></el-input>
			<el-button size="small" type="success" @click="newPriceNotice()">新增一条</el-button>
		</div>
		<hr />
		<el-table :data="tableDatas" v-loading.body="isLoading" style="width: 100%" border>
			<el-table-column prop="name" label="钢厂/产地"></el-table-column>
			<el-table-column prop="description" label="品名"></el-table-column>
			<el-table-column label="材质" prop="material" ></el-table-column>
			<el-table-column label="规格" prop="norms" ></el-table-column>
			<el-table-column label="运输方式" prop="transport" >
				<template scope="scope">{{ scope.row.transport == 1 ? "广州仓发货" : "钢厂直送" }}</template>
			</el-table-column>
			<el-table-column label="最大上浮" prop="maxNumber" >
				<template scope="scope">
					<template v-if="scope.row.isEdit">
						<el-input size="small" v-model="scope.row.maxNumber"></el-input>
					</template>
					<template v-else>
						{{ scope.row.maxNumber }}
					</template>
				</template>
			</el-table-column>
			<el-table-column label="最大下浮" prop="minNumber" >
				<template scope="scope">
					<template v-if="scope.row.isEdit">
						<el-input size="small" v-model="scope.row.minNumber"></el-input>
					</template>
					<template v-else>
						{{ scope.row.minNumber }}
					</template>
				</template>
			</el-table-column>
			<el-table-column label="操作">
				<template scope="scope">
					<template v-if="!scope.row.isEdit">
						<el-button size="small" :disabled="isAbled" @click="toEdit(scope.row)">编辑</el-button>
						<el-button size="small" :disabled="isAbled" type="danger" @click="deleteData(scope)">删除</el-button>
					</template>
					<template v-else>
						<el-button size="small" type="primary" @click="isSaveTable(true, scope.row)">保存</el-button>
						<el-button size="small" @click="isSaveTable(false, scope.row)">取消</el-button>
					</template>
				</template>
			</el-table-column>
		</el-table>
	</div>

</template>

<style scoped>
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
	hr{
		margin:30px 0px 50px 0px;
		border: none;
		border-top:solid 1px #DEDEDE;
	}
</style>
