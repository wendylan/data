<script>
import headerbar from '../../components/admin-headerbar.vue';
import {Table,TableColumn,Select,Option,Button} from "element-ui";
import ajaxCustom from '../../components/ajax-custom.js';
import selecter from './child-components/steel_selecter.vue';
	export default{
		components:{
			headerbar,
            selecter,
			elTable:Table,
			elTableColumn:TableColumn,
			elSelect:Select,
			elOption:Option,
			elButton:Button
		},
		created : function(){
			window._myapp = this;
            ajaxCustom.ajaxGet(this, "dingoapi/getMarketPriceByDate", { params : { date : "2017-08-23" } }, function(response){
                console.log(response.body.data)
                this.marketPriceDatas = response.body.data.marketDatas;
                this.webPriceDatas = response.body.data.webDatas;
				this.brands = response.body.data.brands;
				this.suppliers = response.body.data.suppliers;
				this.warehouses = response.body.data.warehouses;
				this.treeModel = response.body.data.treeModel;
				this.isInit = true;
            });
		},
		data(){
			return {
                marketPriceDatas : [],
                webPriceDatas : [],
                brands : [],
                suppliers : [],
                warehouses : [],
				payment : {
					options : [],
					selected : null
				},
				isInit : false
			}
		},
		methods:{
			optionChanging(datas, key){
				for(let key in datas){
					if(!(datas[key] instanceof Object)){
						return false;
					}
				}
				console.log(999)
			}
		}
	}
</script>
<template>
	<headerbar active_number="5-1" :text="['市场价格数据','查看/编辑']">
        <div>
            <div class="tools">
                <div>
                    <div class="float-left">
                        <span>创建时间 : </span>
                        <span>2018-09-15</span>
                    </div>
                    <div class="float-right">
                        <span>买买买当前状态 : </span>
                        <span>蛋疼中</span>
                        <el-button type="waring" size="small">开单操作</el-button>
                    </div>
                    <div class="clear_f"></div>
                </div>
                <div>
                    <selecter v-if="this.isInit" :treeModel="treeModel" :brands="brands" :suppliers="suppliers" :warehouses="warehouses" @optionChanging="optionChanging"></selecter>
                </div>
                <div>
                	<span>付款方式 : </span>
					<el-select v-model="payment.selected" size="small">
						<el-option :value="1">1</el-option>
						<el-option :value="1">2</el-option>
						<el-option :value="1">3</el-option>
					</el-select>
                </div>
            </div>
        </div>
	</headerbar>
</template>
<style scoped>
	.el-button{
		width: 74px;
	}
    .float-left{
        float:left;
    }
    .float-right{
        float: right;
    }
    .clear_f{
        clear:both;
    }

    .tools{
        width:100%;
        padding:25px;
        background:#FFF;
    }
    .tools>div{
        width:100%;
    }
</style>
