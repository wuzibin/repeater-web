import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

type DBInfo = {
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

/** 数据库列表 */
export const getDBInfo = (params?: object) => {
  return http.request<DBInfo>("get", baseUrlApi("dbinfo/"), { params });
};
