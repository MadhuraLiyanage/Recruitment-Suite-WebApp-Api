const util = require("../../helpers/common.helper");

exports.jwtDetails = async (req, res, next) => {
  try {
    const userJwtToken = req.headers.authorization.split(" ")[1];
    const decodedJwt = util.decodeJWT(userJwtToken);
    var data = [];

    if (decodedJwt) {
      data = [
        {
          userId: decodedJwt.id,
          userName: decodedJwt.userFullName,
          userEmail: decodedJwt.userEmail,
          userContactNo: decodedJwt.userContactNo,
        },
      ];
    }
    res
      .status(200)
      .json({ status: "00", responseMessage: "Successful", data: data });
  } catch (error) {
    res
      .status(500)
      .json({ status: "99", responseMessage: "Unauthorized", data: [] });
  }
};
