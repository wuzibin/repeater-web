import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

export type UserResult = {
  code: number;
  success?: boolean;
  data: {
    /** 用户名 */
    username: string;
    /** 当前登陆用户的角色 */
    roles: Array<string>;
    /** `token` */
    access: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refresh: string;
    /** `accessToken`的过期时间（格式 '%Y/%m/%d %H:%M:%S'） */
    expires: Date;
  };
};

type UserList = {
  success?: boolean;
  code: number;
  msg?: string;
  data?: Array<any>;
};

/*type UserInfo = {
  success?: boolean;
  code: number;
  msg?: string;
  data?: {
    id: number;
    username: string;
    email: string;
  };
};*/

export type RefreshTokenResult = {
  code: number;
  success?: boolean;
  data: {
    /** `token` */
    access: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    // refresh: string;
    /** `accessToken`的过期时间（格式 '%Y/%m/%d %H:%M:%S'） */
    expires: Date;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/login/", { data });
};

/** 刷新token */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refresh/", {
    data
  });
};

/** 获取用户列表 */
export const getUserList = (params: object) => {
  return http.request<UserList>("get", baseUrlApi("user/"), { params });
};

/** 根据所属系统获取用户列表 */
export const getSysUserList = (data: object) => {
  return http.request<UserList>("post", baseUrlApi("user/system/"), { data });
};
