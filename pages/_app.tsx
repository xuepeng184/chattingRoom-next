import "../styles/globals.css";
import "antd/dist/antd.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import usernameSlice from "../store/store";

const store = configureStore({
  reducer: {
    username: usernameSlice,
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Component {...pageProps}></Component>
    </Provider>
  );
}
