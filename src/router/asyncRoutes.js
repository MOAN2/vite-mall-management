const routerBox = () => import("@/Layout/routerBox.vue");
const nanny = () => import("@/views/base/nanny.vue");
const category = () => import("@/views/category/category.vue");
const classify = () => import("@/views/classify/classify.vue");
const order = () => import("@/views/order/order.vue");
const coupon = () => import("@/views/base/coupon.vue");
const service = () => import("@/views/base/service.vue");
const icons = () => import("@/views/base/icons.vue");
const additional = () => import("@/views/base/additional.vue");
const users = () => import("@/views/base/users.vue");
const ads = () => import("@/views/base/ads.vue");
export const asyncRoutes = [
  {
    path: "/category",
    name: "category",
    component: routerBox,
    redirect: "/category/index",
    meta: {
      title: "家政管理",
    },
    children: [
      {
        path: "/category/index",
        name: "categoryIndex",
        component: category,
        meta: {
          title: "家政详情",
        },
      },
    ],
  },
  {
    path: "/classify",
    name: "classify",
    component: routerBox,
    redirect: "/classify/index",
    meta: {
      title: "分类管理",
    },
    children: [
      {
        path: "/classify/index",
        name: "classifyIndex",
        component: classify,
        meta: {
          title: "分类",
        },
      },
    ],
  },
  {
    path: "/order",
    name: "order",
    component: routerBox,
    redirect: "/order/index",
    meta: {
      title: "订单管理",
    },
    children: [
      {
        path: "/order/index",
        name: "orderIndex",
        component: order,
        meta: {
          title: "订单",
        },
      },
    ],
  },
  {
    path: "/base",
    name: "base",
    component: routerBox,
    redirect: "/base/nanny",
    meta: {
      title: "基础管理",
    },
    children: [
      {
        path: "/base/nanny",
        name: "nanny",
        component: nanny,
        meta: {
          title: "家政保洁人员",
        },
      },
      {
        path: "/base/additional",
        name: "additional",
        component: additional,
        meta: {
          title: "家政加购",
        },
      },
      {
        path: "/base/coupon",
        name: "coupon",
        component: coupon,
        meta: {
          title: "优惠券",
        },
      },
      {
        path: "/base/service",
        name: "service",
        component: service,
        meta: {
          title: "服务价格",
        },
      },
      {
        path: "/base/ads",
        name: "ads",
        component: ads,
        meta: {
          title: "广告管理",
        },
      },
      {
        path: "/base/icons",
        name: "icons",
        component: icons,
        meta: {
          title: "分类图标",
        },
      },
    ],
  },
  {
    path: "/manage",
    name: "manage",
    component: routerBox,
    redirect: "/manage/users",
    meta: {
      title: "后台管理",
    },
    children: [
      {
        path: "/manage/users",
        name: "users",
        component: users,
        meta: {
          title: "用户管理",
        },
      },
    ],
  },
];
