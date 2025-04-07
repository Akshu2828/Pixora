import { Router } from "express";
import {
  acceptFollowRequest,
  getAllRequests,
  getAllUserProfile,
  getAllUsers,
  getFollowRequests,
  getMyFollowers,
  getMyFollowings,
  getUserAndProfile,
  getUserAndProfileByUsername,
  loginUser,
  registerUser,
  sendFollowRequest,
  updateProfilePicture,
  UpdateUserProfile,
  updateUserProfiledata,
} from "../controllers/user.controller.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Pixora",
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: (req, file) =>
      `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`,
  },
});

const upload = multer({ storage });

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/getUserAndProfile").get(getUserAndProfile);
router.route("/getAllUserProfile").get(getAllUserProfile);
router.route("/getAllUsers").get(getAllUsers);
router.route("/updateUserProfile").post(UpdateUserProfile);
router.route("/updateUserProfiledata").post(updateUserProfiledata);
router.route("/getUserAndProfileByUsername").get(getUserAndProfileByUsername);
router.route("/sendFollowRequest").post(sendFollowRequest);
router.route("/acceptFollowRequest").post(acceptFollowRequest);
router.route("/getMyFollowRequests").get(getFollowRequests);
router.route("/getMyFollowers").get(getMyFollowers);
router.route("/getMyFollowing").get(getMyFollowings);
router.route("/getAllRequests").get(getAllRequests);
router
  .route("/updateProfilePicture")
  .post(upload.single("profilePicture"), updateProfilePicture);

export default router;
