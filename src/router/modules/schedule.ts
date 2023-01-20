export default {
  path: "/schedule",
  meta: {
    title: "任务管理",
    icon: "schedule",
    rank: 3
  },
  children: [
    {
      path: "/schedule/index",
      name: "Schedule",
      component: () => import("@/views/schedule/index.vue"),
      meta: {
        title: "任务管理",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/schedule/add",
      name: "ScheduleAdd",
      component: () => import("@/views/schedule/add.vue"),
      meta: {
        // 不在menu菜单中显示
        // showLink: false,
        title: "新增任务",
        roles: ["admin", "common"]
      }
    },
    // params 传参模式
    {
      path: "/schedule/detail/:id",
      name: "ScheduleDetail",
      component: () => import("@/views/schedule/detail.vue"),
      meta: {
        // 不在menu菜单中显示
        showLink: false,
        title: "任务详情",
        roles: ["admin", "common"]
      }
    }
  ]
} as RouteConfigsTable;
