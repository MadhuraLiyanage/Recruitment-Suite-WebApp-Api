const { response } = require("express");
const jwtHelper = require("../../helpers/jwt.helper");
const redisHelper = require("../../helpers/redis.helper");
const logger = require("../../loggers/default.logger");

exports.getNewToken = async (req, res, next) => {
  const refreshToken = req.body.refreshToken;
  //get requesting IP address to login purpose
  const ipAddress = !req.header("x-forwarded-for")
    ? req.socket.remoteAddress
    : req.header("x-forwarded-for");

  if (!refreshToken) {
    logger.info(
      `refresh-token.controller [getNewToken]. Invalid request token from ${ipAddress} refresh-token.controller`
    );
    res.status(200).json({ status: "99", message: "Invalid refresh token." });
    return;
  } else {
    try {
      //verify the refresh token validity
      const result = await jwtHelper.verifyRefreshToken(refreshToken);
      if (!result) {
        reject();
        return;
      }

      //verify for the refresh token in redis
      if (!(await redisHelper.validateRefreshToken(result.id, refreshToken))) {
        reject();
        return;
      }

      //New access token generated using refresh token
      const newAccessToken = await jwtHelper.getToken(
        result.id,
        result.fullUserName,
        result.userEmail,
        result.userContactNo,
        "user",
        process.env.ISSUER,
        process.env.ACCESS_TOKEN_SECRET,
        process.env.JWT_TOKEN_EXP
      );
      //New refresh token generated using refresh token
      const newRefreshToken = await jwtHelper.getToken(
        result.id,
        result.fullUserName,
        result.userEmail,
        result.userContactNo,
        "user",
        process.env.ISSUER,
        process.env.REFRESH_TOKEN_SECRET,
        process.env.REFRESH_TOKEN_EXP
      );
      //store in redis store
      //Refresh tokens will be saved under RefreshTokens branch
      //delete existing refresh token
      try {
        redisHelper.deleteRefreshToken(result.id);
      } catch {
        //no error trap
      }

      //save new refreshToken to Redis
      redisHelper.setRefreshToken(result.id, newRefreshToken);
      const data = [
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      ];
      res
        .status(200)
        .json({ status: "00", responseMessage: "Successful", data: data });
    } catch (err) {
      logger.error(
        `Error in refresh-token.controller, request received from ${ipAddress}. ${err.message}`
      );
      res.status(200).json({
        status: "99",
        responseMessage:
          "Refresh token black listed. Error creating new access tokens using refresh token provided.",
        data: []
      });
      return;
    }
  }
};
