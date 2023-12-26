const { token } = require("morgan");
const redis = require("redis");
const promisify = require("util.promisify");
const logger = require("../loggers/default.logger");
const redisHelper = function () {};

/* Redis processing sample
//Passing user name and password to redis
//URL Base 
//redis://arbitrary_usrname:password@ipaddress:6379/0
//
//SSL
//rediss://:password=@redis-server-url:6380/0?ssl_cert_reqs=CERT_REQUIRED'
//
//Connecting to the local host
const client = redis.createClient({
  host: "localhost",
  port: 6379,
  password: "1234",
  user: "username"
});
*/

const client = redis.createClient({
  url:
    process.env.REDIS_ENVIRONMENT === "DOCKER" ? process.env.REDIS_URL : null,
  port:
    process.env.REDIS_ENVIRONMENT === "LOCAL" ? process.env.REDIS_PORT : null,
  host:
    process.env.REDIS_ENVIRONMENT === "LOCAL" ? process.env.REDIS_SERVER : null
});

(async () => {
  await client.connect();
})();

//const REDIS_SETEX = promisify(client.SETEX).bind(client); //Update Redis value pair with a expairy.
//Will be returning the values after updating Redis
//const REDIS_GET = promisify(client.GET).bind(client); //read a value pair from Redis
//const REDIS_DEL = promisify(client.DEL).bind(client); //delete a value pair from Redis

//Store access token to prevent multi sessions for same user
redisHelper.setAccessToken = async (userId, accessToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (process.env.SINGLE_SESSION === "Y") {
        //Check available sessions

        client.SETEX(
          `${process.env.REDIS_ACCESS_TOKEN_BRANCH}:${userId}`,
          process.env.REDIS_REFRESH_TOKEN_EXP,
          accessToken
        );
      }
      resolve();
    } catch (err) {
      logger.error(`Error in redis.helper [setAccessToken]. ${err.message}`);
      throw err;
    }
  });
};

redisHelper.setRefreshToken = async (userId, refreshToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      client.SETEX(
        `${process.env.REDIS_REFRESH_TOKEN_BRANCH}:${userId}`,
        process.env.REDIS_REFRESH_TOKEN_EXP,
        refreshToken
      );

      resolve();
    } catch (err) {
      logger.error(`Error in redis.helper [setRefreshToken]. ${err.message}`);
      throw err;
    }
  });
};

redisHelper.deleteAccessToken = async (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      client.DEL(`${process.env.REDIS_ACCESS_TOKEN_BRANCH}:${userId}`);

      resolve();
    } catch (err) {
      logger.error(`Error in redis.helper [deleteAccessToken]. ${err.message}`);
      throw err;
    }
  });
};

redisHelper.deleteRefreshToken = async (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      client.DEL(`${process.env.REDIS_REFRESH_TOKEN_BRANCH}:${userId}`);

      resolve();
    } catch (err) {
      logger.error(
        `Error in redis.helper [deleteRefreshToken]. ${err.message}`
      );
      throw err;
    }
  });
};

redisHelper.validateRefreshToken = async (userId, refreshToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      const redisStoredRefreshToken = await client.GET(
        `${process.env.REDIS_REFRESH_TOKEN_BRANCH}:${userId}`
      );
      const result = refreshToken === redisStoredRefreshToken;
      resolve(result);
      return;
    } catch (err) {
      logger.error(
        `Error in redis.helper [validateRefreshToken]. ${err.message}`
      );
      throw err;
    }
  });
};

redisHelper.validateSingleSession = async (userId, accessToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (process.env.SINGLE_SESSION === "Y") {
        const redisStoredAccessToken = await client.GET(
          `${process.env.REDIS_REFRESH_TOKEN_BRANCH}:${userId}`
        );
        const result = accessToken === redisStoredAccessToken;

        resolve(result);
      }
      return;
    } catch (err) {
      logger.error(
        `Error in redis.helper [validateSingleSession]. ${err.message}`
      );
      console.log(err);
      throw err;
    }
  });
};

redisHelper.getCheckRefreshToken = async (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const refreshToken = await client.GET(
        `${process.env.REDIS_REFRESH_TOKEN_BRANCH}:${userId}`
      );

      resolve(!refreshToken ? false : true);
      return;
    } catch (err) {
      logger.error(
        `Error in redis.helper [getCheckRefreshToken]. ${err.message}`
      );
      resolve(false);
    }
  });
};

client.disconnect;

module.exports = redisHelper;
