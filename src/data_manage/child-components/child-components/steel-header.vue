<script>
	import ajaxCustom from '../../../components/ajax-custom.js';
	export default{
		data(){
			return{
				treeSelectData : [],
				noticeUiSwith : true,
				createDatas : {
					newWarehouse : null,
					newPaymentKind : null,
					newPriceSource : {
						name : null,
						type : null
					}
				},
				isOpenBox : false,
				isMoreWarehouse : false,
				selectedWarehouseArr : [],
				tempData : null,
				isCreated : false
			}
		},
		updated(){
			if(this.createOptions && !this.isCreated){
				this.tempData = JSON.parse(JSON.stringify(this.createOptions));
				this.isCreated = true;
			}
		},
		methods : {
			// 传值到父组件
			changeTreeData(){
				this.$emit("showSelectedData", this.treeSelectData)
			},
			createPriceSource(){
				let msg = confirm("确定添加 \"" + this.createDatas.newPriceSource.name + "\" ?");
				if(msg){
					ajaxCustom.ajaxPost(this, "dingoapi/createPriceSource", this.createDatas.newPriceSource, (responese)=>{
						console.log(responese);
						this.selectedModel.priceSource.items.push({
							label : responese.body.data.name,
							value : responese.body.data.id,
							company_type : responese.body.data.company_type
						});
						console.log(this.selectedModel);
						alert("添加成功");
					}, (responese)=>{
						alert(responese.body.message);
						console.log(responese)
					});
				}
			},
			createWarehouse(){
				let msg = confirm("确定添加 \"" + this.createDatas.newWarehouse + "\" ?");
				if(msg){
					ajaxCustom.ajaxPost(this, "dingoapi/createWarehouse", { warehouseData : this.createDatas.newWarehouse }, (responese)=>{
						console.log(responese);
						if(200<=responese.body.status_code<=299){
							alert(responese.body.message);
							this.selectedModel.warehouseModel.items.push({
								label : responese.body.data.warehouse_name,
								value : responese.body.data.id
							});

						}
					}, (responese)=>{
						alert(responese.body.message);
						console.log(responese)
					});
				}
			},
			editWarehouse(text, id){
				ajaxCustom.ajaxPost(this, "dingoapi/editWarehouse", { id:id, warehouse_name:text }, (responese)=>{
					// console.log(responese);
					responese = responese.body;
					if(200<=responese.status_code<=299){
						alert(responese.message);
					}else{
						alert(responese.message);
					}
				}, (responese)=>{
					alert(responese.body.message);
					console.log(responese);
				});
			},
			delWarehouse(id, index){
				id = parseInt(id);
				console.log(id);
				ajaxCustom.ajaxPost(this, "dingoapi/delWarehouse", {id : id}, (responese)=>{
					console.log(responese);
					responese = responese.body;

					if(200<=responese.status_code<=299){
						alert(responese.message);
						this.selectedModel.warehouseModel.items.splice(index, 1);
					}else{
						alert(responese.message);
					}
				}, (responese)=>{
					alert(responese.body.message);
					console.log(responese);
				});
			},
			createPaymentKind(){
				let msg = confirm("确定添加 \"" + this.createDatas.newPaymentKind + "\" ?");
				if(msg){
					ajaxCustom.ajaxPost(this, "dingoapi/createPaymentKind", { payment_name : this.createDatas.newPaymentKind }, (responese)=>{
						console.log(responese)
						if(200<=responese.body.status_code<=299){
							alert(responese.body.message);
							this.selectedModel.paymentKind.items.push({
								label : JSON.parse(JSON.stringify(this.createDatas.newPaymentKind)),
								value : responese.body.data
							});
						}else{
							alert(responese.body.message);
						}
					}, (responese)=>{
						alert(responese.body.message);
						console.log(responese)
					} );
				}
			},
			editPaymentKind(id, payment_name){
				ajaxCustom.ajaxPost(this, "dingoapi/editPaymentKind", { id:id, payment_name:payment_name }, (responese)=>{
					responese = responese.body;
					if(200<=responese.status_code<=299){
						alert(responese.message);
					}else{
						alert(responese.message);
					}
				}, (responese)=>{
					alert(responese.body.message);
					console.log(responese);
				});
			},
			delPaymentKind(id, index){
				id = parseInt(id);
				ajaxCustom.ajaxPost(this, "dingoapi/delPaymentKind", {id : id}, (responese)=>{
					console.log(responese);
					responese = responese.body;
					if(200<=responese.status_code<=299){
						alert(responese.message);
						this.selectedModel.paymentKind.items.splice(index, 1);
					}else{
						alert(responese.message);
					}
				}, (responese)=>{
					alert(responese.body.message);
					console.log(responese);
				});
			},
			editPriceSource : function(id, text, type){
				id = parseInt(id);
				var paramsData = {
					id : id,
					company_type : type,
					text : text
				};
				console.log(paramsData);
				ajaxCustom.ajaxPost(this, "dingoapi/editPriceSource", paramsData, (responese)=>{
					// console.log(responese);
					responese = responese.body;
					if(200<=responese.status_code<=299){
						alert(responese.message);
					}else{
						alert(responese.message);
					}
				}, (responese)=>{
					alert(responese.body.message);
					console.log(responese);
				});
			},
			delPriceSource : function(id, index){
				id = parseInt(id);
				console.log(id);
				ajaxCustom.ajaxPost(this, "dingoapi/delPriceSource", {id : id}, (responese)=>{
					console.log(responese);
					responese = responese.body;
					if(200<=responese.status_code<=299){
						alert(responese.message);
						this.selectedModel.priceSource.items.splice(index, 1)
						this.selectedModel.priceSource.selected = null;
					}else{
						alert(responese.message);
					}
				}, (responese)=>{
					alert(responese.body.message);
					console.log(responese);
				});
			},
			openCreateBox(){
				this.selectedModel.transport.selected = "广州仓发货";
				this.isOpenBox ? this.isOpenBox=false : this.isOpenBox=true;
			},
			surePostDatas(){
				if(this.selectedModel.transport.selected == "直送"){
					this.createOptions.warehouseModel.selected = "钢厂直送";
					this.isMoreWarehouse = false;
				}else{
					if(!this.createOptions.brands.selected || !this.createOptions.priceSource.selected || (this.isMoreWarehouse?!this.selectedWarehouseArr.length:!this.createOptions.warehouseModel.selected) || !this.createOptions.paymentKind.selected || !this.selectedModel.transport.selected){
						alert("请完成表格内的全部选项");
						return false;
					}

					for(let ware of this.selectedWarehouseArr){
						if(ware === this.createOptions.warehouseModel.selected){
							alert("额外添加仓库不能与原来的仓库相同");
							return false;
						}
					}
				}


				this.isOpenBox = false;
				this.$emit("getSteelInfo", true);
				this.$emit("excessWarehouse", this.selectedWarehouseArr, this.isMoreWarehouse);
			}
		},
		watch : {
			noticeUiSwith(newVal, oldVal){
				this.$emit("noticeSwithChanged", newVal);
			}
		},
		props : ["allBrandsData", "selectedModel", "createOptions", "loadData", "dataDate"]
	}
