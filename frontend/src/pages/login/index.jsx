import React, { useEffect, useState } from "react";
import Styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { emptyMessage } from "@/config/redux/reducer/authReducer";

export default function Login() {
  const authState = useSelector((state) => state.auth);

  const router = useRouter();
  const dispatch = useDispatch();

  const [isAccount, setIsAccount] = useState(true);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    dispatch(emptyMessage());
  }, [isAccount]);

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  }, []);

  const handleRegister = () => {
    dispatch(registerUser({ name, username, email, password }));
    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const handleLogin = () => {
    dispatch(loginUser({ email, password }));
  };

  return (
    <div>
      <div className={Styles.container}>
        <div className={Styles.container_leftSide}>
          <img src="SocialImage.png"></img>
        </div>
        <div className={Styles.container_rigthSide}>
          <div className={Styles.container_rigthSide_logo}>
            <h2>Pixora</h2>
          </div>
          <p
            style={{
              color: authState.isError ? "red" : "green",
              fontWeight: "bold",
              paddingBottom: "10px",
            }}
          >
            {authState.message}
          </p>
          <div className={Styles.container_Input}>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></input>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            {isAccount ? (
              <></>
            ) : (
              <div className={Styles.container_Input}>
                <input
                  type="text"
                  placeholder="FullName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                ></input>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                ></input>
              </div>
            )}
          </div>
          <div
            onClick={() => {
              if (isAccount) {
                handleLogin();
              } else {
                handleRegister();
              }
            }}
            className={Styles.authButton}
          >
            <p style={{ cursor: "pointer" }}>
              {isAccount ? "Log In" : "Sign Up"}
            </p>
          </div>
          <p
            onClick={() => {
              setIsAccount(!isAccount);
            }}
          >
            {isAccount ? (
              <>
                Don't have an Account?
                <span
                  style={{
                    color: `#0095f6`,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Sign Up
                </span>
              </>
            ) : (
              <>
                have an Account?
                <span
                  style={{
                    color: `#0095f6`,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Log In
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
