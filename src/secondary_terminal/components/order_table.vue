<script>
    import { Autocomplete } from 'element-ui';
</script>
<template>
    <table>
        <thead>
            <tr>
                <th>序号</th>
                <th>品牌</th>
                <th>品名</th>
                <th>规格</th>
                <th>材质</th>
                <th>仓库</th>
                <th>含税单价</th>
                <th>计划吨数</th>
                <th>总价</th>
                <th>车号</th>
                <th>备注</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(order, index) in orderList">
                <td>{{index}}</td>
                <td>
                    <el-autocomplete class="inline-input" v-model="order.brand" :fetch-suggestions="querySearch" placeholder="请输入品牌" :trigger-on-focus="false" @select="handleSelect"></el-autocomplete>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        </tbody>
    </table>
</template>
<style scoped>
    table{
        margin-top: 20px;
        width: 100%;
        table-layout: fixed;
        border-collapse:collapse;
        border:1px solid black;
        border:1px solid #e0e6ed;
        text-align:center;
        font-size:14px;
    }
    thead{
        background-color:#eef1f6;
    }
    thead th{
        text-align: center;
        padding:10px 0px;
        border:1px solid #dfe6ec;
    }
    table td{
        padding:10px;
        border:none;
        border-bottom:1px solid #e0e6ed;
        border-right:1px solid #e0e6ed;
    }
    table tbody tr:hover{
        background-color: #eff2f7;
    }
</style>