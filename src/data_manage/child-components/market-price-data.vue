<script>
import headerbar from '../../components/admin-headerbar.vue';
import {Table, TableColumn, Select, Option, Button, Popover} from "element-ui";
import ajaxCustom from '../../components/ajax-custom.js';
import selecter from './child-components/steel_selecter.vue';
import orderOperation from './child-components/order_operation.vue';
	export default{
		components:{
			headerbar,
            selecter,
            orderOperation,
			elTable : Table,
			elTableColumn : TableColumn,
			elSelect : Select,
			elOption : Option,
			elButton : Button,
            elPopover : Popover,
		},
		created : function(){
			// 前端初始化 , 分配后端获取的初始化数据
            ajaxCustom.ajaxGet(this, "dingoapi/getInitDatas", function(response){
                console.log(response.body.data)
				this.brands = response.body.data.brands;
				this.suppliers = response.body.data.suppliers;
				this.warehouses = response.body.data.warehouses;
				this.treeModel = response.body.data.treeModel;
				this.isInit = true;
                this.payment.options = response.body.data.payment;
            });
		},
		data(){
			return {
				tableDatas : [],
				tableDatasCache : [],
				morePriceTable : [],
				maxIndex : [],
				selectedAttr : {
					brand : null,
					supplier : null,
					warehouse : null
				},
				showTable : true,
				showType : 1,
                brands : [],
                suppliers : [],
                warehouses : [],
                // 付款方式
				payment : {
					options : [],
					selected : '款到发货'
				},
                // 新增付款方式
                createDatas : {
					newPaymentKind : null,
				},
                // 是否展示开单的页面
                isOpenWindow : false,
				isInit : false
			}
		},
		methods:{
            // 隐藏开单的操作
            hideWindow(data){
                this.isOpenWindow = data;
            },
            // 新增付款方式
            createPaymentKind(){
				let msg = confirm("确定添加 \"" + this.createDatas.newPaymentKind + "\" ?");
                if(msg){
					ajaxCustom.ajaxPost(this, "dingoapi/createPaymentKind", { payment_name : this.createDatas.newPaymentKind }, (responese)=>{
						console.log(responese);
						if(200<=responese.body.status_code<=299){
							alert(responese.body.message);
							this.payment.options.push(responese.body.data);
						}else{
							alert(responese.body.message);
						}
					}, (responese)=>{
						alert(responese.body.message);
						console.log(responese)
					} );
				}
			},
            // 修改付款方式
			editPaymentKind(id, payment_name){
				ajaxCustom.ajaxPost(this, "dingoapi/editPaymentKind", { id : id, payment_name : payment_name }, (responese)=>{
					if(200<=responese.status_code<=299){
						alert(responese.body.message);
					}else{
						alert(responese.body.message);
					}
				}, (responese)=>{
					alert(responese.body.message);
					console.log(responese);
				});
			},
            // 删除修改方式
			delPaymentKind(id, index){
				ajaxCustom.ajaxPost(this, "dingoapi/delPaymentKind", {id : parseInt(id)}, (responese)=>{
					console.log(responese);
					if(200<=responese.status_code<=299){
						alert(responese.body.message);
						this.payment.options.splice(index, 1);
					}else{
						alert(responese.body.message);
					}
				}, (responese)=>{
					alert(responese.body.message);
					console.log(responese);
				});
			},
			optionChanging(datas, key){
				//  是否选中所有选项
				for(let key in datas){
					if(!(datas[key] instanceof Object)){
						this.showTable = false;
						this.selectedAttr = {};
						return false;
					}
				}
				// 保存所选项
				this.selectedAttr = {
					brand : datas.brands.name,
					supplier : datas.suppliers.name,
					warehouse : datas.warehouses.name
				}

				this.showTable = true;
				// 选中数据是否录入
				let hasDatas = true;
				for(let key in datas){
					if(!datas[key].isWrited){
						hasDatas = false;
					}
				}

				if(hasDatas){
					// 有录入则请求数据
					let _params = {
						// date : "2017-12-20",
						brand : datas.brands.name,
						supplier : datas.suppliers.name,
						warehouse : datas.warehouses.name
					}
					ajaxCustom.ajaxGet(this, "dingoapi/getMarketPriceBySteelAndDate", { params : _params }, function(response){
						console.log(response.body.data.marketDatas)
						if(response.body.data.marketDatas.length>=0){
							this.tableDatas = response.body.data.marketDatas.map( (val)=>{
								if(val.price==0 && val.total_limit==0){
									val.price = null;
									val.total_limit = null;
								}
								return val;
							} );
							this.tableDatasCache = JSON.parse(JSON.stringify(this.tableDatas));
							this.maxIndex = [];
							for(let i=0; i<response.body.data.maxIndex; i++){
								this.maxIndex.push(i+1);
							}
							this.morePriceTable = response.body.data.tableDatas.map( (val)=>{
								if(val.price==0 && val.total_limit==0){
									val.price = null;
									val.total_limit = null;
								}
								for(let key of this.maxIndex){
									if(val["price_" + key]==0 && val.total_limit==0){
										val.price = null;
										val.total_limit = null;
									}
								}
								return val;
							});
						}else{
							alert("没有找到相关报价信息");
						}
		            });
				}else{
					// 没录入请求 基础数据
					ajaxCustom.ajaxGet(this, "dingoapi/getAllspecsAndNotice", { params : {data : datas.brands.name, getLine : true} }, function(response){
		                console.log(response.body.data.specsData)
						this.tableDatas = response.body.data.specsData.map( (val)=>{
							val.total_limit = null;
							val.price = null;
							return val;
						});
						this.tableDatasCache = JSON.parse(JSON.stringify(this.tableDatas));
		            });
				}
			},
			postPrice(){
				let _this = this;
				let postDatas = [];

				for(let data of this.tableDatas){
					postDatas.push({
						times : data.times,
						brand : this.selectedAttr.brand,
						cate_spec : data.cate_spec,
						material : data.material,
						size : data.size,
						price : data.price,
						price_source : this.selectedAttr.supplier,
						warehouse : this.selectedAttr.warehouse,
						transport : this.selectedAttr.warehouse == "钢厂直送" ? "钢厂直送" : "广州仓发货",
						payment_kind : this.payment.selected,
						id : data.id,
						total_limit : data.total_limit ? data.total_limit : 0,
						times : data.times ? data.times : 0
					});
				}

				ajaxCustom.ajaxPost(this, "dingoapi/saveMarketPriceDatas", { postDatas : postDatas }, function(response){
					if(response.body.data){
						alert("更改已提交");
						window.location.reload();
					}else{
						alert(response.body.data);
					}
	            });
			}
		}
	}
