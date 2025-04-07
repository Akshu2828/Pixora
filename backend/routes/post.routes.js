import { Router } from "express";
import multer from "multer";
import {
  CommentPost,
  createPost,
  deleteComment,
  deletePost,
  getAllComments,
  getAllPosts,
  likePost,
} from "../controllers/post.controller.js";
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
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
    public_id: (req, file) => `${Date.now()}_${file.originalname}`,
  },
});

const router = Router();
const upload = multer({ storage });

router.route("/post").post(upload.single("media"), createPost);
router.route("/getAllPosts").get(getAllPosts);
router.route("/deletePost").delete(deletePost);
router.route("/commentOnPost").post(CommentPost);
router.route("/getAllComments").get(getAllComments);
router.route("/deleteComment").delete(deleteComment);
router.route("/likesPost").post(likePost);

export default router;
