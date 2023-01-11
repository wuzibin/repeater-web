import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

type DBList = {
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

type DBInfo = {
  success?: boolean;
  code: number;
  msg?: string;
  data?: {
    id: number;
    type: string;
    nickname: string;
    host: string;
    port: number;
    username: string;
    password: string;
    db_name: string;
    system: number;
    system_name: string;
  };
};

type CheckDBResult = {
  success?: boolean;
  code: number;
  msg?: string;
  data?: boolean;
};

/** 数据源列表 */
export const getDBList = (params: object) => {
  return http.request<DBList>("get", baseUrlApi("dbinfo/"), { params });
};

/** 新增数据源 */
export const addDBInfo = (data: object) => {
  return http.request<DBInfo>("post", baseUrlApi("dbinfo/"), { data });
};

/** 数据源详情 */
export const getDBInfo = (id: number | string) => {
  return http.request<DBInfo>("get", baseUrlApi(`dbinfo/${id}/`));
};

/** 删除数据源 */
export const deleteDBInfo = (id: number | string) => {
  return http.request<DBInfo>("delete", baseUrlApi(`dbinfo/${id}/`));
};

/** 更新数据源信息 */
export const updateDBInfo = (id: number | string, data: object) => {
  return http.request<DBInfo>("patch", baseUrlApi(`dbinfo/${id}/`), { data });
};

/** 检测数据源连通性 */
export const checkDBConn = (data: object) => {
  return http.request<CheckDBResult>("post", baseUrlApi("dbinfo/check/"), {
    data
  });
};
