<script>
	import headerbar from "../components/same-headerbar.vue";
	import ajaxCustom from '../components/ajax-custom.js';
	import planList from "../components/demand_plan.vue";
	import projectChanger from '../components/project_to_text.js';
	import createProjectBox from '../components/ProjectCreating/project-creating-box.vue';
	import order from './child-components/order_deal.vue';
	import proTable from './child-components/table.vue';
	import filterBar from '../components/filter-bar.vue';
	import sortMethods from './child-components/steel-sort.js';
	import { Table, TableColumn, Button, Select, Option, Dialog, Input, DatePicker } from 'element-ui';
	import _ from 'lodash';
	export default{
		components : {
			headerbar,
			planList,
			order,
			createProjectBox,
			elTable : Table,
			elDialog : Dialog,
			elInput : Input,
			elTableColumn : TableColumn,
			elButton : Button,
			elSelect : Select,
			elOption : Option,
			elDatePicker : DatePicker,
			proTable : proTable,
			filterBar : filterBar
		},
		created(){
				// 全局变量 配合组件通信
				console.log(window._defaultDatas)
				this.project.list = (window._defaultDatas.projectDatas).reverse();
				this.companys.list = window._defaultDatas.agentCompanys;
				this.nameList = window._defaultDatas.nameList;
				// 初始化主要参数
				this.tempTableDatas = window._defaultDatas.megerDatas;
				this.tableDatas = JSON.parse(JSON.stringify(this.tempTableDatas));
				this.fiterData = this.tableDatas;
				this.getAllBrands();
		},
		data(){
			return {
				tableDatas : null,
				tempTableDatas : null,
				// 合同价计算规则
				contractPriceRule : null,
				// 品牌别名表
				nameList : null,
				// 项目
				project : {
					list : [],
					selected : null,
					info : { name : "", brands : "" }
				},
				// 运输
				logistics : {
					type : 0,
					typeArr : [
						{ value : 1, text : "买方自提"},
						{ value : 0, text : "卖方承运" }
					],
					carsList : [{
						number : null,
						driver : null,
						tel : null,
						idCard : null
					}]
				},
				filter : {
					brand : null,
					product : null,
					material : null,
					size : null
				},
				openBox : false,
				isOpenDialog : false,
				isSelectNeeding : false,
				// 公司
				companys : {
					list : [],
					selected : null
				},
				//已选数据
				selectData : [],
				// 选中项目的品牌
				selectBrands : [],
				// 缓存table数据
				demand : true,
				// 选中的计划单
				planList : null,
				confirmOrcancel : null,
				allBrands : [],
				demandSelect : [],
				fiterData : [],
			}
		},
		methods : {
			// 添加项目
			addProject(formDatas){
				ajaxCustom.ajaxPost(this, "dingoapi/addProjectDatas", formDatas, (response)=>{
					console.log(response)
					this.project.list = response.body.data.reverse();
					this.project.selected = this.project.list[0].project_info_id;
					alert("添加成功");
				}, (response)=>{
					alert(response.body.message);
				});
			},
			// 使用Vue.set添加table属性
			addAttrToTable(tableDatas){
				for(let data of tableDatas){
					this.$set(data, "amount", null);
					this.$set(data, "countPrice", null);
				}
				return tableDatas;
			},
			// 计算品牌范围内数据
			brandFilter(tableDatas){
				let brands = _.filter(this.project.list, [ "project_info_id", this.project.selected ]);
				brands = brands.length ? brands[0].brands : [];
				let result = [];
				for(let data of tableDatas){
					if(_.includes(brands, data.brand)){
						result.push(data);
					}
				}
				return result;
			},
			// 请求合同价计算规则 并计算合同价
			getContractPrice(id){
				if(parseInt(id)){
					// 计算品牌范围内数据
					this.tableDatas = this.brandFilter(this.tempTableDatas);
					this.selectBrands = _.filter(this.project.list, [ "project_info_id", id])[0].brands;

					ajaxCustom.ajaxGet(this, "dingoapi/getSettlementInfo", {params : { id : id }}, (responese)=>{
						console.log(responese)
						this.contractPriceRule = responese.body.data;
						// 显示选中的项目信息
						let pickedProject = _.filter(this.project.list, [ "project_info_id", id ])[0];
						this.project.info = pickedProject;
						this.project.info.settlementText = projectChanger.todo(pickedProject, true);

						// 合同价 : 计算并排序
						this.countContractPrice();
						this.tableDatas = this.brandFilter(JSON.parse(JSON.stringify(this.tempTableDatas)));
						this.tableDatas = sortMethods.todo(this.tableDatas, [
								{ text : "品名", key : "cate_spec" },
								{ text : "规格", key : "size" },
								{ text : "材质", key : "material" }
							], 'desc');
						// 禁止将错误数据传到 filterBar
						if(this.tableDatas.length && this.tableDatas[0]!==null){
							this.fiterData = JSON.parse(JSON.stringify(this.tableDatas));
						}
					}, (responese)=>{
						alert(responese.body.message);
					});

				}
			},
			// 计算合同价
			countContractPrice(){
				let priceType = this.project.info.settlementText.indexOf("网价")>=0 ? 1 : 2;
				for(let data of this.tempTableDatas){
					// 获取符合品牌名称的rule
					let rules = _.filter(this.contractPriceRule, { "brand" : data.brand, "specification" : data.cate_spec });
					let _rules = _.filter(this.contractPriceRule, { "elseName" : data.brand, "specification" : data.cate_spec });
					let matchRule = _.concat(rules, _rules);
					// 分别获取 现货价 和 网价 的 rule
					let matchMarketRule = _.filter(matchRule, { "reference" : "现货价" });
					let matchWebRule = _.filter(matchRule, { "reference" : "网价" });
					matchWebRule = _.concat(matchWebRule, _.filter(matchRule, { "reference" : "最新网价" }));
					// 计算合同价
					let rule = matchMarketRule.length ? matchMarketRule[0] : matchWebRule[0];
					data.countPrice =  _.sum(_.map(_.values(rule), (val)=>{
						if(parseInt(val) > 0) { return parseInt(val); }
					}));
					data.countPrice = data.countPrice ? data.countPrice : 0;
					// 按网价还是现货价结算, 如果没有该价格, 则不计算合同价
					if(priceType === 1 && !data.web_price){
						data.countPrice = 0;
						return false;
					}else if(priceType === 2 && !data.price){
						data.countPrice = 0;
						return false;
					}
					data.countPrice += parseInt(matchMarketRule.length ? (parseInt(data.price) || 0) : (parseInt(data.web_price) || 0 ));
				}
			},
			// 物流信息 : 添加车辆信息
			addNewCar(){
				this.logistics.carsList.push({
					number : null,
					tel : null,
					driver : null,
					idCard : null
				});
			},
			// 创建订单 下单
			createOrder(data){
				data.project_id = this.project.selected;
				ajaxCustom.ajaxPost(this, '/dingoapi/saveOrder', data, (responese)=>{
					console.log(responese);
					window.location.href='/usercenter#/userorder';
					this.isOpenDialog = false;
				}, (responese)=>{
					alert(responese.body.message);
				});
			},
			//关闭模态框
			exitOrder(){
				this.isOpenDialog = false;
			},
			// 打开订单模态框
			makeOrder(){
				this.dataReady(this.tableDatas);
				let hasAmount = false;
				for(let data of this.tableDatas){
					if(data.amount){
						hasAmount = true;
						break;
					}
				}
				if(hasAmount){
					this.isOpenDialog = true;
				}else{
					alert("先输入数量");
				}
			},
			dataReady(data){
				var selectData = [];
				for (var i = 0; i < data.length; i++) {
					if(data[i].amount){
						selectData.push({
							'id' : data[i].id,
							'plate_num' : null,
							'amount' : data[i].amount,
							'brand' : data[i].brand,
							'warehouse' : data[i].warehouse,
							'cate_spec' : data[i].cate_spec,
							'price' : data[i].countPrice,
							'material' : data[i].material,
							'size' : data[i].size,
							'marketPrice' : data[i].price,
							'web_price' : data[i].web_price
						});
					}
				}
				this.selectData = selectData;
				console.log(selectData);
			},
			jumpUrl(){
				window.location.href = "/searchproduct#/";
			},
			getAllBrands(){
				ajaxCustom.ajaxGet(this, 'dingoapi/getAllProduct', (a)=>{
					for(let item of a.data.brand){
						this.allBrands.push(item.brand);
					}
				}, (a)=>{
					alert(a.data.message);
				});
			},
			// 默认显示合同价最低价格的数据
			demandConfirm(data){
				this.planList = data.selectData;
				// 筛选出计划单内规格datas
				let planDatas = [];
				for(let plan of this.planList){
					for(let _data of this.tempTableDatas){
						if(plan.spec==_data.cate_spec && plan.material==_data.material && plan.size==_data.size){
							planDatas.push(_data);
						}
					}
				}
				this.tableDatas = planDatas;
				this.showPlanDatas();
				this.showSelect();
			},
			// 最低价格算法
			showPlanDatas(){
				this.confirmOrcancel = true;

				let _this = this;
				this.tableDatas = _.filter(this.tableDatas, function(data) { 
					return _.includes(_this.selectBrands, data.brand); 
				});
				let bestPrice = _.filter(this.tableDatas, function(data){
					return _.forEach(_this.planList, function(item){
						if( data.material == item.material&&data.cate_spec == item.spec&&data.size == item.size){
							return true;
						}
					});
				});

				let suitableDatas = [];
				for(let data of sortMethods.classify(bestPrice, "material")){
					suitableDatas.push(sortMethods.classify(data, "size"));
				}
				let result = [];
				for(let plan of this.planList){
					for(let tempArr of suitableDatas){
						for(let arr of tempArr){
							if(arr[0] && arr[0].size == plan.size && arr[0].material == plan.material && arr[0].cate_spec == plan.spec){
								let temp = arr.sort(function(a, b){
									return (parseInt(a.countPrice) - parseInt(b.countPrice));
								});
								temp[0] ? result.push(temp[0]) : false;
								if(temp[0]){
									for(let tData of this.tableDatas){
										if(tData.id === temp[0].id){
											tData.amount = plan.value;
											tData.display = true;
										}
									}
								}
							}
						}
					}
				}
				this.addLackingSteel();
				this.demand = false;
			},
			addLackingSteel(){
				for(let plan of this.planList){
					let isHas = false;
					for(let data of this.tableDatas){
						if(data.cate_spec==plan.spec && data.material==plan.material && data.size==plan.size){
							isHas = true;
						}
					}
					if(!isHas){
						this.tableDatas.push({
							amount : plan.value,
							brand : "待议品牌",
							cate_spec : plan.spec,
							countPrice : 0,
							display : true,
							material : plan.material,
							price : 0,
							size : plan.size,
							writer_id : null
						});
					}
				}
			},
			demandCancel(){
				[this.confirmOrcancel, this.demand] = [false, false];
			},
			// 查看品牌内数据
			showPlanBrandsDatas(){
				let index = 0;
				for(let data of this.tableDatas){
					this.$set(this.tableDatas[index], "display", true);
					index++;
				}
				this.sortPrice("desc", "web_price", "网价");
			},
			// 查看所选
			showSelect(){
				let index = 0;
				for(let data of this.tableDatas){
					if(data.amount){
						this.$set(this.tableDatas[index], "display", true);
					}else{
						this.$set(this.tableDatas[index], "display", false);
					}
					index++;
				}
			},
			sortPrice(type, key, text){
				let result = sortMethods.todo(this.tableDatas, [
					{ text : "品名", key : "cate_spec" },
					{ text : "规格", key : "size" },
					{ text : "材质", key : "material" },
					{ text : text, key : key }
				], type);
				this.tableDatas = result;
			},
			getListToChange(result){
				let tempDatas = JSON.parse(JSON.stringify(this.tableDatas));
				for(let data of tempDatas){
					data.display = false;
				}
				for(let data of result){
					for(let tData of tempDatas){
						if(data.id === tData.id){
							tData.display = true;
						}
					}
				}
				this.tableDatas = tempDatas;
			},
            back(){
				this.demand = true;
			}
		}
	}
