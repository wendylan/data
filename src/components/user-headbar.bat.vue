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
					<a href="#" class="bar_a">
						<p>
							<a href="about.html">关于我们</a>
							<a href="help.html">帮助中心</a>
						</p>
					</a>
				</div>
			</div>
		</div>
		<div class="tool">
			<div class="bar_box">
				<ul class="fr">
					<li>
						<a class="page-scroll" href="./index.html">主页</a>
					</li>
					<li>
					  	<a class="page-scroll" href="/webprice">网价</a>
					</li>
					<li>
					  	<a class="page-scroll" href="/mainprice">现货价</a>
					</li>
					<li>
						<a class="page-scroll" href="./historyData.html">缺货查询</a>
					</li>
					<li>
						<a class="page-scroll" href="./dataManage.html">下单管理</a>
					</li>
				</ul>
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
	.fl{
		float: left;
	}
	.fr{
		float: right;
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
		width: 1280px;
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
		width: 1280px;
		height: 70px;
		margin: 0 auto;
	}
	.radious{
		width: 50px;
		height: 50px;
		line-height: 50px;
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
		background-image: url(../../images/test.png);
		background-size: 20px 20px;
	}
	.bar_a:hover{
		background-image: url(../../images/test_hover.png);
		background-size: 20px 20px;
	}
	.bar_a p{
		display: none;
	}
	.bar_a:hover p{
		display: inline-block;
		width: 80px;
		height: 80px;
		position: absolute;
		border:1px solid #dedede;
		border-radius: 5px;
		background: #fff;
		left: -15px;
		top: 18px;
	}
	.bar_a p a{
		margin-top: 5px;
		margin-bottom: 5px;
		color:#333;
	}
	.bar_a p a:hover{
		font-weight: bold;
		color: #8870ff;
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
</style>
