
<script>
	import { Button, Pagination, Loading  } from "element-ui";
	import ajaxCustom from '../../components/ajax-custom.js';
	export default{
		components : {
			elButton : Button,
			elPagination : Pagination
		},
		created : function(){
			this.getWebPrice();
			this.getListData();
		},
		mounted(){
			this.apiToken=this.toJson(Laravel.apiToken);
			this.apiToken=JSON.parse(this.apiToken);
		},
		data(){
			return {
				apiToken:"",
				marketData : null,
				webPriceNS:[],
				webData : [],
				totalPage:0,
				total:0,
				isLoadPrevData : 0,
				canCreate : false
			}
		},
		methods : {
			/*权限控制*/
			toJson(str) {
				str=str.replace(/&quot;/g,'"');
				return str;
			},
			permissionManager(permissions,permission){
				for (var i = 0; i < permissions.length; i++) {
					if(permissions[i].name==permission){
						return true;
					}
				}
				return false;
			},
			rolePermission(roles,role){
				for (var i = 0; i < roles.length; i++) {
					if(roles[i].name==role){
						return true;
					}
				}
				return false;
			},
			routerChange(name){
				this.$router.push(name);
			},
			changePage : function(page){
				let loadingInstance = Loading.service({target:"ul#market-price"});
				var path = "dingoapi/listData?page=" + page;
				ajaxCustom.ajaxGet(this,path, (responese)=>{
					this.marketData = responese.body.data;
					loadingInstance.close();
				}, (responese)=>{
					console.log(responese);
					alert("操作失败");
					loadingInstance.close();
				});
			},
			/*webprice*/
			getWebPrice: function(){
				ajaxCustom.ajaxGet(this,"dingoapi/getWebPriceDate", (responese)=>{
					console.log(responese.data);
					this.webPriceNS=responese.data.data.data;
					this.totalPage=responese.data.data.last_page*10;
					this.total=responese.data.data.total;
					for (var i = 0; i < this.webPriceNS.length; i++) {
						var time=this.webPriceNS[i].date;
						this.webPriceNS[i].date = this.dateFormat(this.webPriceNS[i].date);
						this.webPriceNS[i].time = time;
						// this.webPriceNS.push('time':time);
					}
					this.webData=this.webPriceNS;
				}, (responese)=>{
					console.log(responese);
				});
			},
			getListData:function(){
				ajaxCustom.ajaxGet(this,"dingoapi/listData", (responese)=>{
					responese = responese.body;
					let displayCount = 0;
					for(let data of responese.data.data){
						if(data.display == 1){
							displayCount++;
						}
					}
					console.log(displayCount)
					if(displayCount === 3){
						this.canCreate = true;
					}
					this.marketData = responese.data;
				}, (responese)=>{
					console.log(responese);
				});
			},
			/*时间戳转换成日期*/
			dateFormat: function (shijianchuo){
				//shijianchuo是整数，否则要parseInt转换
				var time = new Date(parseInt(shijianchuo) * 1000);
				var y = time.getFullYear();
				var m = time.getMonth()+1;
				var d = time.getDate();
				var h = time.getHours();
				var mm = time.getMinutes();
				var s = time.getSeconds();
				return y+'-'+this.formatTime(m)+'-'+this.formatTime(d)+' '+this.formatTime(h)+':'+this.formatTime(mm)+':'+this.formatTime(s);
			},
			formatTime:function(m){
				return m<10?'0'+m:m ;
			},
			/*改变页码*/
			changePageOfWebPrice:function(page){
				let loadingInstance = Loading.service({target:"ul#webprice"});
				ajaxCustom.ajaxGet(this,"dingoapi/getWebPriceDate?page="+page, (responese)=>{
					this.webPriceNS=responese.body.data.data;
					for (var i = 0; i < this.webPriceNS.length; i++) {
						var time=this.webPriceNS[i].date;
						this.webPriceNS[i].date=this.dateFormat(this.webPriceNS[i].date);
						this.webPriceNS[i].time = time;
					}
					this.webData=this.webPriceNS;
					this.total=responese.body.data.total;
					loadingInstance.close();
				}, (responese)=>{
					loadingInstance.close();
					console.log(responese);
				});
			},
			createNewReport(){
				// console.log(this.apiToken.permissions);
				if(confirm("确认是否" + (this.isLoadPrevData?"新增导入上次所有报价":"新增空报价表") + " ?")){
					if(this.isLoadPrevData === 0){
						let loadingInstance = Loading.service({target:"body"});
						ajaxCustom.ajaxGet(this,"dingoapi/createMarketRecord", (responese)=>{
							console.log(responese)
							loadingInstance.close();
							this.$router.push("check_market_data/"+responese.body.data.id);
						}, (responese)=>{
							loadingInstance.close();
							alert( responese.body.message );
							console.log(responese);
						});

					}else{
						let loadingInstance = Loading.service({target:"body"});
						ajaxCustom.ajaxGet(this,"dingoapi/getPrveMarketData", (responese)=>{
							console.log(responese)
							loadingInstance.close();
							this.$router.push("check_market_data/"+responese.body.data);
						}, (responese)=>{
							loadingInstance.close();
							alert( responese.body.message );
							console.log(responese);
						});
					}
				}
			},
			checkOrEditPriceData(id){
				window.open("dataManage#/check_market_data/"+id);
			},
			deleteMarketData(id){
				let isDelete = confirm("是否删除此次报价数据 ?");
				if(isDelete){
					let loadingInstance = Loading.service({target:"#market-price"});
					ajaxCustom.ajaxGet(this,"dingoapi/delMarketDatas", { params : { id : id } }, (responese)=>{
						console.log(responese);
						alert( responese.body.message );
						loadingInstance.close();
						this.getListData();
					}, (responese)=>{
						loadingInstance.close();
						alert( responese.body.message );
						console.log(responese);
					});
				}
			},
			reportPriceDatas(id){
				let isDelete = confirm("确定发布报价信息吗 ?");
				if(isDelete){
					let loadingInstance = Loading.service({target:"#market-price"});
					ajaxCustom.ajaxGet(this,"dingoapi/reportMarketData", { params : { id : id } }, (responese)=>{
						console.log(responese);
						alert( responese.body.message );
						loadingInstance.close();
						this.getListData();
					}, (responese)=>{
						loadingInstance.close();
						alert( responese.body.message );
						console.log(responese);
					});
				}
			},
			webPriceView(id){
				window.open("dataManage#/check_web_data/"+id);
			}
		}
	}