</script>

<template>
	<div>
		<headerbar active_number="userDeal" :text="['需求计划单', '需求计划单']"  >
			<div class="main_box">
				<div style="background-color: #fff;padding: 10px 0;padding-left: 15px;">
					<div v-show="!project.selected">
						<span>选择项目 ： </span>
						<el-select v-model="project.selected" size="small" @change="getContractPrice">
							<el-option v-for="item of project.list" :value="item.project_info_id" :label="`${item.name}(${item.company})`">
								<span style="float: left">{{ item.name }}</span>
      							<span style="float: right; color: #8492a6; font-size: 13px">{{ item.company.length ? item.company : "无" }}</span>
							</el-option>
						</el-select>
						<el-button @click="openBox = !openBox" size="small" style="padding: 8px;">新建</el-button>
						<span>   (选择项目后根据项目显示品牌范围今日网价与合同价)   </span>
					</div>
					<div class="project-info" v-show="project.selected">
						<p>
							<span class="set-weight">项目名称：</span>{{ `${project.info.name}` }} <i class="el-icon-edit" @click="project.selected=null"></i>
							<span class="set-weight" style="margin-left: 20px;">项目地址：</span>{{ project.info.province + project.info.city + project.info.area + project.info.addr }}
						</p>
						<p><span class="set-weight">结算条件：</span>{{ project.info.settlementText }}</p>
						<p><span class="set-weight">品牌范围：</span> <span v-for="item of project.info.brands">{{ item }}  </span></p>
					</div>
					<el-button type="primary" style="float:right;margin-top: -40px; margin-right: 20px;" @click="jumpUrl()" v-if="!demand">缺货查询</el-button>
				</div>
				<div class="main-warpper" v-show="!demand">
					<filter-bar v-if="!demand && fiterData.length" :data="fiterData" :index="[
						{ title : '品名', key : 'cate_spec' },
						{ title : '规格' , key : 'size'},
						{ title : '材质', key : 'material'},
						{ title : '品牌', key : 'brand' }
					]" @list="getListToChange" style="text-align: left;background-color: #fff;margin-top: 20px;"></filter-bar>

					<div>
						<!-- 下单管理计划单弹出框 -->
						<el-dialog v-model="isOpenDialog" title="计划单"  size="large" style="text-align:center;">
							<order v-if="isOpenDialog" :data="selectData" :countRules="contractPriceRule" :project="this.project.selected" :project-info="project.info" @order="createOrder" @exit="isOpenDialog = false;">
							</order>
						</el-dialog>

						<div id="check">
							<pro-table v-model="tableDatas">
								<template slot="thead">
									<th>品名</th>
									<th>规格</th>
									<th>材质</th>
									<th>钢厂/品牌</th>
									<th>
										<span>网价</span>
										<div class="sort-icon">
											<div class="sort-icon">
												<div @click="sortPrice('asce', 'web_price', '网价')" >▲</div>
												<div @click="sortPrice('desc', 'web_price', '网价')" style="margin-top: -5px;">▼</div>
											</div>
										</div>
									</th>
									<th>
										<span>现货价</span>
										<div class="sort-icon">
											<div class="sort-icon">
												<div @click="sortPrice('asce', 'web_price', '网价')" >▲</div>
												<div @click="sortPrice('desc', 'web_price', '网价')" style="margin-top: -5px;">▼</div>
											</div>
										</div>
									</th>
									<th>
										<span>合同价</span>
										<div class="sort-icon">
											<div class="sort-icon">
												<div @click="sortPrice('asce', 'countPrice', '合同价')" >▲</div>
												<div @click="sortPrice('desc', 'countPrice', '合同价')" style="margin-top: -5px;">▼</div>
											</div>
										</div>
									</th>
									<th>输入数量</th>
								</template>
								<template slot="tbody" scope="props">
									<template v-if="props.line.display">
										<td>{{ props.line.cate_spec }}</td>
		    							<td>{{ props.line.size }}</td>
		    							<td>{{ props.line.material }}</td>
		    							<td>{{ props.line.brand }}</td>
		    							<td>{{ props.line.web_price }}</td>
		    							<td>{{ props.line.price }}</td>
		    							<td>
		    								<i class="el-icon-information" v-show="!project.selected"></i>
		    								{{ project.selected ? props.line.countPrice : "请先选择项目" }}
		    							</td>
		    							<td>
		    								<input v-if="project.selected" v-model.number="props.line.amount" type="number" min="0" style="width:100%;" />
		    								<input v-else v-model.number="props.line.amount" type="number" min="0" style="width:100%;" />
		    							</td>
									</template>
								</template>
							</pro-table>
						</div>
					</div><!-- v-else end -->

				</div>
			</div>
		</headerbar>

		<div class="main_container">
			<plan-list :brands='allBrands' @confirm='demandConfirm' @cancel='demandCancel' v-show='demand' :way="false" :data="project" :project_id="project.selected" :cancel="true"></plan-list>
			<div class="bottom-bar" v-if="!demand">
				<div>
                    <el-button class="same_test" @click='back'>返回</el-button>
					<el-button @click="showPlanBrandsDatas" type="warning" class="same_test">查看范围内品牌</el-button>
					<el-button @click="showSelect" type="success" class="same_test">查看选中品牌</el-button>
					<el-button @click="makeOrder()" type="primary" class="same_test">下单</el-button>
				</div>
			</div>
		</div>

		<create-project-box :open-box="openBox" @getFormDatas="addProject"></create-project-box>
	</div>
