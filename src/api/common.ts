import request from "@/utils/request";

export const phoneCode = (phone: string) => {
  return request<any>({
    url: "/common/phoneCode",
    method: "post",
    data: phone,
  });
};
