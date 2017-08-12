<script>
	import echarts from "echarts";
	export default{
        data (){
            return {
                msg: [100,100,100,900,100,100,900],
                name: "桂鑫数据"
            }
        },
        mounted (){
            var myChart = echarts.init(document.getElementById('main'));
            myChart.setOption({
                title: {
                    text: this.name,
                    textStyle:{
                        fontSize:12
                    }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                       
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: ['周一','周二','周三','周四','周五','周六','周日']
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name:'邮件营销',
                        type:'line',
                        data:this.msg
                    },
                    {
                        name:'联盟广告',
                        type:'line',
                        data:[220, 182, 191, 234, 290, 330, 310]
                    },
                    {
                        name:'视频广告',
                        type:'line',
                        data:[150, 232, 201, 154, 190, 330, 410]
                    },
                    {
                        name:'直接访问',
                        type:'line',
                        data:[320, 332, 301, 334, 390, 330, 320]
                    },
                    {
                        name:'搜索引擎',
                        type:'line',
                        data:[820, 932, 901, 934, 1290, 1330, 1320]
                    }
                ]
            });
        }

    }

</script>
<template>
<div id="charts">
    <div id="main"  :style="{width:'600px',height:'400px'}"></div>
</div>
</template>
<style scoped>
	
</style>