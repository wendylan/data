<!-- active_number ： 传入的值进行侧边栏相对应的选中
identity: 1 为终端，2为次终端，传这个值进来只是为了区分样式以及功能的区分
text ： 需要在右上方显示的文本
-->
<script>
	import { Row, Col, Menu, MenuItem, Submenu, MenuItemGroup } from 'element-ui';
	import { mapActions } from 'vuex';
	import {mapGetters} from 'vuex';
	import axios from 'axios'
	import ajaxCustom from './ajax-custom.js';
	export default{
		props : {
			active_number : {
				type : String
			},
			identity : {
				type : Number,
				default : 1
			},
			text : {
				type : Array
			},
		},
		components : {
			elRow : Row,
			elCol : Col,
			elMenu : Menu,
			elMenuItem : MenuItem,
			elSubmenu : Submenu,
			elMenuItemGroup : MenuItemGroup,

		},
		created(){
			this.getUserInfo();
			this.showSelect();
			this.initMessage();
			this.loadMsgList();
		},
		data(){
			return {
				// 次终端
				navList : [
					{ name : "现货价格指数", link : "/secondaryTerminal", icon : 'fa fa-line-chart margin' },
					{ name : "买买买", link : "/purchase", icon : 'fa fa-shopping-cart margin'},
					{ name : "资源推荐", link : "/stResource", icon : 'fa fa-joomla margin' },
					{ name : "订单管理", childs : [
						{
							title : '项目订单', icon : 'fa fa-tags margin', data : [
								{ name : "采购订单", link : "/purchaseOrder", icon : 'fa  fa-sticky-note margin' },
								{ name : "销售订单", link : "/salesOrder", icon : 'fa  fa-sticky-note margin' },
							]
						},
						{
							title : '买买买订单', icon : 'fa fa-tags margin', data : [
								{ name : "现货订单", link : "/supplier_order", icon : 'fa  fa-sticky-note margin' },
								{ name : "采购订单", link : "/stUserOrder", icon : 'fa  fa-sticky-note margin' }
							]
						}
					], icon : 'fa fa-list margin' },
					{ name : "表单管理", childs : [
						{ name : "采购台账", link : "/form_total#/purchaseForm", icon : 'fa fa-th-list margin' },
						{ name : "结余统计表", link : "/form_total#/countForm", icon : 'fa fa-th-list margin' },
						{ name : "品牌出货表", link : "/form_total#/brandSellForm", icon : 'fa fa-th-list margin' },
						{ name : "供应商出货统计表", link : "/form_total#/suppilerSellForm", icon : 'fa fa-th-list margin' },
						{ name : "项目出货统计表", link : "/form_total#/projectSellForm", icon : 'fa fa-th-list margin' }
					], icon : 'fa fa-th-large margin' },
					{ name : "项目管理", link : "/agentProject#/usercenter", icon : 'fa fa-tasks margin' },
					{ name : "下单助手", link : "/dealing_tool", icon : ' fa fa-wrench margin' },
				],
				// 终端
				navListTerminal : [
					{ name : "网价", link : "/webprice", icon : 'fa fa-bar-chart margin' },
					{ name : "现货价格指数", link : "/mainprice", icon : 'fa fa-line-chart margin' },
					{ name : "下单管理", link : "/userdeal", icon : 'fa fa-shopping-cart margin'},
					{ name : "我的订单", link : "./usercenter#/userorder", icon : 'fa  fa-sticky-note margin'  },
					{ name : "项目管理", link : "./usercenter#/usercenter", icon : 'fa fa-tasks margin' }
				],
				nowIndex : null,
				user : [],
				msgNum:'',
				msgList:{},
				socket: '',
			}
		},
		computed: {
		...mapGetters([
			'getsocket'
		]),
        },
		methods:{
			...mapActions([
				'websocket'
			]),
			hasPermission(permission){
				for(let i = 0; i<this.user.permissions.length; i++){
					if(permission==this.user.permissions[i].name){
						return true;
					}
				}
				return false;
			},
			getUserInfo(){
				ajaxCustom.ajaxGet(this, "dingoapi/getUserInfo", (response)=>{
					response = response.body;
					this.user = response.user;
					console.log(response);
				}, (response)=>{
					alert(response.body.message);
				});
			},
			showSelect(){
				this.nowIndex = this.active_number;
			},
			showColor(){
				if(this.identity == 1){
					return 'nav_header';
				}else{
					return 'nav_header1';
				}
			},
			initMessage(){
				console.log('init....');
				console.log(window.User.id);
				var wsServer = 'ws://192.168.2.108:9501?uid='+window.User.id;
				var ws = new WebSocket(wsServer);
				var that = this;
				console.log(this.$store);
				this.$store.commit('setsocket', ws);
				//onmessage 监听服务器数据推送
				ws.onmessage = function (evt) {
					console.log(evt.data);
					that.msgNum= evt.data;
					that.loadMsgList();
				};
				this.loadMsgList();
			},
			loadMsgList(){
				var that = this;
				var url = '/msg';
					axios.post(url, {
					})
					.then(function (response) {
						that.msgList=response;
						that.msgNum = response.data.length;
						this.msgNum = response.data.length;
					})
					.catch(function (error) {
						console.log(error);
					});
			},
			send_notify() {
                var that = this;
                axios.get(this.sys_notify, {
                            params: {
                            to_uid: this.notify_to,
                            notify_type: this.notify_type
                            }
                        })
                        .then(function (response) {
                            console.log(response);
                            that.getsocket.send(that.notify_to);
                        })
                        .catch(function (response) {
                            console.log(response);
                        });
            },
		},
	}
