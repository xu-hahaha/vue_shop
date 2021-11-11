<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加商品分类按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 表格 -->
            <tree-table class="treeTable" :data="cateList" :columns="columns" :expand-type="false" :selection-type="false" :show-row-hover="false" border show-index index-text="#">
                <!-- 是否有效列的模板 -->
                <template slot="isOk" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
                    <i class="el-icon-error" v-else style="color: red;"></i>
                </template>
                <!-- 排序列的模板 -->
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" v-else>三级</el-tag>
                </template>
                <!-- 操作列的模板 -->
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click='showEditDialong(scope.row.cat_id)'>编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click='deleteEditDialog(scope.row.cat_id)'>删除</el-button>
                </template>
            </tree-table>
            
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"  :page-sizes="[2, 5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>

        </el-card>

        <!-- 添加商品分类的对话框 -->
        <el-dialog title="添加商品分类" :visible.sync="addCateDialogVisible"  width="50%" @close="addCateDialogClosed">
            
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                 <el-form-item label="父级分类：">
                    <!-- 
                        v-model：选中项绑定值(选中的父级分类的id数组)
                        options：可选项数据源
                        props：配置选项
                     -->
                    <el-cascader v-model="selectedKeys" :options="parentCateList" clearable :props="cascaderProps"  size="mini" @change="parentCateChanged" change-on-select></el-cascader>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑操作的对话框 -->
        <el-dialog title="修改分类" :visible.sync="addCateEditDialogVisible" width="50%" @close="editCateDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateEditDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCate">确 定</el-button>
            </span>
        </el-dialog>


    </div>
</template>
<script>
    export default {
        data() {
            return {
                // 查询商品分类请求的参数
                queryInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5
                },
                // 商品分类列表
                cateList: [],
                // 总数据条数
                total: 0,
                // 树形表格列的配置
                columns: [
                    { 
                        label: '分类名称',
                        prop: 'cat_name'
                    },{
                        label: '是否有效',
                        type: 'template',
                        template: 'isOk'
                    },{
                        label: '排序',
                        type: 'template',
                        template: 'order'
                    },{
                        label: '操作',
                        type: 'template',
                        template: 'opt'
                    }
                ],
                // 控制商品分类对话框是否显示
                addCateDialogVisible: false,
                // 添加商品分类的表单数据对象
                addCateForm: {
                    // 将要添加的分类的名称
                    cat_name: '',
                    // 父类分类的id
                    cat_pid: 0,
                    // 父类的等级，默认添加一级分类
                    cat_level: 0
                },
                // 商品分类验证规则
                addCateFormRules: {
                    cat_name: [
                        { required: true,message:'请输入分类名称',trigger: 'blur' }
                    ]
                },
                // 父级分类列表
                parentCateList: [],
                // 指定联级选择器的配置对象
                cascaderProps: {
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children',
                    // 次级菜单展开方式
                    expandTrigger: 'hover'
                },
                // 选中的父级分类的id数组
                selectedKeys: [],
                // 控制添加商品分类的编辑操作对话框是否显示
                addCateEditDialogVisible: false,
                // 根据ID查询到的商品分类信息
                editForm: {},
                // 编辑操作表单验证
                editFormRules: {
                    cat_name: [
                        { required: true,message:'请输入分类名称',trigger: 'blur' }
                    ]
                },
                // 根据id查询要删除的分类对象信息
                deleteForm: {}
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            // 获取商品分类列表数据
            async getCateList() {
                const {data:res} = await this.$http.get('categories',{
                    params: this.queryInfo
                })
                if(res.meta.status !== 200) {
                    return this.$message.error('获取商品分类列表数据失败')
                }
                // 将获取的商品分类列表数据保存
                this.cateList = res.data.result
                // 总数据条数
                this.total = res.data.total
            },
            // 监听pageSize每页条数的变化
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize
                this.getCateList()
            },
            // 监听pagenum当前页码的变化
            handleCurrentChange(newpage) {
                this.queryInfo.pagenum = newpage
                this.getCateList()
            },
            // 添加商品分类
            showAddCateDialog() {
                // 先获取父级分类的数据列表
                this.getParentCateList()
                // 再显示添加商品分类的对话框
                this.addCateDialogVisible = true
            },
            // 获取父级分类的数据列表
            async getParentCateList() {
                const {data:res} = await this.$http.get('categories',{
                    params: { type: 2 }
                })
                this.parentCateList = res.data
            },
            // 添加商品分类选择项发生变化触发，处理商品分类级联选择器相关数据
            parentCateChanged() {
                // 如果联级选择器被选中的id数组selectedKeys长度大于0，表示有选中父级分类，否则没有,被选中的父类id为数组的最后一个 
                if(this.selectedKeys.length > 0) {
                    this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                    // 为当前分类的等级赋值，数组中没有为0级，否则数组长度等于当前分类的等级
                    this.addCateForm.cat_level = this.selectedKeys.length
                    return
                } else {
                    // 父级分类的id
                    this.addCateForm.cat_pid = 0
                    // 为当前分类的等级赋值
                    this.addCateForm.cat_level =  0
                } 
            },
            // 点击按钮，添加新分类
            addCate() {
                this.$refs.addCateFormRef.validate(async valid => {
                    if(!valid)  return
                    const {data:res} = await this.$http.post('categories', this.addCateForm)
                    if(res.meta.status !== 201) {
                        return this.$message.error('添加分类失败')
                    }
                    this.$message.success('添加分类成功')
                    this.getCateList()
                    this.addCateDialogVisible = false
                })
            },
            // 监听商品父类对话框关闭事件，重置表单
            addCateDialogClosed() {
                this.$refs.addCateFormRef.resetFields()
                this.selectedKeys = []
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level =  0
            },
            // 展示编辑对话框
            async showEditDialong(id) {
                const {data:res} = await this.$http.get('categories/' + id)
                if(res.meta.status !== 200) {
                    return this.$message.error('获取数据失败')
                }
                this.editForm = res.data
                this.addCateEditDialogVisible = true
            },
            // 编辑修改商品分类操作
            editCate() {
                this.$refs.editFormRef.validate(async valid => {
                    if(!valid) return this.$message.error('请输入分类名称')
                    const {data:res} = await this.$http.put('categories/' + this.editForm.cat_id, {
                        cat_name: this.editForm.cat_name
                    })
                    if(res.meta.status !== 200) {
                        return this.$message.error('修改分类失败')
                    }
                    this.$message.success('修改分类成功')
                    this.getCateList()
                    this.addCateEditDialogVisible = false
                })
            },
            // 监听编辑修改商品分类对话框关闭事件，重置表单
            editCateDialogClosed() {
                this.$refs.editFormRef.resetFields()
            },
            // 删除分类
            async deleteEditDialog(id) {
                // 提示用户确认是否删除
                const confirmRest = await this.$confirm('将永久删除该分类, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch( err => err )
                if(confirmRest !== 'confirm'){
                    return this.$message.info('取消了删除操作')
                }
                const {data:res} = await this.$http.delete('categories/'+id)
                console.log(res);
                if(res.meta.status !== 200) {
                    return this.$message.error('删除操作失败')
                }
                this.getCateList()
                this.$message.success('删除成功')
            }
        }
    }
</script>
<style lang="less" scoped>
    .treeTable {
        margin: 15px 0;
    }
    .el-cascader {
        width: 100%;
    }
    
</style>