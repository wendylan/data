<script>
    import ajaxCustom from '../../../components/ajax-custom.js';
    import { Button, Select, Option, Input, RadioGroup, Radio } from "element-ui";
    export default {
        props : {
            // 所有品牌
            brands : {
				type : Array,
                default(){
                    return [];
                }
			},
        },
        components : {
            elButton : Button,
            elSelect : Select,
            elOption : Option,
            elInput : Input,
            elRadioGroup : RadioGroup,
            elRadio : Radio,
        },
        created(){
            this.hiddleBrands();
        },
        data(){
            return{
                allBrands : [],
                isBilling : false,
                priceRules : 1,
                markPriceData : [],
                markPriceDataCache : [],
                selectBrand : null,
            }
        },
        methods : {
            // 根据品牌获取市场价格 
            getMarketPriceStateByBrand(data){
                this.selectBrand = data;
                for(let item of this.allBrands){
                    item.selected = false;
                }
                data.selected = true;
                ajaxCustom.ajaxGet(this, "dingoapi/getMarketPriceStateByBrand", { params : { 'brand' : data.name } }, (response)=>{
                    console.log(response);
                    this.priceRules = response.body.data.active_rule;
                    this.markPriceData = response.body.data.content ? response.body.data.content : [];
                    this.markPriceDataCache = JSON.parse(JSON.stringify(this.markPriceData));
                    this.initIsBilling(this.markPriceData);
                }, (response)=>{
                    alert(response.body.message);
                });
            },
            // 选中的点击不选中
            removeSelected(item){
                item.selected  = false;
                this.markPriceData = [];
                this.markPriceDataCache = [];
                this.selectBrand = null;
            },
            // 初始化品牌开单或者停单的显示
            initIsBilling(arr){
                let isActiveArrLen = 0;
                let notActiveArrLen = 0;
                for(let data of arr){
                    if(data.isActive){
                        isActiveArrLen++;
                    }else{
                        notActiveArrLen++;
                    }
                }
                if(notActiveArrLen == arr.length){
                    this.isBilling = false;
                }
                if(isActiveArrLen){
                    this.isBilling = true;
                }

            },
            // 品牌开单或者停单
            isShowBilling(){
                this.isBilling = !this.isBilling;
                let content = [];
                if(this.isBilling){
                    for(let data of this.markPriceData){
                        data.isActive = 1;
                        content.push({
                            id : data.id,
                            is_active : data.isActive
                        });
                    }
                }else{
                    for(let data of this.markPriceData){
                        data.isActive = 0;
                        content.push({
                            id : data.id,
                            is_active : data.isActive
                        });
                    }
                }
                ajaxCustom.ajaxPost(this, 'dingoapi/changsMarketPriceState', { content : content  }, (response)=>{
                    console.log(response);
                    alert(response.body.message);
                }, (response)=>{
                    console.log(response);
                });
            },
            // 全部开单或者停单
            isShowAllBilling(){
                this.isBilling = !this.isBilling;
                if(this.isBilling){
                    ajaxCustom.ajaxPost(this, 'dingoapi/changsMarketPriceState', { range : 'all', action : 'open'  }, (response)=>{
                        console.log(response);
                        alert(response.body.message);
                        if(this.selectBrand){
                            this.getMarketPriceStateByBrand(this.selectBrand);
                        }
                    }, (response)=>{
                        console.log(response);
                    });
                }else{
                    ajaxCustom.ajaxPost(this, 'dingoapi/changsMarketPriceState', { range : 'all', action : 'close'  }, (response)=>{
                        console.log(response);
                        alert(response.body.message);
                        if(this.selectBrand){
                            this.getMarketPriceStateByBrand(this.selectBrand);
                        }
                    }, (response)=>{
                        console.log(response);
                    });
                }
            },
            // 获取全部品牌
            hiddleBrands(){
                for(let data of this.brands){
                    this.allBrands.push({
                        selected : false,
                        name : data.abbreviation,
                        id : data.id
                    });
                }
            },
            // 是否打开本页,上传false上去进行关闭
            hideOpenation(){
                this.$emit('hideOpenation', false);
            },
            // 保存输入的数据
            save(){
                let changingDatas = [];

                for(let data of this.markPriceData){
                    for(let cache of this.markPriceDataCache){
                        if(data.id == cache.id && (
                            data.floatType != cache.floatType ||
                            data.floatPrice != cache.floatPrice  ||
                            data.supplier_selected != cache.supplier_selected
                        )){
                            if(this.priceRules == 1){
                                changingDatas.push({
                                    id : data.id,
                                    float_type : data.floatType,
                                    float_price : data.floatPrice,
                                    supplier_id : data.supplier_selected,
                                });
                            }
                            if(this.priceRules == 2){
                                changingDatas.push({
                                    id : data.id,
                                    customize_float_type : data.customizeFloatType,
                                    customize_float_price : data.customizeFloatPrice,
                                    supplier_id : data.supplier_selected,
                                });
                            }
                        }
                    }
                }
                if(changingDatas.length){
                    ajaxCustom.ajaxPost(this, 'dingoapi/editMarketRule', { active_rule : this.priceRules, brand_id : this.selectBrand.id, content : changingDatas  }, (response)=>{
                        console.log(response);
                        alert(response.body.message);
                        this.getMarketPriceStateByBrand(this.selectBrand);
                    }, (response)=>{
                        console.log(response);
                    });
				}else{
                    alert("没有改动任何值");
                }


            },
            // 保存单条输入的数据
            saveOne(data){
                let content = [];
                if(this.priceRules == 1){
                    content.push({
                        id : data.id,
                        float_type : data.floatType,
                        float_price : data.floatPrice,
                        supplier_id : data.supplier_selected,
                    });
                }
                if(this.priceRules == 2){
                    content.push({
                        id : data.id,
                        customize_float_type : data.customizeFloatType,
                        customize_float_price : data.customizeFloatPrice,
                        supplier_id : data.supplier_selected,
                    });
                }
                ajaxCustom.ajaxPost(this, 'dingoapi/editMarketRule', { active_rule : this.priceRules, brand_id : this.selectBrand.id, content : content  }, (response)=>{
                    console.log(response);
                    alert(response.body.message);
                    this.getMarketPriceStateByBrand(this.selectBrand);
                }, (response)=>{
                    console.log(response);
                });
            },
            // 开单一条
            BillingOne(data){
                let content = [];
                content.push({
                    id : data.id,
                    is_active : data.isActive ? 0 : 1
                });
                ajaxCustom.ajaxPost(this, 'dingoapi/changsMarketPriceState', { content : content }, (response)=>{
                    alert(response.body.message);
                    data.isActive = data.isActive ? 0 : 1;
                    this.initIsBilling(this.markPriceData);
                }, (response)=>{
                    console.log(response);
                });
            },
        }
    }
