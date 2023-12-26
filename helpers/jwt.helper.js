const jwt = require("jsonwebtoken");
const jwtHelper = function () {};
//const createError = require("http-errors");
const redisHelper = require("../helpers/redis.helper");

jwtHelper.getToken = async (
  userName,
  userFullName,
  userEmail,
  userContactNo,
  userRole,
  issuer,
  tokenSecret,
  tokenExpiry
) => {
  return new Promise((resolve, reject) => {
    try {
      const token = jwt.sign(
        {
          id: userName,
          userFullName: userFullName,
          userEmail: userEmail,
          userContactNo: userContactNo,
          role: userRole,
          issuer: issuer,
          audience: userName
        },
        tokenSecret,
        {
          expiresIn: tokenExpiry
        }
      );
      resolve(token);
    } catch (err) {
      logger.error(`Error in jwt.helper [getToken]. ${err.message}`);
      throw err;
    }
  });
};

jwtHelper.verifyRefreshToken = async (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, payload) => {
        if (err) {
          logger.error(
            `Error in jwt.helper [verifyRefreshToken]. ${err.message}`
          );
          throw err;
        } else {
          const id = payload.id;
          const userFullName = payload.userFullName;
          const userEmail = payload.userEmail;
          const userContactNo = payload.userContactNo;
          const role = payload.userRole;
          const audience = payload.userName;

          resolve({
            id: id,
            userFullName: userFullName,
            userEmail: userEmail,
            userContactNo: userContactNo,
            role: role,
            audience: audience
          });
        }
      }
    );
  });
};

module.exports = jwtHelper;
