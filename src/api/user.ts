import request from "@/utils/request";
// new
export const loginByFingerprint = (fingerprint: string, openId: string) => {
  return request<any>({
    url: "/app/login",
    method: "post",
    data: { fingerPrint: fingerprint, openId: openId },
  });
};

export const loginByPhone = (data: any) => {
  return request<any>({
    url: "/app/loginByPhone",
    method: "post",
    data: data,
  });
};

export const getUserInfo = () => {
  return request<any>({
    url: "/app/userInfo",
    method: "get",
  });
};
