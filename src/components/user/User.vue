<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <div style="margin-top: 15px;">
                <el-row :gutter="5">
                    <el-col :span="16">
                        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                        </el-input>
                    </el-col>
                    <el-col :span="2">
                        <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                    </el-col>
                </el-row>
            </div>

            <!-- 用户列表区域 -->
            <el-table :data="userlist" :border="true" stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column prop="mg_state" label="状态">
                    <!-- 利用作用域插槽渲染开关 -->
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <!-- 利用作用域插槽渲染按钮 -->
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                        <!-- 分配角色按钮 -->
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <!-- layout：控制页面上需要展示的功能组件 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加用户的对话框 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password" type="password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>

            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户的对话框 -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号码" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {  
        data() {
            // 邮箱自定义验证规则
            const checkEmail = (rules,value,callback) => {
                // 验证邮箱的正则表达式
                var regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
                // 验证邮箱规则
                if(regEmail.test(value)){
                    // 合法邮箱
                    return callback()
                }
                callback(new Error("请输入合法的邮箱"))
            }
            // 手机号码自定义验证规则
            const checkMobile= (rules,value,callback) => {
                // 验证手机的正则表达式
                var regMobile = /^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/
                if(regMobile.test(value)) {
                    // 输入手机号码合法
                    return callback()
                }
                callback(new Error("请输入合法手机号码"))
             }

            return {
                // 获取用户列表的参数对象
                queryInfo: {
                    query: '',
                    // 当前页码
                    pagenum: 1,
                    // 每页显示条数
                    pagesize: 2
                },
                // 获取的所有用户列表
                userlist: [],
                // 总数据条数
                total: 0,
                // 控制添加用户对话框的显示与隐藏
                addDialogVisible: false,
                // 控制修改用户对话框的显示与隐藏
                editDialogVisible: false,
                // 添加用户表单的数据
                addForm: {
                    username: '',
                    password: '',
                    email: '',
                    mobile: ''
                },
                // 添加用户表单的验证规则对象 
                addFormRules: {
                    // 验证用户名是否合法
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' },{ min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur'},{ min: 6, max: 15,message: '长度在 6 到 15 个字符', tirgger: 'blur' }

                    ],
                    email: [
                        { required: true, message: '请输入邮箱', trigger: 'blur'},{ validator: checkEmail, trigger: 'blur' }
                    ],
                    mobile: [
                        { required: true, message: '请输入手机号码', trigger: 'blur'},{ validator: checkMobile, trigger: 'blur' }
                    ]
                },
                // 查询到的用户信息对象
                editForm: {},
                // 修改用户信息的校验规则
                editFormRules: {
                    email: [
                        { required: true, message: '请输入邮箱', trigger: 'blur' },{ validator: checkEmail, trigger: 'blur' }
                    ],
                    mobile: [
                        { required: true, message: '请输入手机号码', trigger: 'blur' },{ validator: checkMobile,trigger: 'blur' }
                    ]
                }
            }
        },
        created() {
            this.getUserList()
        },
        methods: {
            async getUserList() {
                const { data:res } = await this.$http.get('users', {
                    params: this.queryInfo
                })
                if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.userlist = res.data.users
                this.total = res.data.total
            },
            // 监听pagesize 改变的事件
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize;
                this.getUserList()
            },
            // 监听页码值改变的事件
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage;
                this.getUserList()
            },
            // 监听 switch 开关状态的变化
            async userStateChanged(userInfo) {
                const { data : res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
                if(res.meta.status !== 200) {
                    // 对switch开关状态取反，使之保持原来状态
                    userInfo.mg_state = !userInfo.mg_state
                    return this.$message.error('用户状态更新失败！')
                }
                this.$message.success('用户状态已更新！')
            },
            // 在关闭添加用户对话框的时候将表单重置 绑定close事件触发
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            // 点击按钮，添加用户对话框表单的预校验功能
            addUser() {
                this.$refs.addFormRef.validate( async (valid) => {
                    // valid 为预校验结果，预校验结果为false不通过
                    if(!valid) return 
                    // 预校验结果valid为true,通过校验，可以发起添加用户的请求
                    const { data : res } = await this.$http.post('users', this.addForm)
                    if(res.meta.status !== 201) {
                        this.$message.error("添加用户失败！")
                    }
                    this.$message.success("添加用户成功！")
                    // 添加用户成功后关闭隐藏添加用户的对话框
                    this.addDialogVisible = false
                    // 重新获取用户列表数据
                    this.getUserList
                } )
            },
            // 根据id修改用户信息
            async showEditDialog(id) {
                const { data:res } = await this.$http.get('users/' + id)
                if(res.meta.status !== 200) {
                    return this.$message.error("获取用户信息失败")
                }
                // 将查询获取的用户信息保存
                this.editForm = res.data
                // 展示编辑用户的对话框
                this.editDialogVisible = true
                
            },
            // 监听修改用户对话框的关闭事件
            editDialogClosed() {
                // 关闭对话框重置表单
                this.$refs.editFormRef.resetFields()
            },
            // 修改用户对话框预验证
            editUserInfo() {
                this.$refs.editFormRef.validate( async valid => {
                    // 预验证不通过
                    if(!valid) return
                    // 预验证通过，可以发起修改用户信息的数据请求
                    const {data:res} = await this.$http.put('users/' + this.editForm.id, {
                        email: this.editForm.email,
                        mobile: this.editForm.mobile
                    })
                    if(res.meta.status !== 200) {
                        return this.$message.error('用户信息更新失败')
                    }
                    // 关闭对话框
                    this.editDialogVisible = false
                    // 刷新数据列表
                    this.getUserList()
                    // 提示修改成功的信息
                    this.$message.success('用户信息更新成功')
                } )
            },
            // 根据id删除对应的用户信息
            async removeUserById(id) {
                // 弹框询问用户是否删除数据
                const confirmResult = await this.$confirm('将永久删除该用户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                console.log(confirmResult);
                // 如果用户确认删除返回字符串confirm，取消删除返回字符串cancel
                if(confirmResult !== 'confirm') { 
                    return this.$message.info('取消了删除操作')
                }
                // 发送请求删除用户
                const {data:res} = await this.$http.delete('users/'+id)
                if(res.meta.status !== 200) {
                    return this.$message.error('删除用户失败')
                }
                // 刷新数据列表
                this.getUserList()
                // 消息提示
                this.$message.success('删除用户成功')
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-table {
        margin-top: 15px;
        margin-bottom: 15px;
        font-size: 12px;
    }
</style>