import Vue from 'vue'
import Router from 'vue-router'
import Entry from '@/components/Entry'
import Auction from '@/components/Auction'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/entry',
      name: 'Entry',
      component: Entry
    },
    {
      path: '/auction',
      name: 'Auction',
      component: Auction
    }
  ]
})
