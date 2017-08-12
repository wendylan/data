<script>
    import echarts from "echarts";
    import {Form,FormItem, Button, Select, Input, Table, TableColumn, Option, DatePicker, Col ,Loading } from 'element-ui';
    import ajaxCustom from '../../components/ajax-custom.js';
    export default{
        components : {
            elCol : Col,
            elTable : Table,
            elTableColumn : TableColumn,
            elSelect : Select,
            elOption : Option,
            elInput : Input,
            elButton : Button,
            elDatePicker : DatePicker,
            elFormItem : FormItem ,
            elForm : Form
        },
        created : function(){
            this.getBrands();
        },
        mounted (){
            this.chartOpen();
        },
        methods :{
            /*统计图打开*/
            chartOpen(){
            var myChart = echarts.init(document.getElementById('main'));
                myChart.setOption({
                    title: {
                        textStyle:{
                            fontSize :12
                        }
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data : ["网价","市场直送价","市场自提价","网价-市场直送差价","网价-市场自提差价"]
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data:this.dateBetween
                    },
                    yAxis:[
                    {
                        min : 1500,
                        name:'价格',
                        type: 'value'
                    },{
                        max : 200,
                        name:'差价',
                        type: 'value'
                    }
                    ],
                    series:this.historyData
                });
            },
            /*获得品牌名称*/
            getBrands(){
                // console.log(_token);
                ajaxCustom.ajaxGet(this,"dingoapi/getFactorys", (responese)=>{
                let brands=responese.body.data;
                this.brandsData=[];
                    for (var i = 0; i < brands.length; i++) {
                        this.brandsData.push({'name':brands[i].brand});
                    }
                }, (responese)=>{
                    console.log(responese);
                });
            },
            /*获得并处理品牌数据*/
            getBrandsProducts(brand){
                this.product="";
                ajaxCustom.ajaxPost(this,"dingoapi/getProductsData",{ brand : brand.name }, (responese)=>{
                    console.log(this.brands);
                    let productData=responese.body.data;
                    brand.product=undefined;
                    for (var i = 0; i < productData.length; i++) {
                        this.getProductsData(brand,productData[i]);
                    }
                    this.productGroup=brand.product;
                }, (responese)=>{
                    console.log(responese);
                });
            },
            /*时间的业务逻辑处理，并检测数据是否完全，提交表单*/
            foremostDateContrast(date){
                if(this.final!=''&&this.final!=undefined){
                    let foremost=new Date(date);
                    let final=new Date(this.final);
                    if (this.dateConrtrast(foremost.getTime()/1000,final.getTime()/1000+86400)) {
                        this.foremost='';
                    }
                }
                this.seachHistoryPrice();
            },
            finalDateContrast(date){
                if(this.foremost!=''&&this.foremost!=undefined){
                    let foremost=new Date(this.foremost);
                    let final=new Date(date);
                    if (this.dateConrtrast(foremost.getTime()/1000,final.getTime()/1000+86400)) {
                        this.final='';
                    }else{
                    this.seachHistoryPrice();

                    }
                }
            },
            dateConrtrast(foremost,final){
                if (final<=foremost) {
                    return true;
                }else{
                    this.timeBetween=[];
                    this.dateBetween=[];
                    this.createXAxis(foremost,final);
                    return false;
                }
            },
            //生成时间轴（x轴）
            createXAxis(foremost,final){
                if (foremost<final) {
                    this.timeBetween.push(foremost);
                    this.dateBetween.push(this.timeChangeToDate(foremost));
                    this.createXAxis(foremost+86400,final);
                }else{
                    return;
                }
            },
            //时间戳转换成日期
            timeChangeToDate(timestamp){
                var time = new Date(parseInt(timestamp) * 1000);
                // var y = time.getFullYear();
                var m = time.getMonth()+1;
                var d = time.getDate();
                // var h = time.getHours();
                // var mm = time.getMinutes();
                // var s = time.getSeconds();
                return /*y+'-'+*/this.formatTime(m)+'-'+this.formatTime(d)/*+' '+this.formatTime(h)+':'+this.formatTime(mm)+':'+this.formatTime(s)*/;
            },
            formatTime:function(m){
                return m<10?'0'+m:m ;
            },
            //检测材质是否有数据
            changeMaterial(){
                this.seachHistoryPrice();
            },
            //提交数据，获得网价，市场价以及报价日期
            seachHistoryPrice(){
                // console.log(this.final);
                if(this.foremost!=''&&this.foremost!=undefined){
                    if(this.final!=''&&this.final!=undefined){
                        if (this.material!='') {
                            let loadingInstance = Loading.service({ fullscreen: true });
                            var data={}; 
                            data.foremostDate = this.foremost.getTime()/1000;
                            data.finalDate    = this.final.getTime()/1000+86400;
                            data.brand        = this.brands.name;
                            data.product      = this.product.name;
                            data.type         = this.type.name ;
                            data.material     = this.material; 
                            ajaxCustom.ajaxPost(this,"dingoapi/seachHistoryPrice",{data}, (responese)=>{
                                // console.log(responese);
                                if (responese.body.data.webPrice.length!=0&&responese.body.data.marketPrice.length!=0) {
                                    /*获取统计图网价数据*/
                                    let web=this.getChartWebPrice(responese.body.data.webPrice);
                                    /*获取统计图市场直送价数据*/
                                    let marketSend=this.getChartMarketSendPrice(responese.body.data.marketPrice);
                                    /*获取统计图市场自提价数据*/
                                    let marketSelf=this.getChartMarketSelfPrice(responese.body.data.marketPrice);
                                    /*获取统计图网价直送差价数据*/
                                    this.getWebSendDiffPrice(web,marketSend);
                                    /*获取统计图网价自提差价数据*/
                                    this.getWebSelfDiffPrice(web,marketSelf);
                                    /*求均价*/
                                    // console.log(marketSend);
                                    this.marketSendAvgPrice=this.getAvg(marketSend);
                                    this.marketSelfAvgPrice=this.getAvg(marketSelf);
                                    this.webAvgPrice=this.getAvg(web);
                                    /*获取均价差价*/
                                    this.webSendpriceDifference=this.getAvgPriceDiff(this.webAvgPrice,this.marketSendAvgPrice);
                                    this.webSelfpriceDifference=this.getAvgPriceDiff(this.webAvgPrice,this.marketSelfAvgPrice);
                                    /*显示单位*/
                                    this.webAvgPrice=this.unitDisplay(this.webAvgPrice);
                                    this.marketSendAvgPrice=this.unitDisplay(this.marketSendAvgPrice);
                                    this.marketSelfAvgPrice=this.unitDisplay(this.marketSelfAvgPrice);
                                    this.webSendpriceDifference=this.unitDisplay(this.webSendpriceDifference);
                                    this.webSelfpriceDifference=this.unitDisplay(this.webSelfpriceDifference);
                                }else if(responese.body.data.webPrice.length!=0){
                                    /*获取统计图网价数据*/
                                    let web=this.getChartWebPrice(responese.body.data.webPrice);
                                    /*求均价*/
                                    console.log(web);
                                    this.webAvgPrice=this.getAvg(web)+"元/吨";
                                    /*清空市场数据*/
                                    this.cleanMarketData();
                                }else if(responese.body.data.marketPrice.length!=0){
                                    /*获取统计图市场直送价数据*/
                                    let marketSend=this.getChartMarketSendPrice(responese.body.data.marketPrice);
                                    /*获取统计图市场自提价数据*/
                                    let marketSelf=this.getChartMarketSelfPrice(responese.body.data.marketPrice);
                                    /*求均价*/
                                    this.marketSendAvgPrice=this.getAvg(marketSend)+"元/吨";
                                    this.marketSelfAvgPrice=this.getAvg(marketSelf)+"元/吨";
                                    /*清空网价数据*/
                                    this.cleanWebData();
                                }else{
                                    /*清空数据*/
                                    this.cleanWebData();
                                    this.cleanMarketData();
                                }
                                this.chartDisplay=1;
                                this.chartOpen();
                                loadingInstance.close();
                            }, (responese)=>{
                                console.log(responese);
                                loadingInstance.close();
                            });
                        }
                    }
                }
            },
            /*获取统计图市场直送价数据*/
            getChartMarketSendPrice(marketData){
                let marketSend=this.historyData[0].data=[];
                for (var i = 0; i < this.dateBetween.length; i++) {
                    marketSend.push(undefined);
                    for(var j = 0; j < marketData.length; j++){
                        let timeadd=marketData[j].date%86400<57600?28800:-57600;
                        let time=parseInt(marketData[j].date/86400)*86400-timeadd;
                        if(this.timeBetween[i]==time&&marketData[j].transport=="直送"){
                            marketSend[i]=parseInt(marketData[j].price);
                        }
                    }
                }
                return marketSend;
            },
            /*获取统计图市场自提价数据*/
            getChartMarketSelfPrice(marketData){
                let marketSelf=this.historyData[3].data=[];
                for (var i = 0; i < this.dateBetween.length; i++) {
                    marketSelf.push(undefined);
                    for(var j = 0; j < marketData.length; j++){
                        let timeadd=marketData[j].date%86400<57600?28800:-57600;
                        let time=parseInt(marketData[j].date/86400)*86400-timeadd;
                        if(this.timeBetween[i]==time&&marketData[j].transport=="广州仓发货"){
                            marketSelf[i]=parseInt(marketData[j].price);
                        }
                    }
                }
                return marketSelf;
            },
            /*获取统计图网价数据*/
            getChartWebPrice(webData){
                let web=this.historyData[1].data=[];
                for (var i = 0; i < this.dateBetween.length; i++) {
                    web.push(undefined);
                    for (var j = 0; j < webData.length; j++) {
                        let timeadd=webData[j].file_name%86400<57600?28800:-57600;
                        let time=parseInt(webData[j].file_name/86400)*86400-timeadd;
                        if(this.timeBetween[i]==time&&webData[j].web_price!="-"){
                            // console.log(webData[j].web_price!="-");
                            web[i]=parseInt(webData[j].web_price);
                        }
                    }
                }
                return web;
            },
            /*获取统计图网价直送差价数据*/
            getWebSendDiffPrice(webData,marketData){
                let webSendpriceDifference=this.historyData[2].data=[];
                for (var i = 0; i < this.dateBetween.length; i++) {
                    webSendpriceDifference.push(undefined);
                    if (webData[i]!=undefined&&marketData[i]!=undefined){
                        webSendpriceDifference[i]=webData[i]-marketData[i];
                    }
                }
            },
            /*获取统计图网价自提差价数据*/
            getWebSelfDiffPrice(webData,marketData){
                let webSendpriceDifference=this.historyData[4].data=[];
                for (var i = 0; i < this.dateBetween.length; i++) {
                    webSendpriceDifference.push(undefined);
                    if (webData[i]!=undefined&&marketData[i]!=undefined){
                        webSendpriceDifference[i]=webData[i]-marketData[i];
                    }
                }
            },
            /*获取均价差价*/
            getAvgPriceDiff(webPrice,marketPrice){
                if(marketPrice!="暂无数据"){
                    return webPrice-marketPrice;
                }
                return marketPrice;
            },
            /*求均价*/
            getAvg(array){
                let sum=0;
                let undefinedCount=0;
                for (var i = 0; i < array.length; i++) {
                    if (array[i]!=undefined) {
                        sum+=array[i];
                    }else{
                        undefinedCount+=1;
                    }
                }
                if(undefinedCount==array.length){
                    return "暂无数据";
                }
                let avg=parseInt(sum/(array.length-undefinedCount));
                return avg;
            },
            /*单位显示*/
            unitDisplay(data){
                if(data!='暂无数据'){
                    return data+'元/吨';
                }
                return data;
            },
            /*接收空数据时清空原有数据*/
            cleanMarketData(){
                this.marketSendAvgPrice="暂无数据";
                this.marketSelfAvgPrice="暂无数据";
                this.webSendpriceDifference="暂无数据";
                this.webSelfpriceDifference="暂无数据";
                this.historyData[0].data=[];
                this.historyData[2].data=[];
                this.historyData[3].data=[];
                this.historyData[4].data=[];
            },
            cleanWebData(){
                this.webAvgPrice="暂无数据";
                this.webSendpriceDifference="暂无数据";
                this.webSelfpriceDifference="暂无数据";
                this.historyData[1].data=[];
                this.historyData[2].data=[];
                this.historyData[4].data=[];
            },
            /*产品数据处理*/
            getProductsData(brand,data){
                if (brand.product==undefined) {
                    brand.product=[{name : data.product , type :[{name : data.type ,material :[data.material]}]}];
                }else{
                    for (var i = 0; i < brand.product.length; i++) {
                        if(brand.product[i].name==data.product){
                            this.getTypeData(brand.product[i],data);
                            return;
                        }
                    }
                    brand.product.push({name : data.product , type :[{name : data.type ,material :[data.material]}]});
                }
            },
            getTypeData(product,data){
                for (var i = 0; i < product.type.length; i++) {
                    if(product.type[i].name==data.type){
                        this.getMaterialData(product.type[i],data.material);
                        return;
                    }
                }
                product.type.push({name : data.type ,material :[data.material]});
                },
            getMaterialData(type,material){
                type.material.push(material);
            },
            /*联动处理*/
            changeProducts(product){
                this.type='';
                this.typeGroup=product.type;
            },
            changeType(type){
                this.material='';
                this.materialGroup=type.material;
            }
        },

        data(){
            return {
                chartDisplay : 0,
                //禁止选中日期（今日之后的日期）
                pickerOptions: {
                    disabledDate(time) {
                        return time.getTime() > Date.now() ;
                    }
                },
                //历史价格数据
                historyData : [
                    {
                        name:'市场直送价',
                        type:'line',
                        data:[]
                    },
                    {
                        name:'网价',
                        type:'line',
                        data:[]
                    },
                    {
                        name:'网价-市场直送差价',
                        type:'bar',
                        yAxisIndex: 1,
                        data:[]
                    },
                    {
                        name:'市场自提价',
                        type:'line',
                        data:[]
                    },
                    {
                        name:'网价-市场自提差价',
                        type:'bar',
                        yAxisIndex: 1,
                        data:[]
                    }
                ],
                //市场自提均价
                marketSelfAvgPrice : "暂无数据",
                //市场直送均价
                marketSendAvgPrice : "暂无数据",
                //网价均价
                webAvgPrice : "暂无数据",
                //网价自提差价均价
                webSelfpriceDifference :"暂无数据",
                //网价直送差价均价
                webSendpriceDifference :"暂无数据",
                //x轴时间及时间戳
                dateBetween :[],
                timeBetween : [],
                //日期数据绑定
                foremost : '',
                final : '',
                //钢厂or品牌
                brands : '',
                //产品数据
                product : '',
                productGroup : [],
                //规格数据
                type : '',
                typeGroup :[],
                //材质数据
                material : '',
                materialGroup :[],
                //数据源
                brandsData : []
            }
        }
    }
