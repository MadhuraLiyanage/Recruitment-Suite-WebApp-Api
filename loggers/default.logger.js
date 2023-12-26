const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
 
// Import all needed using Object Destructuring
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;


module.exports = winston.createLogger({
    level: process.env.LOG_LEVEL,
    format: combine(
        format.errors({ stack: true }), // log the full stack
        timestamp(), // get the time stamp part of the full log message
        printf(({ level, message, timestamp, stack }) => { // formating the log outcome to show/store 
          return `${new Date()} ${level}: ${message} `;
        })
      ),
  //  format: winston.format.simple(),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
            filename: process.env.LOG_FILE,
            dirname: process.env.LOG_DIR,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxFiles: '14d',
            maxSize: '20m'
        })
    ]
});


