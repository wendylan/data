<script>
	import { Table, TableColumn, Button, Input, Select, Option, Dialog ,Form,FormItem,Pagination,DatePicker} from 'element-ui';
	import ajaxCustom from '../../components/ajax-custom.js';
	import titleBox from "../../components/title-box.vue";
	export default{
		components : {
			titleBox : titleBox,
			elTable : Table,
			elTableColumn : TableColumn,
			elButton : Button,
			elInput : Input,
			elSelect : Select,
			elOption : Option,
			elDialog:Dialog,
			elForm:Form,
			elFormItem:FormItem,
			elPagination : Pagination,
			elDatePicker : DatePicker
		},
		created : function(){
			ajaxCustom.ajaxGet(this,"dingoapi/getSteelMarketList", (responese)=>{
				console.log(responese);
				let resData = responese.body;
				if(responese.status === 200){
					for(let data of resData.data.steelMarketList){
						for(let num of this.numberToText){
							if(data.price_queue == num.num){
								data.price_queue = num.text;
							}
						}
					}
					this.tableData = resData.data.steelMarketList;
					this.changePage(1);
				}else{
					alert("暂无数据");
				}
			},(responese)=>{
				alert(responese.body.message);
				console.log(responese);
			});
		},
		data() {
			return {
				currentPageItems:[],
				tableData: [],
				pickerOptions: {
                    disabledDate(time) {
                        return time.getTime() > Date.now() ;
                    }
                },
				numberToText : [
					{ num : 0, text : "首次" },
					{ num : 1, text : "二次" },
					{ num : 2, text : "三次" },
					{ num : 3, text : "四次" }
				],
				isButtonLoading : false,
				currentPage : 1,
				searchDate : null,
			}
		},
		methods : {
			// 分页功能
			changePage(page){
				let total=this.tableData.length;
				this.currentPageItems=[];
				for(let i=(page-1)*15;i<(page*15<total?page*15:total);i++){
					this.currentPageItems.push(this.tableData[i]);
				}
			},
			getSearchDate(){
				if(this.searchDate){
					this.currentPageItems =[];
					let date = this.dateFormat(this.searchDate);
					for(let data of this.tableData){
						if(date == data.created_at.slice(0,10)){
							this.currentPageItems.push(data);
						}
					}
				}else{
					this.changePage(1);
				}
			},
			lookAll(){
				this.searchDate = '';
				this.changePage(1);
			},
			//日期对象格式化
			dateFormat(date){
				var year =date.getFullYear();
				var month = (date.getMonth()+1).toString();
				var day =(date.getDate()).toString();
				if(month.length == 1){
					month = '0'+month;
				}
				if(day.length ==1){
					day = '0'+day;
				}
				var dateTime =year+"-"+month+"-"+day;
				return dateTime;
			},
			moreInfo(row){
				this.$router.push('/'+row.id);
			},
		}
	}
</script>

<template>
	<div class="first-main-warpper">
		<title-box :text="['现货参考价','提供每日最新钢铁价格']"></title-box>
		<div style="margin-bottom:20px;float:right;">
			<span>查询报价</span>
			<el-date-picker v-model="searchDate" size="small" :picker-options="pickerOptions" :editable="false" type="date" placeholder="选择日期" @change="getSearchDate"></el-date-picker>
		</div>

		<el-table
	    :data="currentPageItems"
	    style="width: 100%;text-align:center"
	    @row-click="moreInfo" >
			<el-table-column label="名称" inline-template :context="_self">
				<template>
					{{ "广州钢材现货市场" + currentPageItems[$index].price_queue + "报价" }}
				</template>
			</el-table-column>
			<el-table-column prop="created_at" label="日期"></el-table-column>
		</el-table>
		
		<div class="page" v-if="!searchDate">
			<el-pagination
		    	:current-page="currentPage"
		    	:page-size="15"
		    	layout="total,prev, pager, next,jumper"
		    	:total="tableData.length"
				@current-change='changePage'>
		    </el-pagination>
		</div>
		<p style="text-align:center;margin-top:30px;" v-if="searchDate" ><el-button @click="lookAll()">查看所有</el-button></p>
	</div>
</template>

<style scoped>

	.first-main-warpper{
		width:1280px;
		margin:auto;
		padding:10px;
		color:#1F2D3D;
	}
	h1,h4{
		font-weight:400;
	}
	h4{
		color:#8492A6;
	}
	.search-box>div{
		margin:0px 20px 10px 0px;
	}
	.el-table tr:hover{
		cursor:pointer;
	}
	.page{
		margin-top: 30px;
		text-align: center;
	}
</style>
<style>
	.first-main-warpper .el-table tbody tr:hover{
		cursor:pointer;
	}
	#detepicker input{
		height : 28px;
	}
</style>