</script>

<template>
	<div class="content">
		<div class="nav_left">
			<div class="top-left-part">
				<div class="left_box">
					<a href="/stindex" class="logo">
						<img src="/data/images/logoq.png" alt="">
						<span>六六钢铁</span>
					</a>
					<div class="logo_box">
						<a href="/companyInfo">
							<img src="/data/images/icon.png" alt="">
						</a>
						<!-- <span v-if="identity==2">次终端用户</span> -->
						<!-- <span v-else>终端用户</span> -->
						<span>{{ user.name }}</span>
					</div>
				</div>
			</div>
			<template v-if="identity==2">
				<el-row class="tac">
				  	<el-col :span="8">
				    	<el-menu class="el-menu-vertical-demo" theme="dark" :default-active="nowIndex" unique-opened>
							<template v-for="(val, index) in navList">
								<el-menu-item v-if="!val.childs" :index="(index+1).toString()"><i :class="val.icon"></i><a :href="val.link">{{ val.name }}</a></el-menu-item>
			  					<el-submenu v-else :index="(index+1).toString()">
			  					   <template slot="title"><i :class="val.icon"></i>{{ val.name }}</template>
									<template v-for="(value, key) in val.childs">
										<el-menu-item v-if="!value.data" :index="(index+1).toString()+ '-' + (key+1).toString()"><i :class="value.icon"></i><a :href="value.link">{{ value.name }}</a></el-menu-item>
										<el-menu-item-group v-else>
											<template slot="title"><i :class="value.icon"></i>{{ value.title }}</template>
											<el-menu-item v-for="(data, item) in value.data" :index="(index+1).toString() + '-' + (key+1).toString()+'-' + (item+1).toString() "><i :class="data.icon"></i><a :href="data.link">{{ data.name }}</a></el-menu-item>
										</el-menu-item-group>
									</template>
			  				   </el-submenu>
							</template>
				    	</el-menu>
					</el-col>
				</el-row>
			</template>
			<template v-else>
				<el-row class="tac">
				  	<el-col :span="8">
				    	<el-menu class="el-menu-vertical-demo" theme="dark" :default-active="nowIndex">
							<el-menu-item v-for="(val, index) in navListTerminal" :index="(index+1).toString()"><i :class="val.icon"></i><a :href="val.link">{{ val.name }}</a></el-menu-item>
				    	</el-menu>
					</el-col>
				</el-row>
			</template>
		</div>
		<div class="right_con">
			<div class="right_con_top">
				<div :class="showColor()">
					<div class="right_con-left">
						<!-- <h2>现货价</h2> -->
						<!-- <slot></slot> -->
					</div>
					<div class="right_con-right">
						<ul>
							<li class="parent_box">
								<a href="/messageList" title="消息中心">
									<i class="fa fa-envelope"></i>
									<div class="notify"><span class="heartbit"></span><span class="point"></span></div>
								</a>
								<div class="fix_box">
									<p class="same_p">
										<span>订单信息</span>
										<span>2017-06-08 12:25:56</span>
									</p>
									<hr>
									<ul>
										<li>
											<a href="#">this is a test</a>
										</li>
										<li>
											<a href="#">this is a test</a>
										</li>
										<li>
											<a href="#">this is a test</a>
										</li>
										<li>
											<a href="#">this is a test</a>
										</li>
									</ul>
									<hr>
									<p class="p_style">
										<a href="#">查看所有消息</a>
									</p>
								</div>
							</li>
							<li>
								<a href="/companyInfo" title="设置">
									<i class="fa fa-cog margin" ></i>
									<div class="notify"><span class="heartbit"></span><span class="point"></span></div>
								</a>
							</li>
							<li>
								<a href="/admin/logout" title="退出登录">
									<i class="fa fa-sign-out margin"></i>
								</a>
							</li>
						</ul>
					</div>
				</div>
				<div class="nav_middle">
					<!-- <slot name="title"></slot> -->
					<div class="text_lent">
						<span>{{ text[0] }}</span>
						<!-- <h5>{{ text[1] }}</h5> -->
						<!-- <slot></slot> -->
					</div>
				</div>
			</div>
			<div class="right_con_main">
				<slot></slot>
			</div>
		</div>
	</div>
