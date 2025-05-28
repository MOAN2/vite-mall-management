import { get, post, del, put } from "@/utils/methods.js";

//文件上传
export const addFileApi = (params) => {
  // 创建FormData对象处理文件上传
  const formData = new FormData();
  
  // 如果params是文件对象，直接添加到FormData
  if (params instanceof File) {
    formData.append('file', params);
  } 
  // 如果params包含file属性，添加file到FormData
  else if (params.file) {
    formData.append('file', params.file);
    
    // 添加其他参数到FormData
    Object.keys(params).forEach(key => {
      if (key !== 'file') {
        formData.append(key, params[key]);
      }
    });
  }
  
  // 文件上传需要手动设置Content-Type为multipart/form-data
  // 注意：当使用FormData时，不要设置具体的boundary，让浏览器自动处理
  return post("/admin/file/upload", params, false, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
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
  return get("/admin/project/price/pageQueryList", params);
};
//查询所有家政服务
export const getAllProjecteApi = (params) => {
  return get("/admin/project/queryAllProjectList", params);
};

// 广告
//删除
export const deladApi = (params) => {
  return del(`/admin/ads/delete/${params.id}`, params);
};

export const addadApi = (params) => {
  return post("/admin/ads/add", params);
};
 
//编辑
export const editadApi = (params) => {
  return post("/admin/ads/edit", params);
};
//查询
export const getadApi = (params) => {
  return get("/admin/ads/pageQueryList", params);
};


// 优惠券
//删除
export const delDiscountApi = (params) => {
  return post(`/admin/coupon/delete`, params);
};

export const addDiscountApi = (params) => {
  return post("/admin/coupon/add", params);
};
 
//编辑
export const editDiscountApi = (params) => {
  return post("/admin/coupon/edit", params);
};
//查询
export const getDiscountApi = (params) => {
  return get("/admin/coupon/pageQuery", params);
};


// 保洁人员
//删除
export const delNannyApi = (params) => {
  return post(`/admin/nanny/delete`, params);
};

//新增
export const addNannyApi = (params) => {
  return post("/admin/nanny/add", params);
};
 
//编辑
export const editNannyApi = (params) => {
  return post("/admin/nanny/edit", params);
};
//查询
export const getNannyApi = (params) => {
  return get("/admin/nanny/pageQueryList", params);
};