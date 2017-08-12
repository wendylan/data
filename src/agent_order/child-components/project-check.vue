<script>
	import {Button, Dialog, Form, FormItem} from 'element-ui';
	import relateBox from './relate-box.vue';
	export default{
		props : ['projectId','userId','opencheck'],
		data(){
			return {
				isOpen : false,
				isShowRelate : false,
				projectPayItems : [
					{num : 1, text : "统一包干结算"},
					{num : 2, text : "分品牌包干结算"},
					{num : 3, text : "统一分拆结算"},
					{num : 4, text : "分品牌分拆结算"},
					{num : 5, text : "综合费率结算"},
					{num : 6, text : "其他"},
				],
				labelWidth : '150px', 
				projectInfo : {
					// unit_name : "广东省建工集团有限公司",
					unit_name : "",
					project_name : "流花湖公园",
					city : "广州市",
					area : "越秀区",
					addr : "流花路1号",
					brands : ["韶钢","粤钢"],
					pay_items : 1,
					begin : '下单后',
					days : 15,
					web_price_down : 14,
					freight : 20,
					ponderation_price : 16, 
				}, 
			}
		},
		components : {
			relateBox,
			elButton : Button,
			elDialog : Dialog,
			elForm : Form,
			elFormItem : FormItem,
		},
		methods : {
			// 结算方式转换
			payToText(pay_items){
				for(let data of this.projectPayItems){
					if(data.num == pay_items){
						return data.text;
					}
				}
			},
			// 审核
			finishCheck(){
				this.isOpen = false;
				this.$emit('finishCheck', this.projectInfo);
			}
		},
		watch : {
			opencheck(){
				this.isOpen = true;
			}
		},
	}
</script>
<template>
	<div>
		<el-dialog title="项目审核" v-model="isOpen" style="text-align:center;">
			<el-form>
				<el-form-item label="所属单位 : " :label-width="labelWidth" class="text_left"> 
					<span v-if="projectInfo.unit_name">{{ projectInfo.unit_name }}</span>
					<span v-else>未关联<el-button size="small" @click="isShowRelate=!isShowRelate" style="margin-left:20px;">关联</el-button></span>
				</el-form-item>
				<el-form-item label="项目名称 : " :label-width="labelWidth" class="text_left">
					{{ projectInfo.project_name}}
				</el-form-item>
				<el-form-item label="项目地址 : " :label-width="labelWidth" class="text_left">
					广东省{{ projectInfo.city + projectInfo.area + projectInfo.addr }}
				</el-form-item>
				<el-form-item label="品牌范围 : " :label-width="labelWidth" class="text_left">
					<span v-for="item in projectInfo.brands">{{ item }},</span>
				</el-form-item>
				<el-form-item label="结算方式 : " :label-width="labelWidth" class="text_left">
					{{ payToText(projectInfo.pay_items) }}
				</el-form-item>
				<el-form-item label="结算条件 : " :label-width="labelWidth" class="text_left">
					<span v-if="projectInfo.days">{{ projectInfo.begin }}{{ projectInfo.days }}日 , </span>
					<span v-if="projectInfo.web_price_down">网价下浮{{ projectInfo.web_price_down }}元/吨 , </span>
					<span v-if="projectInfo.freight">运费{{ projectInfo.freight }}元/吨 , </span>
					<span v-if="projectInfo.ponderation_price">过磅费{{ projectInfo.ponderation_price }}元/吨</span>
				</el-form-item>
			</el-form>
			<div style="margin-top:20px;">
				<el-button type="primary" @click="finishCheck">审核通过</el-button>
			</div>
		</el-dialog>
		<relate-box :openbox="isShowRelate"></relate-box>
	</div>
</template>
<style scoped>
	*{
		margin: 0;
	}
	.text_left{
		text-align: left;
	}
</style>