<script>
    import _ from 'lodash';
	import {Button, Dialog, Form, FormItem, Input} from 'element-ui';
	import relateBox from './relate-box.vue';
	export default{
        components : {
			relateBox,
			elButton : Button,
			elDialog : Dialog,
			elForm : Form,
			elFormItem : FormItem,
			elInput : Input
		},
		props : ['projectId', 'userId', 'opencheck', 'projects', 'companys'],
		data(){
			return {
				isOpen : false,
				// 是否显示关联弹出框
				isShowRelate : false,
				// 结算方式
				projectPayItems : [
					{ num : "1", text : "统一包干结算" },
					{ num : "2", text : "分品牌包干结算" },
					{ num : "3", text : "分品名包干结算" },
					{ num : "4", text : "统一分拆结算" },
					{ num : "5", text : "分品牌分拆结算" },
					{ num : "6", text : "综合费率结算" },
					{ num : "7", text : "其他" },
				],
				labelWidth : '150px',
				// 项目信息
				projectInfo : {
					settlement : {}
				},
			}
		},
		methods : {
			// 结算方式转换
			payToText(pay_items){
                let text = _.find(this.projectPayItems, function(item){
                    return item.num == pay_items;
                });
                return text?text.text:'';
			},
			// 审核
			finishCheck(){
				this.projectInfo.settlement.conditionType = 8;
				this.$emit('finishCheck', this.projectInfo);
				this.isOpen = false;
			},
			// 获取当前项目
			getProject(){
                this.projectInfo =  _.find(this.projects, ['project_id', this.projectId]);
			},
			// 取消关联
			cancelRelate(id){
				this.$emit('cancelRelate', id);
			},

			// 确认关联
			confirmRelate(id){
				this.$emit('confirmRelate', id);
			},
		},
		watch : {
			opencheck(){
				this.isOpen = true;
			},
			projectId(){
				this.getProject();
			},
		},

	}
</script>
<template>
	<div>
		<el-dialog title="项目审核" v-model="isOpen" style="text-align:center;">
			<el-form>
				<el-form-item label="所属单位 : " :label-width="labelWidth" class="text_left">
					<span v-if="projectInfo.company">{{ projectInfo.company }}</span>
					<span v-else>未关联<el-button size="small" @click="isShowRelate=!isShowRelate" style="margin-left:20px;">关联</el-button></span>
				</el-form-item>
				<el-form-item label="项目名称 : " :label-width="labelWidth" class="text_left">
					{{ projectInfo.name}}
				</el-form-item>
				<el-form-item label="项目地址 : " :label-width="labelWidth" class="text_left">
					广东省{{ projectInfo.city + projectInfo.area + projectInfo.addr }}
				</el-form-item>
				<el-form-item label="品牌范围 : " :label-width="labelWidth" class="text_left">
					<span v-for="(item, index) in projectInfo.brands" :key="index">{{ item }},</span>
				</el-form-item>
				<el-form-item label="结算方式 : " :label-width="labelWidth" class="text_left">
					{{ payToText(projectInfo.settlement.conditionType) }}
				</el-form-item>
				<el-form-item label="结算条件 : " :label-width="labelWidth" class="text_left">
					<el-input type="textarea" :rows="3" v-model="projectInfo.settlement.elsePayWay"></el-input>
				</el-form-item>
			</el-form>
			<div style="margin-top:20px;">
				<el-button type="primary" @click="finishCheck">审核通过</el-button>
			</div>
		</el-dialog>
		<!-- 关联弹出框 -->
		<relate-box :openbox="isShowRelate" :proReateId="projectId" :companys="companys" :projects="projects" @confirmRelate="confirmRelate" @cancelRelate="cancelRelate"></relate-box>
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
