<!-- active_number ： 传入的值进行侧边栏相对应的选中 -->
<script>
	import { Row, Col, Menu, MenuItem, Submenu, MenuItemGroup } from 'element-ui';
	import ajaxCustom from './ajax-custom.js';
	export default{
		props : {
			active_number : {
				type : String
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
		},
		data(){
			return {
				// 后台
				navList : [
					{ name : "推荐资源", link : "./sourceRecommend.html", icon : 'fa fa-shopping-cart margin'},
					{ name : "运费查询", link : "./freight.html", icon : 'fa fa-joomla margin' },
					{ name : "历史数据", link : "./historyData.html", icon : 'fa fa-tasks margin' },
					{ name : "数据管理", link : "./dataManage.html", icon : ' fa fa-wrench margin' },
					{ name : "后台数据", childs : [
						// { name : "市场价格数据", link : "/dataManage.html#/market_price_data", icon : 'fa fa-th-list margin' },
						{ name : "品牌数据", link : "admin/product", icon : 'fa fa-th-list margin' },
						{ name : "运费数据", link : "/dataManage.html#/freightData", icon : 'fa fa-th-list margin' },
						{ name : "浮动设置", link : "/dataManage.html#/priceRangeData", icon : 'fa fa-th-list margin' },
						{ name : "定价规则", link : "/dataManage.html#/market_rule_data", icon : 'fa fa-th-list margin' },
						{ name : "供应商别名", link : "/dataManage.html#/price_source_data", icon : 'fa fa-th-list margin' },
						{ name : "品牌详情", link : "/dataManage.html#/brand_manage_data", icon : 'fa fa-th-list margin' },
						{ name : "物流司机数据", link : "/dataManage.html#/car_info_data", icon : 'fa fa-th-list margin' },
						{ name : "后台补录", link : "/dataManage.html#/data_search", icon : 'fa fa-th-list margin' },
					], icon : 'fa fa-th-large margin' },
				],
				nowIndex : null,
				user : [],
			}
		},
		methods:{
            // 获取用户信息
			getUserInfo(){
				ajaxCustom.ajaxGet(this, "dingoapi/getUserInfo", (response)=>{
					response = response.body;
					this.user = response.user;
					console.log(response);
				}, (response)=>{
					alert(response.body.message);
				});
			},
            // 设置当前的选择状态是否active
			showSelect(){
				this.nowIndex = this.active_number;
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
						<span>{{ user.name }}</span>
					</div>
				</div>
			</div>
			<el-row class="tac">
			  	<el-col :span="8">
			    	<el-menu class="el-menu-vertical-demo" theme="dark" :default-active="nowIndex" unique-opened>
						<template v-for="(val, index) in navList">
							<el-menu-item v-if="!val.childs" :index="(index+1).toString()"><i :class="val.icon"></i><a :href="val.link">{{ val.name }}</a></el-menu-item>
		  					<el-submenu v-else :index="(index+1).toString()">
		  					   <template slot="title"><i :class="val.icon"></i>{{ val.name }}</template>
								<template v-for="(value, key) in val.childs">
									<el-menu-item :index="(index+1).toString()+ '-' + (key+1).toString()"><i :class="value.icon"></i><a :href="value.link">{{ value.name }}</a></el-menu-item>
								</template>
		  				   </el-submenu>
						</template>
			    	</el-menu>
				</el-col>
			</el-row>
		</div>
		<div class="right_con">
			<div class="right_con_top">
				<div class="nav_header1">
					<div class="right_con-left">
					</div>
					<div class="right_con-right">
						<ul>
							<li>
								<a href="" title="消息中心">
									<i class="fa fa-envelope"></i>
									<div class="notify"><span class="heartbit"></span><span class="point"></span></div>
								</a>
							</li>
							<li>
								<a href="" title="设置">
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
	.margin{
		margin-right: 10px;
		font-size: 16px;
	}
	*{
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
</style>
