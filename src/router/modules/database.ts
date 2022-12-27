export default {
  path: "/database",
  meta: {
    title: "数据源管理",
    icon: "database",
    rank: 2
  },
  children: [
    {
      path: "/database/index",
      name: "Database",
      component: () => import("@/views/database/index.vue"),
      meta: {
        title: "数据源管理",
        roles: ["admin", "common"]
      }
    }
  ]
} as RouteConfigsTable;
