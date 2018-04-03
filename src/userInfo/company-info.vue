<script>
    import _ from 'lodash';
	import headerbar from "../components/same-headerbar.vue";
	import addsData from "../../res/json/provinceList.json";
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
			this.getCompayInfo();
		},
		data(){
			return {
                // 是否显示弹出框
				dialogVisible : false,
                // 地区json数据
				addsData,
                // 是否可编辑
                isEdit : false,
                // 城市
				cityOption : [],
                // 市区
				areaOption : [],
                // 所有公司信息
                allCompanyInfo : [],
                // 修改的时候信息存储
				companyInfo : {
                    name : '',
                    province : '',
                    city : '',
                    county : '',
                    address : '',
                    company_attr : '',
                    company_boss : '',
                    company_contacts : '',
                    company_file_path : '',
                    company_number : '',
                    company_tel : '',
                    company_type : '',
                    idcard_number : '',
                    is_listed : '',
                    is_review : '',
                    register_money : ''
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
            // 获取个人信息功能
			getCompayInfo(){
				ajaxCustom.ajaxGet(this, "dingoapi/getCompanyInfo", (response)=>{
					console.log(response);
					console.log(response.data);
					if(response.data.length){
						this.allCompanyInfo = response.data;
					}
                    console.log(this.companyInfo);
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
            // 修改企业信息
            editCompany(){
                this.isEdit = !this.isEdit;
                this.companyInfo = JSON.parse(JSON.stringify(this.allCompanyInfo[0]));
            },
			modal(){
				this.dialogVisible = true;
			},
            // 获取路径
			getImgPath(file){
				if(!file){
					return null;
				}
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
            // 提交信息
			submitInfo(name){
				console.log(this.$refs[name]);
				this.$refs[name].validate((valid) => {
					if (valid) {
						if(this.companyInfo.company_file_path==''){
							alert('请上传营业执照！');
							return false;
						}
						this.savePostFile();
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			},
			savePostFile(){
				var formData=new FormData(window.document.getElementById('form'));
				ajaxCustom.ajaxPost(this, "dingoapi/postCompanyInfo", formData,(response)=>{
					console.log(response);
                    alert(response.body.message);
                    this.allCompanyInfo[0] = this.companyInfo;
                    this.isEdit = false;
				},(response)=>{
					console.log(response);
				});
			},
            // 取消提交数据
            cancelSubmit(){
                this.isEdit = false;
            },
		},
	}
</script>
<template>
	<div>
		<headerbar :text="['企业信息', '企业信息']">
			<div class="text_box">
                <div v-if="(!isEdit) ">
                    <template v-for="item in allCompanyInfo">
                        <div class="inline" >
                            <label>企业名称：</label>
                            <span>{{item.name}}</span>
						</div>

						<div class="inline">
                            <label>企业地址：</label>
                            <span>{{item.province}}省</span>
                            <span>{{item.city}}</span>
                            <span>{{item.county}}</span>
                            <span>{{item.address}}</span>
						</div>

						<div class="inline">
                            <label>企业类型：</label>
                            <span>{{item.company_type==1?'终端':'次终端'}}</span>
						</div>

						<div class="inline">
                            <label>企业性质：</label>
                            <span v-if="item.company_attr==1">国有</span>
                            <span v-if="item.company_attr==2">集体</span>
                            <span v-if="item.company_attr==3">外资</span>
                            <span v-if="item.company_attr==5">民营</span>
                            <span v-if="item.company_attr==4">其他</span>
						</div>

						<div class="inline">
                            <label>是否上市：</label>
                            <span>{{item.is_listed==1?'是':'否'}}</span>
						</div>

						<div class="inline">
                            <label>营业执照号码:</label>
                            <span>{{item.company_number}}</span>
						</div>

						<div class="inline">
                            <label>注册资本(万元):</label>
                            <span>{{item.register_money}}</span>
						</div>

						<div class="inline">
                            <label>营业执照:</label>
                            <span>
                                <img :src="getImgPath(item.company_file_path)" alt="">
                            </span>
						</div>

		  				<div class="inline">
                            <label>法定代表人:</label>
                            <span>{{item.company_boss}}</span>
		  				</div>

			  			<div class="inline">
                            <label>联系人:</label>
                            <span>{{item.company_contacts}}</span>
		  				</div>

		  				<div class="inline">
                            <label>联系电话:</label>
                            <span>{{item.company_tel}}</span>
		  				</div>

		  				<div class="inline">
                            <label>身份证号码:</label>
                            <span>{{item.idcard_number}}</span>
		  				</div>
			  			<p style="margin-left: 140px; margin-bottom:20px;">
				  			<el-button type="success"  @click = "editCompany">修改信息</el-button>
			  			</p>
                    </template>
				</div>
				<div v-if="isEdit||(!(allCompanyInfo.length))">
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
					  			<el-button type="danger"  @click = "cancelSubmit()">取消</el-button>
					  			<el-button type="primary"  @click = "submitInfo('companyInfo')">保存信息</el-button>
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
    .inline{
        margin:20px;
    }
    .inline label{
        display: inline-block;
        width: 150px;
        text-align: right;
        font-weight: bold;
        font-size: 14px;
        margin-right: 15px;
    }
    .inline img{
        display: inline-block;
        width: 40%;
        vertical-align:middle;
    }
</style>
