<script>
	import headerbar from '../../components/admin-headerbar.vue';
	import ajaxCustom from '../../components/ajax-custom.js';
	import{ Button, Dialog, Form, FormItem, Select, Option, Input, Upload } from 'element-ui';
	export default{
		created(){
			this.getBrandInfo();
		},
		components : {
			headerbar,
			elButton : Button,
			elDialog : Dialog,
			elForm : Form,
			elFormItem : FormItem,
			elSelect : Select,
			elOption : Option,
			elInput : Input,
			elUpload : Upload,
		},
		data(){
			return{
                // 品牌详细信息数组
				brandDetail : [],
				isEdit : -1,
                // 修改时候的数据存储
				tempBrandDetail : {},
                // 新建弹出框是否打开
				dialogFormVisible : false,
                // 新增一条品牌信息的对象
				newBrandDetail : {
					brands : '',
					context : '',
					cate_spec : '',
					cate_style : '',
                    // 重量标准
					weight_standard : '',
                    // 运输方式
					transport_way : '',
                    // 钢厂三证
					steel_certificate : [
						{ type : 'first',value : ''},
						{ type : 'second',value : ''},
						{ type : 'third',value : ''}
					],
                    // 质量认证书
					quality_certificate : '',
                    // 供应商
					supplier : [
                        {
                            name : ''
                        }
                    ]
				},
			}
		},
		methods : {
			// 获取品牌详情数据
			getBrandInfo(){
				ajaxCustom.ajaxGet(this, 'dingoapi/getBrandInfo', (response)=>{
					console.log(response);
					this.brandDetail = response.body.data;
                    console.log(this.brandDetail);
					if(this.brandDetail.length){
						this.brandDetail = response.body.data.reverse();
					}
				}, (response)=>{
					console.log(response);
				});
			},
            // 新增一条品牌信息
			newOneBrandInfo(){
                console.log(this.newBrandDetail);
                var form=document.getElementById("formAdd");
                var fd =new FormData(form);
                $.ajax({
                     url: "dingoapi/addBrandInfo",
                     type: "POST",
                     data: fd,
                     processData: false,  // 告诉jQuery不要去处理发送的数据
                     contentType: false,   // 告诉jQuery不要去设置Content-Type请求头
                     success: function(response){
                        console.log(response);
                        this.brandDetail = response.data.reverse();
                        location.reload();
                     }
                });
                this.dialogFormVisible = false;
                return false;
			},
			// 修改一条数据
			editBrandDetail(index){
				this.isEdit = index;
				this.tempBrandDetail = JSON.parse(JSON.stringify(this.brandDetail[index]));
			},
			// 删除一条数据
			delBrandDetail(index, id){
				var dataId = id;
				var _this = this;
				ajaxCustom.ajaxPost(this,'dingoapi/delBrandInfo', { id : dataId }, (responese)=>{
					console.log(responese);
					if(responese.body.status_code == 200){
						alert(responese.body.message);
						_this.brandDetail.splice(index, 1);
					}else{
						alert(responese.body.message);
					}
				},(responese)=>{
					alert(responese.body.message);
				} );
			},
			// 保存修改
			saveChanging(index){
				delete this.tempBrandDetail.created_at;
				delete this.tempBrandDetail.updated_at;
                var form=document.getElementById("form");
                var fd =new FormData(form);
                var that = this;
                $.ajax({
                     url: "dingoapi/editBrandInfo",
                     type: "POST",
                     data: fd,
                     processData: false,  // 告诉jQuery不要去处理发送的数据
                     contentType: false,   // 告诉jQuery不要去设置Content-Type请求头
                     success: function(response){
                        console.log(response);
                        location.reload();
                     }
                });
                return false;

			},
			// 取消修改
			cancelChanging(){
				this.isEdit = -1;
			},
			// 右侧边的固定栏
			moveToBrand(brand){
				let tablesDom = document.getElementsByTagName("table");
				for(let data of tablesDom){
					if(data.attributes["data-brand"].value == brand){
						// 解决兼容性问题
						document.body.scrollTop = data.offsetTop;
						document.documentElement.scrollTop = data.offsetTop;
						window.pageYOffset  = data.offsetTop;
					}
				}
			},
            // 获取图片路径
			getImgPath(file){
				if(file){
					if(file.length<13){
						return null;
					}
					if(file.substr(0, 4)=='data'){
						return file;
					}
					let filename = '/'+file.substr(13);
					return filename;
				}
			},
			handleAvatarSuccess(res, file) {
				this.tempBrandDetail.weight_standard = URL.createObjectURL(file.raw);
			},
            // 增加供应商
            addSupplier(){
                this.newBrandDetail.supplier.push(
                    {
                        name : null
                    }
                );
            },
            // 删除供应商
            delSupplier(index){
                if(this.newBrandDetail.supplier.length > 1){
					this.newBrandDetail.supplier.splice(index, 1);
				}
            },
            addSupplierData(){
                this.tempBrandDetail.supplier.push(
                    {
                        name : null
                    }
                );
            },
            // 删除供应商
            delSupplierData(index){
                if(this.tempBrandDetail.supplier.length > 1){
					this.tempBrandDetail.supplier.splice(index, 1);
				}
            },
		},
	}
