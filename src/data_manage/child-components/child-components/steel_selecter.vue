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
                brands : JSON.parse(JSON.stringify(this.brands)),
                suppliers : JSON.parse(JSON.stringify(this.suppliers)),
                warehouses :JSON.parse(JSON.stringify(this.warehouses))
            };

            // 初始化数据
            for(let key in this.allDatas){
                let _this = this;
                this.allDatas[key] = this.allDatas[key].map( (val)=>{
                    this.$set(val, "selected", false);
                    this.$set(val, "isWrited", false);
                    return val;
                } );
            }

            // 计算已录入品牌
            for(let data of this.treeModel){
                for(let _data of this.allDatas.brands){
                    if(data.name == _data.abbreviation){
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
                optionsSequence : ["brands", "suppliers", "warehouses"]
			}
		},
		methods : {
			selectOption(option, key){
                for(let data of this.allDatas[key]){
                    data.selected = false;
                }
                this.selectedDatas[key] = option;
                option.selected = true;
                this.renderWrited(key);
				this.$emit("optionChanging", this.selectedDatas, key);
			},
			removeSelected(option, key){
                this.selectedDatas[key] = null;
				option.selected = false;
				this.$emit("optionChanging", this.selectedDatas, key);
			},
            renderWrited(key){
                if(this.selectedDatas.brands.length){
                    return false;
                }

                if(key == "brands"){
                    // 清空原有选中
                    for(let key in this.allDatas){
                        if(key != "brands"){
                            this.selectedDatas[key] = null;
                            for(let data of this.allDatas[key]){
                                data.selected = false;
                            }
                        }
                    }
                }else if(key == "warehouses"){
                    // for(let data of this.allDatas[key]){
                    //     data.selected = false;
                    // }
                }

                if(!this.selectedDatas.suppliers){
                    //先清空原有已录入样式
                    for(let key in this.allDatas){
                        if(key != "brands"){
                            for(let data of this.allDatas[key]){
                                data.isWrited = false;
                            }
                        }
                    }
                    for(let data of this.treeModel){
                        if(data.name == this.selectedDatas.brands.abbreviation){
                            for(let brandByModel of data.childs){
                                for(let _data of this.allDatas.suppliers){
                                    if(brandByModel.name == _data.name){
                                        _data.isWrited = true;
                                    }
                                }
                            }
                        }
                    }
                    // 将已录入数据前置
                    this.allDatas.suppliers.sort( (a, b)=>{
                        a = a.isWrited ? 1 : 0;
                        b = b.isWrited ? 1 : 0;
                        return b - a;
                    });
                }else{
                    //先清空原有已录入样式
                    for(let key in this.allDatas){
                        if(key == "warehouses"){
                            for(let data of this.allDatas[key]){
                                data.isWrited = false;
                            }
                        }
                    }
                    let warehouses = [];
                    for(let data of this.treeModel){
                        if(data.name == this.selectedDatas.brands.abbreviation){
                            for(let _data of data.childs){
                                if(_data.name == this.selectedDatas.suppliers.name){
                                    warehouses = _data.childs;
                                }
                            }
                        }
                    }

                    for(let data of warehouses){
                        for(let _data of this.allDatas.warehouses){
                            if(data == _data.warehouse_name){
                                _data.isWrited = true;
                            }
                        }
                    }
                    // 将已录入数据前置
                    this.allDatas.warehouses.sort( (a, b)=>{
                        a = a.isWrited ? 1 : 0;
                        b = b.isWrited ? 1 : 0;
                        return b - a;
                    });
                }
                // end
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
					<template v-for="option of allDatas.brands"  >
						<span v-if="!option.selected ? true : false" :class="option.isWrited ? 'writed' : 'not-writed'" @click="selectOption(option, 'brands')">{{ option.abbreviation }}</span>
						<span v-else class="selected" :class="option.isWrited ? 'writed' : 'not-writed'" @click="removeSelected(option, 'brands')">{{ option.abbreviation }}</span>
					</template>
				</div>
			</li>
            <li class="line-box" >
				<div class="left_box">供应商 :</div>
				<div class="main_box">
					<template v-for="option of allDatas.suppliers"  >
						<span v-if="!option.selected ? true : false" :class="option.isWrited ? 'writed' : 'not-writed'" @click="selectOption(option, 'suppliers')">{{ option.name }}</span>
						<span v-else class="selected" :class="option.isWrited ? 'writed' : 'not-writed'" @click="removeSelected(option, 'suppliers')">{{ option.name }}</span>
					</template>
				</div>
			</li>
            <li class="line-box" >
				<div class="left_box">仓库 :</div>
				<div class="main_box">
					<template v-for="option of allDatas.warehouses"  >
						<span v-if="!option.selected ? true : false" :class="option.isWrited ? 'writed' : 'not-writed'" @click="selectOption(option, 'warehouses')">{{ option.warehouse_name }}</span>
						<span v-else class="selected" :class="option.isWrited ? 'writed' : 'not-writed'" @click="removeSelected(option, 'warehouses')">{{ option.warehouse_name }}</span>
					</template>
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