</script>

<template>
	<div class="main-warpper" >
		<h1>后台数据</h1>
		<h4>管理后台的数据</h4>
		<br><br>
		<div class="list-box">
			<template v-if="marketData">
				<ul id="market-price">
					<li>
						<div class="title">市场价格 :
							<el-select v-model="isLoadPrevData">
								<el-option :value="0" label="新报价"></el-option>
								<el-option :value="1" label="导入上一次所有报价"></el-option>
							</el-select>
						</div>
						<div>
							<el-button type="primary" @click="createNewReport()" :disabled="!canCreate">新增</el-button>
							<p style="margin: 0px;font-size: 14px;" v-show="!canCreate">(必须先完成已有的报价表)</p>
						</div>
						<p style="clear:both;"></p>
					</li>
					<li v-for="data of marketData.data">
						<div>{{ data.created_at }}</div>
						<div>
							<el-button type="default" @click="checkOrEditPriceData(data.id)">{{ !data.display ? "编辑" : "查看" }}
							</el-button>
							<template v-if="!data.display">
								<el-button type="success" @click="reportPriceDatas(data.id)">发布</el-button>
							</template>
							<el-button v-show="!data.display" type="danger" @click="deleteMarketData(data.id)" >删除</el-button>
						</div>
						<p style="clear:both;"></p>
					</li>
				</ul>
				<div class="page-box">
					<p>共 {{ marketData.total }} 行</p>
					<el-pagination layout="prev, pager, next" :small="true" :page-size="3" :current-page="marketData.current_page" :total="marketData.total" @current-change="changePage"></el-pagination>
				</div>
			</template>
		</div>
		<div class="list-box" >
			<ul  id="webprice">
				<li >
					<div class="title">网价价格数据 : </div>
					<p style="clear:both;"></p>
				</li>
				<li v-for="data of webData">
					<div>{{ data.date }}</div>
						<div><el-button type="default" @click='webPriceView(data.time)'>查看</el-button></div>
					<p style="clear:both;"></p>
				</li>
			</ul>
			<div class="page-box">
				<p>共 {{ total }} 行</p>
				<el-pagination layout="prev, pager, next" :total="totalPage"
				@current-change="changePageOfWebPrice" small
				></el-pagination>
			</div>
		</div>
		<div style="clear:both"></div>


		<div class="other-data">
			<div class="other-data-box">
				<p>品牌数据:</p>
				<div class="button-box line-other">
					<!-- <router-link to="/brandsData"> -->
						<el-button type="primary"><a href="admin/product" target="_blank">查看</a></el-button>
					<!-- </router-link> -->
					<!-- <router-link to="/create_brands_data"> -->
						<el-button type="primary"><a href="admin/product" target="_blank">新增</a></el-button>
					<!-- </router-link> -->
				</div>
			</div>
			<div class="other-data-box">
				<p>运费数据:</p>
				<div class="button-box">
					<el-button type="primary" @click="routerChange('freightData')">查看</el-button>
					<el-button type="primary" @click="routerChange('create_freight_data')">新增</el-button>
				</div>
			</div>
			<div class="other-data-box">
				<p>浮动设置:</p>
				<div class="button-box">
					<el-button type="primary" @click="routerChange('priceRangeData')">进入</el-button>
				</div>
			</div>
			<div class="other-data-box">
				<p>定价规则:</p>
				<div class="button-box">
					<el-button type="primary" @click="routerChange('market_rule_data')">进入</el-button>
				</div>
			</div>
		</div>

	</div>