</script>
<template>
	<headerbar active_number="5-6" :text="['品牌详情','查看/编辑品牌详情简称']">
		<div class="img_box">
			<div class="left-jump-bar">
				<div class="brand" v-for="datas in brandDetail" @click="moveToBrand(datas.brands)">{{ datas.brands }}</div>
			</div>

			<div style="background-color: #fff;padding: 10px 15px;">
				<el-button @click="dialogFormVisible=true" type="primary">新建</el-button>
			</div>

			<div class="table_box">
				<table v-for="(item, index) in brandDetail" :data-brand="item.brands" class="same_table">
					<template v-if="isEdit!=index">
						<tr>
							<th>品牌</th>
							<td>{{item.brands}}</td>
						</tr>
						<tr>
							<th>基本资料</th>
							<td style="text-align:left;padding-left:20px;">{{item.context}}</td>
						</tr>
						<tr>
							<th>生产规格</th>
							<td style="text-align:left;padding-left:20px;">{{ item.cate_spec }}</td>
						</tr>
						<tr>
							<th>钢牌/钢标样式</th>
							<td>
								<img :src="getImgPath(item.cate_style)" alt="" class="img_style">
							</td>
						</tr>
						<tr>
							<th>理计重量标准</th>
							<td>
								<img :src="getImgPath(item.weight_standard)" alt="" class="img_style">
							</td>
						</tr>
						<tr>
							<th>承运方式</th>
							<td>{{ item.transport_way }}</td>
						</tr>
						<tr>
							<th>钢厂三证</th>
							<template v-for="data in item.steel_certificate">
								<img :src="getImgPath(data.value)" alt="" class="img_style">
							</template>
						</tr>
						<tr>
							<th>质量认证书</th>
							<td>
								<img :src="getImgPath(item.quality_certificate)" alt="" class="img_style">
							</td>
						</tr>
						<tr>
							<th>广东区域供应商</th>
                            <td>
                                <span v-for="data in item.supplier">{{ data.name }}, </span>
                            </td>
						</tr>
						<tr>
							<th>操作</th>
							<td>
								<el-button size="small" @click="editBrandDetail(index)">修改</el-button>
								<el-button size="small" type="danger" @click="delBrandDetail(index, item.id)">删除</el-button>
							</td>
						</tr>
					</template>
					<template v-else>
						<el-form :model="tempBrandDetail" ref="tempBrandDetail" >
							<form id="form" name="form" enctype="multipart/form-data" >
								<tr>
									<th>品牌</th>
									<td  class="same_padding">
										<el-form-item prop="brands" label="" >
											<el-input size="small" name="brands"  v-model='tempBrandDetail.brands' type="text"></el-input>
											<el-input size="small" name="id"  v-model='tempBrandDetail.id' type="text" style="display:none;"></el-input>
										</el-form-item>
									</td>
								</tr>
								<tr>
									<th>基本资料</th>
									<td class="same_padding">
										<el-form-item prop="context" label="" >
											<el-input size="small" name="context"  v-model='tempBrandDetail.context' type="textarea" autosize></el-input>
										</el-form-item>
									</td>
								</tr>
								<tr>
									<th>生产规格</th>
									<td class="same_padding">
										<el-form-item prop="cate_spec" label="" >
											<el-input size="small" name="cate_spec"  v-model='tempBrandDetail.cate_spec' type="text"></el-input>
										</el-form-item>
									</td>
								</tr>
								<tr>
									<th>钢牌/钢标样式</th>
									<td style="width:100%">
										<el-form-item prop="cate_style" label="">
											<el-upload action="" :auto-upload="false" name="cate_style">
												<el-button size="small" type="primary">点击上传</el-button>
											</el-upload>
										</el-form-item>

									</td>
								</tr>
								<tr>
									<th>理计重量标准</th>
									<td>
										<el-form-item prop="weight_standard" label="" >
											<el-upload action="" :auto-upload="false" name="weight_standard">
												<el-button size="small" type="primary">点击上传</el-button>
											</el-upload>
										</el-form-item>
									</td>
								</tr>
								<tr>
									<th>承运方式</th>
									<td class="same_padding">
										<el-form-item prop="transport_way" label="" >
											<el-input size="small" name="transport_way"  v-model='tempBrandDetail.transport_way' type="text"></el-input>
										</el-form-item>
									</td>
								</tr>
								<tr>
									<th>钢厂三证</th>
									<td>
										<el-form-item label="" prop="steel_certificate">
											<el-upload action="" :auto-upload="false" name="first">
												<el-button size="small" type="primary">点击上传</el-button>
											</el-upload>
											<el-upload action="" :auto-upload="false" name="second">
												<el-button size="small" type="primary">点击上传</el-button>
											</el-upload>
											<el-upload action="" :auto-upload="false" name="third">
												<el-button size="small" type="primary">点击上传</el-button>
											</el-upload>
										</el-form-item>

									</td>

								</tr>
								<tr>
									<th>质量认证书</th>
									<td>
										<el-form-item prop="quality_certificate" label="" >
											<el-upload action="" :auto-upload="false" name="quality_certificate">
												<el-button size="small" type="primary">点击上传</el-button>
											</el-upload>
										</el-form-item>
									</td>

								</tr>
								<tr>
									<th>广东区域供应商</th>
									<td class="same_padding">
                                        <template v-for="(item, index) in tempBrandDetail.supplier" >
            								<p>
            									<el-input size="small" name="supplier[]" type="text" v-model="item.name" style="width:50%;"></el-input>
            									<el-button size="small" @click="delSupplierData(index)" :disabled="tempBrandDetail.supplier.length ==1? true:false" >删除</el-button>
            								</p>
            							</template>
                                        <el-button type="primary" @click="addSupplierData" size="small">增加</el-button>
									</td>
								</tr>
								<tr>
									<th>操作</th>
									<td>
										<el-button size="small" type="info" @click="saveChanging()">保存</el-button>
										<el-button size="small" @click="cancelChanging()">取消</el-button>
									</td>
								</tr>
							</form>
						</el-form>
					</template>
				</table>
				<br>
			</div>

			<!-- 新增品牌详情弹出框 -->
			<el-dialog title="新增品牌详情" v-model="dialogFormVisible">
				<el-form :model="newBrandDetail" ref="newBrandDetail" label-width="150px">
					<form id="formAdd" name="formAdd" enctype="multipart/form-data" >
						<el-form-item label="品牌名称" prop="brands">
							<el-input size="small" name="brands" v-model="newBrandDetail.brands" auto-complete="off" class="input_style"></el-input>
						</el-form-item>
						<el-form-item label="基本资料" prop="context">
							<el-input size="small" name="context" type="textarea" v-model="newBrandDetail.context" autosize class="input_style"></el-input>
						</el-form-item>
						<el-form-item label="生产规格" prop="cate_spec">
							<el-input size="small" name="cate_spec" v-model="newBrandDetail.cate_spec" auto-complete="off" class="input_style"></el-input>
						</el-form-item>
						<el-form-item label="钢牌/钢标样式" prop="cate_style" >
							<el-upload action="" :auto-upload="false" name="cate_style">
								<el-button size="small" type="primary">点击上传</el-button>
							</el-upload>
						</el-form-item>
						<el-form-item label="理计重量标准" prop="weight_standard" >
							<el-upload action="" :auto-upload="false" name="weight_standard">
								<el-button size="small" type="primary">点击上传</el-button>
							</el-upload>
						</el-form-item>
						<el-form-item label="承运方式" prop="transport_way">
							<el-input size="small" name="transport_way" v-model="newBrandDetail.transport_way" auto-complete="off" class="input_style"></el-input>
						</el-form-item>
						<el-form-item label="钢厂三证" v-for="data in newBrandDetail.steel_certificate">
							<el-upload action="" :auto-upload="false" :name="data.type">
								<el-button size="small" type="primary">点击上传</el-button>
							</el-upload>
						</el-form-item>
						<el-form-item label="质量认证书" prop="quality_certificate">
							<el-upload action="" :auto-upload="false" name="quality_certificate">
								<el-button size="small" type="primary">点击上传</el-button>
							</el-upload>
						</el-form-item>
						<el-form-item label="广东区域供应商" >
                            <template v-for="(item, index) in newBrandDetail.supplier" >
                                <p>
                                    <el-input size="small" type="text" v-model="item.name"  name="supplier[]" class="input_style"></el-input>
                                    <el-button size="small" @click="delSupplier(index)" :disabled="newBrandDetail.supplier.length ==1? true:false" >删除</el-button>
                                </p>
                            </template>
                            <el-button type="primary" @click="addSupplier" size="small">增加</el-button>
						</el-form-item>
					</form>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click="dialogFormVisible = false">取 消</el-button>
					<el-button type="primary" @click="newOneBrandInfo()">确 定</el-button>
				</div>
			</el-dialog>
		</div>

	</div>
	</headerbar>
