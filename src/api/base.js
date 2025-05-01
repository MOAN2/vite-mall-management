import { get, post, del, put } from "@/utils/methods.js";

//文件上传
export const addFileApi = (params) => {
  return post("/admin/file/upload", params);
};
//文件删除
export const delFileApi = (params) => {
  return del(`/admin/file/${params.fileId}`, params);
};
// 家政服务价格

//删除
export const delPriceServiceApi = (params) => {
  return post("/admin/project/price/delete", params);
};
//新增
export const addPriceServiceApi = (params) => {
  return post("/admin/project/price/add", params);
};
//编辑
export const editPriceServiceApi = (params) => {
  return post("/admin/project/price/edit", params);
};
//查询
export const getPriceServiceApi = (params) => {
  return get("/admin/project/price/queryList", params);
};
