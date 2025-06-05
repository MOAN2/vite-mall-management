import { get, post, del, put } from "@/utils/methods.js";

// 
export const getOrderListApi = (params) => {
    return get(`/admin/order/pageQueryList`, params);
  }
  