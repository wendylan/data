<script>
	import headerbar from "../components/same-headerbar.vue";
	import ajaxCustom from '../components/ajax-custom.js';
	import { Tabs, TabPane, Table, TableColumn, Pagination, Dialog, Button, Tag, Input, Form, FormItem } from 'element-ui';
	export default {
		components : {
			headerbar,
            elTabs : Tabs,
            elTabPane : TabPane,
            elTable : Table,
			elTableColumn : TableColumn,
            elPagination : Pagination,
            elDialog : Dialog,
            elButton : Button,
            elTag : Tag,
            elInput : Input,
            elForm : Form,
            elFormItem : FormItem,
		},
		created(){
			this.roles = this.toJson(role);
            this.handleClick();
		},
		data(){
			return {
				roles : [],
                activeName : 'second',
                // 每条数据前面选择框的数据组合
                multipleSelection: [],
                // 是否显示弹出框
                showMessage : false,
                // 当前页
                currentPage : 1,
                // 搜索的关键字
                keyword : '',
                // tab选项卡数据
                currentMessage : [],
                // 表格及分页数据
                pageMessage : [],
                // 查看的弹出框数据
                detailData : [],
                // 状态转换内容
                messageStatus : [
					{num : 0, text : "未读", type:"info"},
					{num : 1, text : "已读", type:"success"}
				],
                // 是否显示分页
                showPage : true,
                // 全部数据
                tableData: [
                    {
                        id : 1,
                        date: '2016-05-03',
                        content: 'this is a testthis is a testthis is a testthis is a testthis is a testthis is a test',
                        type: '订单消息',
                        status : 0
                    },
                    {
                        id : 2,
                        date: '2016-05-02',
                        content: 'this is a test',
                        type: '订单消息',
                        status : 0
                    },
                    {
                        id : 3,
                        date: '2016-05-04',
                        content: 'this is a test',
                        type: '订单消息',
                        status : 1
                    },
                    {
                        id : 4,
                        date: '2016-05-01',
                        content: 'this is a test',
                        type: '订单消息',
                        status : 1
                    },
                    {
                        id : 5,
                        date: '2016-05-08',
                        content: 'this is a test',
                        type: '采购信息',
                        status : 1
                    },
                    {
                        id : 6,
                        date: '2016-05-06',
                        content: 'this is a test',
                        type: '采购信息',
                        status : 1
                    },
                    {
                        id : 7,
                        date: '2016-05-07',
                        content: 'this is a test',
                        type: '订单消息',
                        status : 1
                    }
                ],

			}
		},
		methods : {
			toJson(data){
				data = data.replace(/&quot;/g, '"');
				data = JSON.parse(data);
				return data;
			},
			hasRole(role){
				for (var i = 0; i < this.roles.length; i++) {
					if(this.roles[i].name==role){
						return true;
					}
				}
				return false;
			},
            // 状态转换为文本
			statusToText(status){
				for(let data of this.messageStatus){
					if(data.num == status){
						return  data;
					}
				}
			},
            // tab选择器
            handleClick() {
                let active = this.activeName;
                // 全部信息
                if(active == 'first') {
                    this.currentMessage = [];
                    this.currentMessage = this.tableData;
                    this.changePage(1);
                }
                // 未读信息
                if(active == 'second') {
                    this.currentMessage = [];
                    for(let data of this.tableData){
                        if(data.status == 0 ){
                            this.currentMessage.push(data);
                        }
                    }
                    this.changePage(1);
                }
                // 已读信息
                if(active == 'third') {
                    this.currentMessage = [];
                    for(let data of this.tableData) {
                        if(data.status == 1) {
                            this.currentMessage.push(data);
                        }
                    }
                    this.changePage(1);
                }
            },
            // 选择每条数据前面的框进行赋值保存
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 查看数据
            showdata(index){
				this.detailData = this.tableData[index];
				this.showMessage = !this.showMessage;
                this.tableData[index].status = 1;
                this.handleClick();
			},
            // 删除数据
            deldata(id){
                let tmp = this.tableData;
                for(let i = 0; i < tmp.length; i++){
                    if(tmp[i].id == id){
                        tmp.splice(i, 1);
                    }
                }
            },
            // 搜索功能
            handleIconClick() {
                this.showPage = false;
                this.pageMessage = [];
                for(let data of this.tableData){
                    if(
                        data.content.includes(this.keyword) ||
                        data.type.includes(this.keyword)
                        ){
                        this.pageMessage.push(data);
                    }
                }
            },
            // 删除多条信息
            delMultiple(){
                let data = this.tableData;
                for(let i = 0; i < data.length; i++ ){
                    for(let item of this.multipleSelection){
                        if(data[i].id == item.id){
                            data.splice(i, 1);
                        }
                    }
                }
                this.handleClick();
            },
            // 标记为已读
            changeStatus(){
                let data = this.tableData;
                for(let i = 0; i < data.length; i++ ){
                    for(let item of this.multipleSelection){
                        if(data[i].id == item.id){
                            data[i].status = 1;
                        }
                    }
                }
                this.handleClick();
            },
            showAll(){
                this.showPage = true;
				this.currentMessage = this.tableData;
				this.changePage(1);
            },
            // 分页
			changePage(page){
				let total = this.currentMessage.length;
				this.pageMessage = [];
				for(let i = (page-1)*6; i < (page*6 < total ? page*6 : total); i++ ){
					this.pageMessage.push(this.currentMessage[i]);
				}
			},
		},
	}
