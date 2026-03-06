import request from "@/utils/request";

/**
 * 创建押金订单
 */
export function createDeposit(params: {
    userId: number;  
    amount: number;
    deviceSn: string;
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
export function refundDeposit() {
  return request({
    url: "/app/payment/refund/deposit",
    method: "post",
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

export interface VerifyPaymentResult {
  code: number;
  msg: string;
  data: {
    type: "deposit" | "rent" |"refund";
    orderId?: string | number;
    deviceSn?: string;
  };
}

/**
 * 验证 PayDunya 支付回调 token
 */
export function verifyDepositPayment(token: string): Promise<VerifyPaymentResult> {
  return request({
    url: "/app/payment/verify",
    method: "post",
    params: { token },
  });
}
