<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path:'/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮 -->
            <el-row class="rolesButton">
                <el-col>
                    <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表区域 -->
            <el-row>
                <el-table :data="rolesList" :border="true" stripe>
                    <!-- 表格展开列 -->
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <el-row :class="['bdbottom',i === 0 ? 'bdtop':'','vcenter']" v-for="(item,i) in scope.row.children" :key="item.id">
                                <!-- 渲染一级权限 -->
                                <el-col :span="6">
                                    <el-tag  closable @close="removeRightById(scope.row,item.id)">{{ item.authName }}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <!-- 渲染二级和三级权限 -->
                                <el-col :span="18">
                                    <el-row :class="[i2===0?'':'bdtop','vcenter']" v-for="(item2,i2) in item.children" :key="item2.id">
                                        <!-- 渲染二级权限 -->
                                        <el-col :span="6">
                                            <el-tag type="success"  closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                            <i class="el-icon-caret-right"></i>
                                        </el-col>
                                        <el-col :span="18">
                                            <!-- 渲染三级权限 -->
                                            <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item2.authName}}</el-tag>
                                        </el-col>
                                    </el-row>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column label="角色名称" prop="roleName"></el-table-column>
                    <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                    <el-table-column label="操作" width="290px">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoles(scope.row.id)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRolesById(scope.row.id)">删除</el-button>
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialong(scope.row )">分配权限</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
        </el-card>

        <!-- 分配权限对话框 -->
        <el-dialog title="分配权限" :visible.sync=" setRightDialogVisible" width="50%" @close="setRightDialongClosed">
            <!-- 树形控件 -->
            <el-tree :data="rightList" :props="defaultTree" show-checkbox node-key="id" :default-expand-all="true" :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>


        <!-- 添加角色对话框 -->
        <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <el-form :model="addForm" label-width="80px" ref="addFormRef" :rules="addFormRules">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRoles">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑用户对话框 -->
        <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" label-width="80px" ref="editFormRef" :rules="editFormRules">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRolesInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                // 添加角色表单数据
                addForm: {
                    roleName: '',
                    roleDesc: ''
                },
                // 角色列表
                rolesList: [],
                // 编辑用户数据
                editForm: {
                    roleName: '',
                    roleDesc: ''
                },
                // 获取的所有权限列表
                rightList: [],
                // 控制添加角色的对话框是否显示
                addDialogVisible: false,
                // 控制编辑用户的对话框是否显示
                editDialogVisible: false,
                // 控制分配权限的对话框是否显示
                setRightDialogVisible: false,
                // 树形控件属性绑定的对象
                defaultTree: {
                    label: 'authName',
                    children: 'children'
                },
                // 默认选中的节点ID数组
                defKeys: [],
                // 当前即将分配权限的角色id
                roleId: '',
                // 添加角色校验规则
                addFormRules: {
                    roleName: [
                        { required: true, message: '角色名称不能为空', trigger: "blur" }
                    ],
                    roleDesc: [
                        { required: false, trigger: "blur" }
                    ]
                },
                // 编辑角色校验规则
                editFormRules: {
                    roleName: [
                        { required: true, message: '角色名称不能为空', trigger: "blur" }
                    ],
                    roleDesc: [
                        { required: false, trigger: "blur" }
                    ]
                }
            }
        },
        created() {
            // 发送请求获取角色列表数据，在created钩子函数中页面加载完成就会自动调用
            this.getRolesList()
        },
        methods: {
            // 发送请求获取角色列表数据
            async getRolesList() {
                const { data:res } = await this.$http.get('roles')
                if(res.meta.status !== 200) {
                    return this.$message.error("获取角色列表失败")
                }
                this.rolesList = res.data
            },
            // 关闭添加角色对话框重置表单
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            // 添加角色
            addRoles() {
                this.$refs.addFormRef.validate( async valid => {
                    if(!valid) return
                    const {data:res} = await this.$http.post('roles',this.addForm)
                    if(res.meta.status !== 201) {
                        this.$message.error('添加角色失败')
                    }
                    this.$message.success('添加角色成功')
                    this.addDialogVisible = false
                    this.getRolesList()
                } )
            },
            // 关闭编辑角色的对话框重置表单校验
            editDialogClosed() {
                this.$refs.editFormRef.resetFields()
            },
            // 点击编辑角色
            async showEditRoles(id) {
                const {data:res} = await this.$http.get('roles/'+id)
                if( res.meta.status !== 200 ) return
                this.editForm = res.data
                this.editDialogVisible = true
            },
            // 提交编辑的角色
            editRolesInfo() {
                this.$refs.editFormRef.validate( async valid => {
                    if(!valid) return
                    const {data:res} = await this.$http.put("roles/"+this.editForm.roleId, {
                        roleName: this.editForm.roleName,
                        roleDesc: this.editForm.roleDesc
                    })
                    if(res.meta.status !== 200)
                        return this.$message.error("提交角色失败")
                    this.$message.success("角色提交成功")
                    this.editDialogVisible = false 
                    this.getRolesList()
                })
            },
            // 删除角色
            async removeRolesById(id) {
                // 弹框询问用户是否删除数据
                const confirmResult = await this.$confirm('将永久删除该角色, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch( err => err )
                if(confirmResult !== 'confirm') {
                    return this.$message.info('已取消删除')
                }
                // 发送请求删除角色
                const {data:res} = await this.$http.delete('roles/'+id)
                if(res.meta.status !== 200) {
                    return this.$message.error('删除角色失败')
                }
                this.$message.success('成功删除角色')
                this.getRolesList()
            },
            // 根据id删除对应权限
            async removeRightById(role,rightId) {
                // 弹框询问用户是否删除对应权限
                const confirmResult = await this.$confirm('将永久删除该权限, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                if( confirmResult !== 'confirm' ) {
                    return this.$message.info('已取消删除')
                }
                const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                if(res.meta.status !== 200) {
                    return this.$message.error('删除指定权限失败')
                }

                // 因为删除操作响应的结果是当前角色下的最新权限数据，只需将其赋值给角色的children即可，不必调用getRolesList()获取所有角色列表，否则页面会全部渲染，表单展开列也会合上，降低用户体验，只赋值最新权限，实现局部数据更新即可，展开列不会合上
                role.children = res.data
            },
            // 展示分配权限对话框
            async showSetRightDialong(role) {
                // 将需要授权的角色的id保存
                this.roleId = role.id
                // 获取所有权限列表
                const {data:res} = await this.$http.get('rights/tree')
                if(res.meta.status !== 200) {
                    return this.$message.error('获取所有权限列表失败')
                }
                // 保存获取的所有权限列表
                this.rightList = res.data
                // 递归获取三级节点的Id
                this.getLeafKeys(role,this.defKeys)
                this.setRightDialogVisible = true
            },
            // 通过递归的形式，获取角色下所有的三级权限id，并保存到 defKeys 数组中
            getLeafKeys(node,arr) {
                // 如果当前node节点不包含children属性，则是三级节点
                if(!node.children) {
                    return arr.push(node.id)
                }
                node.children.forEach(item => this.getLeafKeys(item,arr))
            },
            // 监听权限分配对话框关闭
            setRightDialongClosed() {
                // 重置默认选中的节点ID数组为空
                this.defKeys = []
            },
            // 确定为角色分配权限
            async allotRights() {
                // 被选中节点的id的数组 ES6数组的扩展运算符
                const keys = [
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()
                ]
                //  将被选中节点的id数组转换为以‘,’为分隔的字符串
                const idStr= keys.join(',')
                // 发送请求，角色授权
                const { data:res} = await this.$http.post(`roles/${this.roleId}/rights`, {
                    rids: idStr
                })
                if(res.meta.status !== 200) {
                    return this.$message.error('角色授权未成功')
                }
                this.$message.success('角色成功授权')
                this.getRolesList()
                this.setRightDialogVisible = false
            }
        }
    }
</script>
<style lang="less" scoped>
    .rolesButton {
        margin-bottom: 15px;
    }
    .el-tag {
        margin: 7px;
    }
    .bdtop {
        border-top: 1px solid #eee;
    }
    .bdbottom {
        border-bottom: 1px solid #eee;
    }
    .vcenter {
        display: flex;
        align-items: center;
    }
</style>