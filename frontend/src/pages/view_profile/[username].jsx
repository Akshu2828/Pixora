import { BASE_URL, clientServer } from "@/config";
import {
  getAllRequests,
  getMyFollowers,
  getMyFollowings,
  getUserAndProfile,
  sendFollowRequest,
} from "@/config/redux/action/authAction";
import {
  CommentPost,
  deleteComment,
  getAllComments,
  getAllPosts,
  likePost,
} from "@/config/redux/action/postAction";
import { setTokenIsThere } from "@/config/redux/reducer/authReducer";
import { resetPostId } from "@/config/redux/reducer/postReducer";
import Dashboardlayout from "@/layout/DashboardLayout/dashboardLayout";
import { useRouter } from "next/router";
import React, { use, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Styles from "./index.module.css";
import socket from "@/config/socket";

export default function ViewProfile({ userProfile }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);
  const [commentText, setCommentText] = useState("");

  const [isChatModal, setIsChatModal] = useState(false);

  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const selectedPost = postState.posts.find(
    (post) => post._id === postState.postId
  );

  const selectedPostProfile = selectedPost?.userId;
  const handleCommentPost = async () => {
    await dispatch(
      CommentPost({
        post_id: postState.postId,
        body: commentText,
      })
    );
    await dispatch(getAllComments({ post_id: postState.postId }));

    setCommentText("");
  };

  function getRoomId(user1, user2) {
    return [user1, user2].sort().join("_"); // Always same order
  }

  const messageListenerRef = useRef(null);

  if (!messageListenerRef.current) {
    messageListenerRef.current = (data) => {
      setChatMessages((prev) => [...prev, data]);
    };
  }

  useEffect(() => {
    if (authState.user && userProfile) {
      const roomId = getRoomId(
        authState.user.userId._id,
        userProfile.userId._id
      );
      socket.emit("join-room", roomId);

      socket.off("receive-message", messageListenerRef.current); // Safe cleanup
      socket.on("receive-message", messageListenerRef.current);

      return () => {
        socket.off("receive-message", messageListenerRef.current);
      };
    }
  }, [authState.user?.userId?._id, userProfile?.userId?._id]);

  useEffect(() => {
    if (authState.user && userProfile) {
      const isUserFollowing = authState.getMyFollowing.some(
        (following) => following.userId === userProfile.userId._id
      );
      setIsFollowing(isUserFollowing);
    }
  }, [authState.getMyFollowing, userProfile]);

  useEffect(() => {
    console.log(userProfile);
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      dispatch(getAllPosts());
      dispatch(setTokenIsThere());
      dispatch(getUserAndProfile({ token: storedToken }));
      dispatch(getAllRequests({ token: storedToken }));
      dispatch(getMyFollowers({ token: userProfile?.userId?.token }));
      dispatch(getMyFollowings({ token: userProfile?.userId?.token }));
    }
  }, [dispatch, router]);

  useEffect(() => {
    if (userProfile) {
      let posts = postState.posts.filter((post) => {
        return post.userId.username === userProfile.userId.username;
      });
      setUserPosts(posts);
      console.log(posts);
    } else {
      console.log("User not found or loading...");
    }
  }, [authState?.user, postState.posts]);

  useEffect(() => {
    if (isChatModal === true) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isChatModal]);

  useEffect(() => {
    if (postState.postId !== "") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [postState.postId]);

  const handleChatModal = () => {
    setIsChatModal(!isChatModal);
  };

  const handleFollowUnfollow = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    }

    await dispatch(
      sendFollowRequest({
        token: storedToken,
        followingId: userProfile.userId._id,
      })
    );

    await dispatch(getMyFollowers({ token: storedToken }));
    await dispatch(getMyFollowings({ token: storedToken }));
    await dispatch(getAllRequests({ token: storedToken }));

    setIsFollowing(!isFollowing);
  };

  const renderFollowButton = () => {
    const existingRequest = authState?.getAllRequests.find(
      (request) => request?.following?._id === userProfile?.userId?._id
    );

    if (existingRequest) {
      if (existingRequest.status_accepted === null) {
        return <p>Requested</p>;
      } else {
        return <p>Following</p>;
      }
    } else {
      return <p>Follow</p>;
    }
  };

  return (
    <Dashboardlayout>
      <div className={Styles.ProfileContainer}>
        <div className={Styles.UserProfile}>
          <div className={Styles.userProfileData}>
            <div className={Styles.userProfileImage}>
              <img src={`${userProfile?.userId?.profilePicture}`} />
            </div>
            <div className={Styles.user_usernameOne}>
              <p style={{ fontWeight: "bold" }}>
                {userProfile?.userId?.username}
              </p>
            </div>
            <div className={Styles.userProfiledata}>
              <div className={Styles.userDataOne}>
                <div className={Styles.user_usernameTwo}>
                  <p style={{ fontWeight: "bold" }}>
                    {userProfile?.userId?.username}
                  </p>
                </div>
                <div
                  onClick={() => {
                    handleFollowUnfollow();
                  }}
                  className={Styles.follow_btn}
                >
                  {renderFollowButton()}
                </div>
                <div
                  onClick={() => {
                    handleChatModal();
                  }}
                  className={Styles.message_Button}
                >
                  <p style={{ fontWeight: "bold" }}>Message</p>
                </div>
              </div>
              <div className={Styles.userDataTwo}>
                <div className={Styles.userTotalPosts}>
                  <span style={{ fontWeight: "bold" }}>{userPosts.length}</span>
                  <p style={{ color: "#acb4bb" }}>posts</p>
                </div>
                <div className={Styles.userTotalFollowers}>
                  <span style={{ fontWeight: "bold" }}>
                    {authState.getMyFollowers.length}
                  </span>
                  <p style={{ color: "#acb4bb" }}>Followers</p>
                </div>
                <div className={Styles.userTotalFollowing}>
                  <span style={{ fontWeight: "bold" }}>
                    {authState.getMyFollowing.length}
                  </span>
                  <p style={{ color: "#acb4bb" }}>Following</p>
                </div>
              </div>
              <div className={Styles.userDataThree}>
                <p style={{ fontWeight: "bold" }}>
                  {userProfile?.userId?.name}
                </p>
                <p>{userProfile?.bio}</p>
              </div>
            </div>
          </div>
          <div className={Styles.userPosts}>
            {userPosts.map((post, index) => {
              return (
                <div
                  className={Styles.postImage}
                  key={index}
                  onClick={() => {
                    dispatch(getAllComments({ post_id: post._id }));
                  }}
                >
                  <img src={`${post.media}`} />
                </div>
              );
            })}
          </div>
        </div>

        {isChatModal ? (
          <div onClick={() => handleChatModal()} className={Styles.chatModal}>
            <div
              onClick={(e) => e.stopPropagation()}
              className={Styles.chatModalHeader}
            >
              <div className={Styles.userProfile}>
                <div className={Styles.userProfile_Image}>
                  <img
                    src={`${userProfile?.userId?.profilePicture}`}
                    alt="Profile"
                    width="50"
                    height="50"
                    style={{ borderRadius: "50%" }}
                  />
                </div>
                <div className={Styles.userProfileDetail}>
                  <p style={{ fontWeight: "bold" }}>
                    {userProfile?.userId.username}
                  </p>
                  <p style={{ color: "silver" }}>{userProfile?.userId.name}</p>
                </div>
              </div>
              <div className={Styles.chatMessagesContainer}>
                {chatMessages.map((msg, index) => (
                  <p
                    key={index}
                    style={{
                      backgroundColor:
                        msg.senderId === authState.user.userId._id
                          ? "#0095f6"
                          : "#363636",

                      alignSelf:
                        msg.senderId === authState.user.userId._id
                          ? "flex-end"
                          : "flex-start",
                    }}
                  >
                    {msg.text}
                  </p>
                ))}
              </div>

              <div className={Styles.chatInputContainer}>
                <div className={Styles.chatInput}>
                  <input
                    type="text"
                    placeholder="Message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                  ></input>
                </div>
                <div
                  className={Styles.chatbutton}
                  onClick={() => {
                    const roomId = getRoomId(
                      authState.user.userId._id,
                      userProfile.userId._id
                    );
                    const messageData = {
                      senderId: authState.user.userId._id,
                      receiverId: userProfile.userId._id,
                      text: chatMessage,
                      roomId,
                    };
                    socket.emit("send-message", messageData);
                    setChatMessage("");
                  }}
                >
                  <p style={{ fontWeight: "bold" }}>Send</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}

        {postState.postId !== "" && (
          <div
            onClick={() => {
              dispatch(resetPostId());
            }}
            className={Styles.postMainContainer}
          >
            <div
              onClick={() => {
                dispatch(resetPostId());
              }}
              className={Styles.PostResetIcon}
            >
              <i className="fa-solid fa-xmark"></i>
            </div>
            <div
              onClick={(e) => e.stopPropagation()}
              className={Styles.postContainer}
            >
              <div className={Styles.postMediaContainer}>
                <img src={`${selectedPost.media}`} />
              </div>
              <div className={Styles.postcommentsContainer}>
                <div className={Styles.postUserProfile}>
                  <img
                    src={`${selectedPostProfile.profilePicture}`}
                    alt="Profile"
                    width="40"
                    height="40"
                    style={{ borderRadius: "50%" }}
                  />
                  <p style={{ marginLeft: "10px", fontWeight: "bold" }}>
                    {selectedPostProfile.name}
                  </p>
                </div>
                <div className={Styles.postBody}>
                  <img
                    src={`${selectedPostProfile.profilePicture}`}
                    alt="Profile"
                    width="40"
                    height="40"
                    style={{ borderRadius: "50%" }}
                  />
                  <p style={{ marginLeft: "10px" }}>{selectedPost.body}</p>
                </div>
                <div className={Styles.CommentContainer}>
                  {postState?.comments.map((comment, index) => (
                    <div key={index} className={Styles.mainCommentContainer}>
                      <div>
                        <img
                          src={`${comment?.userId.profilePicture}`}
                          alt="Profile"
                          width="40"
                          height="40"
                          style={{ borderRadius: "50%" }}
                        />
                      </div>
                      <div>
                        <p
                          style={{
                            display: "inline",
                            fontWeight: "bold",
                            marginRight: "10px",
                          }}
                        >
                          {comment?.userId.username}
                        </p>
                        <p style={{ display: "inline" }}>
                          {comment.commentBody}
                        </p>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          right: "0",
                          marginRight: "10px",
                        }}
                        onClick={async () => {
                          await dispatch(
                            deleteComment({
                              comment_id: comment._id,
                            })
                          );
                          await dispatch(
                            getAllComments({ post_id: postState.postId })
                          );
                        }}
                      >
                        {authState.user?.userId._id === comment?.userId._id ? (
                          <i
                            style={{ color: "red", cursor: "pointer" }}
                            className="fa-solid fa-trash"
                          ></i>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{ marginTop: "10px" }}
                  className={Styles.CommentIcon_Container}
                >
                  <div
                    onClick={async () => {
                      await dispatch(
                        likePost({
                          post_id: postState.postId,
                        })
                      );
                      await dispatch(getAllPosts());
                    }}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {selectedPost?.likedBy?.some(
                      (id) => id === authState.user?.userId?._id
                    ) ? (
                      <i
                        style={{ color: "red", fontSize: "1.5rem" }}
                        className="fa-solid fa-heart"
                      ></i>
                    ) : (
                      <i
                        style={{ fontSize: "1.5rem" }}
                        className="fa-regular fa-heart"
                      ></i>
                    )}
                    <p>{selectedPost?.likes || 0} Likes</p>
                  </div>
                </div>
                <div className={Styles.commentIput_container}>
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a Comment.."
                  />
                  <div
                    onClick={async () => {
                      handleCommentPost();
                    }}
                  >
                    <p style={{ fontWeight: "bold" }}>Post</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dashboardlayout>
  );
}

export async function getServerSideProps(context) {
  const request = await clientServer.get("/getUserAndProfileByUsername", {
    params: {
      username: context.query.username,
    },
  });

  const response = await request.data;
  return { props: { userProfile: request.data.profile } };
}
