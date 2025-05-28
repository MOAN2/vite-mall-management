import { get, post, del, put } from "@/utils/methods.js";

// 登录
export const loginApi = (params) => {
  return post(`/admin/auth/login`, params);
}

//  获取用户信息
export const getUserInfoApi = (params) => {
  return get(`/admin/auth/getUserInfo`, params);
}

//  退出登录
export const logoutApi = (params) => {
  return post(`/admin/auth/logout`, params);
}

 
// 更新用户信息
export const updateUserInfoApi = (params) => {
  return post(`/admin/user/update`, params);
}

// 修改密码
export const changePasswordApi = (params) => {
  return post(`/admin/user/updatePassword`, params);
}
 // 删除用户
export const delUserApi = (params) => {
  return post(`/admin/user/delete/${params.id}`, params);
}

// 创建用户
export const createUserApi = (params) => {
  return post(`/admin/user/create`, params);
}
 
 // 用户详情
 export const getUserDetailApi = (params) => {
  return get(`/admin/user/getById/${params.id}`);
}

// 查询用户
export const getUsersApi = (params) => {
  return get(`/admin/user/pageQueryList`, params);
}
 