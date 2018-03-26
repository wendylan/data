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
			elDatePicker : DatePicker
		},
		data(){
			return{
				tableDatas : [
					{
						a : 1,
						b : "广州市建材",
						c : "90082.00",
						d : "2017/09/09"
					},{
						a : 2,
						b : "广州市建材",
						c : "90082.00",
						d : "2017/09/09"
					},{
						a : 3,
						b : "广州市建材",
						c : "90082.00",
						d : "2017/09/09"
					},{
						a : 4,
						b : "广州市建材",
						c : "90082.00",
						d : "2017/09/09"
					},{
						a : 5,
						b : "广州市建材",
						c : "90082.00",
						d : "2017/09/09"
					}
				],
				value1 : ""
			}
		}
	}
</script>

<template>
	<div>
		<headbar active_number="countForm" :text="['结余统计表', '']">
			<div style="width:100%; overflow:hidden;">
				<el-table :data="tableDatas">
					<el-table-column label="序列" prop="a"></el-table-column>
					<el-table-column label="供应商" prop="b"></el-table-column>
					<el-table-column label="结余金额" prop="c"></el-table-column>
					<el-table-column label="结余日期" prop="d"></el-table-column>
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
