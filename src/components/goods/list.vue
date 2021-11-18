<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <el-table :data="goodsList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="180px">
                    <!-- 
                        过滤器的使用：{{ scope.row.add_time | dateFormat }}
                            scope.row.add_time：待处理格式化的数据
                            dateFormat：定义的用来处理格式化数据的过滤器名称
                     -->
                    <template slot-scope="scope">{{ scope.row.add_time | dateFormat }}</template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页功能 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background></el-pagination>
        </el-card>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                // 查询参数对象
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                // 商品列表数据
                goodsList: [],
                // 商品列表总条数
                total: 0
            }
        },
        created() {
            this.getGoodsList()
        },
        methods: {
            // 获取商品列表数据
            async getGoodsList() {
                const {data:res} = await this.$http.get('goods', {
                    params: this.queryInfo
                })
                if(res.meta.status !== 200) {
                    return this.$message.error('请求商品数据列表失败')
                }
                this.goodsList = res.data.goods
                this.total = res.data.total
            },
            // 分页功能每页显示条数发生变化触发
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize
                this.getGoodsList()
            },
            // 分页功能当前页码发生变化触发
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getGoodsList()
            },
            // 根据id删除商品
            async removeById(id) {
                // 弹框确定用户是否删除商品
                const confirmResult = await this.$confirm('将删除该商品, 是否继续?', '提示', { 
                        confirmButtonText: '确定', 
                        cancelButtonText: '取消', 
                        type: 'warning' 
                }).catch(err => err)
                if(confirmResult !== 'confirm') {
                    return this.$message.info('已取消删除操作')
                }
                const {data:res} = await this.$http.delete(`goods/${id}`)
                if(res.meta.status !== 200) {
                    return this.$message.error('商品删除失败')
                }
                this.$message.success('商品已删除')
                this.getGoodsList()
            },
            // 点击按钮，跳转到添加商品的页面
            goAddPage() {
                this.$router.push('/goods/add')
            }
        }
    }
</script>
<style lang="less" scoped>
    .el-table {
        margin: 15px 0;
    }
</style>