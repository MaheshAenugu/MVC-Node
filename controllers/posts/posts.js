const Post = require("../../model/post/Post");
const User = require("../../model/user/User");
const appErr = require("../../utils/appErr");

//create
const createPostCtrl = async (req, res, next) => {
  const { title, description, category, user } = req.body;
  try {
    if (!title || !description || !category || !req.file) {
      return next(appErr("All feilds are required"));
    }
    // find the user
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);
    // create post
    const postCreated = await Post.create({
      title,
      description,
      category,
      user: userFound._id,
      image: req.file.path,
    });
    userFound.posts.push(postCreated._id);

    await userFound.save();
    res.json({
      status: "success",
      user: postCreated,
    });
  } catch (error) {
    res.json(error);
  }
};

//all
const fetchPostsCtrl = async (req, res, next) => {
  const posts = await Post.find().populate("comments");
  try {
    res.json({
      status: "success",
      user: posts,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//details
const fetchPostCtrl = async (req, res, next) => {
  try {
    // get id from params
    const id = req.params.id;
    // find the post
    const post = await Post.findById(id);
    res.json({
      status: "success",
      data: post,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//delete
const deletePostCtrl = async (req, res, next) => {
  try {
    // find the post
    const post = await Post.findById(req.params.id);
    // check if the post belongs to the user
    if (post.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not allowed to delete this post", 403));
    }
    // delete post
    await Post.findByIdAndDelete(req.params.id);
    res.json({
      status: "success",
      user: "Post has been deleted successfully",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//update
const updatepostCtrl = async (req, res, next) => {
  const { title, description, category } = req.body;
  if (!title || !description || !category || !req.file) {
    return next(appErr("All feilds are required"));
  }
  try {
    // find the post
    const post = await Post.findById(req.params.id);
    // check if the post belongs to the user
    if (post.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not allowed to Update this post", 403));
    }
    // update post
    const postUpdate = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        image: req.file.path,
      },
      { new: true }
    );
    res.json({
      status: "success",
      user: postUpdate,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};
module.exports = {
  createPostCtrl,
  fetchPostsCtrl,
  fetchPostCtrl,
  deletePostCtrl,
  updatepostCtrl,
};
