<script>
    import headerbar from '../../components/admin-headerbar.vue';
	// import echarts from "echarts";
    import ajaxCustom from '../../components/ajax-custom.js';
    import {Table, TableColumn, Select, Option} from 'element-ui';
	export default{
        components : {
            headerbar,
            elSelect : Select,
            elOption : Option,
            elTable : Table,
            elTableColumn : TableColumn,
        },
        created : function(){
            ajaxCustom.ajaxGet(this,"dingoapi/getAllHasbrands", (responese)=>{
                for(let data of responese.body.data){
                    this.allBrandsName.push(data.brand);
                }
                console.log(responese);
            },(responese)=>{
                console.log(responese);
            });

            let brands = this.$route.params.name.substring(0, this.$route.params.name.length-1).split('&');
            this.initBrandsData(brands);
        },
        data (){
            return{
                tableData : [],
                allBrandsName : [],
                threeBrand : "",
                fouthBrand : ""
            }
        },
        methods : {
            initBrandsData(brands){
                ajaxCustom.ajaxGet(this,"dingoapi/brandsDiff", { params : { brands : brands } }, (responese)=>{
                    console.log(responese);
                    this.tableData = [];
                    let brandsData = responese.body.data;
                    let basicData = { 0 : "", 1 : "", 2 : "", 3 : "", 4 : "" };

                    var basicLine = JSON.parse(JSON.stringify(basicData));
                    basicLine[0] = "品牌";
                    for(let i=0; i<brandsData.length; i++){
                        basicLine[i+1] = brandsData[i].brandData[0].brand;
                    }
                    this.tableData.push(basicLine);

                    basicLine = JSON.parse(JSON.stringify(basicData));
                    basicLine[0] = "规格";
                    for(let i=0; i<brandsData.length; i++){
                        basicLine[i+1] = JSON.stringify(brandsData[i].brandData[0].steel).replace(/:{/g, "<br/>").replace(/{|}|'|"|\[/g, '').replace(/],/g, "<br/>").replace(/]/g, '').replace(/:/g, ": ");
                    }
                    this.tableData.push(basicLine);

                    //货源
                    // var basicLine = JSON.parse(JSON.stringify(basicData));
                    // basicLine[0] = "货源";
                    // this.tableData.push(basicLine);

                    //网价均价
                    basicLine = JSON.parse(JSON.stringify(basicData));
                    basicLine[0] = "Φ18-25近一个月网价均价(元/吨)";
                    this.tableData.push(basicLine);

                    //基础均价
                    basicLine = JSON.parse(JSON.stringify(basicData));
                    basicLine[0] = "Φ18-25近一个月基础均价(元/吨)";

                    for(let j=0; j<brandsData.length; j++){
                        if(brandsData[j].brandData[0].resourceDatas){
                            basicLine[j+1] = "非抗震:" + brandsData[j].brandData[0].resourceDatas[0].material.toFixed(2) + "     " + "抗震:" + brandsData[j].brandData[0].resourceDatas[0]._material.toFixed(2);
                        }
                    }
                    this.tableData.push(basicLine);

                    //包到均价
                    basicLine = JSON.parse(JSON.stringify(basicData));
                    basicLine[0] = "Φ18-25近一个月包到均价(元/吨)";
                    this.tableData.push(basicLine);

                    //发货方式
                    basicLine = JSON.parse(JSON.stringify(basicData));
                    basicLine[0] = "发货方式";
                    this.tableData.push(basicLine);

                    //运费
                    basicLine = JSON.parse(JSON.stringify(basicData));
                    basicLine[0] = "运费(元/吨)";
                    this.tableData.push(basicLine);

                },(responese)=>{
                    console.log(responese);
                });
            },
            getBrandData(data){
                console.log()
                let brands = [];
                for(let i=1; i<Object.keys(this.tableData[0]).length-1; i++){
                    console.log(this.tableData[0][i].length)
                    if(this.tableData[0][i].length){
                        brands.push(this.tableData[0][i]);
                    }
                }
                brands.push(data);
                console.log(brands)
                this.initBrandsData(brands);
            }
        }
    }

</script>
<template>
    <headerbar active_number="1" :text="['品牌对比','多个品牌对比功能']">
        <div>
            <el-table :data="tableData" :show-header="false" border >
                <el-table-column align="center" prop="0" width="150px"></el-table-column>
                <el-table-column>
                    <template scope="scope">
                        <span v-html="scope.row[1]"></span>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template scope="scope">
                        <span v-html="scope.row[2]"></span>
                    </template>
                </el-table-column>
                <el-table-column prop="3">
                    <template scope="scope">
                        <template v-if="scope.$index==0&&scope.row[3].length==0">
                            <el-select size="small" v-model="threeBrand" @change="getBrandData" >
                                <el-option v-for="item in allBrandsName" :label="item" :value="item"></el-option>
                            </el-select>
                        </template>
                        <template v-else>
                            <span v-html="scope.row[3]"></span>
                        </template>
                    </template>
                </el-table-column>
                <el-table-column prop="4">
                    <template scope="scope">
                        <template v-if="scope.$index==0&&scope.row[4].length==0">
                            <el-select size="small" v-model="fouthBrand" @change="getBrandData" >
                                <el-option v-for="item in allBrandsName" :label="item" :value="item"></el-option>
                            </el-select>
                        </template>
                        <template v-else>
                            <span v-html="scope.row[4]"></span>
                        </template>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </headerbar>
</template>
<style scoped>
    h1,h4{
        font-weight:400;
    }
    h4{
        color:#666;
    }
</style>

<style>
    td:first-child{
        background-color:#eef1f6;
        border-bottom: solid 1px #DEDEDE;
    }
</style>
