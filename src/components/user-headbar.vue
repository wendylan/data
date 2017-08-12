<script>
	export default{
		props : {
			active_number : {
				type : Number
			}
		},
		data(){
			return {
				navList : [
					{ name : "主页", link : "/index" },
					{ name : "网价", link : "/webprice" },
					{ name : "现货价", link : "/mainprice" },
					{ name : "下单管理", link : "/userdeal" }
				],
				isShow : false
			}
		},
		methods:{
			showAbout(){
				this.isShow = !this.isShow;
			},
		},
	}
</script>

<template>
	<header>
		<div class="container">
			<div class="row">
				<div class="col-md-12 col-sm-12">
					<div class="tool_top">
						<div class="top_bar">
							<div class="fl">
								<a href="index.html" class="logo">
									<b>六六钢铁</b><br>
									<span>www.66gangtie.com</span>
								</a>
							</div>
							<div class="bar fr">
								<a href="#" class="radious"><span>终端</span></a>
								<a href="javascript:void(0);" class="bar_a" @click="showAbout">
									<i class="el-icon-menu"></i>
									<p v-show="isShow" class="about">
										<i></i>
										<a href="about.html">关于我们</a>
										<a href="help.html">帮助中心</a>
									</p>
								</a>
							</div>
						</div>
					</div>
				</div>
				<div class="col-md-12 col-sm-12">
					<div class="tool">
						<div class="bar_box">
							<ul class="fr">
								<li v-for="item in navList">
									<a class="page-scroll" :href="item.link">{{ item.name }}</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

		</div>

	</header>
</template>

<style scoped>
	*{
		font-family:"微软雅黑";
		padding: 0;
		margin: 0;
	}
	a,a:hover{
		text-decoration: none;
	}
	header{
		width: 100%;
	}
	.fl{
		float: left;
	}
	.fr{
		float: right;
	}
	.container{
		width: 100%;
		margin: 0 auto;
	}
	.tool_top{
		width: 100%;
		background: #1f1f1f;
		background: #2b2f36;
		color: #333;
	}
	.tool_top a{
		display: inline-block;
		margin-top: 5px;
	}
	.top_bar{
		width: 80%;
		height: 80px;
		text-align: center;
		margin: 0 auto;
		padding-top: 10px;
	}
	.logo{
		text-align: center;
		margin-top: 10px;
		color: #fff;
	}
	.logo:hover{
		color: #8870ff;
	}
	.bar_box{
		width: 80%;
		height: 70px;
		margin: 0 auto;
	}
	.radious{
		width: 44px;
		height: 44px;
		line-height: 38px;
		border-radius: 50%;
		text-align: center;
		color: #fff;
		border:3px solid #3b5998;
		transition: all 0.3s ease;
	}
	.radious:hover{
		background: #3b5998;
	}
	.bar_a{
		position: relative;
		width: 20px;
		height: 20px;
		margin-left: 20px;
	}
	.about{
		z-index: 2;
		width: 80px;
		padding: 0;
		height:auto;
		position: absolute;
		background: #fff;
		left: -26px;
		top: 50px;
	}
	.about i{
		position: absolute;
		top: -20px;
		left: 25px;
		width: 0;
		height: 0;
		border:10px solid transparent;
		border-bottom-color: #fff;
	}
	.about a{
		padding: 0;
		margin: 0;
		display: inline-block;
		width: 80px;
		height: 40px;
		line-height: 40px;
		background: #f5f5f5;
		color:#333;
	}
	.about a:hover{
		font-weight: bold;
		color: #fff;
		background: #2b2f36;
	}
	.tool{
		width: 100%;
		background:#323842;
	}
	.tool ul li{
		float: left;
		list-style: none;
	}
	.tool ul li a{
		display: inline-block;
		color: #fff;
		width: 150px;
		height: 70px;
		line-height: 70px;
		text-align: center;
		font-size: 16px;
		font-weight: bold;
	}
	.tool ul li a:hover{
		background: #f5f5f5 ;
		color: #222222;
	}
	@media screen and (min-width: 468px) {
		.tool ul li a{
			display: inline-block;
			width:80px;
		}
	}
	@media screen and (min-width: 768px){
		.tool ul li a {
			display: inline-block;
			width: 120px;
		}
	}
	@media screen and (min-width: 992px){
		.tool ul li a {
			display: inline-block;
			width: 150px;
		}
	}
	.el-icon-menu{
		margin-top:15px;
		font-size: 20px;
	}
</style>
