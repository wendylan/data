<script>
    import _ from 'lodash';
	import headerbar from '../components/same-headerbar.vue';
	import ajaxCustom from '../components/ajax-custom.js';
	import { Select, Option} from 'element-ui';
	export default{
		components : {
			headerbar,
			elSelect : Select,
			elOption : Option,
		},
		created : function() {
			this.getAllBrandsDetails();
		},
		data(){
			return{
				// 表格数据
				brandsData : [],
				// 所有品牌
				allBrands : {
					item : [],
					selected : null
				},
                // 表格数据
				filterBrands : [],
			}
		},
		methods : {
			// 通过传过来的路由显示现对应的品牌详情
			showBrandDetail(){
				let brand = this.$route.query.brand;
				this.allBrands.selected = _.find(this.brandsData, ['brands', brand]).brands;
			},
            // 获取品牌的详细信息
			getAllBrandsDetails(){
				ajaxCustom.ajaxGet(this, 'dingoapi/getBrandInfo', (response)=>{
					console.log(response);
					this.brandsData = response.body.data;
                    // 获取所有品牌
                    this.allBrands.item = _.uniq(_.flatMap(this.brandsData, (val)=>{
                        return val.brands;
                    }));
                    // 表格默认显示第一个数据
					this.filterBrands.push(this.brandsData[0]);
                    // 选择框默认显示一个品牌
					this.allBrands.selected = this.filterBrands[0].brands;
                    // 如果路由有传过来有值
					this.showBrandDetail();
				}, (response)=>{
					console.log(response);
				});
			},
			// 查询相对应的品牌数据
			searchBrand(){
                this.filterBrands = _.filter(this.brandsData, ['brands', this.allBrands.selected]);
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
		},
	}
</script>
<template>
	<div>
		<headerbar :text="['品牌详情', '查看品牌详细情况']">
			<div class="some_style">
				<span>请选择品牌:</span>
				<el-select placeholder="请选择" v-model="allBrands.selected" @change="searchBrand" size="small">
					<el-option v-for="brand in allBrands.item" :label="brand" :value="brand"></el-option>
				</el-select>
				<table v-for="item in filterBrands">
					<tr>
						<th>品牌</th>
						<td>{{ item.brands }}</td>
					</tr>
					<tr>
						<th>基本资料</th>
						<td style="text-align:left;padding-left:20px;">{{ item.context }}</td>
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
						<td>
							<template v-for="data in item.steel_certificate">
								<img :src="getImgPath(data.value)" alt="" class="img_style">
							</template>
						</td>

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
				</table>
				<br>
			</div>
		</headerbar>
	</div>
</template>
<style scoped>
	.some_style{
		background-color: #fff;
		padding: 15px;
	}
	table{
		width: 100%;
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
	.img_style{
		display:inline-block;
		width:30%;
		height:auto;
	}
</style>
