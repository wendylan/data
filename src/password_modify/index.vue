<script>
    // import _ from 'lodash';
	import headerbar from "../components/same-headerbar.vue";
	import { Input, Button, Loading } from 'element-ui';
	import ajaxCustom from '../components/ajax-custom.js';
	export default {
		components : {
			headerbar,
			elInput : Input,
			elButton : Button,
		},
		data(){
			return {
               old_password : null,
               new_password : null,
			}
		},
		methods : {
			confirm(old_password, new_password){
                let loadingInstance = Loading.service({ fullscreen: true });
				ajaxCustom.ajaxPost(this, "/dingoapi/modifyPassword", { 'new_password' : new_password, 'old_password' : old_password }, (response)=>{
					// console.log(response);
					alert(response.data.message);
                    loadingInstance.close();
				}, (response)=>{
					// console.log(response);
					alert(response.data.message);
                    loadingInstance.close();
				});
			}
		},
	}
</script>
<template>
	<div>
		<headerbar :text="['修改密码', '修改密码']">
			<div>
				<div class="text_box">
                    <p>
                        <span >旧密码</span>
    					<el-input v-model="old_password" type="password"  placeholder="输入旧密码" ></el-input>
                    </p>
					<p>
                        <span>新密码</span>
    					<el-input v-model="new_password" type="password" class="form-control" placeholder="输入新密码" ></el-input>
					</p>
					<el-button type="info" @click="confirm(old_password,new_password)">确定</el-button>
				</div>
			</div>
		</headerbar>
	</div>
</template>
<style scoped>
	.text_box{
		width: 80%;
		margin: 15px auto;
		padding:25px;
		background-color: #fff;
        text-align: center;
	}
    .text_box p{
        margin:20px;
    }
	.el-input{
		width: 200px;
	}
	span{
		color: #aaa;
	}
</style>
