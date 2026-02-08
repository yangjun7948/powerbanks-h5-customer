import request from "@/utils/request";

export const getMemberInfo = () => {
  return request<any>({
    url: "/base/member/info",
    method: "get",
  });
};
