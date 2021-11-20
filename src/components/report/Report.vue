<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 为echarts准备一个具备宽高的dom -->
            <div id="main" style="width: 750px;height: 400px;"></div>
        </el-card>
    </div>
</template>
<script>
// 导入echarts插件
import *as echarts from 'echarts'
// 导入lodash插件
import _ from 'lodash'
    export default {
        data() {
            return {
                options: {
                    title: {
                        text: '用户来源'
                    },
                    tooltip: {},
                    legend: {
                        data: ['销量']
                    },
                    xAxis: {
                        data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
                    },
                    yAxis: {},
                    series: [
                        {
                            name: '销量',
                            type: 'bar',
                            data: [5, 20, 36, 10, 10, 20]
                        }
                    ]
                }
            }
        },
        created() {},
        // 页面dom元素被渲染完成调用此mounted()钩子函数
        async mounted() {
            // 基于已有的dom,初始化echarts
            var myEcharts = echarts.init(document.getElementById('main'));
            
            // 发送请求，获取图表要展示的数据
            const {data:res} = await this.$http.get('reports/type/1')
            if(res.meta.status !== 200) return 
            // 指定图标数据和配置,合并数据
            const result = _.merge(res.data,this.options)
            // 展示图表
            myEcharts.setOption(result)
        },
        methods: {}
    }
</script>
<style lang="less" scoped>

</style>