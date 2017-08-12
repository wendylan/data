<script>
	export default{
		props : {
			name : {
				type : String
			},
			options : {
				type : Array
			}
		},
		data(){
			return {
				showSelectBox : null,
				selectedList : []
			}
		},
		methods : {
			closeSelectBox(event){
				this.closing(event.relatedTarget);
			},
			closing(element){
				try{
					let parentElement = element.parentNode;
					if(element.getAttribute("class")=="check-box-warpper" || element.getAttribute("class")=="component-warpper"){
						return true;
					}else if(element.nodeName == "BODY"){
						this.showSelectBox = null;
					}else{
						this.closing(parentElement);
					}
				}catch(err){
					this.showSelectBox = null;
				}
			},
			selectedArr(data){
				let isRepeat = false;
				let index = 0;
				for(let _data of this.selectedList){
					if(_data == data){
						isRepeat = true;
						this.selectedList.splice(index, 1);
						break;
					}
					index++;
				}
				if(!isRepeat){
					this.selectedList.push(data);
				}
				this.$emit("selectedArr", this.selectedList);
			}
		}
	}
</script>

<template>
	<div class="component-warpper" @mouseout="closeSelectBox">
		<span @mouseover="showSelectBox=name" @mouseout="closeSelectBox">{{ name }} <span class="set-color">▼</span></span>
		<div class="check-box-warpper" v-show="showSelectBox==name">
			<div v-for="item in options">
				<label> {{ item.text }} </label>
				<input type="checkbox" :value="item.value" @click="selectedArr(item.value)" />
			</div>
		</div>
	</div>
</template>

<style scoped>
	.check-box-warpper{
		position:absolute;
		overflow:auto;
		width:100px;
		max-height:300px;
		border:solid 2px #DEDEDE;
		background-color:#FFF;
	}
	.component-warpper{
		width: 80px;
    	margin: auto;
		cursor:pointer;
	}
	.check-box-warpper>div{
		margin:10px 0px 10px 0px;
	}
	.set-color{
		color:#97a8be;
	}
</style>