</script>
<template>
	<div>
		<headerbar :identity="hasRole('次终端用户') ? 2 : 1" :text="['信息列表', '查看详细信息']">
            <div class="content_box">
                <div style="position: relative;">
                    <el-tabs v-model="activeName" @tab-click="handleClick">
                        <el-tab-pane label="全部信息" name="first"></el-tab-pane>
                        <el-tab-pane label="未读信息" name="second"></el-tab-pane>
                        <el-tab-pane label="已读信息" name="third"></el-tab-pane>
                    </el-tabs>
                    <span style="position: absolute; top:5px;left: 300px;">
                        <el-button size="small" @click="delMultiple()">删除</el-button>
                        <el-button size="small" @click="changeStatus()">标记为已读</el-button>
                    </span>
                    <span style="position: absolute; top:0;right: 0;">
                        <el-input class="leftBox" placeholder="支持信息类型内容搜索" v-model="keyword" icon="search" @change="handleIconClick"></el-input>
                    </span>
                </div>

                <el-table ref="multipleTable" :data="pageMessage" border tooltip-effect="dark" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="55"></el-table-column>
                    <el-table-column prop="content" label="消息内容"></el-table-column>
                    <el-table-column prop="date" label="发生时间" width="120"></el-table-column>
                    <el-table-column prop="type" label="消息类型"></el-table-column>
                    <el-table-column label="状态">
                        <template scope="scope">
                            <el-tag :type="statusToText(scope.row.status).type">{{statusToText(scope.row.status).text}}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作">
                        <template scope="scope">
                            <el-button  @click="showdata(scope.$index);" type="info" size="small" >查看</el-button>
                            <el-button type="danger" @click="deldata(scope.row.id);" size="small">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>


                <!-- 分页 -->
                <div class="block" v-if="showPage">
                    <el-pagination :current-page="currentPage" :page-size="6" layout="total, prev, pager, next, jumper" :total="currentMessage.length"  @current-change='changePage'>
                    </el-pagination>
                </div>
                <el-button v-show="showPage == false" class="text_align" type="primary" @click="showAll">查看所有信息</el-button>

                <el-dialog title="信息详情" v-model="showMessage" style="text-align:center;">
                    <el-form>
        				<el-form-item label="内容 : " label-width="150px" class="text_left">
        					<span>{{ detailData.content }}</span>
        				</el-form-item>
        				<el-form-item label="发生时间 : " label-width="150px" class="text_left">
        					{{ detailData.date}}
        				</el-form-item>
        				<el-form-item label="消息类型 : " label-width="150px" class="text_left">
        					{{ detailData.type}}
        				</el-form-item>
        			</el-form>
                </el-dialog>
            </div>
		</headerbar>
	</div>
</template>
<style scoped>
    .content_box{
        background-color: #fff;
		padding: 15px;
    }
    .block{
        padding: 20px 0;
        margin: 20px 0;
        text-align: center;
    }
    .leftBox{
        width:250px;
    }
    .text_align{
        text-align: center;
        margin: 20px auto;
        display: block;
    }
    .text_left{
        text-align:left;
    }
</style>
