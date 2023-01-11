import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

type SystemList = {
  success?: boolean;
  code: number;
  msg?: string;
  links?: {
    next: string;
    previous: string;
  };
  total?: number;
  pages?: number;
  data?: Array<any>;
};

type SystemInfo = {
  success?: boolean;
  code: number;
  msg?: string;
  data?: {
    id: number;
    name: string;
    fullname: string;
    ip: string;
    remark: string;
  };
};

/** 业务系统列表 */
export const getSysList = (params: object) => {
  return http.request<SystemList>("get", baseUrlApi("sysinfo/"), { params });
};

/** 新增业务系统 */
export const addSysInfo = (data: object) => {
  return http.request<SystemInfo>("post", baseUrlApi("sysinfo/"), { data });
};

/** 业务系统详情 */
export const getSysInfo = (id: number | string) => {
  return http.request<SystemInfo>("get", baseUrlApi(`sysinfo/${id}/`));
};

/** 删除业务系统 */
export const deleteSysInfo = (id: number | string) => {
  return http.request<SystemInfo>("delete", baseUrlApi(`sysinfo/${id}/`));
};

/** 更新业务系统信息 */
export const updateSysInfo = (id: number | string, data?: object) => {
  return http.request<SystemInfo>("patch", baseUrlApi(`sysinfo/${id}/`), {
    data
  });
};
