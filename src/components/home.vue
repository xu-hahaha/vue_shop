<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台系统</span>
      </div>
      <el-button type="info" @click="loginOut">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>


      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏折叠展开功能 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 菜单区域 -->
        <el-menu :collapse="isCollapse" :collapse-transition="false" background-color="#333744" text-color="#fff" active-text-color="#409EFF" :unique-opened="true" :router="true" :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for='item in menulist' :key='item.id'>
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path + ''" v-for='subItem in item.children' :key='subItem.id' @click="saveNavState('/' + subItem.path)">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>

      </el-aside>


      <!-- 右侧内容主体 -->
      <el-main>
          <!-- 路由占位符 -->
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      // 一级菜单图标
      iconsObj:  {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 是否水平折叠菜单栏
      isCollapse: false,
      // 被激活当前项链接
      activePath: ''
    }
  },
  // 菜单栏需要一登陆就请求数据渲染到页面，所以定义钩子函数created创建实例就会调用
  created() {
    this.getMenuList();
    // 将sessionStorage 中的激活链接取出赋值
    this.activePath = window.sessionStorage.getItem('activePath');
  },
  methods: {
    loginOut() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜单数据
    async getMenuList() {
      const {data:res} = await this.$http.get('menus')
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse() {
      // 点击按钮对是否折叠取反
      this.isCollapse = !this.isCollapse;
    },
    saveNavState(activePath) {
      // 将传递的当前激活项菜单的index 链接保存到sessionStorage
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath;
    } 
  }
}
</script>
<style lang="less" scoped>
  .home-container {
    height: 100%;
  }
  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #373d41;
    padding-left: 0;
    color: #fff;
    font-size: 20px;
    div {
      display: flex;
      align-items: center;

      span {
        margin-left: 15px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: none;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
  .iconfont {
    margin-right: 15px;
  }
  .toggle-button {
    background-color: #4a5064;
    color: #fff;
    font-size: 10px;
    line-height: 24px;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>