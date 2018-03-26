<script>
	import{ Tabs, TabPane, Form, FormItem, Input, Button, Popover } from 'element-ui';
	import axios from 'axios';
	export default{
		components : {
			elTabs : Tabs,
			elTabPane : TabPane,
			elForm : Form,
			elFormItem : FormItem,
			elInput : Input,
			elButton : Button,
			elPopover : Popover,
		},
		data(){
			var validatePass1 = (rule, value, callback) => {
				if (value === '') {
					callback(new Error('请再次输入密码'));
				} else if (value !== this.registerInfo.password) {
					callback(new Error('两次输入密码不一致!'));
				} else {
					callback();
				}
			};
			var validatePass2 = (rule, value, callback) => {
				if (value === '') {
					callback(new Error('请再次输入密码'));
				} else if (value !== this.registerInfoEmail.password) {
					callback(new Error('两次输入密码不一致!'));
				} else {
					callback();
				}
			}
			return {
				captcha : null,
				postcaptcha : null,
				captcha_message : null,
				activeName : 'first',
				registerInfo : {
					mobile : null,
					password : null,
					password_confirmation : '',
					verifyCode : null,
				},
				rules : {
					mobile : [
						{ required: true, message: '请输入手机号码', trigger: 'blur' },
					],
					password : [
						{ required: true, message: '请输入密码', trigger: 'blur' },
					],
					password_confirmation : [
						{ validator: validatePass1, trigger: 'blur' },
					],
					verifyCode : [
						{ required: true, message: '请输入手机验证码', trigger: 'blur' },
					]
				},
				registerInfoEmail : {
					email : null,
					password : null,
					password_confirmation : ''
				},
				rules1 : {
					email : [
						{ required: true, message: '请输入邮箱地址', trigger: 'blur' },
					],
					password : [
						{ required: true, message: '请输入密码', trigger: 'blur' },
					],
					password_confirmation : [
						{ validator: validatePass2, trigger: 'blur' },
					]
				},
				mobile_error :"",
				captcha_visible: false,
			}
		},
		methods : {
			submitInfo( name ){
				this.$refs[name].validate((valid) => {
					if (valid) {
						window.document.getElementById(name).onSubmit();
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			},
			getVerifyCode(value){
				console.log(value);
			},
			recaptcha(e){
				// console.log(e);
				this.captcha = e.target;
				this.captcha.src='captcha/1?r='+Math.random();
			},
			reg_captcha_submit(){
				if (this.registerInfo.mobile !== null) {
				axios.post('/regsms',{
                                mobile : this.registerInfo.mobile,
                                postcaptcha : this.postcaptcha
                        })
                        .then(resp => {
							console.log(resp.data);
							let btn_get_captcha=document.getElementById('get_captcha');
							this.resend(btn_get_captcha);
							this.captcha_message=null;
							this.captcha_visible=false;
						}).catch(error => {
							console.log(error);
							if(error!=null){
								this.captcha_message=error.response.data;
								document.getElementById('img_captcha').click();
								console.log('请求失败：'+error.response.data);
							}
						});
				}
			},
			onSubmit(formName) {
				console.log(this.registerInfo);
				this.$refs[formName].validate((valid) => {
          		if (valid) {
					axios.post("/register",{
							mobile : this.registerInfo.mobile,
							password : this.registerInfo.password,
							password_confirmation : this.registerInfo.password_confirmation,
							verifyCode : this.registerInfo.verifyCode
						})
						.then(data => {
							console.log(data.message);
							window.location.href='/companyInfo';
						})
						.catch(errors => {
							console.log(errors.response.data);
							if(errors!=null){
							this.mobile_error="手机号码已注册";
							}
						});
				}else{
					console.log('空数据');
					 return false;
				}
				});
			},
			resend(element){
				console.log(element)
				var num = 60
				var timer = setInterval(function () {
					num--
					element.innerHTML = num + '秒后重新获取'
					element.style.color = ' #ccc'
					element.disabled = ' disabled'
					if (num === 0) {
					element.disabled = ''
					element.style.color = ' #ffa600'
					element.innerHTML = '获取验证码'
					clearInterval(timer)
					}
				}, 1000)
				}
		},
	}
</script>
<template>
	<div style="height:100%;">
		<div class="main_contianer">
			<div class="left_box">
				<div class="left_vertial">
					<div class="logo">
						<img src="/data/images/logoq.png" alt="">
					</div>
					<div style="color: #fff;text-align: center;margin-bottom: 30px;">
						<p style="font-size: 30px; margin-top: -15px;">六六钢铁</p>
					</div>
					<div class="main_text">
						<a href="#" class="text_a">
							<div class="same_box"><i class="fa fa-line-chart fa-3x"></i></div>
							<span  class="text_span">现货价格</span>
						</a>
						<a href="#" class="text_a">
							<div class="same_box"><i class="fa fa-shopping-cart fa-3x"></i></div>
							<span class="text_span" >买买买</span>
						</a>
						<a href="#" class="text_a">
							<div class="same_box"><i class="fa fa-joomla fa-3x"></i></div>
							<span  class="text_span">资源推荐</span>
						</a>
						<a href="#" class="text_a">
							<div class="same_box"><i class="fa fa-th fa-3x"></i></div>
							<span  class="text_span">下单管理</span>
						</a>
						<a href="#" class="text_a">
							<div class="same_box"><i class="fa fa-table fa-3x"></i></div>
							<span  class="text_span">项目管理</span>
						</a>
					</div>
				</div>
			</div>
			<div class="right_box">
				<div class="right_top">
					<p style="float: right;">
						<a href="/login" >登录</a>
						<span>|</span>
						<a href="/register">注册</a>
					</p>
				</div>
				<div class="right_content">
					<div class="right_vertial">
						<el-tabs v-model="activeName">
							<el-tab-pane label="手机注册" name="first">
								<el-form :model="registerInfo" :rules="rules" ref="registerInfo" @submit.prevent="onSubmit" label-width="100px" style="margin-top: 30px;text-align: center;">
									<!-- <form id="registerInfo" method="POST" action="/register" @submit.prevent="onSubmit"> -->
										<el-form-item prop="mobile" label="手机号码" :error="mobile_error">
											<el-input name="mobile"  v-model='registerInfo.mobile' type="text" :maxlength="11" :minlength="13"></el-input>
										</el-form-item>
										<el-form-item prop="password" label="设置密码" >
											<el-input name="password"  v-model='registerInfo.password' type="password"></el-input>
										</el-form-item>
										<el-form-item prop="password_confirmation" label="再次输入密码" >
											<el-input name="password_confirmation"  v-model='registerInfo.password_confirmation' type="password"></el-input>
										</el-form-item>
											<el-popover
											ref="popover5"
											placement="bottom"
											width="180"
											v-model="captcha_visible">
											<p>请填写图中的验证码</p>
											<div style="text-align: right; margin: 0">

													<a @click="recaptcha" ref="recaptcha">
														<img src="/captcha/1" id="img_captcha" alt="验证码" title="刷新图片">
													</a><br><br>
													<span style="color:red" v-if="captcha_message" v-text="captcha_message"></span>
													<el-input name="captcha"  v-model='postcaptcha' type="text"></el-input>
													<br><br>
													<el-button size="mini" type="text" @click="captcha_visible = false">取消</el-button>
													<el-button type="primary" size="mini" @click = "reg_captcha_submit()">确定</el-button>

											</div>
											</el-popover>
										<el-form-item prop="verifyCode" label="手机验证" >
											<el-input placeholder="请输入手机验证码" v-model="registerInfo.verifyCode" name="verifyCode">
												<el-button id="get_captcha" slot="append" v-popover:popover5>获取验证码</el-button>
											</el-input>
										</el-form-item>
										<el-button style="min-width: 100px;" type="success"  @click = "onSubmit('registerInfo')">注册</el-button>
									<!-- </form> -->
								</el-form>
							</el-tab-pane>
							<!-- <el-tab-pane label="邮箱注册" name="second" >
								<el-form :model="registerInfoEmail" :rules="rules1" ref="registerInfoEmail"  label-width="100px" style="margin-top: 30px;text-align: center;">
									<form id="registerInfoEmail" method="POST" action="">
										<el-form-item prop="email" label="邮箱地址" >
											<el-input name="email"  v-model='registerInfoEmail.email' type="text"></el-input>
										</el-form-item>
										<el-form-item prop="password" label="Password" >
											<el-input name="password"  v-model='registerInfoEmail.password' type="password"></el-input>
										</el-form-item>
										<el-form-item prop="password_confirmation" label="再次输入密码" >
											<el-input name="password_confirmation"  v-model='registerInfoEmail.password_confirmation' type="password"></el-input>
										</el-form-item>
										<el-button  style="min-width: 100px;"type="success"  @click = "submitInfo('registerInfoEmail')">注册</el-button>
									</form>
								</el-form>
							</el-tab-pane> -->
						</el-tabs>
					</div>
				</div>
			</div>
		</div>

	</div>
</template>
<style scoped>

	html,body {
	    background-color: #f8f8f8;
	    width: 100%;
	    height: 100%;
	}

	a,
	a:hover,
	a:focus {
	    text-decoration: none;
	    color: #fff;
	}

	.main_contianer {
	    width: 100%;
	    height: 100%;
        overflow: hidden;
	}

	.left_box {
	    width: 60%;
	    height: 100%;
	    float: left;
	    background-color: #61c1cf;
	}
	.left_vertial{
		width: 100%;
		height: 420px;
	    margin-top: 160px;
	}
	.left_box>.left_vertial{
		display:inline-block;
		vertical-align: middle;
	}
	.logo {
	    width: 120px;
	    height: 120px;
	    margin: 0 auto;
	    /*margin-top: 180px;*/
	}

	.logo img{
		width: 120px;
		height: 120px;
		display: inline-block;
	}

	.main_text {
	    padding-top: 50px;
	    width: 80%;
	    margin: 0 auto;
	    clear: both;
	    text-align: center;
	}

	.text_a {
	    display: inline-block;
	    width: 100px;
	    height: 100px;
	    margin: 0 30px;
	}

	.text_span {
	    display: inline-block;
	    width: 100px;
	    margin-top: 10px;
	    font-size: 16px;
	    font-weight: bold;
	}

	.same_box {
	    border: 2px solid #fff;
	    border-radius: 50%;
	    width: 100px;
	    height: 100px;
	    line-height: 100px;
	    float: left;
	}

	.same_box i {
	    height: 100px;
	    line-height: 100px;
	    color: #fff;
	}

	.right_box {
	    width: 40%;
	    height: 100%;
	    float: left;
	    background-color: #2c394c;
	    color: #fff;
	}

	.right_top {
	    margin-top: 10px;
	    margin-right: 20px;
	}

	.right_content {
	    width: 60%;
	    /*height: 98%;*/
	    margin: 160px auto;
	    /*margin-top: 220px;*/
	}
	.right_vertial{
		width: 100%;
		height: 420px;
	}
	.right_content>.right_vertial{
		display:inline-block;
		vertical-align: middle;
	}



</style>
