import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/login.vue')
// import Home from '../components/home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

// import User from '../components/user/User.vue'
const User = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/User.vue')
// import Rights from '../components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights.vue')
// import Roles from '../components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles.vue')
// import Cate from '../components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Cate.vue')
// import Params from '../components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')
// import List from '../components/goods/list.vue'
const List = () => import(/* webpackChunkName: "List_Add" */ '../components/goods/list.vue')
// import Add from '../components/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "List_Add" */ '../components/goods/Add.vue')
// import Order from '../components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
// import Report from '../components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [];

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login'},
    { path: '/login', component: Login },
    { path: '/home', component: Home, redirect: '/welcome',
        children: [
          { path: '/welcome',component: Welcome },
          { path: '/users', component: User },
          { path: '/rights', component: Rights},
          { path: '/roles', component: Roles },
          { path: '/categories', component: Cate },
          { path: '/params', component: Params },
          { path: '/goods', component: List },
          { path: '/goods/add', component: Add },
          { path: '/orders', component: Order },
          { path: '/reports', component: Report }
        ]
    }
  ]  
})

// ????????????????????????
router.beforeEach( (to,from,next) => {
  // to????????????????????????
  // from????????????????????????????????????
  // next() ?????????????????????????????????   next('/login')??????????????????????????????
  // ???????????????????????????????????????
  if(to.path == '/login') return next();
  // ??????token
  const tokenStr = window.sessionStorage.getItem('token');
  // ????????????token???????????????????????????????????????
  if(!tokenStr) return next('/login');
  next();
} );

export default router
