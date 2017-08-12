<script>
import ajaxCustom from '../../components/ajax-custom.js';
	export default{
		data(){
			return {
				selectHandle : '品名',
				goodsName : [],
				highSpeedWireType : [],
				highSpeedWireMaterial : [],
				diskType : [],
				diskMaterial : [],
				screwTheadSteelType : [],
				screwTheadSteelMaterial : [],
				newBrandsData:[],
				steelAdds:'',
				shippingMethods:'',
				option : [
					{ label:"钢厂直送"  },
					{ label:"广州仓发货" },
					{ label:"全选"  }
				],
				goodsData : [
					{
						name : "高线",
						type : ["6.5" , "8" , "10"],
						material : ["HPB300"]
					},
					{
						name : "盘螺",
						type : ["6","8","10"],
						material : ["HRB400","HRB400E"]
					},
					{
						name : "螺纹钢",
						type : ["10","12","14","16","18","20","22","25","28","32","36","40"],
						material : ["HRB400","HRB400E"]
					}
				],
				option2:{ type : [],material:[] },
			}
		},
		methods : {
			getAllData(){
				if (this.newBrandsData!=[]) {
					this.newBrandsData=[];
				}
				if(this.shippingMethods=="全选"){
					this.shippingMethods="钢厂直送，广州仓发货";
				}
				for (let i = 0; i < this.goodsName.length; i++) {
					if (this.goodsName[i]=="全选") {
						continue;
					}
					if (this.goodsName[i]=='高线') {
						for (let j = 0; j < this.highSpeedWireType.length; j++) {
							if (this.highSpeedWireType[j]=="全选") {
								continue;
							}
							for (let k = 0; k < this.highSpeedWireMaterial.length; k++) {
								if (this.highSpeedWireMaterial[k]=="全选") {
									continue;
								}
								this.newBrandsData.push({
									editCtrl : false ,
									oneSteelAdds : this.steelAdds,
									oneGoodsName : this.goodsName[i] , 
									oneType : this.highSpeedWireType[j], 
									oneMaterial :this.highSpeedWireMaterial[k],
									oneMethods :this.shippingMethods,

								});
							}
						}
					}
					else if (this.goodsName[i]=='盘螺') {
						for (let j = 0; j < this.diskType.length; j++) {
							if (this.diskType[j]=="全选") {
								continue;
							}
							for (let k = 0; k < this.diskMaterial.length; k++) {
								if (this.diskMaterial[k]=="全选") {
									continue;
								}
								this.newBrandsData.push({
									editCtrl : false ,
									oneSteelAdds :this.steelAdds,
									oneGoodsName : this.goodsName[i] , 
									oneType : this.diskType[j], 
									oneMaterial :this.diskMaterial[k],
									oneMethods :this.shippingMethods,
								});
							}
						}
					}
					else if(this.goodsName[i]=='螺纹钢') {
						for (let j = 0; j < this.screwTheadSteelType.length; j++) {
							if (this.screwTheadSteelType[j]=="全选") {
								continue;
							}
							for (let k = 0; k < this.screwTheadSteelMaterial.length; k++) {
								if (this.screwTheadSteelMaterial[k]=="全选") {
									continue;
								}
								this.newBrandsData.push({
									editCtrl : false ,
									oneSteelAdds : this.steelAdds,
									oneGoodsName : this.goodsName[i] , 
									oneType : this.screwTheadSteelType[j], 
									oneMaterial :this.screwTheadSteelMaterial[k],
									oneMethods : this.shippingMethods,
								});
							}
						}
					}
				}
											
			},
			highSpeedWireTypeALLChoose(){
				for (var i = 0; i < this.highSpeedWireType.length; i++) {
					if (this.highSpeedWireType[i]=="全选") {
						this.highSpeedWireType=["6.5","8","10","全选"];
					} 
				}				
			},
			highSpeedWireMaterialALLChoose(){
				for (var i = 0; i < this.highSpeedWireMaterial.length; i++) {
					if (this.highSpeedWireMaterial[i]=="全选") {
						this.highSpeedWireMaterial=["HPB300","全选"];
					} 
				}
			},
			diskTypeALLChoose(){
				for (var i = 0; i < this.diskType.length; i++) {
					if (this.diskType[i]=="全选") {
						this.diskType=["6","8","10","全选"];
					} 
				}
			},
			diskMaterialALLChoose(){
				for (var i = 0; i < this.diskMaterial.length; i++) {
					if (this.diskMaterial[i]=="全选") {
						this.diskMaterial=["HRB400","HRB400E","全选"];
					} 
				}
			},
			screwTheadSteelTypeALLChoose(){
				for (var i = 0; i < this.screwTheadSteelType.length; i++) {
					if (this.screwTheadSteelType[i]=="全选") {
						this.screwTheadSteelType=["10","12","14","16","18","20","22","25","28","32","36","40","全选"];
					} 
				}
			},
			screwTheadSteelMaterialALLChoose(){
				for (var i = 0; i < this.screwTheadSteelMaterial.length; i++) {
					if (this.screwTheadSteelMaterial[i]=="全选") {
						this.screwTheadSteelMaterial=["HRB400","HRB400E","全选"];
					} 
				}
			},
			goodsNameALLChoose(){
				for (var i = 0; i < this.goodsName.length; i++) {
					if (this.goodsName[i]=="全选") {
						this.goodsName=["高线","盘螺","螺纹钢","全选"];
					} 
				}
			},
			isEdit(index){
				for (var i = 0; i < this.goodsData.length; i++) {
					if(this.newBrandsData[index].oneGoodsName==this.goodsData[i].name){
						this.option2.type=this.goodsData[i].type;
						this.option2.material=this.goodsData[i].material;
					}
				}
				this.newBrandsData[index].editCtrl=!this.newBrandsData[index].editCtrl;
			}
		}
	}
