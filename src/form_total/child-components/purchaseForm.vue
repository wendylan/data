<script>
	import ajaxCustom from '../../components/ajax-custom.js';
	import filterBar from '../../components/filter-bar.vue';
	import headbar from "../../components/same-headerbar.vue";
	import { DatePicker, Table, TableColumn } from 'element-ui';
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
						a : "2017/09/10",
						b : "万科云城",
						c : "广州市建材",
						d : "粤钢",
						e : "螺纹钢",
						f : "16",
						g : "100",
						h : "100",
						i : "93.5",
						j : "93.5",
						k : "4000",
						l : "POID1038292",
						n : 8000,
						m : 5000,
						o : 3000,
						p : 1100,
						q : 600,
						r : 500,
						s : 200,
						t : "POID1038292",
						u : 50,
						v : 1,
						w : 1,
						x : 999,
						y : null
					},
					{
						a : "2017/09/10",
						b : "万科云城",
						c : "广州市建材",
						d : "广钢",
						e : "螺纹钢",
						f : "16",
						g : "100",
						h : "100",
						i : "93.5",
						j : "93.5",
						k : "4000",
						l : "POID1038292",
						n : 8000,
						m : 5000,
						o : 3000,
						p : 1100,
						q : 600,
						r : 500,
						s : 200,
						t : "POID1038292",
						u : 50,
						v : 1,
						w : 1,
						x : 999,
						y : null
					},
					{
						a : "2017/09/10",
						b : "万科云城",
						c : "广州市A建材",
						d : "粤钢",
						e : "螺纹钢",
						f : "16",
						g : "100",
						h : "100",
						i : "93.5",
						j : "93.5",
						k : "4000",
						l : "POID1038292",
						n : 8000,
						m : 5000,
						o : 3000,
						p : 1100,
						q : 600,
						r : 500,
						s : 200,
						t : "POID1038292",
						u : 50,
						v : 1,
						w : 1,
						x : 999,
						y : null
					},
					{
						a : "2017/09/10",
						b : "珠江新城",
						c : "广州市B建材",
						d : "粤钢",
						e : "螺纹钢",
						f : "16",
						g : "100",
						h : "100",
						i : "93.5",
						j : "93.5",
						k : "4000",
						l : "POID1038292",
						n : 8000,
						m : 5000,
						o : 3000,
						p : 1100,
						q : 600,
						r : 500,
						s : 200,
						t : "POID1038292",
						u : 50,
						v : 1,
						w : 1,
						x : 999,
						y : null
					},
					{
						a : "2017/09/10",
						b : "万科云城",
						c : "广州市建材",
						d : "粤钢",
						e : "螺纹钢",
						f : "18",
						g : "100",
						h : "100",
						i : "93.5",
						j : "93.5",
						k : "4000",
						l : "POID1038292",
						n : 8000,
						m : 5000,
						o : 3000,
						p : 1100,
						q : 600,
						r : 500,
						s : 200,
						t : "POID1038292",
						u : 50,
						v : 1,
						w : 1,
						x : 999,
						y : null
					},
					{
						a : "2017/09/10",
						b : "万科云城",
						c : "广州市建材",
						d : "粤钢",
						e : "螺纹钢",
						f : "20",
						g : "100",
						h : "100",
						i : "93.5",
						j : "93.5",
						k : "4000",
						l : "POID1038292",
						n : 8000,
						m : 5000,
						o : 3000,
						p : 1100,
						q : 600,
						r : 500,
						s : 200,
						t : "POID1038292",
						u : 50,
						v : 1,
						w : 1,
						x : 999,
						y : null
					},
					{
						a : "2017/09/10",
						b : "万科云城",
						c : "广州市建材",
						d : "粤钢",
						e : "螺纹钢",
						f : "16",
						g : "100",
						h : "100",
						i : "93.5",
						j : "93.5",
						k : "4000",
						l : "POID1038292",
						n : 8000,
						m : 5000,
						o : 3000,
						p : 1100,
						q : 600,
						r : 500,
						s : 200,
						t : "POID1038292",
						u : 50,
						v : 1,
						w : 1,
						x : 999,
						y : null
					}
				],
				value1 : "",
				pickerOptions0 : ""
			}
		}
	}
</script>

<template>
	<div style="padding-bottom:50px;">
		<headbar active_number="purchaseForm" :text="['采购台账', '']">
			<div class="">
				<filter-bar :data="tableDatas" :index="[
					{ title : '项目' , key : 'b'},
					{ title : '供应商', key : 'c'},
					{ title : '钢厂', key : 'd' },
					{ title : '品名', key : 'e' },
					{ title : '规格', key : 'f' }
				]"></filter-bar>
			</div>
			<div style="margin:30px 0px 30px">
				<span>选择日期：</span>
				<el-date-picker
					v-model="value1"
					type="daterange"
					placeholder="选择日期"
					size="small">
			    </el-date-picker>
			</div>
			<div style="width:100%; overflow:hidden;">
				<el-table :data="tableDatas">
					<el-table-column label="下单日期" prop="a"></el-table-column>
					<el-table-column label="工程项目" prop="b"></el-table-column>
					<el-table-column label="供应商" prop="c"></el-table-column>
					<el-table-column label="钢厂" prop="d"></el-table-column>
					<el-table-column label="品名" prop="e"></el-table-column>
					<el-table-column label="规格" prop="f"></el-table-column>
					<el-table-column label="计划重量" prop="g"></el-table-column>
					<el-table-column label="采购单价" prop="h"></el-table-column>
					<el-table-column label="实提重量" prop="i">
						<template scope="scope">
							<input v-model="scope.row.i" type="text" />
						</template>
					</el-table-column>
					<el-table-column label="实收重量" prop="j">
						<template scope="scope">
							<input v-model="scope.row.j" type="text" />
						</template>
					</el-table-column>
					<el-table-column label="提货仓" prop="k"></el-table-column>
					<el-table-column label="车牌号" prop="l"></el-table-column>
					<el-table-column label="结算金额" prop="n"></el-table-column>
					<el-table-column label="已付金额" prop="m"></el-table-column>
					<el-table-column label="结算余额" prop="o"></el-table-column>
					<el-table-column label="采销差价" prop="p"></el-table-column>
					<el-table-column label="发票号" >
						<template scope="scope">
							<input v-model="scope.row.q" type="text" />
						</template>
					</el-table-column>
					<el-table-column label="运费" prop="r">
						<template scope="scope">
							<input v-model="scope.row.r" type="text" />
						</template>
					</el-table-column>
					<el-table-column label="物流提货情况" >
						<template scope="scope">
							<input v-model="scope.row.s" type="text" />
						</template>
					</el-table-column>
					<el-table-column label="吊机费用">
						<template scope="scope">
							<input v-model="scope.row.t" type="text" />
						</template>
					</el-table-column>
					<el-table-column label="备注" >
						<template scope="scope">
							<input v-model="scope.row.u" type="text" />
						</template>
					</el-table-column>
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
