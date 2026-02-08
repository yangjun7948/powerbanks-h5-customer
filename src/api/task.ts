import request from "@/utils/request";

export const customerTask = (data: any) => {
  return request<any>({
    url: "/video/task/customer",
    method: "post",
    data,
    timeout: 60000,
  });
};
export const customerTaskList = (data: any) => {
  return request<any>({
    url: "/video/task/customer/list",
    method: "post",
    data,
  });
};

export const getTaskMatchInfo = (data: any) => {
  return request<any>({
    url: "/video/task/match/info",
    method: "post",
    data,
  });
};

export const reGenerateTask = (data: any) => {
  return request<any>({
    url: "/video/task/reGenerate",
    method: "post",
    data,
  });
};
