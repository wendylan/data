<!--

	Usage :
		组件接收一个index来渲染table，在title的字符串值前加'~'符号，设置为可排序(如下价格设置为可排序),
		组件也可以当作普通的table使用，index不传参即可

	Example :
		<pro-table v-model="tableDatas"
			:index="[
				{ title :'品名', key : 'product' },
				{ title :'规格', key : 'type' },
				{ title :'材质', key : 'material' },
				{ title :'钢厂/产地', key : 'brands' },
				{ title :'~价格(元/吨)', key : 'web_price' },
				{
					title : '二级表头',
					isGroup : true,
					child : [
						{
							title :'涨跌',
							key : 'price_change'
						},
						{
							title :'货源',
							key : 'source_states'
						}
					]
				}
			]"
		></pro-table>

	Example :
		index参数为空时，自定义table
		<pro-table v-model="tableDatas" >
			<template slot="thead">
				<th>语文</th>
				<th>数学</th>
				<th>英语</th>
			</template>

			<template slot="tbody">
				<td>Class 1</td>
				<td>Class 2</td>
				<td>Class 3</td>
			</template>
		</pro-table>

 -->
<script>
	export default{
		props : {
			value : {
				type : Array,
				default : function(){
					return [];
				}
			},
			index : {
				type : Array,
				default : function(){
					return [];
				}
			}
		},
		created(){
			//
			this.systemName = navigator.platform.indexOf("Win")==0 ? "win" : "mac";
			this.theadStyle = navigator.platform.indexOf("Win")==0 ? 'width:calc( 100% - 17px );' : 'width:100%;';

			//
			let keysArr = [];
			this.theadDatas = JSON.parse(JSON.stringify(this.index));
			this.tableDatas = this.value;

			// 是否存在二级表头
			for(let i=0; i<this.theadDatas.length; i++){
				if(this.theadDatas[i].isGroup){
					this.secondHead.push(this.theadDatas[i]);
					this.isSeccondHead = true;
				}
			}

			// 获取tbody渲染的参照数据
			for(let data of this.theadDatas){
				if(data.isGroup){
					for(let item of data.child){
						this.tbodyIndex.push(item);
					}
				}else{
					this.tbodyIndex.push(data);
				}
			}

			// 获取品名/规格/材质对应的key值
			let temp = ["品名", "规格", "材质"];
			for(let item of temp){
				for(let data of this.theadDatas){
					if(item == data.title){
						this.steelKey.push({
							key : data.key,
							sort : 0
						});
					}
				}
			}
		},
		beforeUpdate(){
			this.theadDatas = this.index;
			this.tableDatas = this.value;
		},
		data(){
			return {
				tableDatas : [],
				theadDatas : [],
				secondHead : [],
				// tbody渲染的参照数据
				tbodyIndex : [],
				// 用来排序的品名/规格/材质的key值
				steelKey : [],
				splitResult : [],
				theadStyle : "",
				isSeccondHead : false
			}
		},
		methods : {
			// table排序
			sortPrice(type, sortKey){
				let _this = this;
				// 先求出切割的顺序, 如果都是同一品名/规格/材质，则不切割
				for(let data of this.steelKey){
					let splitResult = this.classify(this.tableDatas, data.key);
					if(splitResult[0] instanceof Array){
						data.sort = splitResult.length;
					}
				}

				// 将数据进行分类、分级
				this.loopClassify(this.tableDatas, 0);

				// 品名排序
				this.splitResult.sort(function(a, b){
					return b[0][0][0][_this.steelKey[0].key].length - a[0][0][0][_this.steelKey[0].key].length;
				});
				// 规格排序
				for(let data of this.splitResult){
					data.sort(function(a, b){
						return parseInt(a[0][0][_this.steelKey[1].key]) - parseInt(b[0][0][_this.steelKey[1].key]);
					});
				}
				// 材质排序
				for(let datas of this.splitResult){
					for(let data of datas){
						data.sort(function(a, b){
							let numA = parseInt(a[0][_this.steelKey[2].key].replace('HRB400E', '4').replace("HRB400", "3").replace("HRB500E", "2").replace("HRB500", "1"));
							let numB = parseInt(b[0][_this.steelKey[2].key].replace('HRB400E', '4').replace("HRB400", "3").replace("HRB500E", "2").replace("HRB500", "1"));
							if(isNaN(numA) || isNaN(numB)){
								return -9999;
							}else{
								return numB - numA;
							}
						});
					}
				}
				// 最终价格排序 降维
				let allResult = [];
				for(let datas of this.splitResult){
					for(let data of datas){
						for(let item of data){
							item.sort(function(a, b){
								if(type=="desc"){
									return parseInt(a[sortKey]) - parseInt(b[sortKey]);
								}
								return parseInt(b[sortKey]) - parseInt(a[sortKey]);
							});
							for(let best of item){
								allResult.push(best);
							}
						}
					}
				}
				// console.log(JSON.parse(JSON.stringify(allResult)));
				this.$emit('input', allResult);
			},
			// 递归将分类好的数据 输出为 树形数据
			loopClassify(tableDatas, count){
				let arr = [];
				if(count !== 3){
					if((tableDatas[0] instanceof Array) && count===1){
						for(let data of tableDatas){
							arr.push(this.classify(data, this.steelKey[count].key));
						}
					}else if(!(tableDatas[0] instanceof Array)){
						arr = this.classify(tableDatas, this.steelKey[count].key);
					}else if((tableDatas[0] instanceof Array) && count===2){
						for(let datas of tableDatas){
							let tmp = [];
							for(let data of datas){
								tmp.push(this.classify(data, this.steelKey[count].key));
							}
							arr.push(tmp);
						}
					}
				}

				if(count<=2){
					this.loopClassify(arr, (++count))
				}else{
					this.splitResult = tableDatas;
				}
			},
			// 递归将数据分类
			classify(sourceTable, key){
				let index = 0;
				let tableDatas = JSON.parse(JSON.stringify(sourceTable));
				let arr = [tableDatas.splice(0, 1)[0]];

				while(index < tableDatas.length){
					for(let item of arr){
						if(item[key] == tableDatas[index][key]){
							arr.push(tableDatas.splice(index, 1)[0]);
							index--;
							break;
						}
					}
					index++;
				}
				if(tableDatas.length!==0 && tableDatas[0]!==undefined){
					let tmp = this.classify(tableDatas, key);
					if(tmp[0].length===undefined){
						arr = [arr, tmp];
					}else{
						tmp.push(arr);
						arr = tmp;
					}
				}
				if(!(arr[0] instanceof Array)){
					return [arr];
				}else{
					return arr;
				}
			}
		}
	}
