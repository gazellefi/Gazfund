// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import { Row, Col, Image, Field } from 'vant'
import vconsole from "vconsole"
import 'element-ui/lib/theme-chalk/index.css'
import 'vant/lib/index.css'

Vue.use(ElementUI)
Vue.use(Row)
Vue.use(Col)
Vue.use(Image)
Vue.use(Field)
Vue.config.productionTip = false
window.eventBus = new Vue()

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

// new vconsole()
