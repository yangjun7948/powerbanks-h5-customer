import request from "@/utils/request";

// 查询视频素材列表
export function listMaterial(query) {
  return request({
    url: "/video/material/list",
    method: "post",
    data: query,
  });
}
