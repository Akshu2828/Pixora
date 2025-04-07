import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  bio: {
    type: String,
    default: "",
  },
  currentPost: {
    type: String,
    default: "",
  },
});

const Profile = mongoose.model("Profile", ProfileSchema);

export default Profile;
