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

// 为axios插件配置基准路由
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/' 
// 配置axios包，使其挂载到Vue原型对象上供vue所有组件使用
Vue.prototype.$http = axios;

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
