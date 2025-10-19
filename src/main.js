import { createApp } from 'vue'
import { store } from '@/pinia'
import router from './router'

// Vant 组件和样式
import {
  Button,
  NavBar,
  DropdownMenu, DropdownItem,
  Tabbar,
  Empty,
  Tab, Tabs,
  TabbarItem,
  Grid,
  GridItem,
  Card,
  Image as VanImage,
  ImagePreview,
  Search,
  Popup,
  Form,
  Field,
  Toast,
  Dialog,
  Loading,
  PullRefresh,
  Swipe,
  SwipeItem,
  Cell, CellGroup,
  Checkbox, CheckboxGroup,
  List,
  Rate,
  Tag,
  Badge,
  Icon,
  Stepper,
  RadioGroup, Radio,
  Progress,
  Collapse,
  CollapseItem,
  Picker
} from 'vant'
import 'vant/lib/index.css'

// PC端调试支持
import '@vant/touch-emulator'

import App from './App.vue'
import '@/style/index.css'

const app = createApp(App)

// 注册 Vant 组件
app.use(Button)
  .use(NavBar)
  .use(Tabbar)
  .use(ImagePreview)
  .use(TabbarItem)
  .use(Grid)
  .use(GridItem)
  .use(Card)
  .use(VanImage)
  .use(Search)
  .use(Popup)
  .use(Form)
  .use(Field)
  .use(Toast)
  .use(Dialog)
  .use(Loading)
  .use(PullRefresh)
  .use(List)
  .use(Rate)
  .use(Tag)
  .use(Badge)
  .use(Checkbox)
  .use(CheckboxGroup)
  .use(Icon)
  .use(Swipe)
  .use(SwipeItem)
  .use(Cell)
  .use(CellGroup)
  .use(Empty)
  .use(DropdownMenu)
  .use(DropdownItem)
  .use(Stepper)
  .use(Radio)
  .use(RadioGroup)
  .use(Tab)
  .use(Tabs)
  .use(Progress)
  .use(Collapse)
  .use(CollapseItem)
  .use(Picker)


app.use(store)
app.use(router)

app.mount('#app')

