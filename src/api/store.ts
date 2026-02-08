import request from "@/utils/request";

/**
 * 获取门店列表
 */
export function getStoreList(params: {
  latitude?: number;
  longitude?: number;
  status?: string; // 'all' | 'rentable' | 'returnable'
  page?: number;
  pageSize?: number;
}) {
  return request({
    url: "/store/list",
    method: "get",
    params,
  });
}

/**
 * 获取门店详情
 */
export function getStoreDetail(id: string) {
  return request({
    url: `/store/${id}`,
    method: "get",
  });
}
