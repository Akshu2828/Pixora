import React, { useEffect, useState } from "react";
import Styles from "./index.module.css";
import Dashboardlayout from "@/layout/DashboardLayout/dashboardLayout";
import { reset, setTokenIsThere } from "@/config/redux/reducer/authReducer";
import {
  getMyFollowers,
  getMyFollowings,
  getUserAndProfile,
} from "@/config/redux/action/authAction";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { BASE_URL, clientServer } from "@/config";
import {
  CommentPost,
  deleteComment,
  getAllComments,
  getAllPosts,
  likePost,
} from "@/config/redux/action/postAction";
import { resetPostId } from "@/config/redux/reducer/postReducer";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);
  const [userPosts, setUserPosts] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [commentText, setCommentText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedPost = postState.posts.find(
    (post) => post._id === postState.postId
  );

  const selectedPostProfile = selectedPost?.userId;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      dispatch(getAllPosts());
      dispatch(setTokenIsThere());
      dispatch(getUserAndProfile({ token: storedToken }));
      dispatch(getMyFollowers({ token: storedToken }));
      dispatch(getMyFollowings({ token: storedToken }));
    }
  }, [dispatch, router]);

  useEffect(() => {
    if (authState?.user) {
      setUserProfile(authState.user);
      let posts = postState.posts.filter((post) => {
        return post.userId.username === authState.user?.userId?.username;
      });
      setUserPosts(posts);
    } else {
      console.log("User not found or loading...");
    }
  }, [authState?.user, postState.posts]);

  useEffect(() => {
    if (postState.postId !== "") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [postState.postId]);

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

  const handleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  const handleProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    formData.append("token", localStorage.getItem("token"));

    try {
      const response = await clientServer.post(
        "/updateProfilePicture",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(getUserAndProfile({ token: localStorage.getItem("token") }));
    } catch (error) {
      console.error("Error updating profile picture:", error.response || error);
    }
  };

  const updateProfileData = async () => {
    const request = await clientServer.post("/updateUserProfile", {
      token: localStorage.getItem("token"),
      username: userProfile.userId.username,
    });

    const response = await clientServer.post("/updateUserProfiledata", {
      token: localStorage.getItem("token"),
      bio: userProfile.bio,
    });
    dispatch(getUserAndProfile({ token: localStorage.getItem("token") }));
    setIsModalOpen(!isModalOpen);
  };
  return (
    <Dashboardlayout>
      <div className={Styles.ProfileContainer}>
        <div className={Styles.UserProfile}>
          <div className={Styles.userProfileDataMain}>
            <div className={Styles.userProfileImage}>
              <img src={`${authState?.user?.userId?.profilePicture}`} />
            </div>
            <div className={Styles.userProfiledata}>
              <div className={Styles.userDataOne}>
                <div className={Styles.user_username}>
                  <p style={{ fontWeight: "bold" }}>
                    {authState?.user?.userId?.username}
                  </p>
                </div>
                <div
                  onClick={() => {
                    handleModal();
                  }}
                  className={Styles.editProfile_btn}
                >
                  <p style={{ fontWeight: "bold" }}>Edit</p>
                </div>
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
                  {authState?.user?.userId?.name}
                </p>
                <p>{authState?.user?.bio}</p>
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
      {isModalOpen && (
        <div className={Styles.modalOverlay} onClick={handleModal}>
          <div
            className={Styles.EditProfileContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={Styles.updateProfilePicture}>
              <div className={Styles.updateProfilePictureMainContainer}>
                <div className={Styles.profileImage}>
                  <img src={`${authState?.user?.userId?.profilePicture}`} />
                </div>
                <div className={Styles.usernameAndname}>
                  <p style={{ fontWeight: "bold" }}>
                    {authState?.user?.userId?.username}
                  </p>
                  <p>{authState?.user?.userId?.name}</p>
                </div>
                <div className={Styles.imageUpdateBtn}>
                  <input
                    onChange={(e) => {
                      handleProfilePicture(e.target.files[0]);
                    }}
                    type="file"
                    id="profilePictureUpload"
                    style={{ display: "none" }}
                  />
                  <label htmlFor="profilePictureUpload">
                    <p style={{ fontWeight: "bold", cursor: "pointer" }}>
                      Change Photo
                    </p>
                  </label>
                </div>
              </div>
            </div>
            <div className={Styles.updateUsername}>
              <div className={Styles.usernameIput}>
                <p style={{ marginBottom: "10px" }}>Username</p>
                <input
                  type="text"
                  value={userProfile.userId.username}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      userId: {
                        ...userProfile.userId,
                        username: e.target.value,
                      },
                    })
                  }
                ></input>
              </div>
            </div>
            <div className={Styles.updateBio}>
              <div className={Styles.bioTextarea}>
                <p style={{ marginBottom: "10px" }}>Bio</p>
                <textarea
                  value={userProfile.bio}
                  onChange={(e) => {
                    setUserProfile({ ...userProfile, bio: e.target.value });
                  }}
                ></textarea>
              </div>
            </div>
            <div className={Styles.updateButtons}>
              <div className={Styles.profileUpdateButton}>
                <div
                  onClick={() => {
                    updateProfileData();
                  }}
                  className={Styles.submitButton}
                >
                  <p style={{ fontWeight: "bold" }}>Submit</p>
                </div>
                <div
                  onClick={() => {
                    handleModal();
                  }}
                  className={Styles.cancelButton}
                >
                  <p style={{ fontWeight: "bold" }}>Cancel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Dashboardlayout>
  );
}
