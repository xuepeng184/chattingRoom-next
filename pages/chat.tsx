import styled from "styled-components";
import { useEffect, useState, useRef } from "react";
import bgi from "../public/666.png";
import chatBgi from "../public/777.png";
import requests from "../utils/request";
import io from "socket.io-client";
import { useDispatch } from "react-redux";
import { changeName } from "../store/store";
import { useSelector } from "react-redux";
import { notification } from "antd";
import { routerBeforeEach } from "../utils/beforeEach";
import { useRouter } from "next/router";
import axios from "axios";
import { httpHost, wsHOST } from "../utils/request";

export default function Chat() {
  const router = useRouter();
  const socket = io(wsHOST);
  const dispatch = useDispatch();
  const input = useRef<HTMLInputElement>(null);
  const [currentReceiver, setCurrentReceiver] = useState("");
  const [myself, setMyself] = useState({
    username: "",
    userPic: "",
  });
  const [message, setMessage] = useState([
    {
      sender: "",
      content: "",
      receiver: "",
    },
  ]);
  let localSender = useSelector((store: any) => store.username.value);

  //用户列表
  const [userList, setUserList] = useState([
    {
      username: "",
      userPic: "",
    },
  ]);

  const getUserList = async () => {
    axios.post(`${httpHost}user/all`).then((res) => {
      console.log("用户列表", res.data);

      setUserList(res.data);
    });
    // console.log("用户列表", result);
  };

  const getCurrentMessages = async () => {
    console.log("开始获得消息");
    //设置定时器，先让页面加载完，高度发生变化，才能到最底部，不然只能到倒数第二条
    setTimeout(() => {
      let showArea = document.getElementById("showArea") as HTMLElement;
      showArea.scrollTo(0, showArea.scrollHeight);
    }, 100);
    let result = await requests({
      url: "message/getlist",
      method: "post",
      data: {
        sender: localSender,
        receiver: currentReceiver,
      },
    });
    console.log("消息列表", result.data);

    setMessage(result.data.data);
    //滚动到屏幕最底部
  };

  const sendMessage = async () => {
    if (localSender == currentReceiver || currentReceiver == "") {
      input.current!.value = "";
      return notification["info"]({
        message: "您必须选择一个人发信息",
        duration: 2,
      });
    }
    const message = input.current!.value;
    let result = await requests({
      method: "post",
      url: "message/send",
      data: {
        sender: localSender,
        receiver: currentReceiver,
        content: message,
      },
    });
    console.log("发送信息", result);
    socket.emit("getmessage");
    input.current!.value = "";
  };

  const getMyself = async () => {
    axios
      .get(`${httpHost}user/findme`, {
        params: {
          username: localSender,
        },
      })
      .then((res) => {
        console.log("----->", res.data);

        setMyself(res.data);
      });
  };

  useEffect(() => {
    getCurrentMessages();
  }, [currentReceiver]);

  useEffect(() => {
    routerBeforeEach(router);
    getUserList();
    dispatch(changeName(sessionStorage.getItem("username") as string));
    getMyself();
  }, []);

  useEffect(() => {
    socket.on("showMessage", getCurrentMessages);
    return () => {
      socket.off("showMessage");
    };
  });

  return (
    <ChatContainer>
      <div className="userDet">
        <p>当前登录的用户是：</p>
        <img src={myself.userPic} alt="" />
        <p>{localSender}</p>
      </div>
      <div className="main">
        <div className="left">
          <div className="showArea" id="showArea">
            {message.map((message, index) => {
              return message.sender == localSender ? (
                <div className="newItem item_right" key={index}>
                  <span>{message.content}</span>
                </div>
              ) : (
                <div className="newItem" key={index}>
                  <span>{message.content}</span>
                </div>
              );
            })}
          </div>
          <div className="inputArea">
            <input type="text" className="inputText" ref={input} />
            <button className="submitBut" onClick={sendMessage}>
              发送信息
            </button>
          </div>
        </div>
        <div className="right">
          {userList.map((user, index) => {
            return (
              <div
                className={currentReceiver == user.username ? "right_item selected" : "right_item"}
                key={index}
                onClick={() => setCurrentReceiver(user.username)}
              >
                <img src={user.userPic} alt="" />
                <span>{user.username}</span>
                {user.username == localSender ? (
                  <span className="meSpan">当前用户</span>
                ) : (
                  <span></span>
                )}
                {user.username == currentReceiver && user.username !== localSender ? (
                  <span className="meSpan">当前聊天用户</span>
                ) : (
                  <span></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </ChatContainer>
  );
}

const ChatContainer = styled.div`
  overflow: hidden; //清除浮动，防止边距塌陷
  background-image: url(${bgi.src});
  background-size: cover;
  width: 100vw;
  height: 100vh;
  .userDet {
    height: 200px;
    width: 200px;
    position: absolute;
    left: 20px;
    top: 20px;
    text-align: center;
    p {
      color: #a3a998;
      font-size: 20px;
      margin: 0;
      margin-bottom: 15px;
    }
    img {
      width: 130px;
      height: 130px;
      border-radius: 50%;
    }
  }
  .main {
    display: flex;
    width: 1000px;
    height: 600px;
    margin: 80px auto;
  }
  .left {
    background-image: url(${chatBgi.src});
    background-size: cover;
    background-position-x: right;
    width: 75%;
    height: 100%;
    /* background-color: red; */
    .showArea {
      width: 100%;
      height: 75%;
      overflow-y: scroll;
      border-bottom: 1px solid white;
      border-right: 1px solid white;
      position: relative;
      &::-webkit-scrollbar-thumb {
        background-color: #e0e0e0;
      }
      &::-webkit-scrollbar-track {
        background-color: #ced6be;
      }
      &::-webkit-scrollbar {
        width: 8px;
      }
      .newItem {
        height: 70px;
        width: 100%;
        padding: 0 20px;
        font-size: 18px;
        color: #e0e0e0;
        position: relative;
        span {
          padding: 0 20px;
          background-color: #6d6d6d;
          height: 30px;
          position: absolute;
          top: 30px;
          border-radius: 10px;
        }
      }
      .item_right {
        span {
          /* position: absolute; */
          right: 20px;
        }
      }
    }
    .inputArea {
      width: 100%;
      height: 25%;
      border-right: 1px solid black;
      position: relative;
      .inputText {
        background-color: transparent;
        width: 100%;
        height: 100%;
        font-size: 30px;
        outline: none;
        color: #ffc0cb;
        border: none;
        padding-left: 10px;
      }
      .submitBut {
        position: absolute;
        bottom: 20px;
        right: 30px;
        background-color: #a3a998;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        transition: all 0.3s linear;
        &:hover {
          background-color: #b7bcaf;
          transform: scale(1.1);
        }
      }
    }
  }
  .right {
    width: 25%;
    height: 100%;
    overflow-y: scroll;
    background-color: #373434;
    .right_item {
      height: 100px;
      width: 100%;
      position: relative;
      background-color: #373434;
      border: 1px solid white;
      &:hover {
        background-color: #222121;
      }
      img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        position: absolute;
        top: 10px;
        left: 10px;
      }
      span {
        top: 40px;
        width: 100px;
        right: 10px;
        position: absolute;
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: 20px;
        color: #fff;
      }
      .meSpan {
        position: absolute;
        top: 10px;
        font-size: 15px;
        color: orange;
      }
    }
    .selected {
      background-color: #4a3535;
    }
  }
`;
