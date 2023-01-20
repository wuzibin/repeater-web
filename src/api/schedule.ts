import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

type DictResult = {
  success?: boolean;
  code: number;
  msg?: string;
  data?: {
    dbtype?: Array<any>;
    cron?: Array<any>;
    period?: Array<any>;
    check_type?: Array<any>;
    condition?: Array<any>;
    notify_type?: Array<any>;
    ret_type?: Array<any>;
    diff_type?: Array<any>;
    level?: Array<any>;
  };
};

type ScheduleList = {
  success?: boolean;
  code: number;
  msg?: string;
  links?: {
    next: string;
    previous: string;
  };
  total?: number;
  pages?: number;
  data?: Array<Schedule>;
};

type PeriodicTask = {
  crontab: {
    month_of_year: string;
    day_of_month: string;
    day_of_week: string;
    hour: string;
    minute: string;
  };
  interval: {
    period: string;
    every: number;
  };
  clocked: {
    clocked_time: string;
  };
  strategy: string;
  name: string;
  description: string;
  one_off: boolean;
  start_time: string;
  enabled: boolean;
  last_run_at: string;
  date_changed: string;
  total_run_count: number;
};

type NotifyConfig = {
  interval: number;
  count: number;
  rest: number;
  type: string;
  level: string;
  title: string;
  content: string;
  handle: string;
  alert_user: Array<number>;
};

type ScheduleInfo = {
  success?: boolean;
  code: number;
  msg?: string;
  data?: Schedule;
};

export type CheckItem = {
  label?: string;
  type?: string;
  condition?: string;
  value?: string;
  ret_type?: string;
  exec_db_id?: number;
  exec_sql?: string;
  db_name?: string;
  diff_type?: string;
  exec_db2_id?: number;
  exec_sql2?: string;
  db2_name?: string;
};

export type Schedule = {
  id: number;
  periodic_task: PeriodicTask;
  notify_config: NotifyConfig;
  check_item: Array<CheckItem>;
  logical_exp: string;
  mode: string;
  system_id: number;
  system_name: string;
  loading: boolean; // 前端展示行加载状态使用
};

/** 字典项目查询 */
export const getDict = (data: object) => {
  return http.request<DictResult>("post", baseUrlApi("schedule/dict/"), {
    data
  });
};

/** 定时任务列表 */
export const getScheduleList = (params: object) => {
  return http.request<ScheduleList>("get", baseUrlApi("schedule/"), { params });
};

/** 新增定时任务 */
export const addSchedule = (data: object) => {
  return http.request<ScheduleInfo>("post", baseUrlApi("schedule/add/"), {
    data
  });
};

/** 定时任务详情 */
export const getSchedule = (id: number | string) => {
  return http.request<ScheduleInfo>("get", baseUrlApi(`schedule/${id}/`));
};

/** 删除定时任务 */
export const deleteSchedule = (id: number | string) => {
  return http.request<ScheduleInfo>(
    "delete",
    baseUrlApi(`schedule/${id}/delete/`)
  );
};

/** 更新定时任务信息 */
export const updateSchedule = (id: number | string, data: object) => {
  return http.request<ScheduleInfo>(
    "post",
    baseUrlApi(`schedule/${id}/edit/`),
    {
      data
    }
  );
};

/** 修改任务状态 */
export const changeScheduleStatus = (data: object) => {
  return http.request<ScheduleInfo>("post", baseUrlApi("schedule/status/"), {
    data
  });
};
