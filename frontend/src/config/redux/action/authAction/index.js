import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
      });

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      } else {
        return thunkAPI.rejectWithValue({
          message: "Token not Provided",
        });
      }
      return thunkAPI.fulfillWithValue(response.data.token);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getUserAndProfile = createAsyncThunk(
  "user/getUserAndProfile",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/getUserAndProfile", {
        params: {
          token: user.token,
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getAllUserProfile = createAsyncThunk(
  "user/getAllUserProfile",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/getAllUserProfile");

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/getAllUsers");

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const sendFollowRequest = createAsyncThunk(
  "user/sendFollowRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/sendFollowRequest", {
        token: user.token,
        followingId: user.followingId,
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getFollowRequests = createAsyncThunk(
  "user/getFollowRequests",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/getMyFollowRequests", {
        params: {
          token: user.token,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const acceptFollowRequest = createAsyncThunk(
  "user/acceptFollowRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/acceptFollowRequest", {
        token: user.token,
        followerId: user.followerId,
        action_type: user.action_type,
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getUserFollowers = createAsyncThunk(
  "user/getUserFollowers",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/getUserFollowers", {
        params: {
          userId: user.userId,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getUserFollowings = createAsyncThunk(
  "user/getUserFollowings",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/getUserFollowings", {
        params: {
          userId: user.userId,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getMyFollowers = createAsyncThunk(
  "user/getMyFollower",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/getMyFollowers", {
        params: {
          token: user.token,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getMyFollowings = createAsyncThunk(
  "user/getMyFollowing",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/getMyFollowing", {
        params: {
          token: user.token,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getAllRequests = createAsyncThunk(
  "user/getAllRequests",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/getAllRequests", {
        params: {
          token: user.token,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);
