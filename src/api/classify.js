import { get, post, del, put } from "@/utils/methods.js";

// 分页查询分类数据
export const getClassListApi = (params) => {
  return get("/admin/category/queryPageList", params);
};
// 查询分类数据
export const getAllClassListApi = (params) => {
  return get("/admin/category/queryAllCategory", params);
};


// 新增分类
export const addClassApi = (params) => {
  return post("/admin/category/create", params);
};
// 编辑分类
export const editClassApi = (params) => {
  return post("/admin/category/edit", params);
};
// 删除分类
export const delClassApi = (params) => {
  return post("/admin/category/delete", params);
};
