<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 提示区域 -->
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
            <!-- 步骤进度条 -->
            <!-- 由于定义的activeIndex是字符串类型，所以直接减0可以js隐式转换最简单的将其转换为number类型 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
            </el-steps>
            <!-- tab栏区域 -->
            <!-- 添加商品表单的数据需整体一次提交，所以放在同一个表达 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
                <!-- v-model自动绑定选项卡中的name属性，是String类型 -->
                <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
                            <el-input v-model="item.attr_vals"> </el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- 
                            action：图片上传到后台API的URL地址 
                            on-preview：点击已上传文件时触发on-remove：上传的文件列表移出文件时触发
                            list-type：文件列表的类型
                        -->
                        <el-upload :action="uploadURL"  :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headersObj" :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑器组件 -->
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <!-- 添加商品的按钮 -->
                        <el-button type="primary" class="btnAdd" @click="Add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览对话框 -->
        <el-dialog title="图片预览" :visible.sync="imDdialogVisible" width="50%">
            <img :src="previewPath" alt="" class="previewImg">
        </el-dialog>
    </div>
</template>
<script>
import _ from 'lodash'
    export default {
        data() {
            return {
                // tab栏绑定的选项卡name属性，步骤进度条当前激活项索引引用此属性
                activeIndex: '0',
                // 添加商品的表单数据对象
                addForm: {
                    goods_name: '',
                    goods_price: 0,
                    goods_number: 0,
                    goods_weight: 0,
                    // 选中商品所属的分类的id数组
                    goods_cat: [],
                    // 上传的图片临时路径（对象）
                    pics: [],
                    // 商品描述
                    goods_introduce: '',
                    // 商品的参数(数组)
                    attrs: []
                },
                // 添加商品的表单验证规则对象
                addFormRules: {
                    goods_name: [
                        {required:true,message:'请输入商品名称',trigger:'blur'}
                    ],
                    goods_price: [
                        {required:true,message:'请输入商品价格',trigger:'blur'}
                    ],
                    goods_number: [
                        {required:true,message:'请输入商品数量',trigger:'blur'}
                    ],
                    goods_weight: [
                        {required:true,message:'请输入商品重量',trigger:'blur'}
                    ],
                    goods_cat: [
                        {required:true,message:'请选择商品分类',trigger:'blur'}
                    ]
                },
                // 商品分类列表数据
                cateList: [],
                // 级联选择器选项配置
                cateProps: {
                    label: 'cat_name',
                    value: 'cat_id',
                    children: 'children',
                    expandTrigger: 'hover'
                },
                // 获取的商品动态参数列表数据
                manyTableData: [],
                // 获取的商品静态属性列表数据
                onlyTableData: [],
                // 图片上传到后台的API地址
                uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
                // 手动为图片上传组件的headers请求头对象设置token
                headersObj: {
                    Authorization: window.sessionStorage.getItem('token')
                },
                // 上传图片的具体地址
                previewPath: '',
                // 控制图片预览对话框的显示与隐藏
                imDdialogVisible: false
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            // 获取所有商品分类列表数据
            async getCateList() {
                const {data:res} = await this.$http.get('categories')
                if(res.meta.status !== 200) {
                    return this.$message.error('获取商品分类失败')
                }
                this.cateList = res.data
            },
            // 级联选择器选中项发生变化触发
            handleChange() {
                if(this.addForm.goods_cat.length !== 3) {
                    this.addForm.goods_cat = []
                }
            },
            // Tabs标签页切换前触发，如果商品分类的联级选择器没选择三级分类不能切换
            beforeTabLeave(activeName, oldActiveName) {
                if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                    this.$message.error('请选择商品分类')
                    return false
                }
            },
            // 切换tab页触发，发生请求获取切换到标签页的数据
            async tabClicked() {
                // 证明访问的是商品参数（动态参数）面板
                if(this.activeIndex === '1') {
                    const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                        params: { sel: 'many' }
                    })
                    if(res.meta.status !== 200) {
                        return this.$message.error('获取商品动态参数失败')
                    }
                    res.data.forEach(item => {
                        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
                    })
                    this.manyTableData = res.data
                }else if(this.activeIndex === '2') {
                    // 证明访问的是商品属性（静态属性）面板
                    const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                        params: { sel: 'only' }
                    })
                    if(res.meta.status !== 200) {
                        return this.$message.error('获取商品静态属性失败')
                    }
                    this.onlyTableData = res.data
                }
            },
            // 点击已上传文件时触发,可做已上传图片的预览效果
            handlePreview(file) {
                // 保持上传图片的具体地址
                this.previewPath = file.response.data.url
                // 显示图片预览
                this.imDdialogVisible = true
            },
            // 上传的文件列表移出文件时触发，可做移出图片的操作
            // 移出文件时触发的钩子函数，参数自动携带移出文件的信息
            handleRemove(file) {
                // 1、获取将要删除图片的临时路径
                const filePath = file.response.data.tmp_path
                // 2、在pic数组中找到删除图片临时路径的索引
                const i = this.addForm.pics.findIndex( x => x.pic === filePath)
                // 3、根据索引将图片临时路径从数组删除
                this.addForm.pics.splice(i,1)
            },
            // 文件上传成功时调用
            handleSuccess(response) {
                // 1、拼接得到上传图片的信息对象
                const picInfo = {
                    pic: response.data.tmp_path
                }
                // 2、将图片信息对象push添加到pic数组中
                this.addForm.pics.push(picInfo)
            },
            // 添加商品
            Add() {
                this.$refs.addFormRef.validate(async valid => {
                    if(!valid) {
                        return this.$message.error('请填写必要的表单项！')
                    }
                    // 执行添加业务逻辑

                    /**
                     * 1、处理goods_cat
                     *  因添加商品表单的数据对象addForm的goods_cat属性
                     *  在联级选择器中双向绑定的goods_cat是联级选择器
                     *  中值的id,要求必须为数组.但在发送请求时服务器
                     *  求为字符串。
                     *  解决冲突方案：
                     *      通过lodash插件的cloneDeep() 方法深拷贝
                     *  addForm请求数据
                     */
                    const form = _.cloneDeep(this.addForm)
                    // 将goods_cat转换为字符串
                    form.goods_cat = form.goods_cat.join(',')
                    /** 
                     * 2、处理attrs(包含动态参数和静态属性)
                     */
                    this.manyTableData.forEach(item => {
                        const newInfo = {
                            attr_id: item.attr_id,
                            attr_value: item.attr_vals.join(' ')
                        }
                        this.addForm.attrs.push(newInfo)
                    })
                    this.onlyTableData.forEach(item => {
                        const newInfo = {
                            attr_id: item.attr_id,
                            attr_value: item.attr_vals
                        }
                        this.addForm.attrs.push(newInfo)
                    })
                    form.attrs = this.addForm.attrs
                     
                    // 发送请求，添加商品
                    const {data:res} = await this.$http.post('goods',form)
                    if(res.meta.status !== 201) {
                        return this.$message.error('添加商品失败')
                    }
                    // 添加商品成功，通过编程式路由跳转页面
                    this.$message.success('添加商品成功')
                    this.$router.push('/goods')
                })
            }
        },
        computed: {
            cateId() {
                // 如果联级选择器选中的商品分类为三级分类
                if(this.addForm.goods_cat.length === 3) {
                    // 返回商品三级分类的分类id
                    return this.addForm.goods_cat[2]
                }
                return null
            }
        }
    }
</script>
<style lang="less" scoped>
    .el-checkbox {
        margin: 0 10px 0 0 !important;
    }
    .previewImg {
        width: 100%;
    }
    .btnAdd {
        margin-top: 15px;
    }
</style>