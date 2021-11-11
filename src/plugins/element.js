import Vue from 'vue'
import { Button } from 'element-ui'
//从 element-ui 组件库按需导入组件
import { Form, FormItem } from 'element-ui'
import { Input } from 'element-ui';
// 从 element-ui 组件库导入Message 消息提示组件
import { Message } from 'element-ui'
import { 
    Header, 
    Container, 
    Aside, 
    Main, 
    Menu, 
    Submenu, 
    MenuItem, 
    Breadcrumb, 
    BreadcrumbItem, 
    Card,
    Row,
    Col,
    Table,
    TableColumn,
    Switch,
    Tooltip,
    Pagination,
    Dialog,
    MessageBox,
    Tag,
    Tree,
    Select,
    Option,
    Cascader 
} from 'element-ui'

Vue.use(Button)
// 配置组件，将导入的组件注册为全局可用的组件
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Header);
Vue.use(Container);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);
Vue.use(Card);
Vue.use(Row);
Vue.use(Col);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Switch);
Vue.use(Tooltip);
Vue.use(Pagination);
Vue.use(Dialog);
Vue.use(Tag);
Vue.use(Tree);
Vue.use(Select);
Vue.use(Option);
Vue.use(Cascader);
// 将Message挂载到Vue原型对象上，使vue所有组件都可访问到此组件
Vue.prototype.$message = Message;
Vue.prototype.$confirm  = MessageBox.confirm;