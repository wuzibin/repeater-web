import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

type Result = {
  success?: boolean;
  code: number;
  msg?: string;
  data?: Array<any>;
};

/** 业务系统列表 */
export const getSysInfo = () => {
  return http.request<Result>("get", baseUrlApi("sysinfo/"));
};
