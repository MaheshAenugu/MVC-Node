const bcrypt = require("bcryptjs");
const User = require("../../model/user/User");
const appErr = require("../../utils/appErr");

//register
const registerCtrl = async (req, res, next) => {
  const { fullname, email, password } = req.body;
  // check if fild is empty
  if (!fullname || !email || !password) {
    return next(appErr("Please fill all fields"));
  }

  try {
    // 1. check if user exist (email)
    const userFound = await User.findOne({ email });
    // throw an error
    if (userFound) {
      return next(appErr("User already Exist"));
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // register user
    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
    });
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.json(error);
  }
};

// const loginCtrl = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     // Check if email exists
//     const userFound = await User.findOne({ email });
//     console.log(userFound);
//     if (!userFound) {
//       return res.json({
//         status: "failure",
//         message: "Invalid login credentials",
//       });
//     }

//     // Verify password
//     const isPasswordValid = await bcrypt.compare(password, userFound.password);
//     console.log(isPasswordValid);
//     if (!isPasswordValid) {
//       return res.json({
//         status: "failure",
//         message: "Invalid login credentials",
//       });
//     }

//     res.json({
//       status: "success",
//       data: userFound,
//     });
//   } catch (error) {
//     res.json(error);
//   }
// };

//login
const loginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(appErr("Email and password feilds are required"));
  }
  try {
    // Check if email exist
    const userFound = await User.findOne({ email });
    if (!userFound) {
      // throw an error
      return next(appErr("Invalid login credentails"));
    }
    // verify password
    const isPasswordValid = await bcrypt.compare(password, userFound.password);
    if (!isPasswordValid) {
      return next(appErr("Invalid login credentails"));
    }
    // save the user into
    req.session.userAuth = userFound._id;
    console.log(req.session);
    res.json({
      status: "success",
      data: userFound,
    });
  } catch (error) {
    res.json(error);
  }
};

//details
const userDetailsCtrl = async (req, res) => {
  // get userId from params
  const userId = req.params.id;
  // find user
  const user = await User.findById(userId);
  try {
    res.json({
      status: "success",
      user: user,
    });
  } catch (error) {
    res.json(error);
  }
};

//profile
const profileCtrl = async (req, res) => {
  try {
    // get the login user
    const userID = req.session.userAuth;
    // find the user
    const user = await User.findById(userID)
      .populate("posts")
      .populate("comments");
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.json(error);
  }
};

//upload profile photo
const uploadProfilePhotoCtrl = async (req, res) => {
  try {
    //1. upload
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);
    // 2. check if user is found
    if (!userFound) {
      return next(appErr("User not found", 403));
    }
    // 3.update profile photo
    await User.findByIdAndUpdate(
      userId,
      {
        profileImage: req.file.path,
      },
      {
        new: true,
      }
    );
    res.json({
      status: "success",

      user: "You have successfully updated your profile photo",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//upload cover image
const uploadCoverImgCtrl = async (req, res) => {
  try {
    //1. upload
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);
    // 2. check if user is found
    if (!userFound) {
      return next(appErr("User not found", 403));
    }
    // 3.update profile photo
    await User.findByIdAndUpdate(
      userId,
      {
        coverImage: req.file.path,
      },
      {
        new: true,
      }
    );
    res.json({
      status: "success",

      user: "You have successfully updated your cover photo",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//update password
const updatePasswordCtrl = async (req, res, next) => {
  const { password } = req.body;
  try {
    // check if user is updating the password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // update user
      await User.findByIdAndUpdate(
        req.params.id,
        { password: hashedPassword },
        { new: true }
      );
      res.json({
        status: "success",
        user: "Password has been changed successful",
      });
    }
  } catch (error) {
    return next(appErr(error));
  }
};

//update user
const updateUserCtrl = async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    if (email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return next(appErr("Email is taken", 400));
      }
    }
    // update the user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullname, email },
      { new: true }
    );
    res.json({
      status: "success",
      user: user,
    });
  } catch (error) {
    res.json(next(appErr(error.message)));
  }
};

//logout
const logoutCtrl = async (req, res) => {
  try {
    res.json({
      status: "success",
      user: "User logout",
    });
  } catch (error) {
    res.json(error);
  }
};

module.exports = {
  registerCtrl,
  loginCtrl,
  userDetailsCtrl,
  profileCtrl,
  uploadProfilePhotoCtrl,
  uploadCoverImgCtrl,
  updatePasswordCtrl,
  updateUserCtrl,
  logoutCtrl,
};
