import Vue from 'vue'
import { Button } from 'element-ui'
//从 element-ui 组件库按需导入组件
import { Form, FormItem } from 'element-ui'
import { Input } from 'element-ui';
// 从 element-ui 组件库导入Message 消息提示组件
import { Message } from 'element-ui'

Vue.use(Button)
// 配置组件，将导入的组件注册为全局可用的组件
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
// 将Message挂载到Vue原型对象上，使vue所有组件都可访问到此组件
Vue.prototype.$message = Message;