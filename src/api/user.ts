import request from "@/utils/request";
// new
export const loginByPhone = (data: any) => {
  return request<any>({
    url: "/app/user/login/phone",
    method: "post",
    data: data,
  });
};

export const getUserInfo = () => {
  return request<any>({
    url: "/app/user/info",
    method: "get",
  });
};
