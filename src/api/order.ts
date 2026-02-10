import request from "@/utils/request";

/**
 * 获取进行中的订单
 */
export function getRentingOrder(userId:string) {
  return request<any>({
    url: "/app/order/ongoing-order/" + userId,
    method: "get",
  });
}