</script>

<template>
	<div class="main-warpper">
		<h1>品牌数据</h1>
		<h4>添加新的品牌数据记录</h4>
		<el-col :span="6">
			<span>钢厂/产地:</span>
			<el-input v-model="steelAdds"></el-input>
			<br>
		</el-col>
		<el-col :span="6"></el-col>
		<el-col :span="6">			
			<span>发货方式:</span>
			<el-select v-model="shippingMethods" >
				<el-option v-for="item in option" :label="item.label" :value="item.label"></el-option>
			</el-select>
			<br>
		</el-col>
		<el-col :span="6"></el-col>	
		<br><br><br><br>
		<el-radio-group v-model="selectHandle">
		    <el-radio-button label="品名"></el-radio-button>
		    <el-radio-button label="高线规格"></el-radio-button>
		    <el-radio-button label="高线材质"></el-radio-button>
		    <el-radio-button label="盘螺规格"></el-radio-button>
		    <el-radio-button label="盘螺材质"></el-radio-button>
		    <el-radio-button label="螺纹钢规格"></el-radio-button>
		    <el-radio-button label="螺纹钢材质"></el-radio-button>
  		</el-radio-group>
  		<br>
  		<template v-if="selectHandle==='品名'">
  			<el-checkbox-group v-model="goodsName">
				<el-checkbox v-for="item in goodsData" :label="item.name"></el-checkbox>
    			<el-checkbox label="全选" @change="goodsNameALLChoose"></el-checkbox>		
  			</el-checkbox-group>
  		</template>
  		<template v-else-if="selectHandle==='高线规格'">
  			<el-checkbox-group v-model="highSpeedWireType">
				<el-checkbox v-for="item in goodsData[0].type" :label="item"></el-checkbox>
    			<el-checkbox label="全选" @change="highSpeedWireTypeALLChoose"></el-checkbox>		
  			</el-checkbox-group>
  		</template>
  		<template v-else-if="selectHandle==='高线材质'">
  			<el-checkbox-group v-model="highSpeedWireMaterial">
				<el-checkbox v-for="item in goodsData[0].material" :label="item"></el-checkbox>
    			<el-checkbox label="全选" @change="highSpeedWireMaterialALLChoose"></el-checkbox>		
  			</el-checkbox-group>
  		</template>
  		<template v-else-if="selectHandle==='盘螺规格'">
  			<el-checkbox-group v-model="diskType">
				<el-checkbox v-for="item in goodsData[1].type" :label="item"></el-checkbox>
    			<el-checkbox label="全选" @change="diskTypeALLChoose"></el-checkbox>		
  			</el-checkbox-group>
  		</template>
  		<template v-else-if="selectHandle==='盘螺材质'">
  			<el-checkbox-group v-model="diskMaterial">
    			<el-checkbox v-for="item in goodsData[1].material" :label="item"></el-checkbox>
    			<el-checkbox label="全选" @change="diskMaterialALLChoose"></el-checkbox>		
  			</el-checkbox-group>
  		</template>
  		<template v-else-if="selectHandle==='螺纹钢规格'">
  			<el-checkbox-group  v-model="screwTheadSteelType">
				<el-checkbox v-for="item in goodsData[2].type" :label="item"></el-checkbox>
    			<el-checkbox label="全选" @change="screwTheadSteelTypeALLChoose"></el-checkbox>		
  			</el-checkbox-group>
  		</template>
  		<template v-else>
  			<el-checkbox-group v-model="screwTheadSteelMaterial">
				<el-checkbox v-for="item in goodsData[2].material" :label="item"></el-checkbox>
    			<el-checkbox label="全选" @change="screwTheadSteelMaterialALLChoose"></el-checkbox>		
  			</el-checkbox-group>
  		</template>
  		<br><br><br>
  		<el-button type="primary" @click="getAllData">生成所有货品</el-button>
  		<br><br><br>
  		<el-table :data="newBrandsData">
  			<el-table-column label="钢厂/产地" prop="oneSteelAdds"></el-table-column>
  			<el-table-column label="品名" prop="oneGoodsName"></el-table-column>
  			<el-table-column label="规格" inline-template :context="_self">
  				<template>
  					<template v-if="newBrandsData[$index].editCtrl">
  						<el-select v-model="newBrandsData[$index].oneType">
  							<el-option v-for="item in option2.type" :label="item" :value="item"></el-option>
  						</el-select>
  					</template>
  					<template v-else>
  						{{newBrandsData[$index].oneType}}
  					</template>
  				</template>
  			</el-table-column>
  			<el-table-column label="材质" inline-template :context="_self">
  				<template>
  					<template v-if="newBrandsData[$index].editCtrl">
  						<el-select v-model="newBrandsData[$index].oneMaterial">
  							<el-option v-for="item in option2.material" :label="item" :value="item"></el-option>
  						</el-select>
  					</template>
  					<template v-else>
  						{{newBrandsData[$index].oneMaterial}}
  					</template>
  				</template>
  			</el-table-column>
  			<el-table-column label="发货方式" inline-template :context="_self">
  				<template>
  					<template v-if="newBrandsData[$index].editCtrl">
  						<el-select v-model="newBrandsData[$index].oneMethods">
  							<el-option v-for="item in option" :label="item.label" :value="item.label"></el-option>
  						</el-select>
  					</template>
  					<template v-else>
  						{{newBrandsData[$index].oneMethods}}
  					</template>
  				</template>
  			</el-table-column>
  			<el-table-column label="操作" inline-template :context="_self">
	  			<template>
		  			<template v-if="newBrandsData[$index].editCtrl">
		  				<el-button size="small" type="primary" @click="isEdit($index)">保存</el-button>
		  			</template>
	  				<template v-else>
	  					<el-button size="small" type="success" @click="isEdit($index)">编辑</el-button>
	  				</template>
	  			</template>
	  				
  			</el-table-column>
  		</el-table>
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
	.el-input{
		width: 200px;
	}
</style>