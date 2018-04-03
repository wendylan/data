<!-- active_number ： 传入的值进行侧边栏相对应的选中
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
            // 左侧栏的active显示
			active_number : {
				type : String
			},
            // 右上方的文本显示
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
			// this.initMessage();
			this.loadMsgList();
		},
		data(){
			return {
				navList : [
					{
						name : "现货价格指数",
						link : "/secondaryTerminal",
						icon : 'fa fa-line-chart margin',
						index : 'secondaryTerminal',
						roles : ['次终端用户'],
						permission : '现货价格指数'
					},
					{
						name : "现货价格指数",
						link : "/mainprice",
						icon : 'fa fa-line-chart margin',
						index : 'mainprice',
						roles : ['终端用户'],
						permission : '现货价格指数'
					},
                    {
                        name : "网价",
                        link : "/webprice",
                        icon : 'fa fa-bar-chart margin',
                        index : 'webPrice',
                        roles : ['次终端用户', '终端用户'],
                        permission : '网价'
                    },
					{
						name : "买买买",
						link : "/purchase",
						icon : 'fa fa-shopping-cart margin',
						index : 'purchase',
						roles : ['次终端用户'],
						permission : '买买买'
					},
					{
						name : "资源推荐",
						link : "/stResource",
						icon : 'fa fa-joomla margin',
						index : 'stResource',
						roles : ['次终端用户', '终端用户'],
						permission : '资源推荐'
					},
					{
						name : "订单管理",
						childs : [
							{
								title : '项目订单', icon : 'fa fa-tags margin', data : [
									{ name : "采购订单", link : "/purchaseOrder", icon : 'fa  fa-sticky-note margin', index : 'purchaseOrder' },
									{ name : "销售订单", link : "/salesOrder", icon : 'fa  fa-sticky-note margin', index : 'salesOrder' },
								]
							},
							{
								title : '买买买订单', icon : 'fa fa-tags margin', data : [
									{ name : "现货订单", link : "/supplier_order", icon : 'fa  fa-sticky-note margin', index : 'supplier_order', roles : ['运营中心'] },
									{ name : "采购订单", link : "/stUserOrder", icon : 'fa  fa-sticky-note margin', index : 'stUserOrder' }
								]
							}
						],
						icon : 'fa fa-list margin',
						index : 'orderManage',
						roles : ['次终端用户'],
						permission : '订单管理'
					},
					{
						name : "表单管理",
						childs : [
							{ name : "采购台账", link : "/form_total#/purchaseForm", icon : 'fa fa-th-list margin', index : 'purchaseForm' },
							{ name : "结余统计表", link : "/form_total#/countForm", icon : 'fa fa-th-list margin', index : 'countForm' },
							{ name : "品牌出货表", link : "/form_total#/brandSellForm", icon : 'fa fa-th-list margin', index : 'brandSellForm' },
							{ name : "供应商出货统计表", link : "/form_total#/suppilerSellForm", icon : 'fa fa-th-list margin', index : 'suppilerSellForm' },
							{ name : "项目出货统计表", link : "/form_total#/projectSellForm", icon : 'fa fa-th-list margin', index : 'projectSellForm' }
						],
						icon : 'fa fa-th-large margin',
						index : 'form_total',
						roles : ['次终端用户'],
						permission : '表单管理'
					},
					{
						name : "下单助手",
						link : "/dealing_tool",
						icon : ' fa fa-wrench margin',
						index : 'dealing_tool',
						roles : ['次终端用户'],
						permission : '下单助手'
					},
					{
						name : "下单管理",
						link : "/userdeal",
						icon : 'fa fa-shopping-cart margin',
						index : 'userDeal',
						roles : ['次终端用户', '终端用户'],
						permission : '下单管理'
					},
					{
						name : "我的订单",
						link : "./usercenter#/userorder",
						icon : 'fa  fa-sticky-note margin',
						index : 'terminalUserorder',
						roles : ['终端用户'],
						permission : '我的订单'
					},
					{
						name : "项目管理",
						link : "/agentProject#/usercenter",
						icon : 'fa fa-tasks margin',
						index : 'secondUsercenter',
						roles : ['次终端用户'],
						permission : '项目管理'
					},
					{
						name : "项目管理",
						link : "./userprojectmanager",
						icon : 'fa fa-tasks margin',
						index : 'terminalUsercenter',
						roles : ['终端用户'],
						permission : '项目管理'
					},

					{ name : "历史数据", link : "./historyData.html", icon : 'fa fa-tasks margin', index:"historyData", roles: ['前台数据管理员'], permission: "-" },
					{ name : "数据管理", link : "./dataManage.html", icon : ' fa fa-wrench margin', index: "dataManage", roles: ['前台数据管理员'], permission: "-" },
					{ name : "后台数据", 
						childs : [
							// { name : "市场价格数据", link : "/dataManage.html#/market_price_data", icon : 'fa fa-th-list margin', index: 'market_price_data' },
							// { name : "品牌数据", link : "admin/product", icon : 'fa fa-th-list margin', index: 'product' },
							{ name : "运费数据", link : "/dataManage#/freightData", icon : 'fa fa-th-list margin', index: 'freightData' },
							{ name : "浮动设置", link : "/dataManage#/priceRangeData", icon : 'fa fa-th-list margin', index: 'priceRangeData' },
							{ name : "定价规则", link : "/dataManage#/market_rule_data", icon : 'fa fa-th-list margin', index: 'market_rule_data' },
							{ name : "供应商别名", link : "/dataManage#/price_source_data", icon : 'fa fa-th-list margin', index: 'price_source_data' },
							{ name : "品牌详情", link : "/dataManage#/brand_manage_data", icon : 'fa fa-th-list margin', index: 'brand_manage_data' },
							{ name : "物流司机数据", link : "/dataManage#/car_info_data", icon : 'fa fa-th-list margin', index: 'car_info_data' },
							{ name : "后台补录", link : "/dataManage#/data_search", icon : 'fa fa-th-list margin', index: 'data_search' },
						], 
						icon : 'fa fa-th-large margin', 
						index: "data_background", 
						roles: ['前台数据管理员'], 
						permission: "-" 
					},
				],
				nowIndex : null,
				user : [],
				msgNum : '',
				msgList : {},
				socket : '',
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
            // 获取用户信息
			getUserInfo(){
				ajaxCustom.ajaxGet(this, "dingoapi/getUserInfo", (response)=>{
					response = response.body;
					this.user = response.user;
					console.log('roles', this.user);
				}, (response)=>{
					alert(response.body.message);
				});
			},
            // 用来判断哪个侧边栏进行选中
			showSelect(){
				this.nowIndex = this.active_number;
			},
            // 右上方导航栏的颜色控制
			showColor(){
				if(this.user.roles){
					if(this.roleJudge("次终端用户")){
						return 'nav_header1';
					}else{
						return 'nav_header';
					}
				}else{
					return 'nav_header1';
				}
			},
			initMessage(){
				var wsServer = 'ws://127.0.0.1:9501?uid='+window.User.id;
				var ws = new WebSocket(wsServer);
				// console.log(ws);
				var that = this;
				this.$store.commit('setsocket', ws);
				// //onmessage 监听服务器数据推送
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
            judgeRolesAndPermission(roles, permission){
                if(!this.user.roles){
                    return false;
                }
                if(this.isAdmin()){
                    return true;
                }
                for(let role of roles){
                    if(this.roleJudge(role)){
                        if(this.permissionJudge(permission)){
                            return true;
                        }
                    }
                }
                return false;
            },
            //判断角色是否吻合
            roleJudge(role){
                //角色判断
                let roles = this.user.roles;
                for (var i = 0; i < roles.length; i++) {
                    if( roles[i].name == role ){
                        return true;
                    }
                }
                return false;
            },
            //次级显示判断（判断是否我司运营中心角色）
            secondRoleJudge(role){
                //参数判断（未定义角色的默认显示）
                if(role == undefined){
                    return true;
                }else{
                    role = role[0];
                }
                return this.roleJudge(role);
            },
            //判断权限是否吻合
            permissionJudge(permission){
            	if(permission == "-"){
            		return true;
            	}
                let permissions = this.user.permissions;
                for (var i = 0; i < permissions.length; i++) {
                    if( permissions[i].name == permission ){
                        return true;
                    }
                }
                return false;
            },
            //判断是否管理员
            isAdmin(){
                let roles = this.user.roles;
                for (var i = 0; i < roles.length; i++) {
                    if( roles[i].name=='admin' ){
                        return true;
                    }
                }
                return false;
            }
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
						<span>{{ user.name }}</span>
					</div>
				</div>
			</div>

			<el-row class="tac">
			  	<el-col :span="8">
			    	<el-menu class="el-menu-vertical-demo" theme="dark" :default-active="nowIndex" unique-opened>
						<template v-for="val in navList" v-if="judgeRolesAndPermission(val.roles,val.permission)">
							<el-menu-item v-if="!val.childs" :index="val.index"><i :class="val.icon"></i><a :href="val.link">{{ val.name }}</a></el-menu-item>
		  					<el-submenu v-else :index="val.index">
                                <template slot="title"><i :class="val.icon"></i>{{ val.name }}</template>
                                <template v-for="value in val.childs">
                                    <el-menu-item v-if="!value.data" :index="value.index"><i :class="value.icon"></i><a :href="value.link">{{ value.name }}</a></el-menu-item>
                                    <el-menu-item-group v-else>
                                        <template slot="title"><i :class="value.icon"></i>{{ value.title }}</template>
                                        <el-menu-item v-for="data in value.data" :index="data.index" v-if="secondRoleJudge(data.roles)">
                                        	<i :class="data.icon"></i><a :href="data.link" >{{ data.name }}</a>
                                        </el-menu-item>
                                    </el-menu-item-group>
                                </template>
		  				   </el-submenu>
						</template>
			    	</el-menu>
				</el-col>
			</el-row>
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
								<a href="/passwordModify" title="设置">
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
					<div class="text_lent">
						<span>{{ text[0] }}</span>
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
	*{
		margin: 0;
	}
	a,a:hover{
		text-decoration: none;
	}
	.margin{
		margin-right: 10px;
		font-size: 16px;
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
        min-height: 100%;
    }
    .right_con {
        width: 100%;
    }
    .nav_left {
    	position: fixed;
        width: 220px;
        margin-left: -220px;
        height: 100%;
        color: #fff;
		background-color: #324157;
		overflow: auto;
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
		margin-top: 6px;
        display: inline-block;
	}
	.top-left-part{
		margin-bottom: 10px;
	}
	.nav_left .tac .el-menu-vertical-demo{
		width: 220px;
		height: 100%;
	}
	.nav_left .el-menu-item, .el-submenu__title{
		height: 50px;
		line-height: 50px;
	}
	.nav_left .tac .el-menu-vertical-demo a{
		color: #fff;
		height: 50px;
		line-height: 50px;
	}
	.el-menu-item a{
		display: inline-block;
		width: 99%;
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
			overflow-y: auto;
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
