import Dashboardlayout from "@/layout/DashboardLayout/dashboardLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Styles from "./index.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUserProfile,
  getAllUsers,
  getUserAndProfile,
} from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config";
import {
  CommentPost,
  deleteComment,
  deletePost,
  getAllComments,
  getAllPosts,
  likePost,
} from "@/config/redux/action/postAction";
import { resetPostId } from "@/config/redux/reducer/postReducer";
import { reset } from "@/config/redux/reducer/authReducer";

export default function dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);

  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    } else {
      const storedToken = localStorage.getItem("token");
      dispatch(getAllUserProfile());
      dispatch(getAllPosts());
      dispatch(getAllUsers());
      dispatch(getUserAndProfile({ token: storedToken }));
    }
  }, [dispatch, router]);

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

  return (
    <Dashboardlayout>
      <div className={Styles.dashboard_mainContainer}>
        <div className={Styles.mobile_Logo}>
          <div
            onClick={() => {
              router.push("/dashboard");
            }}
            className={Styles.mobile_heading}
          >
            <h1>Pixora</h1>
          </div>
        </div>
        <div className={Styles.dashboard_container_middle}>
          <div className={Styles.UserStory_Container}>
            {authState.all_users
              .filter((user) => user._id !== authState.user?.userId?._id)
              .map((user, index) => {
                return (
                  <div
                    onClick={() => {
                      router.push(`/view_profile/${user.username}`);
                    }}
                    key={index}
                    className={Styles.userStory}
                  >
                    <img
                      className={Styles.profilePicture}
                      src={`${user.profilePicture}`}
                    />
                    <p>{user.username || "Unknown"}</p>
                  </div>
                );
              })}
          </div>
          <div className={Styles.UserPost_Container}>
            {postState.posts.map((post, index) => {
              return (
                <div key={index} className={Styles.postIndex}>
                  <div className={Styles.Post}>
                    <div className={Styles.postUser_profile}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <img
                          onClick={() => {
                            router.push(
                              `/view_profile/${post.userId.username}`
                            );
                          }}
                          className={Styles.profilePicture}
                          src={`${post.userId.profilePicture}`}
                        />
                        <p className={Styles.post_username}>
                          {post.userId?.username}
                        </p>
                      </div>
                      {post.userId._id === authState.user?.userId._id && (
                        <div
                          onClick={async () => {
                            await dispatch(
                              deletePost({
                                post_id: post._id,
                              })
                            );
                            await dispatch(getAllPosts());
                          }}
                          style={{ marginRight: "100px", cursor: "pointer" }}
                          className={Styles.post_media}
                        >
                          <p>
                            <i
                              style={{ color: "red", fontSize: "1.2rem" }}
                              className="fa-solid fa-trash"
                            ></i>
                          </p>
                        </div>
                      )}
                    </div>
                    <div className={Styles.postUser_media}>
                      <img src={`${post.media}`} />
                    </div>
                    <div className={Styles.post_icon}>
                      <div
                        onClick={async () => {
                          await dispatch(
                            likePost({
                              post_id: post._id,
                            })
                          );
                          await dispatch(getAllPosts());
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {post.likedBy.some(
                          (id) => id === authState.user?.userId?._id
                        ) ? (
                          <i
                            style={{ color: "red" }}
                            className="fa-solid fa-heart"
                          ></i>
                        ) : (
                          <i className="fa-regular fa-heart"></i>
                        )}
                        <p>{post.likes}&nbsp;Likes</p>
                      </div>
                      <div
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          dispatch(getAllComments({ post_id: post._id }));
                        }}
                      >
                        <i className="fa-regular fa-comment"></i>
                      </div>
                    </div>
                    <div className={Styles.postUser_body}>
                      <p className={Styles.post_username}>
                        {post.userId.username}
                      </p>
                      <p>{post.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={Styles.dashboard_container_rigth}>
          <div className={Styles.userProfile}>
            {authState.user?.userId ? (
              <div
                onClick={() => {
                  router.push("/Profile");
                }}
                className={Styles.userProfileContainer}
              >
                <div className={Styles.user_ProfilePicture}>
                  <img
                    src={`${authState.user.userId.profilePicture}`}
                    alt="Profile"
                    width="50"
                    height="50"
                    style={{ borderRadius: "50%" }}
                  />
                </div>
                <div>
                  <p style={{ fontWeight: "bold" }}>
                    {authState.user.userId.name}
                  </p>
                  <p style={{ color: "silver" }}>
                    {authState.user.userId.username}
                  </p>
                </div>
              </div>
            ) : (
              <p>Loading Profile...</p>
            )}
            <div
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/login");
                dispatch(reset());
              }}
              className={Styles.logoutButton}
            >
              <p style={{ fontWeight: "bold" }}>Logout</p>
            </div>
          </div>
          <div className={Styles.Top_Profiles}>
            <p>Top Profiles</p>
            {authState.all_users
              .filter((user) => user._id !== authState.user?.userId?._id)
              .map((user, index) => (
                <div
                  onClick={() => {
                    router.push(`/view_profile/${user.username}`);
                  }}
                  key={index}
                  className={Styles.topProfileUsers}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={`${user.profilePicture}`}
                    alt="Profile"
                    width="50"
                    height="50"
                    style={{ borderRadius: "50%" }}
                  />
                  <p style={{ marginLeft: "10px" }}>{user.name}</p>
                </div>
              ))}
          </div>
          <div className={Styles.copyRights}>
            <p style={{ color: "silver" }}>&copy; 2025 Pixora</p>
          </div>
        </div>
      </div>
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
                  onClick={() => {
                    router.push(
                      `/view_profile/${selectedPostProfile.username}`
                    );
                  }}
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
                        onClick={() => {
                          router.push(
                            `/view_profile/${comment?.userId.username}`
                          );
                        }}
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
                      <p style={{ display: "inline" }}>{comment.commentBody}</p>
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
    </Dashboardlayout>
  );
}