</template>
<style scoped>
	h1,h4{
		font-weight:400;
	}
	h4{
		color:#8492A6;
	}
	.table_box{
		margin-top:20px;
		clear:both;
	}
	.same_table{
		background:#fff;
		padding:15px;
		width:100%;
		margin-top: 20px;
	}
	.table_box tr{
		width: 100%;
	}
	.table_box th, td{
		text-align: center;
		font-size: 18px;
		padding: 10px 0px;
		border: 1px solid #dfe6ec;
	}
	.table_box th{
		width: 15%;
	}
	.table_box tr:hover{
		background-color:#e0e6ed;
	}
	.same_padding{
		text-align:left;
		padding:8px 20px;
	}

	.left-jump-bar{
		position:fixed;
		right:0;
		top:120px;
		width: 100px;
		border-top-left-radius:7px;
		border-bottom-left-radius: 7px;
		color:white;
		background:#a0aec4;
		text-align:center;
		font-size: 16;
    	font-weight: 700;
	}
	.left-jump-bar:hover{
		opacity: 1;
	}
	.brand{
		padding : 2px;
	}
	.brand:hover{
		cursor:pointer;
		background:#324157;
	}
	.input_style{
		display:inline-block;
		width:80%;
	}
	.img_style{
		display:inline-block;
		width:30%;
		height:auto;
	}

</style>
