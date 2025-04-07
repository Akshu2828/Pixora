import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Profile from "../models/profile.model.js";
import Follow from "../models/follow.model.js";
import cloudinary from "../utils/cloudinary.js";

export const registerUser = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: "All fiels are required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name,
      username: username,
      email: email,
      password: hashedPassword,
    });

    await newUser.save();

    const profile = new Profile({ userId: newUser._id });

    await profile.save();
    return res.json({ message: "User registerd successfully" });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All Fields are required!" });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: "User not Found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credential" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await User.updateOne({ _id: user._id }, { token: token });
    return res.json({ token: token });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );

    return res.json(userProfile);
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const getAllUserProfile = async (req, res) => {
  try {
    const response = await Profile.find().populate(
      "userId",
      "name email username profilePicture"
    );

    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find();

    return res.status(200).json(allUsers);
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const updateProfilePicture = async (req, res) => {
  console.log("Uploaded file:", req.file);
  try {
    const { token } = req.body;
    if (!req.file) {
      return res.status(400).json("file not found");
    }

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.json({ message: "user not found" });
    }

    user.profilePicture = req.file.path;

    await user.save();

    return res.json({ message: "Profile Picture Updated" });
  } catch (err) {
    console.error("Error updating profile picture:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message, stack: err.stack });
  }
};

export const UpdateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.json({ message: "user not found" });
    }

    const { username } = newUserData;

    const existingUser = await User.findOne({ $or: [{ username }] });

    if (existingUser) {
      if (existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "User already exists!" });
      }
    }

    Object.assign(user, newUserData);

    await user.save();

    return res.json({ message: "User Updated" });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const updateUserProfiledata = async (req, res) => {
  try {
    const { token, ...newProfiledata } = req.body;

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.json({ message: "user not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id });
    if (!userProfile) {
      return res.json({ message: "userProfile not found" });
    }

    Object.assign(userProfile, newProfiledata);

    await userProfile.save();

    return res.json({ message: "Profile Updated" });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const getUserAndProfileByUsername = async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.json({ message: "user not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture token"
    );

    return res.status(200).json({ profile: userProfile });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const sendFollowRequest = async (req, res) => {
  try {
    const { token, followingId } = req.body;
    if (!token || !followingId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const requestUser = await User.findById(followingId);
    if (!requestUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingFollow = await Follow.findOne({
      follower: user._id,
      following: requestUser._id,
    });
    if (existingFollow) {
      return res.status(400).json({ message: "Already sent request" });
    }
    const newFollow = new Follow({
      follower: user._id,
      following: requestUser._id,
      status_accepted: null,
    });

    await newFollow.save();
    res.status(200).json({ newFollow: newFollow });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const acceptFollowRequest = async (req, res) => {
  try {
    const { token, followerId, action_type } = req.body;
    if (!token || !followerId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (action_type !== "accept") {
      return res.status(400).json({ message: "Invalid action type" });
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const upadattedFollow = await Follow.updateMany(
      { follower: followerId, following: user._id, status_accepted: null },
      { $set: { status_accepted: true } }
    );
    if (upadattedFollow.modifiedCount > 0) {
      return res.status(200).json({ message: "Follow request accepted" });
    } else {
      return res
        .status(404)
        .json({ message: "No follow request found or already accepted" });
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const getFollowRequests = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followRequests = await Follow.find({
      following: user._id,
      status_accepted: null,
    }).populate("follower", "name email username profilePicture");
    res.status(200).json(followRequests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyFollowers = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followers = await Follow.find({
      following: user._id,
      status_accepted: true,
    }).populate("follower", "name email username profilePicture");
    res.status(200).json(followers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyFollowings = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const following = await Follow.find({
      follower: user._id,
      status_accepted: true,
    }).populate("following", "name email username profilePicture");
    res.status(200).json(following);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followRequests = await Follow.find({
      follower: user._id,
    }).populate("following", "name email username profilePicture");
    res.status(200).json(followRequests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