</script>

<template>
	<div>
		<!-- 定义模态框 -->
		<div>
			<!-- 新增供应商 -->
			<el-popover ref="edit_source" placement="bottom" trigger="click">
				<ul>
					<li>
						<select style="height:20px;" v-model="createDatas.newPriceSource.type">
							<option value="厂家">厂家</option>
							<option value="代理商">代理商</option>
							<option value="供应商">供应商</option>
						</select>
						<input type="text" v-model="createDatas.newPriceSource.name"/>
						<el-button size="small" type="text" @click="createPriceSource()">新增</el-button>
					</li>
					<hr/>
					<li v-for="(data, index) in selectedModel.priceSource.items">
						<select style="height:20px;" v-model="data.company_type">
							<option value="厂家">厂家</option>
							<option value="代理商">代理商</option>
							<option value="供应商">贸易商</option>
						</select>
						<input type="text" v-model="data.label" />
						<el-button size="small" type="text" @click="editPriceSource(data.value, data.label, data.company_type)">修改</el-button>
						<el-button size="small" type="text" @click="delPriceSource(data.value, index)" >删除</el-button>
					</li>
				</ul>
			</el-popover>

			<!-- 新增仓库 -->
			<el-popover ref="edit_warehouse" placement="bottom" trigger="click">
				<ul>
					<li>
						<input type="text" v-model="createDatas.newWarehouse"/>
						<el-button size="small" type="text" @click="createWarehouse()">新增</el-button>
					</li>
					<hr />
					<li v-for="(data, index) in selectedModel.warehouseModel.items">
						<input type="text" v-model="data.label"/>
						<el-button size="small" type="text" @click="editWarehouse(data.label, data.value)">修改</el-button>
						<el-button size="small" type="text" @click="delWarehouse(data.value, index)">删除</el-button>
					</li>
				</ul>
			</el-popover>

			<!-- 新增付款方式 -->
			<el-popover ref="edit_payment" placement="bottom" trigger="click">
				<ul>
					<li>
						<input type="text" v-model="createDatas.newPaymentKind"/>
						<el-button size="small" type="text" @click="createPaymentKind()">新增</el-button>
					</li>
					<hr />
					<li v-for="(data, index) in selectedModel.paymentKind.items">
						<input type="text" v-model="data.label"/>
						<el-button size="small" type="text" @click="editPaymentKind(data.value, data.label)">修改</el-button>
						<el-button size="small" type="text" @click="delPaymentKind(data.value, index)">删除</el-button>
					</li>
				</ul>
			</el-popover>

			<el-dialog title="新增选项" v-model="isOpenBox" :close-on-click-modal="false">
				<template v-if="createOptions">
					<el-select style="display:block;margin-bottom:10px;" placeholder="品牌" size="small" v-model="createOptions.brands.selected" filterable>
						<el-option v-for="item in createOptions.brands.items" :label="item.label" :value="item.value"></el-option>
					</el-select>
					<el-select style="display:block;margin-bottom:10px;" placeholder="报价来源" size="small" v-model="createOptions.priceSource.selected" filterable>
						<el-option v-for="item in createOptions.priceSource.items" :label="item.label" :value="item.label" :key="item.value" ></el-option>
					</el-select>

					<el-radio-group size="small" v-model="selectedModel.transport.selected">
						<el-radio-button v-for="item in selectedModel.transport.items" :label="item.label"></el-radio-button>
					</el-radio-group>

					<template v-if="selectedModel.transport.selected!='直送'">
						<el-select style="display:block;margin-bottom:10px;" placeholder="选择仓库" size="small" v-model="createOptions.warehouseModel.selected" filterable>
							<el-option v-for="data in createOptions.warehouseModel.items" :label="data.label" :value="data.label" ></el-option>
						</el-select>

						<div>
							<span>是否添加额外仓库</span>
							<el-switch on-text="是" off-text="否" v-model="isMoreWarehouse" ></el-switch>
						</div>

						<el-select style="display:block;margin-bottom:10px;" placeholder="添加额外仓库" size="small" v-show="isMoreWarehouse" v-model="selectedWarehouseArr" multiple>
							<el-option v-for="data in createOptions.warehouseModel.items" :label="data.label" :value="data.label" ></el-option>
						</el-select>
					</template>

					<el-select style="display:block;margin-bottom:10px;" placeholder="付款方式" size="small" v-model="createOptions.paymentKind.selected">
						<el-option v-for="item in createOptions.paymentKind.items" :label="item.label" :value="item.label"></el-option>
					</el-select>

					<div slot="footer" class="dialog-footer">
					    <el-button @click="isOpenBox = false">取 消</el-button>
					    <el-button type="primary" @click="surePostDatas()">确 定</el-button>
				  	</div>
				</template>
			</el-dialog>

			<div style="float:right;margin-right:100px;">
				<span>价格波动提醒</span>
				<el-switch on-text="开" off-text="关" v-model="noticeUiSwith" ></el-switch>
			</div>
			<div v-show="!dataDate" style="margin-bottom:15px;">
				<el-button size="small" type="text" v-popover:edit_source>编辑报价来源</el-button>
				<el-button size="small" type="text" v-popover:edit_warehouse>编辑仓库</el-button>
				<el-button size="small" type="text" v-popover:edit_payment>编辑付款方式</el-button>
				<el-button size="small" type="default" @click="openCreateBox()" >新增</el-button>
			</div>
		</div>

		<div class="block">
		  <span class="demonstration title-style">查看暂存数据 :</span>
		  <el-cascader style="width:400px" size="small" expand-trigger="hover" @change="changeTreeData()" :options="allBrandsData" :props="{ value : 'name', label : 'name', children : 'data', disabled: 'disabled' }" v-model="treeSelectData" ></el-cascader>
		</div>
		<div style="clear:both;"></div>
		<hr />
	</div>

</template>

<style scoped>

</style>
