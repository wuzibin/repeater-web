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
    }
  ]
} as RouteConfigsTable;
