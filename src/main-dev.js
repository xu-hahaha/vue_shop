import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入发送请求的包axios
import axios from "axios";
// 导入vue-table-with-tree-grid插件
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入nprogress 插件及对应样式
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'


// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme


// 为axios插件配置基准路由
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/' 
// 配置axios包，使其挂载到Vue原型对象上供vue所有组件使用
Vue.prototype.$http = axios;
// 通过拦截器为请求添加token，保证请求有权限获取数据
axios.interceptors.request.use( config => {
  // 显示进度条
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config
})
// 响应拦截器
axios.interceptors.response.use(config => {
  // 隐藏进度条
  NProgress.done()
  return config
})
Vue.config.productionTip = false


// 将vue-table-with-tree-grid组件注册为全局可用组件
Vue.component('tree-table', TreeTable)
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)


// 定义时间过滤器，对时间数据做格式化处理
Vue.filter('dateFormat', function(originVal) {
  // 实例化日期构造函数
  const dt = new Date(originVal)
  // 对给定日期进行处理
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2,'0')
  const d = (dt.getDate() + '').padStart(2,'0')
  const hh = (dt.getHours() + '').padStart(2,'0')
  const mm = (dt.getMinutes() + '').padStart(2,'0')
  const ss = (dt.getSeconds() + '').padStart(2,'0')
  // 返回处理结果
  return `${y}-${m}-${d} ${hh}:${mm}:${ss} `
}) 


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
