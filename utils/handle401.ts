import axios from "axios";
import requests from './request';

//锁,防止重复发出刷新token的接口，因为可能有几个401的错误--节流阀
let lock=false
//缓冲区
let originRequest:any=[]

//config就是之前请求的配置
export default function(config:any){

  if(!lock){
    lock=true;
    axios({
      method:'get',
      url:'http://127.0.0.1:3000/refresh',
      headers:{
        'Authorization':`Bearer ${sessionStorage.getItem('refreshToken')}`
      }
    }).then(res=>{
      lock=false;
      sessionStorage.setItem('token',res.data.user_token)
      originRequest.map((callback:Function)=>callback(res.data.user_token))
      originRequest=[]
      //保存token
    }).catch(()=>{
      //失败证明refreshToken过期，重新登陆
      lock=false
    })
    //返回promise替换掉当前请求
    
  }
  return new Promise((resolve)=>{

    //收集旧的请求
    originRequest.push(()=>{
      resolve(requests(config))
    })
  })
}