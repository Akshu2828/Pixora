import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(400).json({ message: "User not Found" });
    }

    if (!req.file) {
      return res.status(400).json({ messsage: "file required" });
    }

    let mediaUrl = "";
    let filetype = "";

    if (req.file) {
      mediaUrl = req.file.path;
      filetype = req.file.mimetype.split("/")[1];
    }

    const post = new Post({
      userId: user._id,
      body: req.body.body,
      media: mediaUrl,
      fileType: filetype,
    });

    await post.save();

    return res.status(200).json({ message: "Post created Successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const allPosts = await Post.find().populate(
      "userId",
      "name username email profilePicture"
    );

    return res.status(200).json(allPosts);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deletePost = async (req, res) => {
  const { token, post_id } = req.body;
  try {
    const user = await User.findOne({ token: token }).select("_id");

    if (!user) {
      return res.status(400).json("user not found");
    }

    const post = await Post.findOne({ _id: post_id });

    if (!post) {
      return res.status(400).json("post not found");
    }

    if (post.userId.toString() !== user._id.toString()) {
      return res.status(400).json("unautherized");
    }

    await Post.deleteOne({ _id: post_id });

    return res.status(200).json("Post deleted Successfully");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const CommentPost = async (req, res) => {
  try {
    const { token, post_id, commentBody } = req.body;

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(400).json("user not found");
    }

    const post = await Post.findOne({ _id: post_id });

    if (!post) {
      return res.status(400).json("post not found");
    }

    const newComment = new Comment({
      userId: user._id,
      postId: post._id,
      commentBody: commentBody,
    });

    newComment.save();

    return res.status(200).json("Comment added Succesfully");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const { post_id } = req.query;

    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(400).json("post not found");
    }

    const comments = await Comment.find({ postId: post_id }).populate(
      "userId",
      "name username profilePicture"
    );

    return res.status(200).json(comments.reverse());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { token, comment_id } = req.body;

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(400).json("user not found");
    }

    const comment = await Comment.findOne({ _id: comment_id });
    if (!comment) {
      return res.status(400).json("comment not found");
    }

    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(400).json("UnAutherised");
    }

    await Comment.deleteOne({ _id: comment._id });

    return res.status(200).json("Comment Deleted Successfully");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const { token, post_id } = req.body;

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(400).json("user not found");
    }

    const post = await Post.findOne({ _id: post_id });

    if (!post) {
      return res.status(400).json("post not found");
    }

    const isLiked = post.likedBy.some(
      (id) => id.toString() === user._id.toString()
    );

    if (isLiked) {
      post.likedBy = post.likedBy.filter((id) => !id.equals(user._id));
      post.likes = Math.max(0, post.likes - 1);
      await post.save();
      return res.status(200).json({ message: "Post unliked" });
    } else {
      post.likedBy.push(user._id);
      post.likes += 1;
      await post.save();
      return res.status(200).json("Post Liked");
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
