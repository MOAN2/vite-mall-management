import SimpleLayout from '@/Layout/SimpleLayout.vue'
import NoAuth from '@/Layout/NoAuth.vue'

export const baseRoutes = [
  {
    path: '/',
    redirect: '/login',
    hidden: true
  },
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  {
    path: '/404',
    component: NoAuth,
    children: [
      {
        path: '',
        name: '404',
        component: () => import('@/views/error/404.vue'),
        meta: {
          title: '404'
        }
      }
    ],
    hidden: true
  },
  {
    path: '/401',
    component: NoAuth,
    children: [
      {
        path: '',
        name: '401',
        component: () => import('@/views/error/401.vue'),
        meta: {
          title: '401'
        }
      }
    ],
    hidden: true
  },
  // 捕获所有未定义路由，重定向到404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    hidden: true
  }
]
