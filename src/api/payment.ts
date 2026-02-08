import request from "@/utils/request";

//单场交易订单
export const createSingleOrder = (matchId: string) => {
  return request<any>({
    url: "/base/transactions/singleOrder",
    method: "post",
    data: { matchId: matchId },
  });
};

//会员交易订单
export const createMemberOrder = (data: any) => {
  return request<any>({
    url: "/base/transactions/memberOrder",
    method: "post",
    data: data,
  });
};

// 查询订单状态
export const getOrderStatus = (data: any) => {
  return request<any>({
    url: "/base/transactions/getOrderStatus",
    method: "post",
    data: data,
  });
};
