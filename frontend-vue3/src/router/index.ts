import { createRouter, createWebHistory } from 'vue-router'
import VerifyView from '../VerifyView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'VerifyView',
      component: VerifyView
    }
  ]
})

export default router
