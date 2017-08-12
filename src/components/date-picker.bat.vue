<script>
	import {DatePicker,Select,Option} from 'element-ui';
	export default {
		props:['reportOption'],
		data(){
			return{
				selectDate : '',
				reportTimes : '',
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
			getDate(){
				// var date = this.dateFormat(this.selectDate);
				var date = this.selectDate;
				this.$emit('getDate',date);
			},
			showTime(){
				var times = this.reportTimes;
				this.$emit('showTime',times);

				// var times = this.reportTimes;
				// this.$emit('showTime',this.reportTimes);
			},
			numChangeText(num){
				if(num == 0){ return "首次"; }
				else if(num == 1){ return "二次" }
				else if(num == 2){ return "三次" }
				else if(num == 3){ return "四次" }
			},
			//日期对象格式化
			dateFormat(date){
				var year =date.getFullYear();
				var month = (date.getMonth()+1).toString();
				var day =(date.getDate()).toString();
				if(month.length == 1){
					month = '0'+month;
				}
				if(day.length ==1){
					day = '0'+day;
				}
				var dateTime =year+"-"+month+"-"+day;
				return dateTime;
			},
		},
	}
</script>
<template>
	<div>
		<el-date-picker v-model="selectDate" type="date" placeholder="选择日期" :picker-options="pickerOptions" @change="getDate">
	    </el-date-picker>
	    <el-select placeholder="报价次序"  v-model="reportTimes" @change="showTime">
			<el-option v-for="item in reportOption" :value="item.date" :label="numChangeText(item.id)" ></el-option>
		</el-select>
	</div>
</template>
<style></style>