</script>

<template>
	<div class="table_box">
		<div v-if="systemName == 'win'"></div>
		<table class="table-style" style="width: 100%;">
			<thead class="table-head" :style="theadStyle">
				<!-- 此处修改了一下没有index的情况下,我自定义二级表头因为tr需要有外面带入，所以我修改了下thead部分，只是表template 的v-if及v-else放到tr前面 从而实现我的自定义二级表头 -->

				<!-- 无index参数则是自定义table -->
				<template v-if="index.length==0">
					<slot name="thead"></slot>
				</template>
				<template v-else>
					<tr>
						<template v-for="item of theadDatas">
							<!-- 是否启用排序功能 -->
							<th v-if="item.title[0]=='~'" :rowspan="isSeccondHead ? 2 : 0" >
								<span>{{ item.title.replace('~', '') }}</span>
								<div class="sort-icon">
									<div class="sort-icon">
										<div @click="sortPrice('asce', item.key)" style="color:#F56C6C;">▲</div>
										<div @click="sortPrice('desc', item.key)" style="margin-top: -5px;color:#67C23A;">▼</div>
									</div>
								</div>
							</th>
							<!-- 一级表头 ：无排序 -->
							<template v-if="!isSeccondHead && item.title[0]!='~'">
								<th >{{ item.title }}</th>
							</template>

							<!-- 二级表头 ：包含的表头 -->
							<th v-else-if="item.isGroup" :colspan="item.child.length"> {{ item.title }} </th>
							<!-- 二级表头 ：设置其他一级表头的高度 -->
							<th v-else-if="secondHead.length>0 && item.title[0]!='~'" :rowspan="2"> {{ item.title }} </th>
						</template>
					</tr>
					<tr>
						<template v-for="item of theadDatas" v-if="item.isGroup">
							<template  v-for="data of item.child">
								<th v-if="data.title[0]=='~'">
									<span>{{ data.title.replace('~', '') }}</span>
									<div class="sort-icon">
										<div class="sort-icon">
											<div @click="sortPrice('asce', data.key)" style="color:#F56C6C;">▲</div>
											<div @click="sortPrice('desc', data.key)" style="margin-top: -5px;color:#67C23A;">▼</div>
										</div>
									</div>
								</th>
								<th v-else>{{ data.title }}</th>
							</template>
						</template>
					</tr>
				</template>

			</thead>
			<tbody>
				<template v-for="line of tableDatas" v-if="line">
					<tr v-if="line.display!=false">
						<!-- 无index参数则是自定义table -->
						<template v-if="index.length==0">
							<slot name="tbody" :line="line"></slot>
						</template>
						<template v-else>
							<template v-for="val of tbodyIndex">
								<template v-for="(data, key) of line">
									<td v-if="key == val.key">
										<!-- 通过判断key 额外添加的涨跌箭头 -->
										<span v-if="val.key =='price_change' && parseInt(line[val.key])" :class="parseInt(line[val.key])>0 ? 'red_sign' : 'green_sign'">{{ parseInt(line[val.key])>0 ? "⬆" : "⬇"}}</span>
										{{ line[val.key]==9999 ? '-' : line[val.key] }}
									</td>
								</template>
							</template>
						</template>
					</tr>
				</template>
			</tbody>
		</table>
	</div>
