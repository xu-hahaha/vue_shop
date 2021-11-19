<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索区域 -->
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <el-table :data="orderList" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price" ></el-table-column>
                <el-table-column label="是否付款" prop="pay_status" >
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send" ></el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                    <!-- 调用在main.js项目打包入口文件中设置的拦截器对事件做格式化处理 -->
                    <template slot-scope="scope">
                        {{ scope.row.create_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template>
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddressDialog"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProgessDialog"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[2, 5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
        </el-card>

        <!-- 修改地址的对话框 -->
        <el-dialog title="修改地址" :visible.sync="addressDialogVisible" width="50%" @close="addressDialogClosed">
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
                <el-form-item label="省市区(县)" prop="address1">
                    <el-cascader v-model="addressForm.address1" :options="citydata"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 物流进度对话框 -->
        <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
            <span>这是一段信息</span>
        </el-dialog>
    </div>
</template>
<script>
// 导入的外部城市数据
import citydata from './citydata.js'
    export default {
        data() {
            return {
                // 查询订单列表的请求参数对象
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                // 总条数
                total: 0,
                // 订单列表数据
                orderList: [],
                // 控制修改地址的对话框显示与隐藏
                addressDialogVisible: false,
                // 修改地址的数据对象
                addressForm: {
                    // address1是联级选择器，所以用数组
                    address1: [],
                    address2: ''
                },
                // 修改地址的校验规则
                addressFormRules: {
                    address1: [
                        { required: true,message:"请选择省市区(县)",trigger: 'blur' }
                    ],
                    address2: [
                        { required: true,message:"请输入详细地址",trigger: 'blur' }
                    ]
                },
                // 导入的外部城市数据，当属性名和值相同时可简写
                // citydata: citydata
                citydata,
                // 控制物流进程对话框是否显示
                progressDialogVisible: false,
                // 物流信息
                progressData: []
            }
        },
        created() {
            this.getOrderList()
        },
        methods: {
            // 查询订单列表
            async getOrderList() {
                const {data:res} = await this.$http.get('orders', { params: this.queryInfo })
                console.log(res);
                if(res.meta.status !== 200) {
                    return this.$message.error('获取订单列表失败')
                }
                this.orderList = res.data.goods
                this.total = res.data.total
            },
            // 分页功能每页显示条数发生变化触发
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize
                this.getOrderList()
            },
            // 当前页码发生变化触发
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getOrderList()
            },
            // 显示修改地址的对话框
            showAddressDialog() {
                this.addressDialogVisible = true
            },
            // 关闭对话框，重置表单
            addressDialogClosed() {
                this.$refs.addressFormRef.resetFields()
            },
            // 显示物流进程的对话框
            showProgessDialog() {
                // 发送请求获取物流进度数据
                // const {data:res} = await this.$http.get('/kuaidi/1106975712662')
                // if(res.meta.status !== 200) {
                //     return this.$message.error('获取物流信息失败')
                // }
                // console.log(res.data);
                // this.progressData = res.data
                this.progressDialogVisible = true
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .el-table {
        margin: 15px 0;
    }
    .el-cascader {
        width: 100%;
    }
</style>