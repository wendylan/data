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
	// 品牌UI的排序顺序
	import brandsSort from '../../res/json/brands_sort.json';
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
			}
		},
		created(){
			this.tableDatas = JSON.parse(JSON.stringify(this.data));
			// 品牌UI排序规则
			this.brandsSort = brandsSort.split(',');
			this.init();
		},
		// data参数改变时，更新筛选options，更新筛选table结果
		updated(){
			let result = JSON.parse(JSON.stringify(this.data));
			let sameCount = 0;
			let keyCount = 0;
			for(let key in result[0]){
				keyCount++;
				for(let tKey in this.tableDatas[0]){
					if(key === tKey && result[0][key] == this.tableDatas[0][tKey]){
						sameCount++;
					}
				}
			}
			// console.log(sameCount,keyCount,result.length,this.tableDatas.length);
			if(sameCount!==keyCount || result.length!==this.tableDatas.length){
				this.tableDatas = JSON.parse(JSON.stringify(this.data));
				this.init();
				this.$emit("list", this.getListToChange(this.getAllselected(), result));
			}
		},
		data(){
			return {
				// 需要筛选的数据
				tableDatas : [],
				// 根据该值渲染筛选的options
				allDatas : [],
				// 额外的8-10和18-25筛选
				extraSize : [
					{ selected : false },
					{ selected : false }
				]
			}
		},
		methods : {
			// 计算allDatas，根据该值来渲染筛选options视图
			init(){
				// table列选项去重
				let temp = this.getTableFilter(JSON.parse(JSON.stringify(this.tableDatas)));

				// 排序选择项的UI
				let brandKey = ""
				if(temp.type){
					brandKey = "brands";
					// size大小排序
					temp.type.sort(function(a, b){
						return parseFloat(a) - parseFloat(b);
					});
				}else{
					brandKey = "brand";
				}
				// 品牌UI顺序排序
				let [sorted, unsorted] = [[], []];
				for(let data of this.brandsSort){
					let index = 0;
					while(index < temp[brandKey].length){
						if(data === temp[brandKey][index]){
							sorted.push(temp[brandKey][index]);
							temp[brandKey].splice(index, 1);
							break;
						}else{
							index++;
						}
					}
				}
				temp[brandKey] = sorted.concat(temp[brandKey]);


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
							});
						}
					}
				}
			},
			// 额外需求, 添加8-10和18-25的筛选项目, 封装已有方法解决
			addExtraSize(datas,uiSelected, type){
				// 先取消已选择的项
				[this.extraSize[0].selected, this.extraSize[1].selected] = [false, false];
				for(let data of this.allDatas){
					for(let _data of data.datas){
						if(_data.selected){
							this.removeSelected(_data);
						}
					}
				}
				let size = (type==1 ? [18, 20, 22, 25] : [8, 10]);
				uiSelected.selected = true;
				for(let data of datas){
					for(let _data of size){
						if(data.name == _data){
							this.selectOption(data);
						}
					}
				}
				// 筛选品名
				if(size[0] === 8){
					for(let data of this.allDatas[0].datas){
						data.name != "螺纹钢" ? this.selectOption(data) : this.removeSelected(data);
					}
				}else{
					for(let data of this.allDatas[0].datas){
						data.name == "螺纹钢" ? this.selectOption(data) : this.removeSelected(data);
					}
				}
				this.$emit("sortByBrands");
			},
			removeExtraSize(datas, uiSelected, type){
				let size = (type==1 ? [18, 20, 22, 25] : [8, 10]);
				uiSelected.selected = false;
				// 取消所有选中项
				for(let data of this.allDatas){
					for(let _data of data.datas){
						if(_data.selected){
							this.removeSelected(_data);
						}
					}
				}
				for(let data of datas){
					for(let _data of size){
						if(data.name == _data){
							this.removeSelected(data);
						}
					}
				}
			},
			selectOption(option){
				option.selected = true;
				let parma = JSON.parse(JSON.stringify(this.tableDatas));
				let result = this.getListToChange(this.getAllselected(), parma);
				this.$emit("list", result, this.extraSize);
			},
			removeSelected(option){
				option.selected = false;
				let parma = JSON.parse(JSON.stringify(this.tableDatas));
				let result = this.getListToChange(this.getAllselected(), parma);
				this.$emit("list", result, this.extraSize);
			},
			// 获取选中的选项
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
			}
		}
	}
</script>

<template>
	<div class="">
		<span style="display:none;">{{ data }}</span>
		<ul>
			<li class="line-box" v-for="(item, key) of allDatas" >
				<div class="left_box">{{ item.title }} :</div>
				<div class="main_box">
					<template v-for="option of item.datas"  >
						<span v-if="!option.selected ? true : false" @click="selectOption(option, key)">{{ option.name }}</span>
						<span v-else class="selected" @click="removeSelected(option, key)">{{ option.name }}</span>
					</template>
					<!-- 额外添加8-10和18-25筛选, 松耦合, 弃用可删除Dom内相关函数  -->
					<template v-if="item.key == 'size' || item.key == 'type'"  >
						<span v-if="!extraSize[1].selected ? true : false" @click="addExtraSize(item.datas, extraSize[1], 2)">8-10</span>
						<span v-else class="selected" @click="removeExtraSize(item.datas, extraSize[1], 2)">8-10</span>

						<span v-if="!extraSize[0].selected ? true : false" @click="addExtraSize(item.datas, extraSize[0], 1)">18-25</span>
						<span v-else class="selected" @click="removeExtraSize(item.datas, extraSize[0], 1)">18-25</span>
					</template>
					<!-- End -->
				</div>
			</li>
		</ul>
		<div style="clear:both;"></div>
	</div>
</template>

<style scoped>
	.line-box{
		list-style: none;
		height: 30px;
		height: auto;
		line-height: 30px;
		border-bottom: 1px dashed #eee;
		margin-left: -15px;
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
