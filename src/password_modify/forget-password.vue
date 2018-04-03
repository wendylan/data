<script>
	import{ Tabs, TabPane, Form, FormItem, Input, Button, Popover } from 'element-ui';
	import ajaxCustom from '../components/ajax-custom.js';
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
				nowTime: 60,
				isShowSend: false,
				state : 1,
				usermobile : null,
				captcha : null,
				postcaptcha : null,
				captcha_message : null,
				activeName : 'first',
				registerInfo : {
					account : null,
					captcha : null,
					password : null,
					password_confirmation : '',
					phone_captcha : null,
				},
				rules : {
					
				},
				
			}
		},
		methods : {
			minutesAfter(){
				if (this.nowTime == 0) { 
					this.isShowSend = true;
			        this.nowTime = 60; 
			        return;
			    } else { 
			        this.nowTime--; 
			    }
			    var that = this;
			    setTimeout( function(){
			    	that.minutesAfter();
			    }, 1000 );
			},
			sendCode(){
				console.log('重新发送');
			},
			recaptcha(e){
				this.captcha = e.target;
				this.captcha.src='createCaptcha/1?r='+Math.random();
			},
			firstCheck() {
				let data = {account : this.registerInfo.account, postcaptcha : this.registerInfo.captcha};
				ajaxCustom.ajaxPost(this, 'checkHasPhone',data, (response)=>{
					console.log(response);
					if(response.body.message == 'success'){
						this.state = response.body.state;
						this.usermobile = response.body.mobile;
						this.minutesAfter();
					}
				}, (response)=>{
					console.log(response);
					alert(response.body.message);
				});
			},
			secondCheck() {
				let data = {phone_captcha : this.registerInfo.phone_captcha, mobile : this.usermobile};
				ajaxCustom.ajaxPost(this, 'checkPhoneCaptcha',data, (response)=>{
					console.log(response);
					if(response.body.message == 'success'){
						this.state = response.body.state;
					}
				}, (response)=>{
					console.log(response);
					alert(response.body.message);
				});
			},
			finish() {
				let data = {mobile : this.usermobile, new_password : this.registerInfo.password};
				ajaxCustom.ajaxPost(this, 'addNewPassword',data, (response)=>{
					if(response.body.message == 'success'){
						alert('修改成功，点击确定返回登录页');
						window.location.href = "/login";
					}
				}, (response)=>{
					console.log(response);
					alert(response.body.message);
				});
			},
			mobileHide(){
				if(this.usermobile){
					let mobile = this.usermobile;
					return mobile.substr(0, 3) + "****"+ mobile.substr(7.4);
				}
			}
		},
	}
</script>
<template>
	<div>
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
							<el-tab-pane label="密码找回" name="first">
								<el-form :model="registerInfo"  ref="registerInfo"  label-width="100px" style="margin-top: 30px;text-align: center;">
									<template v-if='(state == 1)'>
										<el-form-item prop="account" label="请输入账号" >
											<el-input name="account"  v-model='registerInfo.account' type="text" :maxlength="25"></el-input>
										</el-form-item>
										<el-form-item prop="captcha" label="请输入验证码" >
											<el-input name="captcha"  v-model='registerInfo.captcha' type="text" :maxlength="11" :minlength="13">
												<a @click="recaptcha" ref="recaptcha" slot="append">
													<img src="/createCaptcha/1" id="img_captcha" alt="验证码" title="刷新图片">
												</a>
											</el-input>
											
										</el-form-item>
										<el-button style="min-width: 100px;" type="success"  @click = "firstCheck()">下一步</el-button>
									</template>
									<template v-if='(state == 2)'>
										<p>短信验证码已发送到您的账号所绑定的手机:{{mobileHide()}}</p>
										<el-form-item prop="phone_captcha" label="请输入短信验证码" >
											<el-input name="phone_captcha"  v-model='registerInfo.phone_captcha' type="text" :maxlength="11" :minlength="13">
												<el-button v-if="!isShowSend" slot="append">{{ nowTime }}s后重新发送</el-button>
												<el-button v-if="isShowSend" slot="append" @click="sendCode()">免费获取验证码</el-button>
											</el-input>
										</el-form-item>
										<el-button style="min-width: 100px;" type="success"  @click = "secondCheck()">下一步</el-button>
									</template>
									<template v-if='(state == 3)'>
										<el-form-item prop="password" label="请输入新密码" >
											<el-input name="password"  v-model='registerInfo.password' type="password" :maxlength="11" :minlength="13"></el-input>
										</el-form-item>
										<el-form-item prop="password_confirmation" label="请确认新密码" >
											<el-input name="password_confirmation"  v-model='registerInfo.password_confirmation' type="password" :maxlength="11" :minlength="13"></el-input>
										</el-form-item>
										<el-button style="min-width: 100px;" type="success"  @click = "finish()">完成</el-button>
									</template>
								</el-form>
							</el-tab-pane>
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
	#img_captcha{
		height: 30px;
	}


</style>
