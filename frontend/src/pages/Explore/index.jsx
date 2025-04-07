import Dashboardlayout from "@/layout/DashboardLayout/dashboardLayout";
import React, { useEffect, useState } from "react";
import Styles from "./index.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  CommentPost,
  deleteComment,
  getAllComments,
  getAllPosts,
  likePost,
} from "@/config/redux/action/postAction";
import { BASE_URL } from "@/config";
import { useRouter } from "next/router";
import { resetPostId } from "@/config/redux/reducer/postReducer";

export default function Explore() {
  const dispatch = useDispatch();
  const router = useRouter();

  const postState = useSelector((state) => state.postReducer);
  const authState = useSelector((state) => state.auth);

  const [commentText, setCommentText] = useState("");

  const selectedPost = postState.posts.find(
    (post) => post._id === postState.postId
  );

  const selectedPostProfile = selectedPost?.userId;

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    } else {
      dispatch(getAllPosts());
    }
  }, [dispatch, router]);

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
      <div className={Styles.Container}>
        <div className={Styles.ExploreContainer}>
          {postState.posts.map((post, index) => (
            <div
              onClick={() => {
                dispatch(getAllComments({ post_id: post._id }));
              }}
              className={Styles.postMedia}
              key={index}
            >
              <img className={Styles.postMediaImage} src={`${post.media}`} />
            </div>
          ))}
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
