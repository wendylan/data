<script>
	// 品牌UI的排序顺序
	import brandsSort from '../../../../res/json/brands_sort.json';
	export default{
		props : {
            // 仅有录入的 品牌/供应商/仓库
            treeModel : {
                type : Array,
                default(){
                    return [];
                }
            },
            // 所有品牌
            brands : {
				type : Array,
                default(){
                    return [];
                }
			},
            // 所有供应商
            suppliers : {
				type : Array,
                default(){
                    return [];
                }
			},
            // 所有仓库
            warehouses : {
				type : Array,
                default(){
                    return [];
                }
			}
		},
		created(){
            this.allDatas = {
                brands : [],
                suppliers : [],
                warehouses : []
            };

            for(let data of this.brands){
                this.allDatas.brands.push({
                    name : data.abbreviation,
                    selected : false,
                    isWrited : false
                });
            }
            for(let data of this.suppliers){
                this.allDatas.suppliers.push({
                    name : data.name,
                    selected : false,
                    isWrited : false
                });
            }
            for(let data of this.warehouses){
                this.allDatas.warehouses.push({
                    name : data.warehouse_name,
                    selected : false,
                    isWrited : false
                });
            }

            // 计算已录入品牌
            for(let data of this.treeModel){
                for(let _data of this.allDatas.brands){
                    if(data.name == _data.name){
                        _data.isWrited = true;
                    }
                }
            }
            // 已录入品牌前置
            this.allDatas.brands.sort( (a, b)=>{
                a = a.isWrited ? 1 : 0;
                b = b.isWrited ? 1 : 0;
                return b - a;
            } );

		},
		// data参数改变时，更新筛选options，更新筛选table结果
		updated(){

		},
		data(){
			return {
                allDatas : [],
                selectedDatas : {
                    brands : null,
                    suppliers : null,
                    warehouses : null
                },
				showNotWrited : {
					brand : false,
					supplier : false,
					warehouse : false
				},
                optionsSequence : ["brands", "suppliers", "warehouses"]
			}
		},
		methods : {
            searchTreeModel(treeModel, firstStr, str){
                let result = [];
                if(firstStr){
                    for(let data of treeModel){
                        if(data.name == firstStr){
                            for(let _data of data.childs){
                                if(_data.name == str){
                                    result.push(_data);
                                }
                            }
                        }
                    }
                }else{
                    for(let brand of treeModel){
                        if(brand.name == str){
                            result.push(brand);
                        }else{
                            for(let supplier of brand.childs){
                                if(supplier.name == str){
                                    result.push(supplier);
                                }
                            }
                        }
                    }
                }

                return result;
            },
			selectOption(option, key){
                for(let data of this.allDatas[key]){
                    data.selected = false;
                }
                this.selectedDatas[key] = option;
                option.selected = true;
                this.renderWrited(option, key);
				this.$emit("optionChanging", this.selectedDatas, key);
			},
			removeSelected(option, key){
                this.selectedDatas[key] = null;
				option.selected = false;
				this.$emit("optionChanging", this.selectedDatas, key);
			},
            renderWrited(choosedData, key){
                if(this.selectedDatas.brands === null){
                    return false;
                }

                let index = 0;
                for(let data of this.optionsSequence){
                    if(data == key) { break; }
                    index++;
                }

                // 清除联动的选项
                if(this.optionsSequence[index+1] !== undefined){
                    for(let i=(index+1); i<this.optionsSequence.length; i++){
                        for(let data of this.allDatas[this.optionsSequence[i]]){
                            data.selected = false;
                            data.isWrited = false;
                        }
						this.selectedDatas[this.optionsSequence[i]] = null;
                    }

                }

                // 重新计算联动值
                if(this.optionsSequence[index+1] !== undefined){
                    let previousKey = this.optionsSequence[index-1];
                    let nextKey = this.optionsSequence[index+1];
                    if(index === 0){
                        // 是否已录入的品牌
                        let gotTreeDatas = this.searchTreeModel(this.treeModel, null, choosedData.name);
                        if(gotTreeDatas[0]){
                            for(let data of this.allDatas[nextKey]){
                                for(let _data of gotTreeDatas[0].childs){
                                    if(data.name == _data.name){ data.isWrited = true; }
                                }
                            }
                        }
                    }else{
                        let gotTreeDatas = this.searchTreeModel(this.treeModel, this.selectedDatas[previousKey].name, choosedData.name);
                        for(let data of this.allDatas[nextKey]){
                            for(let arr of gotTreeDatas){
                                for(let _data of arr.childs){
                                    if(data.name == _data){ data.isWrited = true; }
                                }
                            }
                        }
                    }
                    this.allDatas[nextKey].sort( (a, b)=>{
                        a = a.isWrited ? 1 : 0;
                        b = b.isWrited ? 1 : 0;
                        return b - a;
                    } );
                }
                // end function
            }
		}
	}
