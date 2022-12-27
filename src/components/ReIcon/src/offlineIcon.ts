import { addIcon } from "@iconify/vue/dist/offline";

/**
 * 这里存放本地图标，在 src/layout/index.vue 文件中加载，避免在首启动加载
 */

// 本地菜单图标，后端在路由的icon中返回对应的图标字符串并且前端在此处使用addIcon添加即可渲染菜单图标
import HomeFilled from "@iconify-icons/ep/home-filled";
import InformationLine from "@iconify-icons/ri/information-line";
import Lollipop from "@iconify-icons/ep/lollipop";
import Apps from "@iconify-icons/ri/apps-line";
import Database from "@iconify-icons/ri/database-2-line";
import Schedule from "@iconify-icons/ri/time-line";

addIcon("homeFilled", HomeFilled);
addIcon("informationLine", InformationLine);
addIcon("lollipop", Lollipop);
addIcon("application", Apps);
addIcon("database", Database);
addIcon("schedule", Schedule);
