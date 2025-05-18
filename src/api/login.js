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

// todo
// // 更新用户信息
// export const updateUserInfoApi = (params) => {
//   return put(`/admin/auth/updateUserInfo`, params);
// }

// // 修改密码
// export const changePasswordApi = (params) => {
//   return post(`/admin/auth/changePassword`, params);
// }
 