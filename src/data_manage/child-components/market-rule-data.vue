<script>
import headerbar from '../../components/admin-headerbar.vue';
import {Table,TableColumn,Select,Option,Button} from "element-ui";
import ajaxCustom from '../../components/ajax-custom.js';
	export default{
		components:{
			headerbar,
			elTable:Table,
			elTableColumn:TableColumn,
			elSelect:Select,
			elOption:Option,
			elButton:Button
		},
		created : function(){
			this.getRuleData();
		},
		data(){
			return {
				data : [],
			}
		},
		methods:{
			getRuleData(){
				ajaxCustom.ajaxGet(this,"dingoapi/getRule", (responese)=>{
					console.log(responese);
					let strHandle=responese.body.data;
					for (var i = 0; i < strHandle.length; i++) {
						strHandle[i].apply_brands=strHandle[i].apply_brands.split(",");
						strHandle[i].brands=strHandle[i].brands.split(",");
						strHandle[i].describe=strHandle[i].describe.split(";");
						strHandle[i].trandsChoose=["自提、直送","自提","直送"];
					}
					this.data=strHandle;
					// console.log(strHandle);
				}, (responese)=>{
					console.log(responese);
				});
			},
			cleanOption(data){
				if(data[0]=='所有品牌'&&data.length>1){
					data=data.splice(0,1);
				}
				if (data[data.length-1]=="所有品牌"&&data.length>1) {
					data=data.splice(0,1);
				}
			},
			updateRule(data){
				for (var i = 0; i < this.data.length; i++) {
					this.data[i].apply_states=0;
				}
				data.apply_states=1;
				ajaxCustom.ajaxGet(this,"dingoapi/getRuleData",{params:data}, (responese)=>{
					console.log(responese);
					this.$message('启用成功');
				}, (responese)=>{
					console.log(responese);
				});
			}
		}
	}
</script>
<template>
	<headerbar active_number="5-4" :text="['定价规则数据','查看/编辑定价规则']">
		<el-table :data="data" >
			<el-table-column prop="id" label="序列" width="80"></el-table-column>
			<el-table-column label="描述" width="420">
				<template scope="scope">
        			<span style="margin-left: 10px" v-for="item in scope.row.describe">{{ item }}<br></span>
      			</template>
			</el-table-column>
			<el-table-column label="应用品牌" >
				<template scope="scope">
					<el-select v-model="scope.row.apply_brands" multiple @change="cleanOption">
						<el-option v-for="item in scope.row.brands" :value="item" :label="item">
						</el-option>
					</el-select>
      			</template>
			</el-table-column>
			<el-table-column label="配送方式">
				<template scope="scope">
					<el-select v-model="scope.row.trandsport">
						<el-option v-for="item in scope.row.trandsChoose" :value="item" :label="item">
						</el-option>
					</el-select>
      			</template>
			</el-table-column>
			<el-table-column label="启用" >
				<template scope="scope">
					<el-button v-if="scope.row.apply_states==0" type="info" @click="updateRule(scope.row)">启用</el-button>
					<el-button v-if="scope.row.apply_states==1" type="danger" @click="updateRule(scope.row)">启用中</el-button>
				</template>
			</el-table-column>
		</el-table>
	</headerbar>
</template>
<style scoped>
	.el-button{
		width: 74px;
	}
</style>
