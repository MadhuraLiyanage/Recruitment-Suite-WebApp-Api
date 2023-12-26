require("dotenv").config();
const express = require("express");
const cors = require("cors");
const requestLogger = require("./loggers/request.logger");
const logger = require("./loggers/default.logger");
const authRouter = require("./routes/auth.route");
const whoAmIRouter = require("./routes/whoAmI.route");
const logoutRouter = require("./routes/logout.route");
const authenticateMiddleware = require("./middleware/authenticate.mw");
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJsDocs = YAML.load("./appApi.yaml");
const responseTime = require("response-time");
const fs = require("fs");
const http = require("http");
const https = require("https");

const app = express();

app.use(responseTime());

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJsDocs));

app.use(cors());
app.use(express.json());

//api running port
const HTTP_PORT = process.env.HTTP_PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

if (process.env.REQUEST_LOG_ENABLE) {
  requestLogger.registerRequestLogger(app);
} else {
  logger.info("Request logger disabled");
}

//api endpoints
app.use(`${process.env.BASE_URL}/auth`, authRouter);
app.use(`${process.env.BASE_URL}/auth/refresh-token`, authRouter);
app.use(`${process.env.BASE_URL}/log-out`, logoutRouter);
app.use(
  `${process.env.BASE_URL}/who-am-i`,
  authenticateMiddleware,
  whoAmIRouter
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error(
    "Recruitment Suite Web Application API. Error loading requested endpoint. Endpoint not found."
  );
  err.httpStatusCode = 404;
  return next(err);
});

// error handler
app.use((err, req, res, next) => {
  const status = err.httpStatusCode || 500;
  const message = err.message;
  res.status(status).json({ message: message });
});

/*configuring SSL */
const httpServer = http.createServer(app);

/* Certificate files created with OpenSSL */
const privateKey = fs.readFileSync("./openssl_certificates/private-key.pem");
const certificate = fs.readFileSync("./openssl_certificates/certificate.pem");
const credentials = { key: privateKey, cert: certificate };
/* */
const httpsServer = https.createServer(credentials, app);
/* */

httpServer.listen(HTTP_PORT, () => {
  logger.info(`HTTP Server listening to port ${HTTP_PORT} and service started`);
});

httpsServer.listen(HTTPS_PORT, () => {
  logger.info(
    `HTTPS Server listening to port ${HTTPS_PORT} and service started`
  );
});
