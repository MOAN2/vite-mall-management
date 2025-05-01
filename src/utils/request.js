import axios from 'axios'
import { ElLoading } from 'element-plus'
import router from '../router'
 
const request = axios.create({
  baseURL: '/api',
  withCredentials: false,
  timeout: 20000
})
let loadingServe

request.interceptors.request.use(
  (config) => {
    const hideLoading = config.hideLoading
    // 默认开启loading
    if (!hideLoading) {
      loadingServe = ElLoading.service({
        text: '正在加载中'
      })
    }
    return config
  },
  (error) => {
    // do something with request error
    console.log(error, 'ERROR11111') // for debug
    if (loadingServe) {
      loadingServe.close()
    }
    return Promise.reject(error)
  }
) /*  */
request.interceptors.response.use(
  (result) => {
    if (loadingServe) {
      loadingServe.close()
    }
    const res = result.data
    if (res.code === -1001) {
      // 登录超时
      console.log('请求拦截')
      // 清除sessionstorage
      localStorage.clear()

      // 清楚本地vuex的用户信息和用户菜单

      // 调到登录页面
      router.push('/login')
    } else if ( res.code !== 200) {
      console.log('请求错误')

      return Promise.reject(error)
    }
    return Promise.resolve(res)
  },
  (error) => {
    // Loading.close()
    console.log('request Erro2222r:', error)
    if (loadingServe) {
      loadingServe.close()
    }
    return Promise.reject(error)
  }
)
export default request
