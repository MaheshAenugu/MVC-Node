const Comment = require("../../model/comment/Comment");
const Post = require("../../model/post/Post");
const User = require("../../model/user/User");
const appErr = require("../../utils/appErr");

//create
const createCommentCtrl = async (req, res, next) => {
  const { message } = req.body;
  try {
    // find the post
    const post = await Post.findById(req.params.id);
    // create comment
    const comment = await Comment.create({
      user: req.session.userAuth,
      message,
    });
    //push the comment to post
    post.comments.push(comment._id);
    // find the user
    const user = await User.findById(req.session.userAuth);
    // push comment
    user.comments.push(comment._id);
    //save
    await post.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });
    res.json({
      status: "success",
      user: comment,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//single
const commentDetailsCtrl = async (req, res) => {
  try {
    res.json({
      status: "success",
      user: "Post comments",
    });
  } catch (error) {
    res.json(error);
  }
};

//delete
const deleteCommentCtrl = async (req, res, next) => {
  try {
    // find comment
    const comment = await Comment.findById(req.params.id);
    // check if the post belongs to the user
    if (comment.user.toString() != req.session.userAuth.toString()) {
      return appErr("You are not allowed to delete this comment", 403);
    }
    // delete comment
    await Comment.findByIdAndDelete(req.params.id);
    res.json({
      status: "success",
      user: "comment has been  deleted successfully",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Update
const upddateCommentCtrl = async (req, res, next) => {
  try {
    //find the comment
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return next(appErr("Comment Not Found"));
    }
    // check if the post belongs to the user
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not allowed to update this commment", 403));
    }
    // update
    const commentUpdated = await Comment.findByIdAndUpdate(
      req.params.id,
      { message: req.body.message },
      { new: true }
    );
    res.json({
      status: "success",
      data: commentUpdated,
    });
  } catch (error) {
    return next(appErr(error));
  }
};

module.exports = {
  createCommentCtrl,
  commentDetailsCtrl,
  deleteCommentCtrl,
  upddateCommentCtrl,
};
