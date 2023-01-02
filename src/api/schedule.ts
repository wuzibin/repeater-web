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
    level?: Array<any>;
  };
};

/** 数据库类型 */
export const getDict = (data?: object) => {
  return http.request<DictResult>("post", baseUrlApi("schedule/dict/"), {
    data
  });
};