</script>
<template>
    <div>
        <div class="content">
            <div style="clear:both;">
                <span class="left_box">开单操作:</span>
                <span class="right_box">
                    <el-button type="success" v-show="!isBilling" @click="isShowAllBilling" size="small">全部开单</el-button>
                    <el-button type="danger" v-show="isBilling" @click="isShowAllBilling" size="small">全部停单</el-button>
                </span>
            </div>
            <div class="content_top">
                <ul style="list-style:none;margin:0;padding:0;">
                    <li>
                        <span class="brand_style"><b>品牌:</b></span>
                        <div class="li_div">
                            <template v-for="item in allBrands">
                                <span  v-if="!item.selected" @click="getMarketPriceStateByBrand(item)" :class="item.selected ? 'selected': ''">{{ item.name }}</span>
                                <span v-else @click="removeSelected(item)" :class="item.selected ? 'selected': ''">{{ item.name }}</span>
                            </template>

                        </div>

                    </li>
                </ul>
            </div>
        </div>
        <div style="padding:15px;">
            <span><b>取价规则:</b></span>
            <template>
                <el-radio-group v-model="priceRules">
                    <el-radio :label="1">最低价</el-radio>
                    <el-radio :label="2">自定义</el-radio>
                </el-radio-group>
            </template>
            <span class="right_box">
                <el-button type="success" v-show="!isBilling" @click="isShowBilling" size="small">品牌开单</el-button>
                <el-button type="danger" v-show="isBilling" @click="isShowBilling" size="small">品牌停单</el-button>
            </span>
        </div>
        <div class="content" v-if="priceRules == 1">

            <table width="100%" cellspacing="0" cellpadding="0" border="1">
                <thead>
                    <tr>
                        <th>品名</th>
                        <th>规格</th>
                        <th>材质</th>
                        <th>取价规则</th>
                        <th>定价</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, index) in markPriceData">
                        <td>{{ data.cate_spec }}</td>
                        <td>{{ data.size }}</td>
                        <td>{{ data.material }}</td>
                        <td :rowspan="markPriceData.length" v-if="index==0">
                            <span>以品牌的具体规格为标准：</span><br>
                            <span>自提：取广州仓自提的最低价;</span><br>
                            <span>包到：取自提价+运费对比直送包到的最低价。</span>
                        </td>
                        <td>
                            <el-select v-model="data.floatType" size="small" style="width:80px;">
                                <el-option label="上浮" :value="1"></el-option>
                                <el-option label="下浮" :value="2"></el-option>
                            </el-select>
                            <el-input v-model="data.floatPrice" size="small" type="number"></el-input><span>元/吨</span>
                        </td>
                        <td>
                            <el-button @click="saveOne(data)" type="primary" size="small">保存</el-button>
                            <el-button v-if="data.isActive" @click="BillingOne(data)" type="danger" size="small">停单</el-button>
                            <el-button v-else @click="BillingOne(data)" type="success" size="small">开单</el-button>

                        </td>
                    </tr>

                </tbody>
            </table>

        </div>
        <div class="content" v-if="priceRules == 2">

            <table width="100%" cellspacing="0" cellpadding="0" border="1">
                <thead>
                    <tr>
                        <th>品名</th>
                        <th>规格</th>
                        <th>材质</th>
                        <th>供应商</th>
                        <th>定价</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, index) in markPriceData">
                        <td>{{ data.cate_spec }}</td>
                        <td>{{ data.size }}</td>
                        <td>{{ data.material }}</td>
                        <td>
                            <el-select v-model="data.supplier_selected" size="small">
                                <el-option v-for="item in data.suppliers" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </td>
                        <td>
                            <el-select v-model="data.customizeFloatType" size="small" style="width:80px;">
                                <el-option label="上浮" :value="1"></el-option>
                                <el-option label="下浮" :value="2"></el-option>
                            </el-select>
                            <el-input v-model="data.customizeFloatPrice" size="small" type="number"></el-input><span>元/吨</span>
                        </td>
                        <td>
                            <el-button @click="saveOne(data)" type="primary" size="small">保存</el-button>
                            <el-button v-if="data.isActive" @click="BillingOne(data)" type="danger" size="small">停单</el-button>
                            <el-button v-else @click="BillingOne(data)" type="success" size="small">开单</el-button>
                        </td>
                    </tr>

                </tbody>
            </table>

        </div>
        <div class="text_align">
            <el-button type="" @click="hideOpenation" size="small">返回</el-button>
            <el-button type="primary" @click="save" size="small">保存</el-button>
        </div>
    </div>
</template>
<style scoped>
.content{
    background:#fff;
    padding:25px;
}
.text_align{
    text-align: center;
    margin-top: 50px;
}
.left_box{
    float: left;
    font-size: 18px;
    color:#999;
}
.right_box{
    float: right;
    display: inline-block;
}
.content_top{
    clear:both;
    padding-top:5px;
}
.brand_style{
    float : left;
    width : 80px;
}
.li_div{
    height: auto;
    margin: 5px 80px 5px;
}
.li_div span{
    margin: 5px;
    display: inline-block;
    padding: 0px 10px 0px 10px;
    color: #666;
    cursor: pointer;
}
.content .el-input{
    width: 60px;
    display: inline-block;
}
.li_div .selected{
    color : red;
}
table{
    border :solid 1px #DEDEDE;
    font-size:14px;
}
table thead{
    background-color:#e0e6ed;
}
table tbody tr:hover{
    background-color:#e0e6ed;
}
table tr td{
    padding:5px;
    text-align:center;
    border-top :solid 1px #DEDEDE;
}
table tr th{
    padding:8px;
    text-align:center;
    border-bottom :solid 1px #DEDEDE;
}
</style>
