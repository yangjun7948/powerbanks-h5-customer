import request from "@/utils/request";

// 上传文件
export function uploadFiles(url, formData) {
  return request({
    url: url,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
      repeatSubmit: false,
    },
  });
}
