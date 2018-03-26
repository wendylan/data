<script>
	import headerbar from "../components/same-headerbar.vue";
	// import ajaxCustom from '../components/ajax-custom.js';
	import { Input, Button, Form, FormItem } from 'element-ui';
	export default {
		components : {
			headerbar,
			elInput : Input,
			elButton : Button,
			elForm : Form,
			elFormItem : FormItem
		},
		data(){
			return {
				accountInfo : {
					name : '',
                    auth_code : ''
				},
				rules : {
					name : [
						{ required: true, message: '请输入注册的邮箱或手机', trigger: 'blur' },
					],
					auth_code : [
						{ required: true, message: '请输入正确的验证码', trigger: 'blur' },
					]
				}
			}
		},
		methods : {
			submitInfo(name){
				this.$refs[name].validate((valid) => {
					if (valid) {
						window.document.getElementById('form').submit();
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			},
            recaptcha(e){
				// console.log(e);
				this.captcha = e.target;
				this.captcha.src='captcha/1?r='+Math.random();
			},
		},
	}
</script>
<template>
	<div>
		<headerbar :text="['找回账户密码', '个人信息']">
			<div>
				<div class="text_box">
                    <h3>找回账号密码</h3>
					<el-form :model="accountInfo" :rules="rules" ref="accountInfo" id="form" label-width="250px">
                        <div class="inline_box" >
    						<el-form-item prop="name" label="登录名:" >
    							<el-input name="name"  v-model='accountInfo.name' type="text" placeholder="请输入注册时的邮箱或者手机"></el-input>
    						</el-form-item>
                        </div>
                        <div class="inline_box" >
    						<el-form-item prop="auth_code" label="验证码:">
    							<el-input name="auth_code"  v-model='accountInfo.auth_code' type="text" style="width:120px;"></el-input>
                                <a @click="recaptcha" ref="recaptcha" class="img_box">
                                    <img src="/captcha/1" id="img_captcha" alt="验证码" title="刷新图片">
                                </a>
    						</el-form-item>

                        </div>
                        <p style="text-align:center;">
                            <el-button type="primary"  @click = "submitInfo('accountInfo')">提交信息</el-button>
                        </p>
					</el-form>
				</div>
			</div>
		</headerbar>
	</div>
</template>
<style scoped>
	.text_box{
	    width: 50%;
		margin: 5px auto;
		padding:5px;
		background-color: #fff;
	}
    .text_box h3{
        font-size: 16px;
        text-align: center;
        margin-top: 20px;
    }
    .el-form{
        margin-top: 20px;
    }
    .el-input{
		width: 250px;
	}
	.el-form-item label{
		font-weight: 300;
	}
    .img_box{
        display: inline-block;
        width: 120px;
    }
    .img_box img{
        height: 37px;
        line-height: 37px;
        border-radius: 5px;
        vertical-align: middle;
        display: inline-block;
    }
</style>
