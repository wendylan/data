<script>
	export default{
		props : {
			active_number : {
				type : Number
			}
		}
	}
</script>

<template>
	<header>
	  <nav class="main-menu menu-fixed menu-bg">
		<div class="container">
		  <!-- Brand and toggle get grouped for better mobile display -->
		  <div class="navbar-header">
			<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
			  <span class="sr-only">Toggle navigation</span>
			  <span class="icon-bar"></span>
			  <span class="icon-bar"></span>
			  <span class="icon-bar"></span>
			</button>
			<!-- <a class="navbar-brand" href="index.html"><img src="data/images/logo.png" alt="logo" class="img-responsive"></a> -->
			<h4 class="test" >钢筋报价和数据系统</h4>
		  </div>

		  <!-- Collect the nav links, forms, and other content for toggling -->
		  <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">

			<ul class="nav navbar-nav navbar-right">
			  <li><a class="page-scroll" href="./index.html">主页</a></li>
			  <li>
			  	<a class="page-scroll" href="./priceInfo.html">钢材价格</a>
			  	<ul>
			  		<i></i>
			  		<li><a href="#">钢材规格</a></li>
			  		<li><a href="#">钢材品牌</a></li>
			  	</ul>
			  </li>
			  <li>
			  	<a class="page-scroll" href="./sourceRecommend.html">推荐资源</a>
			  </li>
			  <li>
			  	<a class="page-scroll" href="./freight.html">运费查询</a>
			  </li>
			  <!-- <li><a class="page-scroll" href="#pricing">价格</a></li> -->
			  <li><a class="page-scroll" href="./historyData.html">历史数据</a></li>
			  <li><a class="page-scroll" href="./dataManage.html">数据管理</a></li>
			  <li><a class="page-scroll" href="./admin/logout">退出系统</a></li>
			</ul>

		  </div><!-- /.navbar-collapse -->
		</div><!-- /.container -->
	  </nav>
	</header>
</template>

