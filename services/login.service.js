const dbConnection = require("../dbaccessors/db.connection");
const conn = dbConnection.dbConnection;
const Login = function () {};

Login.getUser = async (userName) => {
  return new Promise(function (resolve, reject) {
    //check for the user name in the database

    var querySelData =
      "SELECT " +
      "user_profile.id, " +
      " user_profile.userId, " +
      "user_profile.userPassword, " +
      "user_profile.userName, " +
      "user_profile.userEmail, " +
      "user_profile.userContactNo " +
      "FROM `" +
      process.env.DB_NAME +
      "`.user_profile " +
      'WHERE user_profile.userId="' +
      userName +
      '" Limit 1';

    conn.query(querySelData, (err, rows) => {
      if (err) throw err;
      resolve(rows);
    });
  });
};

Login.loginReturn = async (dtSet, result) => {
  return new Promise(function (resolve, reject) {
    //preparing the response with the token
    var data = [];

    if (dtSet.accessToken != undefined) {
      data = [
        {
          accessToken: dtSet.accessToken,
          refreshToken: dtSet.refreshToken,
          id: dtSet.id,
          userId: dtSet.userName,
          userName: dtSet.userFullName,
          userEmail: dtSet.userEmail,
          userContactNo: dtSet.userContactNo,
          isUserActive: 1
        }
      ];
    }

    var retrunValue = {
      status: "00",
      tokenStatus: "",
      userID: dtSet.userName,
      message: dtSet.msg,
      data: data
    };
    resolve(retrunValue);
  });
};

module.exports = Login;
