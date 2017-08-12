<script>
	export default{
		// 上下控制input框
		updated(){
			$(".price-box .set-event-focus>input").unbind("keyup");
			$(".price-box .set-event-focus>input").keyup(function(event){
				if(event.which == 38){
					let presentFocus = $(".price-box .set-event-focus>input:focus");
					let allInput = $(".price-box .set-event-focus>input");
					for(let i=0; i<allInput.length; i++){
						if(allInput[i] == presentFocus[0] && (i-1)>=0){
							allInput[i-1].focus();
						}
					}
				}
				if(event.which == 40){
					let presentFocus = $(".price-box .set-event-focus>input:focus");
					let allInput = $(".price-box .set-event-focus>input");
					for(let i=0; i<allInput.length; i++){
						if(allInput[i] == presentFocus[0] && (i+1)<allInput.length){
							allInput[i+1].focus();
						}
					}
				}
			});
		},
		data(){
			return{

			}
		},
		methods : {
			// 设置自动连续的输入价格
			setSizeData(data, index){
				let price = data[index].price;
				for(let _data of data){
					if(  parseInt(_data.size)>18 && parseInt(_data.size)<=25 && data[index].size!=36 ){
						_data.price = price;
					}
					if( data[index].size==8 && (_data.size==10 || _data.size==12) ){
						_data.price = price;
					}
					if(data[index].size==36 && _data.size==40){
						_data.price = price;
					}
				}
			}
		},
		props : ["listDatas", "selectedModel"]
	}
</script>

<template>
	<div v-if="listDatas!=null">
		<div class="price-box" v-for="data of listDatas">
			<div class="price-list">
				<p class="title">{{ data.name }}</p>
				<div class="price-content" v-for="_data of data.material">
					<p>材质 : {{ _data.name }}</p>
					<div class="input-group" v-for="(inputBox, key) of _data.size" v-if="inputBox.transport==selectedModel.transport.selected" >
						<p>Φ{{ inputBox.size }}</p>

						<div v-if="!inputBox.index">
							<el-input class="set-event-focus" placeholder="输入单价" size="mini" v-model="inputBox.price" ></el-input>
						</div>
						<div v-else>
							<el-input class="set-event-focus" placeholder="输入单价" size="mini" v-model="inputBox.price"
							@change="setSizeData(_data.size,key)" ></el-input>
						</div>

						<div>
							<el-select size="mini" placeholder="" v-model="inputBox.inventory">
								<el-option v-for="item in inputBox.productOptions"
							      :label="item.label"
							      :value="item.value"></el-option>
							</el-select>
							<el-select size="mini" placeholder="" v-model="inputBox.product_status">
								<el-option v-for="item in selectedModel.product_status.items"
							      :label="item.label"
							      :value="item.value"></el-option>
							</el-select>
							<el-select size="mini" placeholder="" v-model="inputBox.warehouseModel.selected" v-if="selectedModel.transport.selected!='直送'">
								<el-option v-for="item in inputBox.warehouseModel.warehouseOptions"
							      :label="item.label"
							      :value="item.value"></el-option>
							</el-select>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div style="clear:both;"></div>
	</div>
</template>

<style scoped>
	.price-box{
		float:left;
		height:auto;
		margin:10px 0px 0px 10px;
		border:solid 1px #DEDEDE;
		border-radius:5px;
	}
	.price-list{
		width:auto;
	}
	.price-list .title{
		font-weight:700;
		text-align:center;
		padding:10px;
		background-color:#EEE;
		margin:0px;
	}
	.price-content>p{
		text-align: center;
	}
	.price-content{
		float:left;
		padding:15px;
	}

	.input-group{
		overflow: initial;
	}
	.input-group>div{
		float:left;
	}
	.input-group .el-select,.el-input{
		display:inline-block;
		width:70px;
		margin-bottom:5px;
	}
	.input-group p{
		float:left;
		width: 35px;
		margin:5px 10px 0px 0px;
	}
</style>
