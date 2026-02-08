import request from "@/utils/request";

export const getMatchList = (data: any) => {
  return request<any>({
    url: "/base/match/list",
    method: "get",
    params: data,
  });
};

export const getMatchCategory = (data: any) => {
  return request<any>({
    url: "/base/category/list",
    method: "get",
    params: data,
  });
};

export const checkBuyMatch = (data: any) => {
  return request<any>({
    url: "/base/match/buyInfo",
    method: "post",
    data: data,
  });
};

export const matchScript = (data: any) => {
  return request<any>({
    url: "/base/match/script",
    method: "post",
    data: data,
    timeout: 60000,
  });
};
