import request from "@/utils/request";

/**
 * 创建押金订单
 */
export function createDeposit(params: {
    userId: number;  
    amount: number;
}) {
  return request({
    url: "/app/payment/deposit/create",
    method: "post",
    params,
  });
}

/**
 * 支付押金
 */
export function payDeposit(data: {
  storeId: string;
  amount: number;
  paymentMethod: string;
  sn?: string;
  phone?: string;
  authCode?: string;
}) {
  return request({
    url: "/app/payment/deposit",
    method: "post",
    data,
  });
}

/**
 * 退还押金
 */
export function refundDeposit(data: { orderId: string }) {
  return request({
    url: "/payment/refund",
    method: "post",
    data,
  });
}

/**
 * 查询押金状态
 */
export function getDepositStatus(userId:string) {
  return request({
    url: "/app/payment/checkDeposit/" + userId,
    method: "get",
  });
}
