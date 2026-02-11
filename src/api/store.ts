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
  return request<any>({
    url: "/app/store/list",
    method: "get",
    params,
  });
}

/**
 * 获取门店详情
 */
export function getStoreDetail(id: string) {
  return request<any>({
    url: `/app/store/${id}`,
    method: "get",
  });
}
/**
 * 根据设备编号获取门店详情
 */
export function getStoreDetailBySn(sn: string) {
  return request<any>({
    url: `/app/store/detail/sn/${sn}`,
    method: "get",
  });
}