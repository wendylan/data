<script>
	// 暂时无法按需引入 $confirm
	// import { Table, TableColumn, Button, Select, Option } from "element-ui";
	import ajaxCustom from '../../components/ajax-custom.js';
	import Vue from "vue";
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
			this.sourceData = JSON.parse(JSON.stringify(this.tableDatas));
		},
		data(){
			return {
				tableDatas : [
					{
						name : "广钢",
						description : "高线",
						norms : "Ф8",
						material : "HPB300",
						sendMethod : "钢厂直送",
						isEdit : false
					},
					{
						name : "广钢",
						description : "高线",
						norms : "Ф11",
						material : "HPB300",
						sendMethod : "钢厂直送",
						isEdit : false
					}
				],
				sourceData : [],
				optionsModel : {
					standard : {
						selected : null,
						options : [
							{ label : "HPB300", value : "HPB300" },
							{ label : "HPB300E", value : "HPB300E" }
						]
					},
					material  : {
						selected : null,
						options : [
							{ label : "Ф6", value : "Ф6" },
							{ label : "Ф8", value : "Ф8" },
							{ label : "Ф10", value : "Ф10" }
						]
					},
					transport : {
						selected : null,
						options : [
							{ label : "自提", value : "自提" },
							{ label : "直送", value : "直送" }
						]
					}
				}
			}
		},
		methods : {
			toEdit(index){
				this.tableDatas[index].isEdit = true;
			},
			deleteData(index){
				this.$confirm("是否确定删除该行数据 ?", "提示", {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				},() => {
					this.tableDatas.splice(index, 1)
					this.$notify({
						title: '成功',
						message: '删除成功',
						type: 'success'
					});
				}).catch( () => {
					// delete callback 
				})
			},
			isSaveTable(value, index){
				if(value){
					this.tableDatas[index].isEdit = false;
					this.sourceData = JSON.parse(JSON.stringify(this.tableDatas));
				}else{
					this.tableDatas[index].isEdit = false;
					this.tableDatas = JSON.parse(JSON.stringify(this.sourceData));
				}
			}
		}
	}
</script>

<template>
	<div class="main-warpper">
		<h1>品牌数据</h1>
		<h4>查看/编辑品牌数据</h4>
		<br/><br/>
		<el-table :data="tableDatas" style="width: 100%" border>
			<el-table-column prop="name" label="钢厂/产地"></el-table-column>
			<el-table-column prop="description" label="品名"></el-table-column>
			<el-table-column label="规格" inline-template :context="_self">
				<template>
					<span v-if="!tableDatas[$index].isEdit">{{ tableDatas[$index].material }}</span>
					<el-select v-model="tableDatas[$index].material" size="small" v-else>
						<el-option v-for="option in optionsModel.standard.options" :value="option.value" :label="option.label" ></el-option>
					</el-select>
				</template>
			</el-table-column>
			<el-table-column label="材质" inline-template :context="_self">
				<template>
					<span v-if="!tableDatas[$index].isEdit">{{ tableDatas[$index].norms }}</span>
					<el-select v-model="tableDatas[$index].norms" size="small" v-else>
						<el-option v-for="option in optionsModel.material.options" :value="option.value" :label="option.label"></el-option>
					</el-select>
				</template>
			</el-table-column>
			<el-table-column label="发货方式" inline-template :context="_self">
				<template>
					<span v-if="!tableDatas[$index].isEdit">{{ tableDatas[$index].sendMethod }}</span>
					<el-select v-model="tableDatas[$index].sendMethod" size="small" v-else>
						<el-option v-for="option in optionsModel.transport.options" :value="option.value" :label="option.label"></el-option>
					</el-select>
				</template>
			</el-table-column>
			<el-table-column label="操作" inline-template :context="_self">
				<template>
					<template v-if="!tableDatas[$index].isEdit">
						<el-button size="small" @click="toEdit($index)">编辑</el-button>
						<el-button size="small" type="danger" @click="deleteData($index)">删除</el-button>
					</template>
					<template v-else>
						<el-button size="small" type="primary" @click="isSaveTable(true, $index)">保存</el-button>
						<el-button size="small" @click="isSaveTable(false, $index)">取消</el-button>
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
</style>