const express = require("express");
const storage = require("../../config/cloudinary");
const multer = require("multer");
const {
  registerCtrl,
  loginCtrl,
  userDetailsCtrl,
  profileCtrl,
  uploadProfilePhotoCtrl,
  uploadCoverImgCtrl,
  updatePasswordCtrl,
  updateUserCtrl,
  logoutCtrl,
} = require("../../controllers/users/users");
const protected = require("../../middlewares/protected");

const userRoutes = express.Router();
// instance of multer
const upload = multer({ storage });

//POST/api/v1/users/register
userRoutes.post("/register", registerCtrl);

//POST/api/v1/users/login
userRoutes.post("/login", loginCtrl);

//GET/api/v1/users/profile
userRoutes.get("/profile", protected, profileCtrl);

//PUT/api/v1/users/profile-photo-upload/
userRoutes.put(
  "/profile-photo-upload/",
  protected,
  upload.single("profile"),
  uploadProfilePhotoCtrl
);

//PUT/api/v1/users/cover-photo-upload/
userRoutes.put(
  "/cover-photo-upload/",
  protected,
  upload.single("cover"),
  uploadCoverImgCtrl
);

//PUT/api/v1/users/update-password/:id
userRoutes.put("/update-password/:id", updatePasswordCtrl);

//PUT/api/v1/users/update/:id
userRoutes.put("/update/:id", updateUserCtrl);

//GET/api/v1/users/:id
userRoutes.get("/:id", userDetailsCtrl);

//GET/api/v1/users/logout
userRoutes.get("/logout", logoutCtrl);

module.exports = userRoutes;
