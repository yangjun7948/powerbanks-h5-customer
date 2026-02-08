import request from "@/utils/request";

// 查询会员套餐列表
export function listPackages(query) {
  return request({
    url: "/base/packages/list",
    method: "get",
    params: query,
  });
}
