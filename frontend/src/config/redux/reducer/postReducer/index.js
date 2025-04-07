import { createSlice } from "@reduxjs/toolkit";
import {
  createPost,
  getAllComments,
  getAllPosts,
} from "../../action/postAction";

const initialState = {
  isError: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  postFetched: true,
  posts: [],
  postId: "",
  comments: [],
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state) => {
        (state.isLoading = true), (state.message = "Getting all posts");
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.postFetched = true;
        state.posts = action.payload.reverse();
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
        state.message = action.payload;
      })
      .addCase(createPost.pending, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = action.payload;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllComments.fulfilled, (state, action) => {
        state.postId = action.payload.post_id;
        state.comments = action.payload.comments;
      });
  },
});

export const { reset, resetPostId } = postSlice.actions;

export default postSlice.reducer;
