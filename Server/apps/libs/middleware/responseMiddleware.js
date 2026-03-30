const responseService = require("../response/response.service");
const RESPONSE_CODE = require("../response/responseCode");

const generateRequestId = () =>
  "req_" + Math.random().toString(36).substring(2, 10);

const buildMeta = (req) => ({
  requestId: req.headers["x-request-id"] || generateRequestId(),
  timestamp: Date.now(),
});

module.exports = (req, res, next) => {

  const send = (code, payload) =>
    res.status(code).json({ ...payload, meta: buildMeta(req) });

  res.success = (data) =>
    send(RESPONSE_CODE.success, responseService.success(data));

  res.error = (code, message, data = {}, errors = []) =>
    send(code, responseService.error(message, data, errors));

  res.badRequest = (msg, errors) =>
    res.error(RESPONSE_CODE.badRequest, msg, {}, errors);

  res.unauthorized = (msg) =>
    res.error(RESPONSE_CODE.unauthorized, msg);

  res.forbidden = (msg) =>
    res.error(RESPONSE_CODE.forbidden, msg);

  res.notFound = (msg) =>
    res.error(RESPONSE_CODE.recordNotFound, msg);

  res.validationError = (msg, errors) =>
    res.error(RESPONSE_CODE.validationError, msg, {}, errors);

  res.serverError = (msg) =>
    res.error(RESPONSE_CODE.internalServerError, msg);

  next();
};