import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/getAllPosts");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const createPost = createAsyncThunk(
  "post/createPost",
  async (userData, thunkAPI) => {
    const { file, body } = userData;

    try {
      const formData = new FormData();

      formData.append("token", localStorage.getItem("token"));
      formData.append("body", body);
      formData.append("media", file);

      const response = await clientServer.post("/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        return thunkAPI.fulfillWithValue(response.data);
      } else {
        return thunkAPI.rejectWithValue("Post not Uploaded!");
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (post_id, thunkAPI) => {
    try {
      const response = await clientServer.delete("/deletePost", {
        data: {
          token: localStorage.getItem("token"),
          post_id: post_id.post_id,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response);
    }
  }
);

export const getAllComments = createAsyncThunk(
  "post/getAllComments",
  async (postData, thunkAPI) => {
    try {
      const response = await clientServer.get("/getAllComments", {
        params: {
          post_id: postData.post_id,
        },
      });

      return thunkAPI.fulfillWithValue({
        comments: response.data,
        post_id: postData.post_id,
      });
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response);
    }
  }
);

export const CommentPost = createAsyncThunk(
  "post/commentPost",
  async (commentData, thunkAPI) => {
    try {
      const response = await clientServer.post("/commentOnPost", {
        token: localStorage.getItem("token"),
        post_id: commentData.post_id,
        commentBody: commentData.body,
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response);
    }
  }
);

export const deleteComment = createAsyncThunk(
  "post/deleteComment",
  async (commentData, thunkAPI) => {
    try {
      const response = await clientServer.delete("/deleteComment", {
        data: {
          token: localStorage.getItem("token"),
          comment_id: commentData.comment_id,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response);
    }
  }
);

export const likePost = createAsyncThunk(
  "post/likePost",
  async (likepost, thunkAPI) => {
    try {
      const response = await clientServer.post("/likesPost", {
        token: localStorage.getItem("token"),
        post_id: likepost.post_id,
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response);
    }
  }
);