<style>
	.test{
		margin: 30px 40px auto auto;
		color: #CCC;
	}
	ul,li{
		list-style: none;
	}
	.nav li ul{
		position: absolute;
		display: none;
		margin:0;
		padding: 0;
	}
	.nav li:hover ul i{
		top:-10px;
		left: 48%;
		position:absolute;
		width: 0;
		height: 0;
		line-height: 0;
		display: block;
		border:5px solid transparent;
		border-bottom-color: #fff;
	}
	header .nav li ul {
		width: 100px;
		border:1px solid #a7a7a7;
		border-radius: 5px;
	}
	header .nav li ul li {
		display: inline-block;
		text-align: center;
		padding: 0 20px;
	}
	header .nav li ul li a{
		text-decoration: none;
		color: red;
		height: 20px;
		padding: 0;
		text-align: center;
		display: inline-block;
		margin: 10px 0;
	}
	header .nav li ul li a:hover{
		color:#00bfff;
	}
	.nav li:hover ul  {
		display: block;
	}

	header .menu-bg {
	    background-color: #191919;
	}
	style.css:477
	header .menu-fixed {
	    background: transparent;
	}
	style.css:464
	header .main-menu {
	    min-height: 90px;
	    -webkit-backface-visibility: hidden;
	    backface-visibility: hidden;
	    z-index: 999;
	    transition: .5s;
	    background-color: #191919;
	    position: fixed;
	    top: 0;
	    width: 100%;
	    height: auto;
	}

	@media (min-width: 1200px)
	bootstrap.min.css:5
	.container {
	    width: 1170px;
	}
	@media (min-width: 992px)
	bootstrap.min.css:5
	.container {
	    width: 970px;
	}
	@media (min-width: 768px)
	bootstrap.min.css:5
	.container {
	    width: 750px;
	}
	bootstrap.min.css:5
	.container {
	    padding-right: 15px;
	    padding-left: 15px;
	    margin-right: auto;
	    margin-left: auto;
	}

	@media (min-width: 768px)
	bootstrap.min.css:5
	.container-fluid>.navbar-collapse, .container-fluid>.navbar-header, .container>.navbar-collapse, .container>.navbar-header {
	    margin-right: 0;
	    margin-left: 0;
	}

	@media (min-width: 768px)
	bootstrap.min.css:5
	.navbar-right {
	    float: right!important;
	    margin-right: -15px;
	}
	@media (min-width: 768px)
	bootstrap.min.css:5
	.navbar-nav {
	    float: left;
	    margin: 0;
	}
	bootstrap.min.css:5
	.navbar-nav {
	    margin: 7.5px -15px;
	}
	bootstrap.min.css:5
	.nav {
	    padding-left: 0;
	    margin-bottom: 0;
	    list-style: none;
	}
	style.css:326
	ul {
	    list-style: disc;
	}
	style.css:323
	ul, ol {
	    padding: 0;
	}
	bootstrap.min.css:5
	ol, ul {
	    margin-top: 0;
	    margin-bottom: 10px;
	}

	header .main-menu ul li a {
	    font-size: 14px;
	    font-weight: 600;
	    color: #a7a7a7;
	    text-transform: capitalize;
	    padding: 35px 14px;
	}
	@media (min-width: 768px)
	bootstrap.min.css:5
	.navbar-nav>li>a {
	    padding-top: 15px;
	    padding-bottom: 15px;
	}
	bootstrap.min.css:5
	.navbar-nav>li>a {
	    padding-top: 10px;
	    padding-bottom: 10px;
	    line-height: 20px;
	}
	bootstrap.min.css:5
	.nav>li>a {
	    position: relative;
	    display: block;
	    padding: 10px 15px;
	}
	style.css:53
	a {
	    background-color: transparent;
	    color: #696969;
	    -webkit-transition: .25s;
	    -moz-transition: .25s;
	    -ms-transition: .25s;
	    -o-transition: .25s;
	    transition: .25s;
	}
	bootstrap.min.css:5
	a {
	    color: #337ab7;
	    text-decoration: none;
	}
	bootstrap.min.css:5
	a {
	    background-color: transparent;
	}

	@media (min-width: 768px)
	bootstrap.min.css:5
	.navbar-nav>li {
	    float: left;
	}
	bootstrap.min.css:5
	.nav>li {
	    position: relative;
	    display: block;
	}

	@media (min-width: 768px)
	bootstrap.min.css:5
	.navbar-nav {
	    float: left;
	    margin: 0;
	}
	bootstrap.min.css:5
	.navbar-nav {
	    margin: 7.5px -15px;
	}
	bootstrap.min.css:5
	.nav {
	    padding-left: 0;
	    margin-bottom: 0;
	    list-style: none;
	}
	style.css:326
	ul {
	    list-style: disc;
	}
	style.css:323
	ul, ol {
	    padding: 0;
	}
	bootstrap.min.css:5
	ol, ul {
	    margin-top: 0;
	    margin-bottom: 10px;
	}

	@media (min-width: 768px)
	bootstrap.min.css:5
	.navbar-collapse.collapse {
	    display: block!important;
	    height: auto!important;
	    padding-bottom: 0;
	    overflow: visible!important;
	}
	@media (min-width: 768px)
	bootstrap.min.css:5
	.navbar-collapse {
	    width: auto;
	    border-top: 0;
	    -webkit-box-shadow: none;
	    box-shadow: none;
	}
	bootstrap.min.css:5
	.navbar-collapse {
	    padding-right: 15px;
	    padding-left: 15px;
	    overflow-x: visible;
	    -webkit-overflow-scrolling: touch;
	    border-top: 1px solid transparent;
	    -webkit-box-shadow: inset 0 1px 0 rgba(255,255,255,.1);
	    box-shadow: inset 0 1px 0 rgba(255,255,255,.1);
	}

	header .main-menu ul li.active a {
	    background-color: transparent;
	    color: #00BFFF;
	}
	style.css:486
	header .main-menu ul li a {
	    font-size: 14px;
	    font-weight: 600;
	    color: #a7a7a7;
	    text-transform: capitalize;
	    padding: 35px 14px;
	}
	@media (min-width: 768px)
	bootstrap.min.css:5
	.navbar-nav>li>a {
	    padding-top: 15px;
	    padding-bottom: 15px;
	}
	bootstrap.min.css:5
	.navbar-nav>li>a {
	    padding-top: 10px;
	    padding-bottom: 10px;
	    line-height: 20px;
	}
	bootstrap.min.css:5
	.nav>li>a {
	    position: relative;
	    display: block;
	    padding: 10px 15px;
	}
	header .main-menu ul li a:hover, header .main-menu ul li a:focus {
	    background-color: transparent;
	    color: #00BFFF;
	}

	.navbar-brand {
	    float: left;
	    height: 50px;
	    padding: 15px 15px;
	    font-size: 18px;
	    line-height: 20px;
	    margin-top: 15px;
	}
</style>