</template>

<style scoped>
	*{
		font-family:"微软雅黑";
		font-size: 14px;
	}
	body{
		background-color:#f8f8f8;
	}
	.main_container{
		width:100%;
		margin:auto;
		padding-left: 210px;
		margin-top: 0;
	}
	.main_box{
		margin: 0 auto;
		padding-left: 15px;
		padding-right: 15px;
		margin-top: 20px;
		max-width: 1280px;
	}
	html body .times-select input.el-input__inner{
		height: 29px;
	}
	.right-btn{
		position: relative;
		float:right;
		top: 3px;
		right: 18px;
		margin-bottom: -50px;
		z-index: 100;

	}
	.self-element-table thead{
		background: #eef1f6;
	}
	.self-element-table thead th{
		padding:10px;
	}
	.self-element-table td,th{
		border:solid 1px #DEDEDE;
		text-align: center;
	}

	.cars-list .el-select{
		margin-right:50px;
	}
	.cars-list>div{
		margin:15px 0px 15px 0px;
	}
	.cars-list .set-margin{
		margin-right: 55px;
	}

	.project-info{
		margin-top: 10px;
	}
	.project-info span.set-weight{
		/*font-size: 16px;*/
		font-weight: bold;
		color: #666;
	}
	.project-info i{
		font-size: 16px;
    	color: #BBB;
		cursor:pointer;
	}

	.bottom-bar{
		position: fixed;
	    bottom: 0px;
	    width: 100%;
	    height: 50px;
		padding:7px;
		padding-right: 220px;
	    z-index: 100;
	    background: aliceblue;
	}
	.bottom-bar div{
		width:auto;
		text-align: center;
		margin:0 auto;
	}

	i.el-icon-information{
		color:#8492a6;
	}

	.sort-icon{
	    display: inline-block;
	    width: 20px;
	    font-size: 12px;
	    color: #97a8be;
	}
	.sort-icon>div{
		cursor: pointer;
	}
	table th>span{
		position: relative;
    	top: -4;
	}
	#check{
		background-color: #fff;
		margin-bottom: 80px;
		padding: 15px;
		padding-top: 5px;
	}
	.same_test{
		width: 120px;
		padding: 10px 8px;
	}
</style>
