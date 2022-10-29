import styled from 'styled-components';
import { useRouter } from 'next/router';
import io from 'socket.io-client'
import { Form, Input, Button, Checkbox, notification } from 'antd';
import bgc from '../public/ada.jpg'
import requests from '../utils/request'


const HomeStyle=styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  .loginform{
    height: 50vh;
    position: absolute;
    top: 50px;
  }
  .ant-row{
    width: 350px;
  }
  .bgImage{
    width: 100vw;
    height: 100vh;
    position: absolute;
    z-index: -1;
  }
  .bgCover{
    height: 300px;
    width: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(6px);
    text-align: center;
    border-radius: 20px;
    overflow: hidden;
  }
  .ant-form-item-label > label {
    color:#fff;
  }
`

export default function Home(){
  const socket=io('http://127.0.0.1:8010')
  const router=useRouter()
  interface FormData{
    username:string,
    password:string,
    confirmPassword:string
  }

  //注册
  const register=async (values:FormData)=>{
    let result=await requests({
      method:'post',
      url:'register',
      data:{
        username:values.username,
        password:values.password,
        userPic:`https://api.multiavatar.com/Binx%${Math.floor((Math.random() * 50000))}.png`
      }
    })
    console.log('注册',result);
    return result
  }


  //登录
  const login =async(values:FormData)=>{
    let result= await requests({
      method:'post',
      url:'auth/login',
      data:{
        ...values
      }
    })
    console.log('登录',result);
    if(result.data.user_token){
      notification['success']({
        message:'您已成功登录！',
        duration:2.5
      })
    }else{
      notification['error']({
        message:'登录失败',
        duration:2.5
      })
      return
    }
    //存储数据
    sessionStorage.setItem('token',result.data.user_token)
    sessionStorage.setItem('username',values.username)
    router.push('/chat')
  }


  const onFinish=async(values:FormData)=>{
    if(values.password===values.confirmPassword){
      let registerResult=await register(values)
      console.log(registerResult);
      if(registerResult.data.code===200){
        login(values)
      }
    }else{
      notification['error']({
        message:'错误!',
        description:'两次密码输入不一致！！',
        duration:2
      })
    }
  }


  return (
  <HomeStyle>
    <img src={bgc.src} alt="" className='bgImage'/>
     <div className='bgCover'>
     <Form
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      autoComplete="off"
      className='loginform'
    >
      <Form.Item
        label="请输入用户名"
        name="username"
        className='whitelabel'
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="请输入密码"
        name="password"
        className='whitelabel'

        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="请确认密码"
        name="confirmPassword"
        className='whitelabel'
        rules={[{ required: true, message: '请确认密码' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          登录
        </Button>
      </Form.Item>
    </Form>
     </div>
  </HomeStyle>)
}

