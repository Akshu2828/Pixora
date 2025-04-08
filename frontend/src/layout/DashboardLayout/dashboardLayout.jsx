import React, { useEffect, useState } from "react";
import Styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptFollowRequest,
  getFollowRequests,
  getUserAndProfile,
} from "@/config/redux/action/authAction";
import { setTokenIsThere } from "@/config/redux/reducer/authReducer";
import { BASE_URL } from "@/config";
import { createPost, getAllPosts } from "@/config/redux/action/postAction";

export default function Dashboardlayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [token, setToken] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [fileContent, setFileContent] = useState(null);

  const [postContent, setPostContent] = useState("");
  const [imageContent, setImageContent] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
      dispatch(setTokenIsThere());
      dispatch(getUserAndProfile({ token: storedToken }));
      // dispatch(acceptFollowRequest({ token: storedToken }));
      dispatch(getFollowRequests({ token: storedToken }));
    }
  }, [dispatch, router]);

  const handleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  const handleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImageContent(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFileContent(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPost = async () => {
    dispatch(createPost({ file: imageContent, body: postContent }));
    setPostContent("");
    setFileContent(null);
    setImageContent(null);
    dispatch(getAllPosts());
    setIsModalOpen(false);
  };

  const handleAccept = (followerId) => {
    dispatch(acceptFollowRequest({ token, followerId, action_type: "accept" }))
      .then(() => {
        dispatch(getFollowRequests({ token }));
      })
      .catch((error) =>
        console.error("Error accepting follow request:", error)
      );
  };

  return (
    <div>
      <div className={Styles.homeContainer}>
        <div className={Styles.homeContainer_leftBar}>
          <div
            onClick={() => {
              router.push("/dashboard");
            }}
          >
            <h1>Pixora</h1>
          </div>
          <div className={Styles.homeContainer_leftBar_icons}>
            <div
              onClick={() => {
                router.push("/dashboard");
              }}
              style={{ display: "inline", cursor: "pointer" }}
            >
              <i className="fa-solid fa-house"></i>
              <p style={{ display: "inline" }}>Home</p>
            </div>
            <div
              onClick={() => {
                router.push("/Explore");
              }}
              style={{ display: "inline", cursor: "pointer" }}
            >
              <i className="fa-solid fa-compass"></i>
              <p style={{ display: "inline" }}>Explore</p>
            </div>
            <div
              onClick={() => {
                handleModal();
              }}
              style={{ display: "inline", cursor: "pointer" }}
            >
              <i className="fa-solid fa-circle-plus"></i>
              <p style={{ display: "inline" }}>Create</p>
            </div>
            <div
              onClick={() => {
                handleNotification();
              }}
              style={{ display: "inline", cursor: "pointer" }}
            >
              <i className="fa-regular fa-heart"></i>
              <p style={{ display: "inline" }}>Notifications</p>
            </div>
          </div>
          <div
            onClick={() => {
              router.push("/Profile");
            }}
            className={Styles.ProfileContainer}
          >
            {authState.user?.userId?.profilePicture ? (
              <img
                src={`${authState.user.userId.profilePicture}`}
                alt="Profile"
                width="50"
                height="50"
                style={{ borderRadius: "50%" }}
              />
            ) : (
              <p>Loading Profile...</p>
            )}
            <p>Profile</p>
          </div>
        </div>

        <div className={Styles.homeContainer_feedContainer}>
          {children}
          {isNotificationOpen ? (
            <div
              onClick={() => {
                handleNotification();
              }}
              className={Styles.notificationContainer}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={Styles.requestContainer}
              >
                {authState?.getFollowRequests?.length === 0 ? (
                  <div className={Styles.noRequests}>
                    <p>No Follow Requests</p>
                  </div>
                ) : (
                  <div className={Styles.requestUsers}>
                    {authState?.getFollowRequests
                      .filter((user) => user.status_accepted === null)
                      .map((user, index) => (
                        <div key={index} className={Styles.userMainContainer}>
                          <div className={Styles.userDetails}>
                            <div className={Styles.userImage}>
                              <img
                                width="50"
                                height="50"
                                style={{ borderRadius: "50%" }}
                                src={`${user?.follower.profilePicture}`}
                              />
                            </div>
                            <div className={Styles.UserUsername}>
                              <p style={{ fontWeight: "bold" }}>
                                {user.follower.username}
                              </p>
                            </div>
                          </div>
                          <div className={Styles.userButton}>
                            <div
                              onClick={() => handleAccept(user.follower._id)}
                              className={Styles.acceptButton}
                            >
                              <p style={{ fontWeight: "bold" }}>Accept</p>
                            </div>
                            <div className={Styles.rejectButton}>
                              <p style={{ fontWeight: "bold" }}>Reject</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <></>
          )}
          {isModalOpen ? (
            <div className={Styles.createPost_MainContainer}>
              <div className={Styles.createPost_heading}>
                <p style={{ fontWeight: "bold" }}>Create Post</p>
              </div>
              <div className={Styles.create_Post}>
                {!fileContent ? (
                  <div className={Styles.createPost_media}>
                    <input
                      type="file"
                      className={Styles.createPost_input}
                      hidden
                      id="createPost_media_input"
                      accept="image/*"
                      onChange={handleImageChange}
                    />

                    <label
                      htmlFor="createPost_media_input"
                      className={Styles.createPost_media_input}
                    >
                      Choose File
                    </label>
                  </div>
                ) : (
                  <div className={Styles.imagePreviewContainer}>
                    <img src={fileContent} alt="Selected Preview" />
                  </div>
                )}

                <div className={Styles.createPost_data}>
                  {authState.user?.userId ? (
                    <div className={Styles.CreatePostUser_profile}>
                      <img
                        alt="Profile"
                        width="70"
                        height="70"
                        style={{ borderRadius: "50%", marginLeft: "1rem" }}
                        src={`${authState.user.userId.profilePicture}`}
                      />
                      <p style={{ marginLeft: "10px", fontWeight: "bold" }}>
                        {authState.user.userId.username}
                      </p>
                    </div>
                  ) : (
                    <></>
                  )}
                  <div className={Styles.CreatePostUser_body}>
                    <textarea
                      placeholder="Type Caption Here!"
                      onChange={(e) => setPostContent(e.target.value)}
                    ></textarea>
                  </div>
                  <div className={Styles.CreatePostUser_ShareBtn}>
                    <div
                      onClick={() => {
                        handleUploadPost();
                      }}
                      className={Styles.PostShareButton}
                    >
                      <p>Share</p>
                    </div>
                    <div
                      onClick={() => {
                        setIsModalOpen(false);
                        document.body.style.overflow = "";
                      }}
                      className={Styles.closeModal}
                    >
                      <p>Discard</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className={Styles.mobileNavbar}>
        <div
          onClick={() => {
            router.push("/dashboard");
          }}
          className={Styles.navbar_homeIcon}
        >
          <i className="fa-solid fa-house"></i>
        </div>
        <div
          onClick={() => {
            router.push("/Explore");
          }}
          className={Styles.navbar_ExploreIcon}
        >
          <i className="fa-solid fa-compass"></i>
        </div>
        <div
          onClick={() => {
            handleModal();
          }}
          className={Styles.navbar_ExploreIcon}
        >
          <i className="fa-solid fa-circle-plus"></i>
        </div>
        <div
          onClick={() => {
            handleNotification();
          }}
          className={Styles.navbar_ExploreIcon}
        >
          <i className="fa-regular fa-heart"></i>
        </div>
        <div
          onClick={() => {
            router.push("/Profile");
          }}
          className={Styles.user_profile}
        >
          <img
            src={`${authState?.user?.userId?.profilePicture}`}
            alt="Profile"
            width="40"
            height="40"
            style={{ borderRadius: "50%" }}
          />
        </div>
      </div>
    </div>
  );
}
