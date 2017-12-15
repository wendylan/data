<script>
	import headerbar from "../components/same-headerbar.vue";
	import ajaxCustom from '../components/ajax-custom.js';
	import { Select, Option, Radio, Dialog, Input, Button, Form, FormItem} from 'element-ui';
	export default {
		components : {
			headerbar,
			elSelect : Select,
			elOption : Option,
			elRadio : Radio,
			elDialog : Dialog,
			elInput : Input,
			elButton : Button,
			elForm : Form,
			elFormItem : FormItem
		},
		created(){
			this.roles = this.toJson(role);
			this.getUserInfo();
		},
		data(){
			var validatePass1 = (rule, value, callback) => {
				if (value === '') {
					callback(new Error('请再次输入密码'));
				} else if (value !== this.userInfo.password) {
					callback(new Error('两次输入密码不一致!'));
				} else {
					callback();
				}
			};
			return {
				dialogVisible : false,
				roles : [],
				userInfo : {
					userInfo_file : null,
					name : '',
					password : '',
					confirmPass : '',
					mobile : '',
					email : '',
					avator : ''
				},
				rules : {
					name : [
						{ required: true, message: '请输入名称', trigger: 'blur' },
					],
					password : [
						{ required: true, message: '请输入密码', trigger: 'blur' },
					],
					confirmPass : [
						{ validator: validatePass1, trigger: 'blur' },
					],
					mobile : [
						{ required: true, message: '请输入手机号码', trigger: 'blur' },
					],
					email : [
						{ required: true, message: '请输入邮箱', trigger: 'blur' },
					]
				}
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
			getUserInfo(){
				ajaxCustom.ajaxGet(this, "dingoapi/getUserInfo", (response)=>{
					console.log(response);
					console.log(response.body.user);
					this.userInfo = response.body.user;
				}, (response)=>{
					alert(response.body.message);
				});
			},
			modal(){
				this.dialogVisible = true;
			},
			getImgPath(file){
				if(file.length<13){
					return null;
				}
				if(file.substr(0, 4)=='data'){
					return file;
				}
				let filename = '/'+file.substr(13);
				return filename;
			},
			modifyFile(){
				window.document.getElementById('file').click();
			},
			fileChanged(flie){
				var files = flie.target.files ;
				if((typeof FileReader)===undefined){
					alert('您的浏览器并不支持图片上传');
				}
				var reader = new FileReader();
				if(files.length){
					this.userInfo.userInfo_file = files[0];
					reader.readAsDataURL(files[0]);
					var this_ = this;
					reader.onload = function(e){
						this_.userInfo.avator = e.target.result;
					}
				}
			},
			submitInfo(name){
				console.log(this.$refs[name]);
				this.$refs[name].validate((valid) => {
					if (valid) {
						if(this.userInfo.avator==''){
							alert('请上传头像！');
							return false;
						}
						console.log(this.userInfo);
						// window.document.getElementById('form').submit();
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			}
		},
	}
</script>
<template>
	<div>
		<headerbar :identity="hasRole('次终端用户') ? 2 : 1" :text="['个人信息', '个人信息']">
			<div>
				<div class="text_box">
					<el-form :model="userInfo" :rules="rules" ref="userInfo"  label-width="150px" >
						<form id="form" method="POST" action="dingoapi/postUserInfo" enctype="multipart/form-data" >

							<div class="inline_box" >
								<el-form-item prop="name" label="用户名称" >
									<el-input name="name"  v-model='userInfo.name' type="text"></el-input>
								</el-form-item>
							</div>

							<div class="inline_box">
								<el-form-item prop="password" label="用户密码">
									<el-input name="password"  v-model='userInfo.password' type="password"></el-input>
								</el-form-item>
							</div>

							<div class="inline_box">
								<el-form-item prop="confirmPass" label="再次输入密码">
									<el-input name="confirmPass"  v-model='userInfo.confirmPass' type="password"></el-input>
								</el-form-item>
							</div>

							<div class="inline_box">
								<el-form-item prop="mobile" label="手机号码">
									<el-input name="mobile"  v-model='userInfo.mobile' type="text"></el-input>
								</el-form-item>
							</div>

							<div class="inline_box">
								<el-form-item prop="email" label="email">
									<el-input name="email"  v-model='userInfo.email' type="text"></el-input>
								</el-form-item>
							</div>
							<div class="inline_box">
								<!-- <el-form-item prop="avator" label="头像">
									<input id='file'  type="file"  @change='fileChanged' name="avator" v-show = 'false'/>
									<template v-if="userInfo.avator!=''&&userInfo.avator!=null">
										<el-button   @click="modal()">查看</el-button>
										<el-button  @click="modifyFile()">修改</el-button>
									</template>
									<template v-if="userInfo.avator==''||userInfo.avator==null">
										<el-button  @click="modifyFile()">上传</el-button>
										<el-button   @click="modal()">查看</el-button>
									</template>
									<el-dialog title="提示" v-model="dialogVisible">
										<img :src="getImgPath(userInfo.avator)" alt="" style="display:block;width:100%;">
										<span slot="footer" class="dialog-footer">
											<el-button @click="dialogVisible = false">取 消</el-button>
											<el-button type="primary" @click="dialogVisible = false">确 定</el-button>
										</span>
									</el-dialog>
								</el-form-item> -->
							</div>
				  			<p style="margin-left: 140px;">
					  			<el-button type="primary"  @click = "submitInfo('userInfo')">提交信息</el-button>
				  			</p>
						</form>
					</el-form>
				</div>
			</div>
		</headerbar>
	</div>
</template>
<style scoped>
	.text_box{
		margin: 5px auto;
		padding:5px;
		background-color: #fff;
	}
	.el-input{
		width: 200px;
	}

	.el-form-item label{
		font-weight: 300;
	}
	.el-form-item__error{
		width : 200px;
	}
</style>
