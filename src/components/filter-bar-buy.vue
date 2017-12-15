<!--

	Example
		<filter-bar :data="tableDatas" :index="[
			{ title : '品名', key : 'product' },
			{ title : '规格' , key : 'type'},
			{ title : '材质', key : 'material'},
			{ title : '品牌', key : 'brands' }
		]" @list="getListToChange" ></filter-bar>

	Usage :
		参数 data : 表格数据
		参数 index : table对应的text和key，如下所示

	Return :
		事件返回值 : 计算参数data，返回匹配的数据，一个新的数组

 -->
<script>
	export default{
		props : {
			// 传入tableDatas
			data : {
				type : Array,
				default : []
			},
			// tableDatas的key和对应的text
			index : {
				type : Array,
				default : []
			},
			// 可选 ： 特殊情况下，需要通过父组件来触发子组件方法，返回已选项
			init : {
				// type : Number,
				default : 0
			}
		},
		created(){
			this.tableDatas = this.data;
			// table列选项去重
			let temp = this.getTableFilter(this.data);
			// 初始化过滤选项
			for(let data of this.index){
				for(let key in temp){
					if(data.key == key){
						let childsArr = [];
						for(let item of temp[key]){
							childsArr.push({
								name : item,
								selected : false
							});
						}
						this.allDatas.push({
							title : data.title,
							key : key,
							datas : childsArr
						})
					}
				}
			}
		},
		data(){
			return {
				tableDatas : [],
				allDatas : []
			}
		},
		methods : {
			selectOption(option){
				option.selected = true;
				let parma = this.tableDatas;
				let result = this.getListToChange(this.getAllselected(), parma);
				this.$emit("list", result);
			},
			removeSelected(option){
				option.selected = false;
				let parma = this.tableDatas;
				let result = this.getListToChange(this.getAllselected(), parma);
				this.$emit("list", result);
			},
			getAllselected(){
				let resultArr = [];
				for(let data of this.allDatas){
					let temp;
					this.index.length>0 ?
					temp = { name : data.title, key : data.key, selected : [] } :
					temp = { name : data.title, selected : [] };
					for(let item of data.datas){
						if(item.selected === true){
							temp.selected.push(item.name);
						}
					}
					resultArr.push(temp);
				}
				return resultArr;
			},
			// 将对象数组中，每个对象的属性归并起来，并去重
			// 可重用， 接收一个对象数组，返回一个以各个属性命名的数组对象，
			getTableFilter(objArrDatas){
				let collectArr = {};
				for(let datas of objArrDatas){
					for(let item in datas){
						collectArr[item] ? collectArr[item] : collectArr[item] = [];
						let hasData = false;
						for(let arr of collectArr[item]){
							if(arr == datas[item]){
								hasData = true;
								break;
							}
						}
						if(!hasData){
							collectArr[item].push(datas[item]);
						}
					}
				}
				return collectArr;
			},
			// 筛选table
			getListToChange(list, tableDatas){
				let index = 0;
				while(index < list.length){
					if(list[index].selected.length === 0){
						list.splice(index, 1)
					}else{
						index++;
					}
				}

				let resultArr = [];
				for(let data of tableDatas){
					let rightCount = 0;
					for(let tableKey in data){
						for(let filter of list){
							if(filter.key === tableKey){
								for(let selected of filter.selected){
									if(selected == data[tableKey]){
										rightCount ++;
										break;
									}
								}
							}
						}

					}
					list.length===rightCount ? resultArr.push(data) : false;
				}
				return resultArr;
			},
			test(){
				alert(this.init);
			}
		},
		watch : {
			init(oldVal, newVal){
				let result = this.data;
				this.tableDatas = this.data;
				// table列选项去重
				let temp = this.getTableFilter(this.data);
				// 初始化过滤选项
				this.allDatas = [];
				for(let data of this.index){
					for(let key in temp){
						if(data.key == key){
							let childsArr = [];
							for(let item of temp[key]){
								childsArr.push({
									name : item,
									selected : false
								});
							}
							this.allDatas.push({
								title : data.title,
								key : key,
								datas : childsArr
							})
						}
					}
				}
				this.$emit("list", this.getListToChange(this.getAllselected(), result));
			}
		}
	}
</script>

<template>
	<div class="">
		<ul>
			<li class="line-box" v-for="(item, key) of allDatas" >
				<div class="left_box">{{ item.title }} :</div>
				<div class="main_box">
					<template v-for="option of item.datas"  >
						<span v-if="!option.selected ? true : false" @click="selectOption(option, key)">{{ option.name }}</span>
						<span v-else class="selected" @click="removeSelected(option, key)">{{ option.name }}</span>
					</template>
				</div>
			</li>
		</ul>
		<div style="clear:both;"></div>
		<!-- <button @click="test">test</button> -->
	</div>
</template>

<style scoped>
	.line-box{
		list-style: none;
		height: 30px;
		height: auto;
		line-height: 30px;
		border-bottom: 1px dashed #eee;
	}
	.left_box{
		width:100px;
		float:left;
		color: #999;
	}
	.line-box span{
		margin:5px;
		display: inline-block;
		padding: 0px 10px 0px 10px;
		color: #666;
		cursor: pointer;
	}
	.line-box>div>span.selected{
		color: #666;
		margin:5px;
		display: inline-block;
		background: bisque;
		border-radius: 5px;
		padding: 0px 10px 0px 10px;
	}
	.el-icon-close{
		font-size: 10px;
	}
	.top_box .el-icon-close{
		color: #e4393c;
		vertical-align: top;
		margin-left: 10px;
		padding: 4px;
	}
	.top_box:hover .el-icon-close{
		background: #e4393c;
		color: #fff;
		font-size: 10px;
	}
	.main_box{
		height: auto;
		margin: 5px 100px 5px;
	}
</style>