</template>

<style scoped>
	*{
		font-family:"微软雅黑";
		/*padding: 0;*/
		margin: 0;
	}
	table.table-style{
		margin-top: 20px;
		width: 100%;
	    table-layout: fixed;
	    border-collapse:collapse;
		border:1px solid #e0e6ed;
		text-align:center;
		font-size:14px;
	}
	table.table-style thead{
		background-color:#eef1f6;
	}
	table.table-style thead th{
		text-align: center;
		padding:10px 0px;
		border:1px solid #dfe6ec;
	}
	table.table-style td{
		padding:10px;
		border:none;
		border-bottom:1px solid #e0e6ed;
		border-right:1px solid #e0e6ed;
		word-wrap:break-word;
		word-break:break-all;
		font-weight:300;
	}
	table.table-style tbody tr:hover{
		background-color: #eff2f7;
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
	table th{
		font-weight:400;
	}
	tbody {
	    display:block;
	    height:500px;
	    overflow-y: scroll;
	}
	thead, tbody tr {
	    display:table;
	    width:100%;
	    table-layout:fixed;
	}
	thead {
	    width:100%;
	}
	table {
	    width:400px;
	}

    .table_box{
    	margin-top: 10px;
    }

    .table_box>div{
    	background: #eef1f6;
	    width: 19px;
	    height: 112px;
	    float: right;
	    z-index: 99999;
	    margin-bottom: -112px;
	    border: 2px solid #dfe6ec;
	    border-left: 0px solid #dfe6ec;
	    border-right: 1px solid #dfe6ec;
    }

    .red_sign{
    	color:red;
    }
    .green_sign{
    	color:green;
    }

</style>
