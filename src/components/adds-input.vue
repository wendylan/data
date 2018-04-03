<script>
    import _ from 'lodash';
	import {Select, Option, Button} from "element-ui"
	import addsData from "../../res/json/provinceList.json";
	export default{
		components : {
			elSelect : Select,
			elOption : Option,
			elButton : Button
		},
		props : ['province', 'grade'],
		methods : {
		/*	getCity(){
				this.cityChoose="";
				this.areaChoose="";
				this.cityOption = _.find(this.addsData.province, ['name', this.provinceChoose]).cityList;
			},*/
			getArea(){
				this.areaChoose = "";
                if(this.cityChoose){
                    this.areaOption = _.find(this.cityOption, ['name', this.cityChoose]).areaList;
                }
				let data = {
					city : this.cityChoose,
					area : this.areaChoose
				}
				this.$emit("change", data);
			},
			sendDataToParent(){
				let data = {
					city : this.cityChoose,
					area : this.areaChoose
				}
				this.$emit("getAddressData", data);
			},
			emptyAdds(){
				this.cityChoose = null;
				this.areaChoose = null;
                this.areaOption = [];
			},
		},
		data(){
			return {
				addsData,
				provinceChoose : "",
				cityChoose : null,
				areaChoose : null,
				cityOption : [],
				areaOption : []
			}
		},
		mounted(){
            this.cityOption = _.find(this.addsData.province, ['name', this.province]).cityList;
		}
	}
</script>
<template>
	<span>
		<!-- <span>项目地址：{{province}}省</span> -->
		<!-- <el-select v-model="provinceChoose" @change="getCity" size="small">
			<el-option v-for="item in addsData.province" :label="item.name" :value="item.name"></el-option>
		</el-select> -->

		<el-select v-model="cityChoose" @change="getArea()" size="small" placeholder="城市">
			<el-option v-for="(item,index) in cityOption " :label="item.name" :value="item.name" :key="index"></el-option>
		</el-select>
		<el-select v-model="areaChoose" size="small" placeholder="区\县" @change="sendDataToParent" v-if='grade==1'>
			<el-option v-for="(item, index) in areaOption " :label="item" :value="item" :key="index"></el-option>
		</el-select>
		<el-button @click="emptyAdds" type="default" size="small">置空</el-button>
	</span>
</template>
<style scoped>
	.el-select{
		width: 150px;
	}
</style>
