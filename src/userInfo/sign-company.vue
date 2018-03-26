<script>
    import _ from 'lodash';
	import addsData from "../../res/json/provinceList.json";
	import ajaxCustom from '../components/ajax-custom.js';
	import { Select, Option, Radio, Dialog, Input, Button, Form, FormItem} from 'element-ui';
	export default {
		components : {
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
			this.getCompayInfo();
		},
		data(){
			return {
                // 查看图片弹出框
				dialogVisible : false,
                // 是否修改
				showCheck : false,
				addsData,
                // 市区
				cityOption : [],
                // 地区
				areaOption : [],
                // 企业信息
				companyInfo : {
					company_file : null,
					province : '',
					city : '',
					county : '',
					address : '',
					company_attr : '',
					company_boss : '',
					company_file_path : '',
					company_number : '',
					company_contacts : '',
					company_tel : '',
					company_type : '',
					idcard_number : '',
					id : '',
					is_listed : '',
					is_review : '',
					name : '',
					register_money : '',
					user_id : ''
				},
				rules : {
					name : [
						{ required: true, message: '请输入活动名称', trigger: 'blur' },
					],
					is_listed : [
						{ type:'number', required: true, message: '请输入是否上市', trigger: 'blur' },
					],
					register_money : [
						{ required: true, message: '请输入注册资本', trigger: 'blur' },
					],
					idcard_number : [
						{ required: true, message: '请输入身份证号码', trigger: 'blur' },
					],
					company_contacts : [
						{ required: true, message: '请输入联系人', trigger: 'blur' },
					],
					company_tel : [
						{ required: true, message: '请输入联系电话', trigger: 'blur' },
					],
					company_number : [
						{ required: true, message: '请输入营业执照号码', trigger: 'blur' },
					],
					company_attr : [
						{ required: true, message: '请选择企业性质', trigger: 'blur' },
					],
					company_type : [
						{ required: true, message: '请选择企业类型', trigger: 'blur' },
					],
					company_boss : [
						{ required: true, message: '请选择企业法人', trigger: 'blur' },
					],

				}
			}
		},
		methods : {
            // 获取企业信息
			getCompayInfo(){
				ajaxCustom.ajaxGet(this, "dingoapi/getCompanyInfo", (response)=>{
					console.log(response);
					if(response.data.length){
						this.companyInfo = response.data[0];
						this.showCheck = true;
					}
				}, (response)=>{
					alert(response.body.message);
				});
			},
            // 获取市区
			getCity(){
                this.cityOption = _.find(this.addsData.province, ['name', this.companyInfo.province]).cityList;
			},
            // 获取地区
			getArea(){
                this.areaOption = _.find(this.cityOption, ['name', this.companyInfo.city]).areaList;
				let data = {
					city : this.companyInfo.city,
					area : this.companyInfo.county
				}
				this.$emit("change", data);
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
					this.companyInfo.company_file = files[0];
					reader.readAsDataURL(files[0]);
					var this_ = this;
					reader.onload = function(e){
						this_.companyInfo.company_file_path = e.target.result;
					}
				}
			},
			submitInfo(name){
				this.$refs[name].validate((valid) => {
					if (valid) {
						if(this.companyInfo.company_file_path==''){
							alert('请上传营业执照！');
							return false;
						}
						window.document.getElementById('form').submit();
						this.showCheck = true;
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
	<div class="main_box" v-if="!showCheck">
		<div class="nav_middle">
			<h1 style="font-weight: 300;">请录入您的企业信息:</h1>
		</div>
		<div class="text_box">
			<el-form :model="companyInfo" :rules="rules" ref="companyInfo"  label-width="150px" >
				<form id="form" method="POST" action="dingoapi/postCompanyInfo" enctype="multipart/form-data" >

					<div class="inline_box" >
						<el-form-item prop="name" label="企业名称" >
							<el-input name="company"  v-model='companyInfo.name' type="text"></el-input>
						</el-form-item>
					</div>

					<div class="inline_box">
						<el-form-item prop="adds" label="企业地址">
							<el-select name="province" v-model="companyInfo.province" @change="getCity" >
								<el-option v-for="item in addsData.province" :label="item.name" :value="item.name"></el-option>
							</el-select>
							<el-select name="city" v-model="companyInfo.city" @change="getArea()"  placeholder="城市">
								<el-option v-for="item in cityOption " :label="item.name" :value="item.name"></el-option>
							</el-select>
							<el-select name="county" v-model="companyInfo.county"  placeholder="区\县" >
								<el-option v-for="item in areaOption " :label="item" :value="item"></el-option>
							</el-select>
							<el-input name="address" v-model="companyInfo.address" placeholder="详细地址"></el-input>
						</el-form-item>
					</div>

					<div class="inline_box">
						<el-form-item prop="company_type" label="企业类型">
							<el-radio  name="company_type" v-model='companyInfo.company_type' label="1" class="radio" >终端</el-radio>
							<el-radio  name="company_type" v-model='companyInfo.company_type' label="2" class="radio" >次终端</el-radio>
						</el-form-item>
					</div>

					<div class="inline_box">
						<el-form-item prop="company_attr" label="企业性质">
							<el-radio name="company_attr" v-model='companyInfo.company_attr' label="1" class="radio" >国有</el-radio>
							<el-radio name="company_attr" v-model='companyInfo.company_attr' label="2" class="radio" >集体</el-radio>
							<el-radio name="company_attr" v-model='companyInfo.company_attr' label="3" class="radio" >外资</el-radio>
							<el-radio name="company_attr" v-model='companyInfo.company_attr' label="5" class="radio" >民营</el-radio>
							<el-radio name="company_attr" v-model='companyInfo.company_attr' label="4" class="radio" >其他</el-radio>
						</el-form-item>
					</div>

					<div class="inline_box">
						<el-form-item prop="is_listed" label="是否上市" >
							<el-radio name="is_listed" v-model='companyInfo.is_listed' :label="1" class="radio" >是</el-radio>
							<el-radio name="is_listed" v-model='companyInfo.is_listed' :label="2" class="radio" >否</el-radio>
						</el-form-item>
					</div>

					<div class="inline_box">
						<el-form-item prop="company_number" label="营业执照号码">
							<el-input name="company_number" v-model="companyInfo.company_number" ></el-input>
						</el-form-item>
					</div>

					<div class="inline_box">
						<el-form-item prop="register_money" label="注册资本(万元)">
							<el-input name="register_money" v-model="companyInfo.register_money" ></el-input>
						</el-form-item>
					</div>

					<div class="inline_box">
						<el-form-item prop="company_file_path" label="营业执照">
							<input id='file'  type="file"  @change='fileChanged' name="company_file_path" v-show = 'false'/>
							<template v-if="companyInfo.company_file_path!=''&& companyInfo.company_file_path!=null">
								<el-button   @click="modal()">查看</el-button>
								<el-button  @click="modifyFile()">修改</el-button>
							</template>
							<template v-if="companyInfo.company_file_path==''||companyInfo.company_file_path==null">
								<el-button  @click="modifyFile()">上传</el-button>
								<el-button   @click="modal()">查看</el-button>
							</template>
							<el-dialog title="提示" v-model="dialogVisible">
								<img :src="getImgPath(companyInfo.company_file_path)" alt="" style="display:block;width:100%;">
								<span slot="footer" class="dialog-footer">
									<el-button @click="dialogVisible = false">取 消</el-button>
									<el-button type="primary" @click="dialogVisible = false">确 定</el-button>
								</span>
							</el-dialog>
						</el-form-item>
					</div>

	  				<div class="inline_box">
		  				<el-form-item prop="company_boss" label="法定代表人">
		  					<el-input name="company_boss" v-model="companyInfo.company_boss" ></el-input>
		  				</el-form-item>
	  				</div>

		  			<div class="inline_box">
		  				<el-form-item prop="company_contacts" label="联系人">
		  					<el-input name="company_contacts" v-model="companyInfo.company_contacts" ></el-input>
		  				</el-form-item>
	  				</div>

	  				<div class="inline_box">
		  				<el-form-item prop="company_tel" label="联系电话">
		  					<el-input name="company_tel" v-model="companyInfo.company_tel" :maxlength="11" :minlength="13"></el-input>
		  				</el-form-item>
	  				</div>

	  				<div class="inline_box">
		  				<el-form-item prop="idcard_number" label="身份证号码">
		  					<el-input name="idcard_number" v-model="companyInfo.idcard_number" :maxlength="18" :minlength="18"></el-input>
		  				</el-form-item>
	  				</div>
		  			<p style="margin-left: 140px;">
			  			<el-button type="primary"  @click = "submitInfo('companyInfo')">提交信息</el-button>
		  			</p>
				</form>
			</el-form>
		</div>
	</div>
	<div class="main_check" v-else>
		<h1>审核中...</h1>
		<el-button style="width: 120px;">
			<a href="/admin/logout">退出登录</a>
		</el-button>
		<el-button type="success" @click="showCheck=!showCheck" style="width: 120px;">修改企业信息</el-button>
	</div>
</div>
</template>
<style scoped>
	a{
		text-decoration: none;
	}
	.main_box{
		width: 80%;
		height: 100%;
		margin: 0 auto;
		max-width: 1280px;
	}
	.main_check{
		width: 80%;
		height: 300px;
		margin: 100px auto;
		max-width: 800px;
		background: #fff;
		text-align: center;
		padding-top: 100px;
	}
	.text_box{
		width: 100%;
		margin: 0 auto;
		padding:15px;
		padding-top: 10px;
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
	.nav_middle{
		background: #fff;
		width: 100%;
		height: 60px;
		line-height: 60px;
		padding:0 15px;
		margin:0px auto 20px auto;
	}
</style>
