const mysql = require("mysql");

const dbConnection = mysql.createConnection({
  host: process.env.DB_SERVER,
  user: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
dbConnection.connect((err) => {
  if (err) throw err;
  console.log(
    "Successfully connected to database (" +
      process.env.DB_NAME +
      " on " +
      process.env.DB_SERVER +
      ")."
  );
});

module.exports.dbConnection = dbConnection;
