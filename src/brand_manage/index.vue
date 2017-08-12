<script>
	import headbar from '../components/agent-header.vue';
	import titleBox from '../components/title-box.vue';
	import ajaxCustom from '../components/ajax-custom.js';
	import { Select, Option} from 'element-ui';
	export default{
		components : {
			headbar,
			titleBox,
			elSelect : Select,
			elOption : Option,
		},
		created : function() {
			this.getAllBrands();
			this.filterBrands.push(this.brandsData[0]);
			this.allBrands.selected = this.filterBrands[0].brands;
		},
		data(){
			return{
				brandsData : [
					{
						brands : "桂鑫",
						context : " 桂鑫钢铁集团有限公司成立于1993年，历经20多年发展，现已发展为集钢铁、地产、港口、金融和贸易等行业为主，跨地域、跨行业、多元化、复合型的大型民营实体集团企业，总资产逾100亿元。其年产量逾800万吨。",
						cate_spec : [
							{ product : "高线", material : "HPB300", size : [6.5, 8, 9, 10]},
							{ product : "盘螺", material : "HRB400", size : [6, 8, 9, 10]},
							{ product : "螺纹钢", material : "HRB400E", size : [10, 12, 14, 16, 18, 20]},
						],
						cate_style : './images/style.png',
						weight_standard : './images/standard.png',
						transport_way : [ '自提', '直送']
					},
					{
						brands : "广钢",
						context : " 广钢钢铁集团有限公司成立于1993年，历经20多年发展，现已发展为集钢铁、地产、港口、金融和贸易等行业为主，跨地域、跨行业、多元化、复合型的大型民营实体集团企业，总资产逾100亿元。其年产量逾800万吨。",
						cate_spec : [
							{ product : "高线", material : "HPB300", size : [6.5, 8, 9, 10]},
							{ product : "盘螺", material : "HRB400", size : [6, 8, 9, 10]},
							{ product : "螺纹钢", material : "HRB400E", size : [10, 12, 14, 16, 18, 20]},
						],
						cate_style : './images/style.png',
						weight_standard : './images/standard.png',
						transport_way : [ '自提', '直送']
					},
				],
				allBrands : {
					item : [],
					selected : null
				},
				filterBrands : [],
			}
		},
		methods : {
			getAllBrands(){
				ajaxCustom.ajaxGet(this, "api/getAllBrandsWillHeader", (response)=>{
					console.log(response);
					this.allBrands.item = response.body;
				}, (response)=>{
					console.log(response);
				});
			},
			searchBrand(){
				this.filterBrands = [];
				for(let data of this.brandsData){
					if(data.brands == this.allBrands.selected){
						this.filterBrands.push(data);
					}
				}
			},
		},
	}
</script>
<template>
	<div>
		<headbar :active_number="1"></headbar>
		<div class="main_warpper">
			<title-box :text="['品牌详情','查看品牌详细情况']"></title-box>
			<div>
				<el-select placeholder="请选择" v-model="allBrands.selected" @change="searchBrand">
					<el-option v-for="brand in allBrands.item" :label="brand" :value="brand"></el-option>
				</el-select>
				<table v-for="item in filterBrands">
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
						<td style="text-align:left;padding-left:20px;">
							<template v-for="data in item.cate_spec">
								<span>{{data.product}}({{data.material}})
									<template v-for="size in data.size">
										<span>Φ{{size}},</span>
									</template>
								</span><br>
							</template>
						</td>
					</tr>
					<tr>
						<th>钢牌/钢标样式</th>
						<td>{{item.cate_style}}</td>
					</tr>
					<tr>
						<th>理计重量标准</th>
						<td>{{item.weight_standard}}</td>
					</tr>
					<tr>
						<th>承运方式</th>
						<td>
							<template v-for="data in item.transport_way">
								<span>{{data}},</span>
							</template>
						</td>
					</tr>
				</table>
				<br>
			</div>
		</div>
	</div>
</template>
<style scoped>
	.main_warpper{
		width: 1280px;
		height: auto;
		margin: 0 auto;
	}
	table{
		width: 80%;
		margin-top: 20px;
	}
	th,td{
		width: 20%;
		text-align: center;
		font-size: 18px;
		padding: 10px 0px;
		border: 1px solid #dfe6ec;
	}
	td{
		width: auto;
	}
</style>