</template>

<style scoped>
	.margin{
		margin-right: 10px;
		font-size: 16px;
	}
	*{
		/*font-family:"微软雅黑";*/
		margin: 0;
	}
	a,a:hover{
		text-decoration: none;
	}
	.content:after {
        clear: both;
        content: " ";
        display: table;
    }
    .nav_left, .right_con {
        float: left;
    }
    .content {
        padding-left: 210px;
    }
    .right_con {
        width: 100%;
    }
    .nav_left {
        width: 220px;
        margin-left: -220px;
        height: 100%;
        color: #fff;
		background-color: #324157;
    }
    .right_con_main{
    	margin: 0 auto;
		padding-left: 15px;
		padding-right: 15px;
		margin-top: 20px;
		max-width: 1280px;
    }

	.left_box{
		margin: 0 auto;
		text-align: left;
		margin-top: 10px;
	}
	.logo{
		color: #fff;
		margin-left: 28px;
	}
	.logo img{
		display: inline-block;
		width: 48px;
		height: 48px;
		vertical-align: bottom;
	}
	.logo span{
		font-size: 20px;
		line-height: 48px;
	}
	.logo_box{
		text-align: center;
		/*margin-top: 10px;*/
	}
	.logo_box img{
		text-align: center;
		margin: 0 auto;
		display: block;
		width: 55px;
		height: 55px;
		border-radius: 50%;
		border: 1px solid #fff;
	}
	.logo_box a{
		color: #fff;
		font-size: 12px;
	    width: 55px;
		height: 55px;
		display: block;
		margin: 0 auto;
	}
	.logo_box span{
		margin-top: 5px;
	}
	.top-left-part{
		margin-bottom: 10px;
	}
	.nav_left .tac .el-menu-vertical-demo{
		width: 220px;
		height: 100%;
	}
	.nav_left .tac .el-menu-vertical-demo a{
		color: #fff;
	}
	.el-menu-item a{
		display: inline-block;
		width: 99%;
		height: 56px;
		line-height: 56px;
	}
	ul li.is-active{
		background: #48576a;
		font-weight: bold;
	}
	@media (min-width: 768px){
		.nav_left{
			width: 220px;
			height: 100%;
			color: #fff;
			background-color: #324157;
			position: fixed;
		}
	}

	li{
		list-style: none;
	}
	.nav_header{
		background: #01c0c8;
		width: 100%;
		height: 60px;
	}
	.nav_header1{
		background: #a0aec4;
		width: 100%;
		height: 60px;
	}
	.nav_middle{
		background: #fff;
		width: 100%;
		height: 60px;
		line-height: 60px;
		text-align: center;
	}
	.right_con-left{
		float: left;
		width: 40%;
	}
	.right_con-left h2{
		height: 60px;
		line-height: 60px;
		color: #fff;
	}
	.right_con-right{
		float: right;
		margin-right: 120px;
		height: 60px;
		line-height: 60px;
	}
	.right_con-right ul li{
		float: left;
		height: 60px;
		line-height: 60px;
		width: 30px;
	}
	.right_con-right ul li a{
		position: relative;
		display: block;
		width: 30px;
		height: 60px;
		line-height: 60px;
		min-height: 60px;
	}
	.nav_header .right_con-right ul li a:hover{
		background-color: #10E9E8;
	}
	.nav_header1 .right_con-right ul li a:hover{
		background-color: #99a9bf;
	}
	.right_con-right ul li i{
		display: inline-block;
		width: 30px;
		height: 60px;
		line-height: 60px;
		text-align: center;
		color: #fff;
		vertical-align: bottom;
	}
	.notify {
	    position: relative;
	    margin-top: -20px;
	}
	.notify .heartbit {
	    position: absolute;
	    top: -30px;
	    right: -4px;
	    height: 25px;
	    width: 25px;
	    z-index: 10;
	    border: 5px solid #fb9678;
	    border-radius: 70px;
	    -moz-animation: heartbit 1s ease-out;
	    -moz-animation-iteration-count: infinite;
	    -o-animation: heartbit 1s ease-out;
	    -o-animation-iteration-count: infinite;
		-webkit-animation: heartbit 1s ease-out;
		-webkit-animation-iteration-count: infinite;
		animation-iteration-count: infinite;
	}
	.notify .point {
	    position: absolute;
	    width: 6px;
	    height: 6px;
	    -webkit-border-radius: 30px;
	    -moz-border-radius: 30px;
	    border-radius: 30px;
	    background-color: #fb9678;
	    right: 6px;
	    top: -20px;
	}
	@keyframes heartbit{
		0%{-webkit-transform:scale(0);opacity:0}
		25%{-webkit-transform:scale(.1);opacity:.1}
		50%{-webkit-transform:scale(.5);opacity:.3}
		75%{-webkit-transform:scale(.8);opacity:.5}
		100%{-webkit-transform:scale(1);opacity:0}
	}
	@-moz-keyframes heartbit{
		0%{-webkit-transform:scale(0);opacity:0}
		25%{-webkit-transform:scale(.1);opacity:.1}
		50%{-webkit-transform:scale(.5);opacity:.3}
		75%{-webkit-transform:scale(.8);opacity:.5}
		100%{-webkit-transform:scale(1);opacity:0}
	}
	@-webkit-keyframes heartbit{
		0%{-webkit-transform:scale(0);opacity:0}
		25%{-webkit-transform:scale(.1);opacity:.1}
		50%{-webkit-transform:scale(.5);opacity:.3}
		75%{-webkit-transform:scale(.8);opacity:.5}
		100%{-webkit-transform:scale(1);opacity:0}
	}
	.text_lent{
		text-align: left;
		height: 60px;
		line-height: 1;
	}
	.text_lent span{
		font-size:20px;
		width: 40%;
		display: inline-block;
		height: 60px;
		line-height: 60px;
		margin-left: 120px;
		color: #666;
	}

	.parent_box{
		position: relative;
	}
	.nav_header .fix_box{
		background-color:#01c0c8;
		width: 200px;
		position: absolute;
		top: 60px;
		left: -30px;
		border:1px solid #dedede;
		display: none;
		z-index: 2;
	}
	.nav_header1 .fix_box{
		background-color:#a0aec4;
		width: 200px;
		position: absolute;
		top: 60px;
		left: -30px;
		border:1px solid #dedede;
		display: none;
		z-index: 2;
	}
	.parent_box:hover .fix_box{
		display: block;
	}
	.fix_box ul{
		display: block;
		padding: 0;
		margin: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	.fix_box ul li{
		width: 100%;
		display: block;
		height: 30px;
		padding: 0;
		margin: 0;
	}
	.same_p{
		margin:0;
		padding: 0;
		height: 30px;
		line-height: 30px;
	}
	.fix_box ul li a{
		padding-left: 10px;
		height: 30px;
		line-height: 30px;
		min-height: 30px;
		display: inline-block;
		width: 100%;
		color: #fff;
		font-weight: bold;
		white-space:nowrap;
		overflow:hidden;
		text-overflow:ellipsis;
	}
	.fix_box .same_p span{
		margin: 0 5px;
		height: 30px;
		line-height: 30px;
		width: 50%;
		font-size: 12px;
		color: #fff;
		opacity: 0.5;
	}
	.fix_box .p_style a{
		width: 100%;
		height: 30px;
		line-height: 30px;
		min-height: 30px;
		display: block;
		color: #fff;
		text-align: center;
	}
</style>
