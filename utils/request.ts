import axios from "axios";
//引入401对应的处理逻辑
import handle401 from "./handle401";

export const httpHost =
  process.env.NODE_ENV == "development" ? "http://localhost:3000/" : "http://49.233.37.228:3000/";
export const wsHOST =
  process.env.NODE_ENV == "development" ? "http://localhost:8010/" : "http://49.233.37.228:8010/";

const requests = axios.create({
  baseURL: httpHost,
  timeout: 5000,
});

// 添加请求拦截器
requests.interceptors.request.use(
  function (config) {
    //给头部带上token
    if (sessionStorage.getItem("token")) {
      config.headers!.Authorization = `Bearer ${sessionStorage.getItem("token")}`;     
    }
    // 在发送请求之前做些什么
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
requests.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    return response;
  },
  function (error) {
    // 对响应错误做点什么
    const {status,config}=error.response;
    if(status==401){
      return handle401(config)
    }
    return Promise.reject(error);
  }
);

export default requests;
