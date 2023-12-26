const Common = function () {};

Common.convertSQL = (sqlString) => {
  return new Promise(function (resolve, reject) {
    console.log(sqlString);
    result = sqlString.replace(/'/g, '"');
    resolve(result);
  });
};

Common.decodeJWT = (token) => {
  if (token !== null || token !== undefined) {
    const base64String = token.split(".")[1];
    const decodedValue = JSON.parse(
      Buffer.from(base64String, "base64").toString("ascii")
    );
    return decodedValue;
  }
  return null;
};

module.exports = Common;
