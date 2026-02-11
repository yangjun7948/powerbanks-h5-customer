import request from "@/utils/request";
import { AnyCnameRecord } from "dns";

/**
 * 获取进行中的订单
 */
export function getRentingOrder(userId:string) {
  return request<any>({
    url: "/app/order/ongoing/" + userId,
    method: "get",
  });
}

/**
 * 根据订单ID获取订单详情
 */
export function getOrderDetail(orderId: string | number) {
  return request<any>({
    url: `/app/order/detail/${orderId}`,
    method: "get",
  });
}

/**
 * 创建租赁订单
 */
export function createRentalOrder(params: {
  userId: number;
  cabinetSn: string;
}) {
  return request<any>({
    url: "/app/order/rent",
    method: "post",
    params,
  });
}

/**
 * 查询弹出状态
 */
export function getPoppingStatus(orderId: string) {
  return request<any>({
    url: `/app/order/rent/popping-status/${orderId}`,
    method: "get",
  });
}

/**
 * 获取订单列表
 */
export function getOrderList(params: any) {
  return request<any>({
    url: "/app/order/list",
    method: "get",
    params,
  });
}

/**
 * 支付订单
 */
export function payOrder(orderId: string | number, paymentMethod: string) {
  return request<any>({
    url: `/app/order/pay/${orderId}`,
    method: "post",
    data: {
      paymentMethod,
    },
  });
}