</template>

<style scoped>
	.main-warpper{
		width:1280px;
		margin:auto;
		padding:25px;
		color:#1F2D3D;
	}
	h1,h4{
		font-weight:400;
	}
	h4{
		color:#8492A6;
	}

	ul{
		list-style: none;
	}
	a{
		color:#FFF;
	}
	a:link{
		text-decoration:none;
	}
	a:visited{
		text-decoration:none;
	}
	a:hover{
		text-decoration:none;
	}
	a:active{
		text-decoration:none;
	}
	.line-other button{
		padding:0px;
	}
	.line-other a{
		display:block;
		padding:10px 15px 10px 15px;
	}
	.list-box{
		float:left;
		width:50%;
	}
	.list-box li{
		padding:10px;
		border-bottom:solid 1px #DEDEDE;
	}
	.list-box li:hover{
		background-color:#EEE;
	}
	.list-box li>div{
		float:left;width:50%;
		font-size:18px;
		text-align:center;
		line-height:2;
	}
	.title{
		font-weight:700;
	}

	.page-box{
		width:200px;
		margin:auto;
	}
	.page-box p{
		text-align:center;
		font-size:14px;
		color:#54667a;
	}



	.other-data{
		margin-top:100px;
		border:solid 1px #DEDEDE;
		overflow: auto;
		padding-bottom:18px;
		background-color:#EEE;
	}
	.other-data>div{
		width:25%;
		float:left;
	}
	.other-data-box{

	}
	.other-data-box>p{
		font-size:18px;
		font-weight: 700;
		text-align:center;
	}
	.other-data-box .button-box{
		text-align: center;
	}
</style>
<style>
	.el-button+.el-button{
		margin-left:0px;
	}
</style>
