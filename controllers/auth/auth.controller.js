const { validationResult } = require("express-validator");
const loginService = require("../../services/login.service");
var crypto = require("crypto");
const jwtHelper = require("../../helpers/jwt.helper");
const redisHelper = require("../../helpers/redis.helper");
const sha256 = require("sha256");

exports.user_login = async (req, res, next) => {
  var error;
  var accessToken, refreshToken, reqStatus, msg;
  const userName = req.body.userName;
  const password = req.body.password;
  var id = 0;
  var userFullName = "";
  var userEmail = "";
  var userContactNo = "";

  try {
    if (!userName || !password) {
      msg = "Invalid user name/password";
      reqStatus = 200;
    }

    var isValidUser = await loginService.getUser(userName);

    if (isValidUser.length == 0) {
      msg = "Invalid user credentials (user name/password)";
      resStatus = 200;
    } else {
      //convert password to hash using SHA256/MD5

      //SHA256 conversion
      const sha256 = require("sha256");
      sha256(password); // 9cca070334...
      const hashPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

      //MD5 conversion
      // const hashPassword = crypto
      //   .createHash("md5")
      //   .update(password, "binary")
      //   .digest("base64");

      //Validate password
      const userPassword = isValidUser[0].userPassword;

      if (userPassword != hashPassword) {
        //Invalid
        msg = "Invalid user credentials (user name/password)";
        resStatus = 200;
      } else {
        //Valid
        id = isValidUser[0].id;
        userFullName = isValidUser[0].userName;
        userEmail = isValidUser[0].userEmail;
        userContactNo = isValidUser[0].userContactNo;

        //get access token
        accessToken = await jwtHelper.getToken(
          userName,
          userFullName,
          userEmail,
          userContactNo,
          "user",
          process.env.ISSUER,
          process.env.ACCESS_TOKEN_SECRET,
          process.env.JWT_TOKEN_EXP
        );
        //get refresh token
        refreshToken = await jwtHelper.getToken(
          userName,
          userFullName,
          userEmail,
          userContactNo,
          "user",
          process.env.ISSUER,
          process.env.REFRESH_TOKEN_SECRET,
          process.env.REFRESH_TOKEN_EXP
        );
        //store in redis store
        //Delete existing refresh token

        try {
          redisHelper.deleteRefreshToken(userName);
        } catch (error) {
          //ignore errors
        }

        //save access token to redis server

        //Save refresh token to redis server
        redisHelper.setRefreshToken(userName, refreshToken);

        msg = "Login Successful";
        resStatus = 200;
      }
    }
    var returnResults = await loginService.loginReturn({
      userName: userName,
      id: id,
      userFullName: userFullName,
      userEmail: userEmail,
      accessToken: accessToken,
      refreshToken: refreshToken,
      msg: msg
    });

    res.status(resStatus).json(returnResults);
  } catch (error) {
    logger.error(`Error in auth.controller ${error.message}.`);
    res.status(500).json({
      errorId: "99",
      error: "Server Error",
      message: "Server error when authenticating. Please try again."
    });
  }
};