</script>
<template>
	<headerbar active_number="5-1" :text="['市场价格数据','查看/编辑']">
        <div>
            <!-- 新增付款方式 -->
			<el-popover ref="edit_payment" placement="bottom" trigger="click">
				<ul>
					<li>
						<input type="text" v-model="createDatas.newPaymentKind"/>
						<el-button size="small" type="text" @click="createPaymentKind()">新增</el-button>
					</li>
					<hr />
					<li v-for="(data, index) in payment.options">
						<input type="text" v-model="data.payment_name"/>
						<el-button size="small" type="text" @click="editPaymentKind(data.id, data.payment_name)">修改</el-button>
						<el-button size="small" type="text" @click="delPaymentKind(data.id, index)">删除</el-button>
					</li>
				</ul>
			</el-popover>

            <div v-show="!isOpenWindow">
                <div class="tools">
                    <div>
                        <div class="float-left">
                            <span>创建时间 : </span>
                            <span>2018-09-15</span>
                        </div>
                        <div class="float-right">
                           <!--  <span>买买买当前状态 : </span>
                            <span>蛋疼中</span> -->
                            <el-button type="waring" size="small" @click="isOpenWindow=!isOpenWindow">开单操作</el-button>
                        </div>
                        <div class="clear_f"></div>
                    </div>
                    <div>
                        <selecter v-if="this.isInit" :treeModel="treeModel" :brands="brands" :suppliers="suppliers" :warehouses="warehouses" @optionChanging="optionChanging"></selecter>
                    </div>
                    <div>
                    	<span>付款方式 : </span>
    					<el-select v-model="payment.selected" size="small">
    						<el-option v-for="item in payment.options" :value="item.payment_name" :label="item.payment_name"></el-option>
    					</el-select>
                        <el-button size="small" type="text" v-popover:edit_payment>新增</el-button>
                    </div>
                </div>
    			<hr />
    			<div class="table-box">
    				<div class="float-right" style="margin:20px 0px 20px 0px;padding-right:20px;">
    					<el-button type="default" size="small" :disabled="!selectedAttr.brand&&!selectedAttr.supplier&&!selectedAttr.warehouse">读取网价</el-button>
    					<el-button type="default" size="small" :disabled="!selectedAttr.brand&&!selectedAttr.supplier&&!selectedAttr.warehouse">统一调价</el-button>
    					<el-button @click="postPrice" type="warning" size="small" :disabled="!selectedAttr.brand&&!selectedAttr.supplier&&!selectedAttr.warehouse">更新报价</el-button>
    				</div>

    				<div>
    					<!-- 更新报价table -->
    					<el-table v-show="showTable&&showType==1" :data="tableDatas">
    						<el-table-column prop="cate_spec" label="品名"></el-table-column>
    						<el-table-column prop="size" label="规格"></el-table-column>
    						<el-table-column prop="material" label="材质"></el-table-column>
    						<el-table-column label="限定数量(吨)">
    							<template scope="scope">
    								<el-input v-model="scope.row.total_limit" size="small"></el-input>
    							</template>
    						</el-table-column>
    						<el-table-column label="最新价格(元)">
    							<template scope="scope">
    								<el-input v-model="scope.row.price" size="small"></el-input>
    							</template>
    						</el-table-column>
    						<el-table-column label="快捷操作">
    							<template scope="scope">
    								<el-button type="default" size="small">停单</el-button>
    							</template>
    						</el-table-column>
    					</el-table>
    					<!-- 多次报价table -->
    					<template>
    						<el-table v-show="showTable&&showType==2" :data="morePriceTable">
	    						<el-table-column prop="cate_spec" label="品名"></el-table-column>
	    						<el-table-column prop="size" label="规格"></el-table-column>
	    						<el-table-column prop="material" label="材质"></el-table-column>
	    						<template v-for="index in maxIndex">
	    							<el-table-column :prop="'price_'+index" :label="'第'+index+'次报价'"></el-table-column>
	    						</template>
	    					</el-table>
    					</template>

    					<div class="left-jump-bar">
    						<h3 style="width:30px;" @click="showType==1 ? (showType=2) : (showType=1)">显示报价明细</h3>
    					</div>
    				</div>
    			</div>
            </div>
            <div v-if="isOpenWindow">
                <order-operation :brands="brands" @hideOpenation="hideWindow"></order-operation>
            </div>
        </div>
	</headerbar>
</template>
<style scoped>
	hr{
		border: none;
		border-top:solid 1px #DEDEDE;
		margin:25px;
	}
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
	.table-box{
		background:#FFF;
		margin-bottom:50px;
	}

	.left-jump-bar{
		position:fixed;
		right:0;
		top:50%;
		width: 50px;
		border-top-left-radius:7px;
		border-bottom-left-radius: 7px;
		color:white;
		background:#324157;
		text-align:center;
		font-size: 16;
    	font-weight: 700;
		opacity: 0.3;
	}
	.left-jump-bar:hover{
		opacity: 1;
		cursor: pointer;
	}
</style>