</script>
<template>
    <div class="main-warpper">
        <h1>历史数据</h1>
        <h4>近期钢材数据统计</h4>
        <div class="form">
            <el-form>
                <div class="tocenter">
                    <div>
                        <span>请&nbsp选&nbsp择&nbsp时&nbsp间：</span>
                        <el-date-picker v-model="foremost" @change="foremostDateContrast(foremost)"
                        :picker-options="pickerOptions"
                        ></el-date-picker><span>--</span>
                        <el-date-picker v-model="final" @change="finalDateContrast(final)"
                        :picker-options="pickerOptions"
                        ></el-date-picker><br>
                    </div>
                    <div>
                        <span>品&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp牌：</span>
                        <el-select v-model="brands" @change="getBrandsProducts(brands)">
                            <el-option v-for="item in brandsData" :label="item.name" :value="item"></el-option>
                        </el-select><br>
                    </div>
                    <div>
                        <span>品&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp名：</span>                
                        <el-select v-model="product" @change="changeProducts(product)">
                            <el-option v-for="item in productGroup" :label="item.name" :value="item"></el-option>
                        </el-select><br>
                    </div>
                    <div>
                        <span>规&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp格：</span>
                        <el-select v-model="type" @change="changeType(type)">
                            <el-option v-for="item in typeGroup" :label="item.name" :value="item"></el-option>
                        </el-select><br>
                    </div>
                    <div>
                        <span>材&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp质：</span>
                        <el-select v-model="material" @change="changeMaterial()">
                            <el-option v-for="item in materialGroup" :label="item" :value="item"></el-option>
                        </el-select><br>
                    </div>
                </div>
                <div class="tocenter">
                    <div class="lineHigh" v-if="webAvgPrice!='暂无数据'">
                        <span>网&nbsp&nbsp价&nbsp&nbsp均&nbsp&nbsp价&nbsp：<font class="fontToCen">{{webAvgPrice}}</font></span>
                    </div>
                    <div class="lineHigh" v-if="marketSelfAvgPrice!='暂无数据'">
                        <span >市场自提均价：<font class="fontToCen">{{marketSelfAvgPrice}}</font></span>
                    </div>
                    <div class="lineHigh" v-if="marketSendAvgPrice!='暂无数据'">
                        <span >市场直送均价：<font class="fontToCen">{{marketSendAvgPrice}}</font></span>
                    </div>
                    <div class="lineHigh" v-if="webSelfpriceDifference!='暂无数据'">
                        <span>网价自提差价：<font class="fontToCen">{{webSelfpriceDifference}}</font></span>	
                    </div>
                    <div class="lineHigh" v-if="webSendpriceDifference!='暂无数据'">
                        <span>网价直送差价：<font class="fontToCen">{{webSendpriceDifference}}</font></span>  
                    </div>
                </div>
            </el-form>
        </div>
        <div   id="main" ></div>
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
        color:#888;
    }
    .el-input{
        width: 140px;
    }
    .scroll{
        width: 150px;
        height: 150px;
        overflow: scroll;
    }
    .form{
        float: left;
        width: 512px;
        margin:50px auto 10px auto;
    }
    .tocenter{
        margin:10px auto 10px 0px;
        padding: 1px;
    }
    .fontToCen{
        margin-left: 100px; 
    }
    .el-select{
        margin-top: 15px;
        width:300px;
        text-align: center;
    }
    .lineHigh{
        margin-bottom:10px; 
    }
    #main{
        float: left;
        width: 700px;
        height: 450px;
    }
</style>