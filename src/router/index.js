import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/user/User.vue'


Vue.use(VueRouter)

const routes = [];

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login'},
    { path: '/login', component: Login },
    { path: '/home', component: Home, redirect: '/welcome',
        children: [
          { path: '/welcome',component: Welcome },
          { path: '/users', component: User }
        ]
    }
  ]  
})

// 挂载路由导航守卫
router.beforeEach( (to,from,next) => {
  // to：将要访问的路径
  // from：代表从哪个路径跳转而来
  // next() ：是一个函数，代表放行   next('/login')：强制跳转到指定页面
  // 若访问路径为登录首页则放行
  if(to.path == '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  // 如果携带token则放行否则强行跳转到登录页
  if(!tokenStr) return next('/login');
  next();
} );

export default router
