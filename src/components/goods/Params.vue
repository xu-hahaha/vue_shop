<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <el-alert title="注意：只允许为第三级分类设置相关参数!" type="warning" :closable='false' show-icon> </el-alert>
            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择商品分类的级联选择框 -->
                    <el-cascader v-model="selectedCateKeys" :options="cateList" :props="cateProps" @change="cateChanged" clearable></el-cascader>
                </el-col>
            </el-row>
            <!-- Tabs 标签页区域 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数的面板 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true"  class="opt_bottom">动态参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <!-- 展开列 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 循环渲染Tag标签 -->
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable  @close="handleClose(i,scope.row)">{{item}}</el-tag>
                                <!-- 输入文本框 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性的面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true"  class="opt_bottom">静态属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" border stripe>
                        <!-- 展开列 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 循环渲染Tag标签 -->
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable  @close="handleClose(i,scope.row)">{{item}}</el-tag>
                                <!-- 输入文本框 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数的对话框 -->
        <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
        </el-dialog>

        <!-- 修改参数的对话框 -->
        <el-dialog :title="'编辑' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                // 所有商品分类列表数据
                cateList: [],
                // 级联选择器的配置对象
                cateProps: {
                    label: 'cat_name',
                    value: 'cat_id',
                    children: 'children',
                    // 次级菜单展开方式
                    expandTrigger: 'hover'
                },
                // 级联选择器选中值的id
                selectedCateKeys: [],
                // 被选中的标签页名称
                activeName: 'many',
                // 动态参数数据
                manyTableData: [],
                // 静态参数数据
                onlyTableData: [],
                // 控制添加参数的对话框是否显示
                addDialogVisible: false,
                // 添加参数的表单数据对象
                addForm: {},
                // 添加参数的表单验证规则对象
                addFormRules: {
                   attr_name: [
                       { required: true, message: '请输入内容', trigger: 'blur' }
                   ]
                },
                // 修改参数的表单数据对象
                editForm: {},
                // 修改参数的表单验证规则对象
                editFormRules: {
                    attr_name: [
                       { required: true, message: '请输入内容', trigger: 'blur' }
                   ]
                },
                // 控制编辑修改参数的对话框是否显示
                editDialogVisible: false
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            // 获取所有商品列表分类
            async getCateList() {
                const {data:res} = await this.$http.get('categories')
                if(res.meta.status !== 200) {
                    return this.$message.error('获取商品列表失败')
                }
                this.cateList = res.data
            },
            // 联级选择器商品分类方式变化触发，
            cateChanged() {
                this.getParamsList()
            },
            // tabs 页签的点击事件处理函数
            handleTabClick() {
                this.getParamsList()
            },
            // 获取参数的列表数据
            async getParamsList() {
                // 级联选择器被选中数组长度不等于3，表示不是三级分类，情况数组，寄来你选择器框也会清空
                if(this.selectedCateKeys.length !== 3) {
                    this.selectedCateKeys = []
                    // 重置获取的动态和静态参数数据，防止选择不是三级分类时不请求参数数据依然保持显示之前的三级分类数据
                    this.manyTableData = []
                    this.onlyTableData = []
                    return 
                }
                // 证明是三级分类,发送请求根据id获取参数列表数据
                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
                // 将请求参数列表对象的attr_vals属性转换为数组
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(' '):[]
                    // 添加自定义属性控制输入文本框与按钮之间的切换
                    item.inputVisible = false
                    // 添加自定义属性控制文本框输入的内容
                    item.inputValue = ''
                })
                if(this.activeName === 'many') {
                    this.manyTableData = res.data
                } else {
                    this.onlyTableData = res.data
                }
            },
            // 监听添加参数的对话框关闭事件，重置校验结果
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            // 点击按钮，添加参数
            addParams() {
                this.$refs.addFormRef.validate(async valid => {
                    if(!valid) return
                    const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
                        attr_name: this.addForm.attr_name,
                        attr_sel: this.activeName
                    })
                    if(res.meta.status !== 201) {
                        return this.$message.error('添加参数失败')
                    }
                    this.$message.success('添加参数成功')
                    this.getParamsList()
                    this.addDialogVisible = false
                })
            },
            // 显示编辑面板
            async showEditDialog(attr_id) {
                // 根据修改的三级分类id查询修改的数据
                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, { params: { attr_sel: this.activeName } })
                if(res.meta.status !== 200) return
                this.editForm = res.data
                // 显示编辑面板
                this.editDialogVisible = true
            },
            // 点击按钮，修改参数
            editParams() {
                this.$refs.editFormRef.validate(async valid => {
                    if(!valid) return
                    const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
                        attr_name: this.editForm.attr_name,
                        attr_sel: this.editForm.attr_sel
                    })
                    if(res.meta.status !== 200) {
                        return this.$message.error('修改参数失败')
                    }
                    this.$message.success('修改参数成功')
                    // 渲染新数据
                    this.getParamsList()
                    this.editDialogVisible = false
                })
            },
            // 监听修改参数的对话框关闭事件，重置校验结果
            editDialogClosed() {
                this.$refs.editFormRef.resetFields()
            },
            // 根据id删除对应参数
            async removeParams(attr_id) {
                // 弹框提示确认用户是否删除
                const confirmResult = await this.$confirm('将删除该参数, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                if(confirmResult !== 'confirm') {
                    return this.$message.info('已取消删除！')
                }
                // 删除业务逻辑
                const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
                if(res.meta.status !== 200) {
                    return this.$message.error('删除失败')
                }
                this.$message.success('删除成功')
                this.getParamsList()
            },
            // 文本框失去焦点或摁下enter都会触发
            async handleInputConfirm(row) {
                // 如果文本框输入的是空字符串（空格）,重置内容切换对话框
                if(row.inputValue.trim().length === 0 ){
                    row.inputValue = ''
                    row.inputVisible = false
                    return
                } 
                // 如果文本框为有效内容，将文本内容添加到转换的attr_vals数组中
                row.attr_vals.push(row.inputValue.trim())
                // 添加到转换的attr_vals数组中后，因其数组在tag标签中循环，会自动渲染，所以渲染完成要重置文本框输入的内容，隐藏文本框
                row.inputValue = ''
                row.inputVisible = false
                // 发送请求，保存此次参数添加内容
                this.saveAttrVals(row)
            },
            // 点击按钮显示文本输入框
            showInput(row) {
                // 显示文本输入框
                row.inputVisible = true
                // 文本框自动或的焦点
                /**
                 * $nextTick( () => {}) 作用：页面被重新渲染之后才调用回调函数
                 */
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
            // 删除对应的参数可选项 i为参数项值的索引
            handleClose(i,row) {
                // 参数可选项是数组，所以直接在数组中删除此项即可
                row.attr_vals.splice(i,1)
                // 从索引i处删除1项后，将此次操作保存到数据库
                this.saveAttrVals(row)
            },
            // 将对attr_vals 的操作保存到数据库
            async saveAttrVals(row) {
                // 发送请求，保存此次参数添加内容
                const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
                    attr_name: row.attr_name,
                    attr_sel: row.attr_sel,
                    // 因服务器中此属性为字符串，故将其拼接为空格为分隔符的字符串
                    attr_vals: row.attr_vals.join(' ')
                })
                if(res.meta.status !== 200) {
                    return this.$message.error('修改参属项失败')
                }
                this.$message.success('修改参数项成功')
            }
        },
        // 计算属性
        computed: {
            // 如果按钮被禁用返回true，否则返回false
            isBtnDisabled() {
                if(this.selectedCateKeys.length !== 3 ) {
                    return true
                }
                return false
            },
            // 用来请求参数分类列表的id参数(分类id)
            cateId() {
                if(this.selectedCateKeys.length === 3) {
                    return this.selectedCateKeys[2]
                }
                return null
            },
            // 添加参数对话框提示文本
            titleText() {
                if(this.activeName === 'many') {
                    return '动态参数'
                }else{
                    return '静态属性'
                }
            }
        }
    }
</script>
<style lang="less" scoped>
    .cat_opt {
        margin: 15px 0;
    }
    .el-cascader {
        width: 30%;
    }
    .el-tag,
    .button-new-tag {
        margin: 10px;
    }
    .opt_bottom {
        margin-bottom: 15px;
    }
    .input-new-tag {
        width: 150px;
        margin: 10px;
    }
</style>