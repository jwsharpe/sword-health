const authorize = (req, res, next) => {
  const authorization = req.headers["x-api-key"];
  if (!authorization) {
    return res.status(401).json({
      message: "Operation Failed",
      data: "Authorization token not found.",
    });
  }
  if (!authorization.match(/^(manager|technician)-\d+$/)) {
    return res.status(403).send("Forbidden");
  }
  return next();
};

module.exports = {
  authorize,
};
