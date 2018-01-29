<script>
	import ajaxCustom from '../../components/ajax-custom.js';
	import filterBar from '../../components/filter-bar.vue';
	import headbar from "../../components/same-headerbar.vue";
	import { DatePicker, Table, TableColumn, Button, Input, Select, Option, Dialog , Form , FormItem, RadioGroup, Radio, Switch, Loading} from 'element-ui';
	export default{
		components : {
			headbar,
			filterBar,
			elTable : Table,
			elTableColumn : TableColumn,
			elDatePicker : DatePicker,
			elButton : Button
		},
		data(){
			return{
				tableHeader : [
					{name : "福州", index : 'a'},
					{name : "香洲", index : 'b'},
					{name : "中山", index :'c'},
					{name : "北疆", index : 'd'},
					{name : "甘猪肥", index : 'e'},
					{name : "江南二潮", index : 'f'},
					{name : "清华园", index : 'g'},
					{name : "东湖", index : 'h'},
					{name : "西海", index : 'i'},
					{name : "喜马拉雅山", index : 'j'},
					{name : "华盛顿", index : 'k'},
					{name : "合计", index : 'l'}
				],
				tableDatas : [
					{
						a : "2017/03/12",
						b : "300",
						c : "100",
						d : "700",
						e : "350",
						f : "2000",
						g : "300",
						h : "221",
						i : "667",
						j : "300",
						k : "50",
						l : "9000"

					},{
						a : "2017/03/12",
						b : "300",
						c : "100",
						d : "700",
						e : "350",
						f : "2000",
						g : "300",
						h : "221",
						i : "667",
						j : "300",
						k : "50",
						l : "9000"

					},{
						a : "2017/03/12",
						b : "300",
						c : "100",
						d : "700",
						e : "350",
						f : "2000",
						g : "300",
						h : "221",
						i : "667",
						j : "300",
						k : "50",
						l : "9000"

					},{
						a : "2017/03/12",
						b : "300",
						c : "100",
						d : "700",
						e : "350",
						f : "2000",
						g : "300",
						h : "221",
						i : "667",
						j : "300",
						k : "50",
						l : "9000"

					},{
						a : "2017/03/12",
						b : "300",
						c : "100",
						d : "700",
						e : "350",
						f : "2000",
						g : "300",
						h : "221",
						i : "667",
						j : "300",
						k : "50",
						l : "9000"

					},{
						a : "2017/03/12",
						b : "300",
						c : "100",
						d : "700",
						e : "350",
						f : "2000",
						g : "300",
						h : "221",
						i : "667",
						j : "300",
						k : "50",
						l : "9000"

					},{
						a : "2017/03/12",
						b : "300",
						c : "100",
						d : "700",
						e : "350",
						f : "2000",
						g : "300",
						h : "221",
						i : "667",
						j : "300",
						k : "50",
						l : "9000"

					}
				],
				value1 : ""
			}
		}
	}
</script>

<template>
	<div>
		<!-- <headbar active_number="5-5" :identity="2" :text="['项目出货统计表', '']"> -->
		<headbar active_number="projectSellForm" :identity="2" :text="['项目出货统计表', '']">
			<div class="">
				<span>选择日期：</span>
				<el-date-picker
					v-model="value1"
					type="date"
					placeholder="选择日期"
					size="small">
			    </el-date-picker>
			</div>
			<div style="margin:20px 0px 20px 0px">
				<span>显示选项：</span>
				<el-button size="small">今日出货品牌</el-button>
				<el-button size="small">本周出货品牌</el-button>
				<el-button size="small">本月出货品牌</el-button>
			</div>
			<div style="width:100%; overflow:hidden;">
				<el-table :data="tableDatas">
					<el-table-column v-for="data in tableHeader" :label="data.name" :prop="data.index"></el-table-column>
				</el-table>
			</div>
		</headbar>
	</div>
</template>

<style scoped>
	.first-main-warpper{
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
	.set-margin{
		margin:7px;
	}
	.project-info{
		color:#666;
	}
	.project-info>div{
		margin:8px;
	}
	b{
		color:#666;
	}
	.header-select>div{
		width:50%;
		float:left;
	}
	table{
		float:right;
	    table-layout: fixed;
	    border-collapse:collapse;
	    border:1px solid black;
		border:1px solid #e0e6ed;
		text-align:center;
		font-size:14px;
	}
	thead{
		background-color:#eef1f6;
	}
	thead th{
		text-align: center;
		padding:10px 0px;
		border:1px solid #dfe6ec;
	}
	table td{
		padding:10px;
		border:none;
		border-bottom:1px solid #e0e6ed;
		border-right:1px solid #e0e6ed;
	}
	table tbody tr:hover{
		background-color: #eff2f7;
	}

	.thead-select{
		width:100%;
	}
	.sort-icon{
		position: relative;
		top: 3px;
		display:inline-block;
		width:20px;
		font-size: 12px;
		color:#97a8be;
	}
	.sort-icon>div{
		width:auto;
		height:auto;
		margin:0;
		padding:0;
		cursor:pointer;
	}
	.content-table{
		margin-bottom:50px;
	}
</style>
<style>
	html body .times-select input.el-input__inner{
		height: 29px;
	}
</style>
