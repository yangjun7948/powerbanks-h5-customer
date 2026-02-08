import request from "@/utils/request";

export const startChat = (data: any) => {
  return request<any>({
    url: "/deepSeek/chat/start",
    method: "post",
    data: data,
  });
};

export const endChat = (data: any) => {
  return request<any>({
    url: "/deepSeek/chat/end",
    method: "post",
    data: data,
  });
};
export const getChatHistory = (data: any) => {
  return request<any>({
    url: "/base/chat/history",
    method: "get",
    params: data,
  });
};