</script>

<template>
	<div class="">
		<span style="display:none;">{{ brands }} {{ suppliers }} {{ warehouses }}</span>
		<ul>
            <li class="line-box" >
				<div class="left_box">品牌 :</div>
				<div class="main_box">
					<template v-for="option of allDatas.brands"  v-if="option.isWrited">
						<span v-if="!option.selected ? true : false" :class="option.isWrited ? 'writed' : 'not-writed'" @click="selectOption(option, 'brands')">{{ option.name }}</span>
						<span v-else class="selected" :class="option.isWrited ? 'writed' : 'not-writed'" @click="removeSelected(option, 'brands')">{{ option.name }}</span>
					</template>
					<template v-for="option of allDatas.brands" v-if="showNotWrited.brand">
						<template v-if="!option.isWrited">
							<span v-if="!option.selected ? true : false" :class="option.isWrited ? 'writed' : 'not-writed'" @click="selectOption(option, 'brands')">{{ option.name }}</span>
							<span v-else class="selected" :class="option.isWrited ? 'writed' : 'not-writed'" @click="removeSelected(option, 'brands')">{{ option.name }}</span>
						</template>
					</template>
					<span @click="showNotWrited.brand = !showNotWrited.brand"><i :class="showNotWrited.brand ? 'el-icon-d-arrow-left' : 'el-icon-more'"></i></span>
				</div>
			</li>
            <li class="line-box" >
				<div class="left_box">供应商 :</div>
				<div class="main_box">
					<template v-for="option of allDatas.suppliers" v-if="option.isWrited" >
						<span v-if="!option.selected ? true : false" :class="option.isWrited ? 'writed' : 'not-writed'" @click="selectOption(option, 'suppliers')">{{ option.name }}</span>
						<span v-else class="selected" :class="option.isWrited ? 'writed' : 'not-writed'" @click="removeSelected(option, 'suppliers')">{{ option.name }}</span>
					</template>
					<template v-for="option of allDatas.suppliers" v-if="showNotWrited.supplier">
						<template v-if="!option.isWrited">
							<span v-if="!option.selected ? true : false" :class="option.isWrited ? 'writed' : 'not-writed'" @click="selectOption(option, 'suppliers')">{{ option.name }}</span>
							<span v-else class="selected" :class="option.isWrited ? 'writed' : 'not-writed'" @click="removeSelected(option, 'suppliers')">{{ option.name }}</span>
						</template>
					</template>
					<span @click="showNotWrited.supplier = !showNotWrited.supplier"><i :class="showNotWrited.supplier ? 'el-icon-d-arrow-left' : 'el-icon-more'"></i></span>
				</div>
			</li>
            <li class="line-box" >
				<div class="left_box">仓库 :</div>
				<div class="main_box">
					<template v-for="option of allDatas.warehouses" v-if="option.isWrited" >
						<span v-if="!option.selected ? true : false" :class="option.isWrited ? 'writed' : 'not-writed'" @click="selectOption(option, 'warehouses')">{{ option.name }}</span>
						<span v-else class="selected" :class="option.isWrited ? 'writed' : 'not-writed'" @click="removeSelected(option, 'warehouses')">{{ option.name }}</span>
					</template>
					<template v-for="option of allDatas.warehouses" v-if="showNotWrited.warehouse">
						<template v-if="!option.isWrited">
							<span v-if="!option.selected ? true : false" :class="option.isWrited ? 'writed' : 'not-writed'" @click="selectOption(option, 'warehouses')">{{ option.name }}</span>
							<span v-else class="selected" :class="option.isWrited ? 'writed' : 'not-writed'" @click="removeSelected(option, 'warehouses')">{{ option.name }}</span>
						</template>
					</template>
					<span @click="showNotWrited.warehouse = !showNotWrited.warehouse"><i :class="showNotWrited.warehouse ? 'el-icon-d-arrow-left' : 'el-icon-more'"></i></span>
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
    html body .not-writed{
        color:#999;
    }
</style>
