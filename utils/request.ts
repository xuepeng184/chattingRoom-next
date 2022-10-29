import axios from 'axios'

const requests=axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000
})

// 添加请求拦截器
requests.interceptors.request.use(function (config) {
  //给头部带上token
  if(sessionStorage.getItem('token')){
    config.headers!.Authorization=`Bearer ${sessionStorage.getItem('token')}`
  }
  // 在发送请求之前做些什么
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
requests.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return response;
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error);
});

export default requests