const morgan = require("morgan");
const rfs = require("rotating-file-stream");

// rotating stream for morgan
const accessLogStream = rfs.createStream(process.env.REQUEST_LOG_FILE, {
  size: "10M",
  interval: process.env.REQUEST_LOG_ROLLING_INTERVAL,
  path: process.env.LOG_DIR,
});

// appenders for printing the logs to console and file
const consoleAppender = morgan(process.env.REQUEST_LOG_FORMAT);
const fileAppender = morgan(process.env.REQUEST_LOG_FORMAT, {
  stream: accessLogStream,
});

// function to inject morgan in an express app
exports.registerRequestLogger = (app) => {
  app.use(consoleAppender);

  // log to file only in `production`
  if (process.env.NODE_ENV === "production") {
    app.use(fileAppender);
  }
};
