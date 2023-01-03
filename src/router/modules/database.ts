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
    },
    {
      path: "/database/add",
      name: "DBInfoAdd",
      component: () => import("@/views/database/add.vue"),
      meta: {
        // 不在menu菜单中显示
        // showLink: false,
        title: "新增数据源",
        roles: ["admin", "common"]
      }
    },
    // params 传参模式
    {
      path: "/database/detail/:id",
      name: "DBInfoDetail",
      component: () => import("@/views/database/detail.vue"),
      meta: {
        // 不在menu菜单中显示
        showLink: false,
        title: "数据源详情",
        roles: ["admin", "common"]
      }
    }
  ]
} as RouteConfigsTable;
