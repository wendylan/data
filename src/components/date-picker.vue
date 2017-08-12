<script>
	import {DatePicker,Select,Option} from 'element-ui';
	export default {
		props:['reportTimes','selectDate','reportOption'],
		data(){
			return{
				date : this.selectDate,
				times : this.reportTimes,
				pickerOptions:{
					disabledDate(time) {
                        return time.getTime() > Date.now() ;
                    }
				},
			}
		},
		components:{
			elDatePicker : DatePicker,
			elSelect : Select,
			elOption : Option,
		},
		methods:{
			getDateData(val){
				this.$emit('getDateData', val);
			},
			showTime(val){
				this.$emit('showTime', val);
			},
			numChangeText(num){
				if(num == 0){ return "首次"; }
				else if(num == 1){ return "二次" }
				else if(num == 2){ return "三次" }
				else if(num == 3){ return "四次" }
			},
		},
		watch:{
			reportTimes(val){
				this.times = val;
			}
		}
	}
</script>
<template>
	<div>
		<el-date-picker v-model="date" type="date" placeholder="选择日期" :picker-options="pickerOptions" @change="getDateData">
	    </el-date-picker>
	    <el-select placeholder="报价次序"  v-model="times" @change="showTime">
			<el-option v-for="item in reportOption" :value="item.date" :label="numChangeText(item.id)" ></el-option>
		</el-select>
	</div>
</template>
<style></style>