const jwt = require("jsonwebtoken");
const logger = require("../loggers/default.logger");
module.exports = (req, res, next) => {
  const ipAddress = !req.header("x-forwarded-for")
    ? req.socket.remoteAddress
    : req.header("x-forwarded-for");
  try {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
      res.status(401).json({
        errorId: "99",
        error: Unauthorized,
        message: "Unauthorized request. Invalid access token."
      });
      logger.info(
        `Unauthorized request with invalid access token from ${ipAddress}.`
      );
      return;
    } else {
      const token = accessToken.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            res.status(401).json({
              errorId: "90",
              error: "Unauthorized",
              message: "Unauthorized request. Token expired."
            });
            logger.info(
              `Unauthorized request with expired token from ${ipAddress}.`
            );
            return;
          } else {
            res.status(401).json({
              errorId: "99",
              error: "Unauthorized",
              message: "Unauthorized request. Invalid access token."
            });
            logger.info(
              `Unauthorized request with invalid access token from ${ipAddress}.`
            );
            return;
          }
        }
        req.user = decoded;
      });
      next();
    }
  } catch (err) {
    logger.error(
      `Error occurred in authenticate.mw, ${err.message}. Request received from ${ipAddress}.`
    );
    res.status(401).json({
      errorId: "99",
      error: "Unauthorized",
      message: "Unauthorized request. Invalid access token."
    });
    return;
  }
};
