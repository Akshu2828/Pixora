import { createSlice } from "@reduxjs/toolkit";
import {
  acceptFollowRequest,
  getAllRequests,
  getAllUserProfile,
  getAllUsers,
  getFollowRequests,
  getMyFollowers,
  getMyFollowings,
  getUserAndProfile,
  getUserFollowers,
  getUserFollowings,
  loginUser,
  registerUser,
  sendFollowRequest,
} from "../../action/authAction";

const initialState = {
  user: undefined,
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  profileFetched: false,
  isTokenThere: true,
  allUser_Fetched: false,
  all_usersProfiles: [],
  all_users: [],
  sendFollowRequest: [],
  getFollowRequests: [],
  getMyFollowers: [],
  getMyFollowing: [],
  getUserFollowers: [],
  getUserFollowings: [],
  acceptFollowRequest: [],
  getAllRequests: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
    emptyMessage: (state) => {
      state.message = "";
    },
    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },
    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registerinng You..";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        (state.isLoading = false),
          (state.isError = false),
          (state.isSuccess = true),
          (state.loggedIn = true),
          (state.message = {
            message: "Registration is SuccessFull, please LogIn",
          });
      })
      .addCase(registerUser.rejected, (state, action) => {
        (state.isLoading = false), (state.isError = true);
        state.message = action.payload;
      })
      .addCase(loginUser.pending, (state, action) => {
        (state.isLoading = true), (state.message = "Logging You...");
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        (state.isLoading = false),
          (state.isError = false),
          (state.isSuccess = true),
          (state.loggedIn = true),
          (state.message = "Logged in SuccessFull");
      })
      .addCase(loginUser.rejected, (state, action) => {
        (state.isError = true),
          (state.isLoading = false),
          (state.message = action.payload.message);
      })
      .addCase(getUserAndProfile.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.profileFetched = true;
        state.user = action.payload;
      })
      .addCase(getAllUserProfile.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.allUser_Fetched = true;
        state.all_usersProfiles = action.payload;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.allUser_Fetched = true;
        state.all_users = action.payload;
      })
      .addCase(sendFollowRequest.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.sendFollowRequest = action.payload;
      })
      .addCase(sendFollowRequest.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(getFollowRequests.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.getFollowRequests = action.payload;
      })
      .addCase(acceptFollowRequest.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.acceptFollowRequest = action.payload;
      })
      .addCase(getUserFollowers.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.getUserFollowers = action.payload;
      })
      .addCase(getUserFollowings.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.getUserFollowings = action.payload;
      })
      .addCase(getMyFollowers.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.getMyFollowers = action.payload;
      })
      .addCase(getMyFollowings.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.getMyFollowing = action.payload;
      })
      .addCase(getAllRequests.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.getAllRequests = action.payload;
      });
  },
});

export const { emptyMessage, setTokenIsThere, setTokenIsNotThere, reset } =
  authSlice.actions;

export default authSlice.reducer;
