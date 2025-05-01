import { get, post, del, put } from "@/utils/methods.js";

// 分页查询家政数据
export const getProjectListApi = (params) => {
  return get("/admin/project/pageQueryList", params);
};

// 新增家政
export const addProjectApi = (params) => {
  return post("/admin/project/create", params);
};
// 编辑家政
export const editProjectApi = (params) => {
  return post("/admin/project/edit", params);
};
// 删除家政
export const delProjectApi = (params) => {
  return post("/admin/project/delete", params);
};
