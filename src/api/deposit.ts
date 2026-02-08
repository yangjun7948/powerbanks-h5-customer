import request from "@/utils/request";

/**
 * 支付押金
 */
export function payDeposit(data: {
  storeId: string;
  amount: number;
  paymentMethod: string;
}) {
  return request({
    url: "/payment/deposit",
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
export function getDepositStatus() {
  return request({
    url: "/payment/deposit/status",
    method: "get",
  });
}
